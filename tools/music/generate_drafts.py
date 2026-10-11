"""
五個年代背景音樂的「合成配樂草稿」產生器（離線、程式合成，不是真實樂器錄音）

用法（需要 Python 3、numpy 與 ffmpeg）：
    python3 tools/music/generate_drafts.py            # 產生 public/audio/*.mp3
    python3 tools/music/generate_drafts.py --wav DIR  # 另外輸出未壓縮的 WAV 母帶（不放進專案）

做法
- 每個年代一首 15 秒的原創曲，最多三個主要聲部，全部以加法合成／簡單物理模型在 numpy 中產生。
- 「循環式」合成：超過 15 秒的音尾（含殘響）會繞回曲首疊加，殘響以循環摺積計算，
  因此 15 秒的內容首尾完全銜接（數學上是週期訊號）。
- 輸出檔 = 曲尾最後 1 秒 + 完整 15 秒 + 曲首前 1 秒（共 17 秒）。網頁以
  loopStart = 1、loopEnd = 16 循環；即使不同瀏覽器解碼 MP3 時前端多出或少掉幾十毫秒，
  循環區間仍落在週期訊號內，接點不會出現空白或爆音。
- 五首以近似 K 加權的方均根音量統一響度，峰值限制在 -1.5 dBFS 以下，並柔和地濾掉 9 kHz 以上的高頻。

以上是藝術化的配樂方向，不宣稱還原當年的實際音樂。日後替換正式配樂時，只要維持
「15 秒循環＋前後各 1 秒循環內容」的格式，或在 src/audio/musicTracks.js 調整 loopStart／loopEnd。
"""

import argparse
import math
import os
import subprocess
import sys

import numpy as np

SR = 44100
LOOP_SECONDS = 15.0
N = int(SR * LOOP_SECONDS)
PAD_SECONDS = 1.0
PAD = int(SR * PAD_SECONDS)
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT_DIR = os.path.join(ROOT, 'public', 'audio')

rng = np.random.default_rng(1853)


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


NOTE_INDEX = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def note(name):
    """'A4'、'F#3'、'Bb2' → MIDI 編號"""
    letter = name[0]
    rest = name[1:]
    shift = 0
    while rest and rest[0] in '#b':
        shift += 1 if rest[0] == '#' else -1
        rest = rest[1:]
    return 12 * (int(rest) + 1) + NOTE_INDEX[letter] + shift


# ───────────── 基本工具 ─────────────


def times(seconds):
    return np.arange(int(seconds * SR)) / SR


def fft_filter(signal, response):
    """以頻域乘上 response(freqs) 濾波（零相位；用於整段循環時為循環濾波）"""
    spectrum = np.fft.rfft(signal, axis=0)
    freqs = np.fft.rfftfreq(signal.shape[0], 1 / SR)
    gain = response(freqs)
    if spectrum.ndim == 2:
        gain = gain[:, None]
    return np.fft.irfft(spectrum * gain, n=signal.shape[0], axis=0)


def smooth_lowpass(cutoff, width):
    def response(f):
        x = np.clip((f - cutoff) / width, 0, 1)
        return 0.5 + 0.5 * np.cos(np.pi * x)

    return response


def smooth_highpass(cutoff, width):
    def response(f):
        x = np.clip((f - (cutoff - width)) / width, 0, 1)
        return 0.5 - 0.5 * np.cos(np.pi * x)

    return response


def bandpass(low, high, width=None):
    w = width or max(80.0, low * 0.5)
    hp = smooth_highpass(low, w)
    lp = smooth_lowpass(high, w)
    return lambda f: hp(f) * lp(f)


def noise(seconds):
    return rng.standard_normal(int(seconds * SR))


def fade(signal, attack, release):
    n = signal.shape[0]
    env = np.ones(n)
    a = min(n, max(1, int(attack * SR)))
    r = min(n, max(1, int(release * SR)))
    env[:a] *= np.linspace(0, 1, a) ** 1.5
    env[n - r:] *= np.linspace(1, 0, r) ** 1.5
    return signal * env


def pan_gains(pan):
    theta = (pan + 1) * np.pi / 4
    return math.cos(theta), math.sin(theta)


class Track:
    """一個 15 秒的循環聲軌（立體聲），放入的聲音超過結尾會繞回開頭"""

    def __init__(self):
        self.dry = np.zeros((N, 2))
        self.send = np.zeros((N, 2))

    def place(self, signal, start_seconds, gain=1.0, pan=0.0, reverb=0.2):
        start = int(round(start_seconds * SR)) % N
        left, right = pan_gains(pan)
        stereo = np.stack([signal * left, signal * right], axis=1) * gain
        pos = 0
        while pos < stereo.shape[0]:
            index = (start + pos) % N
            count = min(N - index, stereo.shape[0] - pos)
            self.dry[index:index + count] += stereo[pos:pos + count]
            self.send[index:index + count] += stereo[pos:pos + count] * reverb
            pos += count


# ───────────── 樂器 ─────────────


def pluck(freq, hold, decay=1.2, darkness=0.4, position=0.15, attack_noise=0.08, max_freq=8000.0, tail=1.6):
    """撥弦（琵琶、古箏、吉他、撥奏低音提琴）：泛音各自衰減，高泛音衰減較快"""
    t = times(hold + tail)
    out = np.zeros_like(t)
    k_max = max(1, min(32, int(max_freq / freq)))
    for k in range(1, k_max + 1):
        amp = abs(math.sin(math.pi * k * position)) / k
        if amp < 1e-4:
            continue
        tau = decay / (1 + darkness * (k - 1))
        fk = k * freq * math.sqrt(1 + 0.00008 * k * k)
        out += amp * np.exp(-t / tau) * np.sin(2 * np.pi * fk * t + rng.uniform(0, 2 * np.pi))
    # 放開琴弦（制音）
    damp_start = int(hold * SR)
    if damp_start < t.shape[0]:
        out[damp_start:] *= np.exp(-(t[damp_start:] - hold) / 0.12)
    # 撥弦瞬間的雜音
    click = fft_filter(noise(0.012), smooth_lowpass(min(5000, freq * 8), 1500)) * np.exp(-times(0.012) / 0.003)
    out[: click.shape[0]] += click * attack_noise
    out = fade(out, 0.002, 0.05)
    return out / (np.max(np.abs(out)) + 1e-9)


def wind(freq, hold, harmonics, breath=0.04, attack=0.06, release=0.12, vibrato=(5.2, 0.005, 0.25), bend=0.0):
    """吹管（竹笛、洞簫）：柔和的泛音、氣聲、延遲出現的顫音；bend 為起音時由下往上的滑音（半音）"""
    t = times(hold + release)
    rate, depth, delay = vibrato
    vib = depth * np.clip((t - delay) / 0.3, 0, 1) * np.sin(2 * np.pi * rate * t)
    glide = bend * np.exp(-t / 0.06)
    f = freq * (1 + vib) * 2 ** (-glide / 12)
    phase = 2 * np.pi * np.cumsum(f) / SR
    out = np.zeros_like(t)
    for k, amp in enumerate(harmonics, start=1):
        out += amp * np.sin(k * phase)
    air = fft_filter(noise(hold + release), bandpass(freq * 1.5, min(7000, freq * 6)))
    out += air / (np.std(air) + 1e-9) * breath
    env = np.ones_like(t)
    a = int(attack * SR)
    env[:a] = np.linspace(0, 1, a) ** 0.7
    r0 = int(hold * SR)
    env[r0:] = np.linspace(1, 0, t.shape[0] - r0) ** 2
    # 長音略為漸弱，比較像真實的換氣
    env *= 1 - 0.15 * np.clip(t / max(hold, 0.3), 0, 1)
    out *= env
    return out / (np.max(np.abs(out)) + 1e-9)


def piano(freq, hold, velocity=0.7, tail=1.8):
    """柔和的鋼琴：兩段式衰減、輕微不諧和泛音、柔和的琴槌聲；放開琴鍵時制音"""
    t = times(hold + tail)
    out = np.zeros_like(t)
    k_max = max(1, min(18, int(5000 / freq)))
    scale = (261.6 / freq) ** 0.5
    for k in range(1, k_max + 1):
        amp = velocity ** (0.3 * k) / k ** 1.4
        tau1 = 0.45 * scale / (1 + 0.35 * (k - 1))
        tau2 = 3.2 * scale / (1 + 0.25 * (k - 1))
        fk = k * freq * math.sqrt(1 + 0.0002 * k * k)
        env = 0.65 * np.exp(-t / tau1) + 0.35 * np.exp(-t / tau2)
        out += amp * env * np.sin(2 * np.pi * fk * t + rng.uniform(0, 2 * np.pi))
    damp = int(hold * SR)
    if damp < t.shape[0]:
        out[damp:] *= np.exp(-(t[damp:] - hold) / 0.15)
    thump = fft_filter(noise(0.02), smooth_lowpass(1800, 600)) * np.exp(-times(0.02) / 0.005)
    out[: thump.shape[0]] += thump * 0.05
    out = fade(out, 0.003, 0.08)
    return out / (np.max(np.abs(out)) + 1e-9)


def epiano(freq, hold, tail=1.6):
    """電鋼琴：調頻合成（調變指數隨時間減少，起音帶一點鐘聲感，之後轉為圓潤）"""
    t = times(hold + tail)
    index = 1.1 * np.exp(-t / 0.22) + 0.18
    mod = np.sin(2 * np.pi * freq * t)
    out = np.sin(2 * np.pi * freq * t + index * mod)
    out += 0.12 * np.exp(-t / 0.12) * np.sin(2 * np.pi * freq * 4.0 * t)
    env = np.exp(-t / 2.4)
    damp = int(hold * SR)
    if damp < t.shape[0]:
        env[damp:] *= np.exp(-(t[damp:] - hold) / 0.25)
    out *= env
    out = fade(out, 0.004, 0.1)
    return out / (np.max(np.abs(out)) + 1e-9)


def reed(freqs, hold, attack=0.07, release=0.15):
    """手風琴：兩組簧片略微錯開音準，柔和起音與風箱的起伏；freqs 為同時按下的音"""
    t = times(hold + release)
    out = np.zeros_like(t)
    for freq in freqs:
        k_max = max(1, min(14, int(3200 / freq)))
        for detune in (0.9985, 1.0015):
            for k in range(1, k_max + 1):
                amp = (1.0 if k % 2 else 0.55) / k ** 0.95
                out += amp * np.sin(2 * np.pi * k * freq * detune * t + rng.uniform(0, 2 * np.pi))
    bellows = 1 + 0.08 * np.sin(2 * np.pi * 0.35 * t)
    env = np.ones_like(t)
    a = int(attack * SR)
    env[:a] = np.linspace(0, 1, a)
    r0 = int(hold * SR)
    env[r0:] = np.linspace(1, 0, t.shape[0] - r0)
    out *= env * bellows
    out = fft_filter(out, smooth_lowpass(2600, 1400))
    return out / (np.max(np.abs(out)) + 1e-9)


def woodblock(pitch=1000.0, length=0.16):
    """木魚／木擊：兩個快速衰減的共振＋短促的敲擊聲"""
    t = times(length)
    out = np.sin(2 * np.pi * pitch * t) * np.exp(-t / 0.028)
    out += 0.4 * np.sin(2 * np.pi * pitch * 2.63 * t) * np.exp(-t / 0.012)
    click = fft_filter(noise(0.004), bandpass(1500, 5000)) * np.exp(-times(0.004) / 0.001)
    out[: click.shape[0]] += click * 0.15
    out = fade(out, 0.0008, 0.02)
    return out / (np.max(np.abs(out)) + 1e-9)


def clapper(length=0.14):
    """拍板：兩片木板相擊（帶通雜音，兩下相隔幾毫秒）"""
    t = times(length)
    hit = fft_filter(noise(length), bandpass(900, 3200)) * np.exp(-t / 0.018)
    out = hit.copy()
    lag = int(0.007 * SR)
    out[lag:] += 0.6 * hit[:-lag]
    out = fade(out, 0.0008, 0.03)
    return out / (np.max(np.abs(out)) + 1e-9)


def brush(kind='tap', length=None):
    """鼓刷：tap（輕點）或 swish（掃刷）"""
    if kind == 'swish':
        length = length or 0.32
        t = times(length)
        env = np.minimum(t / 0.07, 1) * np.exp(-np.maximum(t - 0.07, 0) / 0.09)
        out = fft_filter(noise(length), bandpass(1200, 6500)) * env
    elif kind == 'shaker':
        length = length or 0.09
        t = times(length)
        env = np.minimum(t / 0.012, 1) * np.exp(-np.maximum(t - 0.012, 0) / 0.025)
        out = fft_filter(noise(length), bandpass(3000, 7500)) * env
    else:
        length = length or 0.16
        t = times(length)
        env = np.exp(-t / 0.035)
        out = fft_filter(noise(length), bandpass(700, 5000)) * env
        out += 0.25 * np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.03)
    out = fade(out, 0.001, 0.02)
    return out / (np.max(np.abs(out)) + 1e-9)


def reverb_ir(seconds, seed):
    """殘響的脈衝響應：高頻衰減較快的雙聲道指數衰減雜音（含 15 毫秒預延遲）"""
    local = np.random.default_rng(seed)
    length = int(SR * seconds * 1.4)
    t = np.arange(length) / SR
    channels = []
    for _ in range(2):
        white = local.standard_normal(length)
        bands = [(smooth_lowpass(500, 300), 1.0), (bandpass(500, 2500), 0.8), (bandpass(2500, 6000), 0.5), (smooth_highpass(6000, 1500), 0.28)]
        ir = np.zeros(length)
        for response, factor in bands:
            tau = seconds * factor / 6.9
            ir += fft_filter(white, response) * np.exp(-t / tau)
        pre = int(0.015 * SR)
        ir = np.concatenate([np.zeros(pre), ir[:-pre]])
        channels.append(ir / np.sqrt(np.sum(ir ** 2)))
    return np.stack(channels, axis=1)


def circular_reverb(send, seconds, seed):
    ir = reverb_ir(seconds, seed)
    padded = np.zeros_like(send)
    count = min(ir.shape[0], N)
    padded[:count] = ir[:count]
    out = np.zeros_like(send)
    for c in range(2):
        out[:, c] = np.fft.irfft(np.fft.rfft(send[:, c]) * np.fft.rfft(padded[:, c]), n=N)
    return out


# ───────────── 樂譜工具 ─────────────


class Score:
    def __init__(self, bpm, beats, swing=False):
        self.bpm = bpm
        self.beat = 60.0 / bpm
        self.beats = beats
        self.swing = swing
        assert abs(self.beat * beats - LOOP_SECONDS) < 1e-9, f'{bpm} BPM × {beats} 拍 ≠ 15 秒'

    def seconds(self, beat):
        if self.swing:
            whole = math.floor(beat + 1e-9)
            frac = beat - whole
            if abs(frac - 0.5) < 1e-6:
                beat = whole + 2 / 3
        return beat * self.beat


def eighths(bars, start_bar=0, beats_per_bar=4):
    """把「每小節八個八分音符」的寫法轉成 (拍位置, 拍長, 音名)。'-' 延長、'r' 休止"""
    events = []
    for b, slots in enumerate(bars):
        current = None
        for i, slot in enumerate(slots):
            pos = (start_bar + b) * beats_per_bar + i * 0.5
            if slot == '-':
                if current:
                    current[1] += 0.5
                continue
            if current:
                events.append(tuple(current))
                current = None
            if slot != 'r':
                current = [pos, 0.5, slot]
        if current:
            events.append(tuple(current))
    return events


# ───────────── 五首曲子 ─────────────


def harbor():
    """1853–1895 港口商街：琵琶感撥弦主旋律＋竹笛短句＋輕木擊（D 宮五聲音階，96 BPM，六小節）"""
    score = Score(96, 24)
    track = Track()
    melody = eighths([
        ['A4', '-', 'B4', 'A4', 'F#4', '-', 'E4', '-'],
        ['D4', 'E4', 'F#4', 'A4', 'B4', '-', 'r', 'r'],
        ['D5', '-', 'B4', 'A4', 'B4', '-', 'A4', 'F#4'],
        ['E4', '-', '-', 'F#4', 'A4', '-', 'r', 'r'],
        ['B4', 'A4', 'F#4', 'A4', 'E4', '-', 'D4', 'E4'],
        ['F#4', '-', 'E4', '-', 'D4', '-', 'r', 'A3'],
    ])
    for pos, dur, name in melody:
        accent = 0.92 if pos % 2 == 0 else 0.74
        hold = dur * score.beat * 0.92
        track.place(pluck(midi_hz(note(name)), hold, decay=0.9, darkness=0.32, position=0.12, attack_noise=0.12), score.seconds(pos), 0.42 * accent, -0.12, 0.18)
        # 長音以輕微的輪指（快速重複撥弦）延續
        if dur >= 1.0:
            for k in range(1, int(dur * score.beat / 0.075)):
                when = pos + k * 0.075 / score.beat
                track.place(pluck(midi_hz(note(name)), 0.06, decay=0.5, darkness=0.4, position=0.12, attack_noise=0.05, tail=0.4), score.seconds(when), 0.12, -0.12, 0.18)
    # 琵琶低音（每兩小節一次，撐住和聲）
    for pos, name in [(0, 'D3'), (4, 'D3'), (8, 'B2'), (12, 'A2'), (16, 'E3'), (20, 'A2')]:
        track.place(pluck(midi_hz(note(name)), 1.4, decay=1.4, darkness=0.5, position=0.18, attack_noise=0.06), score.seconds(pos), 0.2, -0.05, 0.2)
    # 竹笛的回應短句
    flute = [(6.0, 0.5, 'E5', 0), (6.5, 0.5, 'F#5', 0), (7.0, 0.9, 'A5', 0.6),
             (13.5, 0.5, 'B4', 0), (14.0, 0.5, 'D5', 0), (14.5, 1.3, 'E5', 0.8),
             (21.0, 0.5, 'F#5', 0), (21.5, 0.5, 'E5', 0), (22.0, 1.2, 'D5', 0.5)]
    for pos, dur, name, bend in flute:
        sound = wind(midi_hz(note(name)), dur * score.beat, [1, 0.42, 0.18, 0.08, 0.04], breath=0.035, attack=0.045, release=0.1, vibrato=(5.6, 0.006, 0.2), bend=bend)
        track.place(sound, score.seconds(pos), 0.24, 0.22, 0.28)
    # 輕木擊：像挑貨走路的步伐
    for beat in range(24):
        pitch = 1250 if beat % 2 == 0 else 980
        track.place(woodblock(pitch), score.seconds(beat), 0.11 if beat % 2 == 0 else 0.085, 0.3, 0.1)
        if beat % 4 == 3:
            track.place(woodblock(1250), score.seconds(beat + 0.5), 0.06, 0.3, 0.1)
    return track, 0.9


def banquet():
    """1895–1930 酒樓繁華：洞簫感長旋律（加倚音裝飾）＋細緻撥弦伴奏＋克制的拍板（A 羽調五聲，64 BPM，四小節）"""
    score = Score(64, 16)
    track = Track()
    # 洞簫：(拍位置, 拍長, 音名, 倚音)
    xiao = [(0.0, 2.0, 'E4', 'D4'), (2.0, 1.0, 'G4', None), (3.0, 1.0, 'A4', None),
            (4.0, 1.5, 'C5', 'A4'), (5.5, 0.5, 'A4', None), (6.0, 1.0, 'G4', 'A4'), (7.0, 1.0, 'E4', None),
            (8.0, 1.0, 'D4', None), (9.0, 0.5, 'E4', None), (9.5, 0.5, 'G4', None), (10.0, 2.0, 'A4', 'G4'),
            (12.0, 1.0, 'G4', None), (13.0, 1.0, 'E4', None), (14.0, 1.0, 'D4', 'E4'), (15.0, 0.5, 'C4', None), (15.5, 0.5, 'D4', None)]
    for pos, dur, name, grace in xiao:
        start = score.seconds(pos)
        hold = dur * score.beat * 0.97
        if grace:
            g = wind(midi_hz(note(grace)), 0.07, [1, 0.25, 0.08], breath=0.04, attack=0.02, release=0.04, vibrato=(4.6, 0.0, 1))
            track.place(g, start - 0.08, 0.15, 0.0, 0.32)
        sound = wind(midi_hz(note(name)), hold, [1, 0.26, 0.09, 0.03], breath=0.045, attack=0.11, release=0.2, vibrato=(4.6, 0.0045, 0.35), bend=0.3)
        track.place(sound, start, 0.33, -0.05, 0.32)
    # 古箏感的撥弦分解和弦（輕聲）
    arps = [['A2', 'E3', 'A3', 'C4', 'E4', 'C4', 'A3', 'E3'],
            ['C3', 'G3', 'C4', 'E4', 'G4', 'E4', 'C4', 'G3'],
            ['D3', 'A3', 'D4', 'G4', 'A4', 'G4', 'D4', 'A3'],
            ['G2', 'D3', 'G3', 'A3', 'D4', 'A3', 'G3', 'D3']]
    for bar, notes_ in enumerate(arps):
        for i, name in enumerate(notes_):
            pos = bar * 4 + i * 0.5
            vel = 0.8 if i == 0 else 0.55
            track.place(pluck(midi_hz(note(name)), 0.9, decay=1.8, darkness=0.55, position=0.2, attack_noise=0.05), score.seconds(pos), 0.16 * vel, 0.25, 0.3)
    # 拍板：每小節第一拍，第三拍更輕
    for bar in range(4):
        track.place(clapper(), score.seconds(bar * 4), 0.075, -0.25, 0.25)
        track.place(clapper(), score.seconds(bar * 4 + 2), 0.04, -0.25, 0.25)
    return track, 1.7


def modern():
    """1930–1945 摩登大稻埕：柔和鋼琴主旋律＋撥奏低音提琴＋刷奏爵士鼓（F 大調，128 BPM 輕搖擺，八小節）"""
    score = Score(128, 32, swing=True)
    track = Track()
    melody = eighths([
        ['r', 'r', 'A4', 'C5', 'E5', '-', 'D5', 'C5'],
        ['A4', '-', '-', '-', 'r', 'F4', 'A4', 'C5'],
        ['D5', '-', 'Bb4', '-', 'G4', '-', 'A4', 'Bb4'],
        ['C5', '-', '-', '-', 'r', 'r', 'E4', 'G4'],
        ['A4', 'C5', 'E5', '-', 'D5', 'C5', 'A4', 'G4'],
        ['F#4', '-', 'A4', '-', 'C5', '-', 'A4', 'F#4'],
        ['G4', '-', 'Bb4', 'D5', 'C5', '-', 'Bb4', 'G4'],
        ['A4', '-', '-', '-', '-', '-', 'r', 'r'],
    ])
    for pos, dur, name in melody:
        end = score.seconds(pos + dur)
        start = score.seconds(pos)
        vel = 0.72 if pos % 1 == 0 else 0.6
        track.place(piano(midi_hz(note(name)), (end - start) * 0.95, velocity=vel), start, 0.4 * vel, 0.1, 0.22)
    # 鋼琴左手：三度＋七度的和弦外殼，輕輕放在每小節第一拍
    shells = [('A3', 'E4'), ('F3', 'C4'), ('Bb3', 'F4'), ('E3', 'Bb3'), ('C4', 'G4'), ('F#3', 'C4'), ('Bb3', 'F4'), ('A3', 'E4')]
    for bar, pair in enumerate(shells):
        for name in pair:
            track.place(piano(midi_hz(note(name)), score.beat * 1.6, velocity=0.45), score.seconds(bar * 4), 0.12, -0.1, 0.22)
        if bar == 6:
            for name in ('E3', 'Bb3'):
                track.place(piano(midi_hz(note(name)), score.beat * 1.6, velocity=0.45), score.seconds(bar * 4 + 2), 0.12, -0.1, 0.22)
    # 撥奏低音提琴：四分音符行進低音
    walk = ['F2', 'A2', 'C3', 'A2', 'D2', 'F2', 'A2', 'C3', 'G2', 'Bb2', 'D3', 'Bb2', 'C3', 'E3', 'G2', 'Bb2',
            'A2', 'C3', 'E3', 'C3', 'D3', 'F#2', 'A2', 'C3', 'G2', 'Bb2', 'C3', 'E2', 'F2', 'A2', 'C3', 'E2']
    for beat, name in enumerate(walk):
        sound = pluck(midi_hz(note(name)), score.beat * 0.85, decay=0.75, darkness=1.1, position=0.22, attack_noise=0.04, max_freq=1500, tail=0.8)
        track.place(sound, score.seconds(beat), 0.34, -0.2, 0.12)
    # 鼓刷：一、三拍掃刷，二、四拍輕點，四拍後半拍再輕點
    for beat in range(32):
        if beat % 2 == 0:
            track.place(brush('swish'), score.seconds(beat), 0.05, 0.25, 0.15)
        else:
            track.place(brush('tap'), score.seconds(beat), 0.07, 0.25, 0.15)
        if beat % 4 == 3:
            track.place(brush('tap'), score.seconds(beat + 0.5), 0.035, 0.25, 0.15)
    return track, 1.0


def postwar():
    """1945–1980 庶民生活：木吉他主旋律＋柔和手風琴伴奏＋輕木擊（G 大調，96 BPM，六小節）"""
    score = Score(96, 24)
    track = Track()
    melody = eighths([
        ['D5', '-', 'B4', 'D5', 'E5', 'D5', 'B4', '-'],
        ['G4', '-', 'A4', 'B4', 'r', 'G4', 'E4', '-'],
        ['E5', '-', 'D5', 'C5', 'r', 'E5', 'G5', '-'],
        ['F#5', 'E5', 'D5', '-', 'A4', '-', 'D5', '-'],
        ['E5', 'D5', 'C5', 'A4', 'D5', 'C5', 'B4', 'A4'],
        ['G4', '-', 'B4', 'A4', 'G4', '-', 'A4', 'C5'],
    ])
    for pos, dur, name in melody:
        vel = 0.9 if pos % 1 == 0 else 0.72
        sound = pluck(midi_hz(note(name)), dur * score.beat * 0.9, decay=1.3, darkness=0.3, position=0.17, attack_noise=0.09)
        track.place(sound, score.seconds(pos), 0.4 * vel, 0.12, 0.16)
    # 手風琴：右手和弦（一、三拍按下），左手低音（一拍根音、三拍五度）
    chords = [(['G3', 'B3', 'D4'], 'G2', 'D3'), (['E3', 'G3', 'B3'], 'E2', 'B2'), (['E3', 'G3', 'C4'], 'C3', 'G2'),
              (['D3', 'F#3', 'A3'], 'D3', 'A2'), (['E3', 'G3', 'C4'], 'C3', None), (['G3', 'B3', 'D4'], 'G2', 'D3')]
    for bar, (triad, root, fifth) in enumerate(chords):
        for half in (0, 2):
            freqs = [midi_hz(note(n)) for n in triad]
            if bar == 4 and half == 2:
                freqs = [midi_hz(note(n)) for n in ('D3', 'F#3', 'A3')]
            track.place(reed(freqs, score.beat * 1.7), score.seconds(bar * 4 + half), 0.13, -0.2, 0.18)
            bass = root if half == 0 else (fifth or 'D3')
            track.place(reed([midi_hz(note(bass))], score.beat * 0.8), score.seconds(bar * 4 + half), 0.1, -0.15, 0.12)
    # 輕木擊：二、四拍，偶爾在第二拍後半拍加一下
    for beat in range(24):
        if beat % 2 == 1:
            track.place(woodblock(900), score.seconds(beat), 0.09, 0.3, 0.1)
        if beat % 8 == 1:
            track.place(woodblock(1300), score.seconds(beat + 0.5), 0.05, 0.3, 0.1)
    return track, 0.8


def revival():
    """2000–現在 老屋新生：柔和電鋼琴和弦＋尼龍弦吉他短旋律＋輕刷奏（96 BPM 直拍、半速感，六小節，多留白）"""
    score = Score(96, 24)
    track = Track()
    chords = [['F3', 'A3', 'C4', 'E4', 'G4'], ['E3', 'G3', 'B3', 'D4'], ['D3', 'F3', 'A3', 'C4', 'E4'],
              ['C3', 'E3', 'G3', 'B3'], ['Bb2', 'D3', 'F3', 'A3'], ['C3', 'E3', 'G3', 'A3', 'D4']]
    for bar, names in enumerate(chords):
        for i, name in enumerate(names):
            spread = i * 0.012  # 輕輕分散的和弦
            track.place(epiano(midi_hz(note(name)), score.beat * 3.4), score.seconds(bar * 4) + spread, 0.085, -0.15 + 0.06 * i, 0.26)
        for name in names[1:4]:
            track.place(epiano(midi_hz(note(name)), score.beat * 0.9), score.seconds(bar * 4 + 2.5), 0.04, 0.05, 0.26)
    melody = eighths([
        ['r', 'r', 'A4', 'C5', 'E5', '-', '-', '-'],
        ['D5', '-', 'B4', '-', 'G4', '-', '-', '-'],
        ['-', '-', '-', '-', 'r', 'A4', 'C5', 'D5'],
        ['E5', '-', '-', '-', 'D5', 'C5', 'B4', '-'],
        ['A4', '-', '-', '-', 'r', 'F4', 'A4', '-'],
        ['G4', '-', '-', '-', '-', '-', 'r', 'r'],
    ])
    for pos, dur, name in melody:
        sound = pluck(midi_hz(note(name)), dur * score.beat * 0.92, decay=1.5, darkness=0.65, position=0.22, attack_noise=0.05, max_freq=5000)
        track.place(sound, score.seconds(pos), 0.36, 0.2, 0.22)
    # 輕刷奏：每小節第三拍輕點（半速感），八分音符的沙鈴非常輕
    for bar in range(6):
        track.place(brush('tap'), score.seconds(bar * 4 + 2), 0.06, 0.15, 0.18)
        for i in range(8):
            track.place(brush('shaker'), score.seconds(bar * 4 + i * 0.5), 0.022 if i % 2 else 0.03, 0.35, 0.1)
    return track, 1.1


TRACKS = [
    ('qing-port', '港口商街', harbor),
    ('banquet', '酒樓繁華', banquet),
    ('modern', '摩登大稻埕', modern),
    ('postwar', '庶民生活', postwar),
    ('revival', '老屋新生', revival),
]


# ───────────── 混音、響度與輸出 ─────────────


def k_weighted_rms(stereo):
    """近似 K 加權（高通＋高頻提升）後的方均根，用來統一五首的響度"""

    def k_curve(f):
        hp = smooth_highpass(80, 60)(f)
        shelf = 1 + 0.58 * np.clip((f - 1000) / 2000, 0, 1)
        return hp * shelf

    weighted = fft_filter(stereo, k_curve)
    return float(np.sqrt(np.mean(weighted ** 2)))


def render(builder):
    track, room = builder()
    wet = circular_reverb(track.send, room, seed=len(builder.__name__))
    mix = track.dry + wet
    mix = fft_filter(mix, lambda f: smooth_highpass(45, 25)(f) * smooth_lowpass(9000, 3500)(f))
    return mix


def encode_mp3(stereo, path, title):
    data = np.concatenate([stereo[-PAD:], stereo, stereo[:PAD]])
    pcm = (np.clip(data, -1, 1) * 32767).astype('<i2').tobytes()
    tags = ['-metadata', f'title=合成配樂草稿｜{title}', '-metadata', 'comment=程式離線合成（tools/music/generate_drafts.py），非真實樂器錄音；15 秒循環位於 1–16 秒']
    subprocess.run(
        ['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', *tags, '-c:a', 'libmp3lame', '-b:a', '160k', path],
        input=pcm,
        check=True,
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--wav', help='另外輸出 WAV 母帶的資料夾')
    args = parser.parse_args()
    os.makedirs(OUT_DIR, exist_ok=True)

    mixes = [(era_id, title, render(builder)) for era_id, title, builder in TRACKS]
    # 統一響度：先算出每首要達到同樣 K 加權方均根所需的增益，再整體下調到最大峰值不超過 -1.5 dBFS
    target = 0.11
    gains = [target / k_weighted_rms(mix) for _, _, mix in mixes]
    peak_limit = 10 ** (-1.5 / 20)
    worst = max(np.max(np.abs(mix)) * g for (_, _, mix), g in zip(mixes, gains))
    overall = min(1.0, peak_limit / worst)
    for (era_id, title, mix), gain in zip(mixes, gains):
        final = mix * gain * overall
        path = os.path.join(OUT_DIR, f'era-{era_id}.mp3')
        encode_mp3(final, path, title)
        if args.wav:
            os.makedirs(args.wav, exist_ok=True)
            data = np.concatenate([final[-PAD:], final, final[:PAD]])
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', os.path.join(args.wav, f'era-{era_id}.wav')], input=data.astype('<f4').tobytes(), check=True)
        peak_db = 20 * math.log10(np.max(np.abs(final)))
        loud_db = 20 * math.log10(k_weighted_rms(final))
        print(f'{era_id:10s} {title}  峰值 {peak_db:6.2f} dBFS  K 加權方均根 {loud_db:6.2f} dB  → {os.path.relpath(path, ROOT)}  {os.path.getsize(path) // 1024} KB')


if __name__ == '__main__':
    sys.exit(main())
