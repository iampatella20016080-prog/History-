#!/usr/bin/env python3
"""
環境音合成工具：產生 public/audio/ambience/*.mp3（每個年代的場景環境聲，與背景音樂分開）

全部是程式合成（numpy 濾波雜訊＋加法合成），不是真實錄音、也沒有使用任何第三方音檔，
所以沒有授權問題；聽感是「示意」，不宣稱還原當年的實際聲音。
每個檔案是單聲道 22.05 kHz、可無縫循環：循環區間用環狀（FFT）濾波與環繞放置事件產生，
輸出時前後各多 1 秒循環內容（同 generate_drafts.py 的作法），網頁以 loopStart／loopEnd 循環。

用法：python3 tools/music/generate_ambience.py [輸出資料夾]   （需要 numpy 與 ffmpeg）
"""
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np

SR = 22050
PAD = 1.0  # 前後多出的循環內容（秒）
rng = np.random.default_rng(1853)


def n_of(sec):
    return int(round(sec * SR))


def noise(n):
    return rng.standard_normal(n)


def bandpass(x, lo, hi, soft=0.25):
    """環狀 FFT 帶通（邊緣平滑），保持循環的連續性"""
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    lo_e, hi_e = max(lo * soft, 1.0), hi * soft
    m = np.clip((f - (lo - lo_e)) / (2 * lo_e), 0, 1) * np.clip(((hi + hi_e) - f) / (2 * hi_e), 0, 1)
    return np.fft.irfft(spec * m, len(x))


def lowpass(x, hi):
    return bandpass(x, 1, hi)


def smooth_noise(n, rate_hz):
    """低頻起伏（0..1），循環連續"""
    return np.clip(0.5 + 0.5 * lowpass(noise(n), rate_hz) / (lowpass(noise(n), rate_hz).std() + 1e-9) * 0.7, 0, 1)


def add_wrapped(buf, sig, start):
    """把 sig 從 start 位置混入，超過尾端就環繞回開頭"""
    idx = (np.arange(len(sig)) + start) % len(buf)
    np.add.at(buf, idx, sig)


def env_exp(n, attack, decay):
    t = np.arange(n) / SR
    return np.minimum(t / max(attack, 1e-4), 1) * np.exp(-t / decay)


def voice(dur, f0s, vowels, vib=5.0, breath=0.03):
    """共振峰人聲：f0 輪廓（Hz，線性內插）＋母音共振峰（(F1,F2,F3) 內插），回傳 dur 秒的訊號"""
    n = n_of(dur)
    f0 = np.interp(np.linspace(0, 1, n), np.linspace(0, 1, len(f0s)), f0s)
    f0 = f0 * (1 + 0.012 * np.sin(2 * np.pi * vib * np.arange(n) / SR))
    phase = np.cumsum(f0) / SR
    src = np.zeros(n)
    for h in range(1, 30):  # 帶限鋸齒波
        src += np.sin(2 * np.pi * h * phase) / h
    src += breath * noise(n)
    out = np.zeros(n)
    seg = max(1, n // len(vowels))
    # 每個母音一段，邊界交叉淡化
    pieces = []
    for i, (F1, F2, F3) in enumerate(vowels):
        full = bandpass(src, F1 * 0.8, F1 * 1.2) * 1.0 + bandpass(src, F2 * 0.85, F2 * 1.15) * 0.6 + bandpass(src, F3 * 0.9, F3 * 1.1) * 0.25
        pieces.append(full)
    w = np.zeros((len(vowels), n))
    pos = np.linspace(0, len(vowels) - 1, n)
    for i in range(len(vowels)):
        w[i] = np.clip(1 - np.abs(pos - i), 0, 1)
    out = sum(p * w[i] for i, p in enumerate(pieces))
    return out / (np.abs(out).max() + 1e-9)


VOWEL = {
    'a': (800, 1200, 2600),
    'o': (500, 900, 2500),
    'e': (450, 1900, 2600),
    'u': (320, 800, 2400),
    'i': (300, 2300, 3000),
}


def normalize(x, rms_db=-22.0, peak=0.9):
    x = x - x.mean()
    rms = np.sqrt(np.mean(x**2)) + 1e-9
    x = x * (10 ** (rms_db / 20) / rms)
    p = np.abs(x).max()
    if p > peak:
        x = x * peak / p
    return x


# ---------- 各聲音 ----------

def river_lap(D=10):
    n = n_of(D)
    out = np.zeros(n)
    for lo, hi, rate, amp in [(120, 500, 0.35, 1.0), (400, 1600, 0.7, 0.7), (1500, 4500, 1.3, 0.35)]:
        mod = np.clip(0.45 + 0.55 * lowpass(noise(n), rate) / 0.35, 0.05, 1.6)
        out += bandpass(noise(n), lo, hi) * mod * amp
    for _ in range(14):  # 水泡的咕嚕聲
        d = rng.uniform(0.06, 0.16)
        t = np.arange(n_of(d)) / SR
        f = rng.uniform(300, 700) * (1 + 1.5 * t / d)
        g = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 2 * rng.uniform(0.04, 0.1)
        add_wrapped(out, g * out.std() * 8, rng.integers(0, n))
    return normalize(out, -24)


def wharf_calls(D=12):
    n = n_of(D)
    out = np.zeros(n)
    for start, base in [(1.2, 118), (6.4, 134)]:
        call1 = voice(0.45, [base * 1.1, base * 1.35, base * 1.25], [VOWEL['e'], VOWEL['o']])
        call2 = voice(0.9, [base * 1.3, base * 1.5, base * 1.0], [VOWEL['o'], VOWEL['a'], VOWEL['o']])
        sig = np.concatenate([call1 * env_exp(len(call1), 0.04, 0.5), np.zeros(n_of(0.12)), call2 * np.sin(np.linspace(0, np.pi, len(call2))) ** 0.6])
        add_wrapped(out, sig, n_of(start))
    # 簡單回聲（河面反射）
    echo = np.zeros(n)
    for k, g in [(0.23, 0.35), (0.47, 0.18)]:
        echo += np.roll(out, n_of(k)) * g
    out = lowpass(out + echo, 3200)
    out += bandpass(noise(n), 100, 700) * 0.02
    return normalize(out, -26)


def oars(D=10):
    n = n_of(D)
    out = np.zeros(n)
    for i in range(3):
        t0 = n_of(0.8 + i * 3.2 + rng.uniform(-0.1, 0.1))
        # 槳架摩擦的吱嘎聲（會滑動的窄頻）
        dur = n_of(0.7)
        t = np.arange(dur) / SR
        f = 520 + 160 * np.sin(2 * np.pi * 2.2 * t) + 80 * t
        creak = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 27 * t))) * np.sin(np.pi * t / 0.7) ** 2
        add_wrapped(out, creak * 0.05, t0)
        # 入水濺起
        splash = bandpass(noise(n_of(0.5)), 500, 5000) * env_exp(n_of(0.5), 0.02, 0.12)
        add_wrapped(out, splash * 0.35, t0 + n_of(0.55))
        # 出水滴落
        for j in range(5):
            dd = n_of(0.05)
            drop = np.sin(2 * np.pi * rng.uniform(700, 1400) * np.arange(dd) / SR) * env_exp(dd, 0.003, 0.02)
            add_wrapped(out, drop * rng.uniform(0.04, 0.1), t0 + n_of(1.2 + 0.25 * j + rng.uniform(0, 0.1)))
    out += bandpass(noise(n), 150, 900) * 0.015
    return normalize(out, -26)


def babble(D=12, voices=9, lo=180, hi=3400, shimmer=0.0):
    n = n_of(D)
    out = np.zeros(n)
    for _ in range(voices):
        v = np.zeros(n)
        pos = 0.0
        base = rng.uniform(105, 250)
        while pos < D:
            syl = rng.uniform(0.12, 0.28)
            dur = min(syl, D - pos)
            if dur > 0.05:
                vow = [VOWEL[k] for k in rng.choice(list(VOWEL), 2)]
                f0 = base * rng.uniform(0.85, 1.3)
                s = voice(dur, [f0, f0 * rng.uniform(0.85, 1.25)], vow, vib=rng.uniform(4, 6))
                s *= np.sin(np.linspace(0, np.pi, len(s))) ** 1.5
                add_wrapped(v, s, n_of(pos))
            pos += syl + (rng.uniform(0.0, 0.1) if rng.random() < 0.7 else rng.uniform(0.3, 1.0))
        out += v * rng.uniform(0.5, 1.0)
    out = bandpass(out, lo, hi) + 0.05 * bandpass(noise(n), 300, 2500) * out.std()
    return normalize(out, -25)


def gong_distant(D=14):
    n = n_of(D)
    out = np.zeros(n)
    partials = [(1.0, 1.0, 3.2), (1.52, 0.55, 2.2), (2.09, 0.4, 1.7), (2.76, 0.25, 1.2), (3.4, 0.12, 0.8)]

    def gong(f0, dur=4.0):
        t = np.arange(n_of(dur)) / SR
        s = sum(a * np.sin(2 * np.pi * f0 * r * t + rng.uniform(0, 6)) * np.exp(-t / dec) for r, a, dec in partials)
        return s * np.minimum(t / 0.01, 1)

    def drum(dur=0.25):
        t = np.arange(n_of(dur)) / SR
        return np.sin(2 * np.pi * np.cumsum(110 * np.exp(-t * 14) + 70) / SR) * np.exp(-t / 0.07)

    add_wrapped(out, gong(190) * 0.5, n_of(1.0))
    add_wrapped(out, gong(255) * 0.35, n_of(7.8))
    # 小鑼鼓點（遠處的鑼鼓示意，不是特定曲牌）
    for t0, k in [(3.6, 0), (3.9, 1), (4.15, 1), (4.4, 0), (10.6, 0), (10.9, 1), (11.1, 1)]:
        add_wrapped(out, drum() * (0.5 if k else 0.8), n_of(t0))
    # 撥弦音（五聲音階，稀疏）
    for t0, f in [(5.2, 392), (5.9, 440), (6.5, 587), (12.3, 523), (13.0, 392)]:
        t = np.arange(n_of(1.2)) / SR
        s = sum(np.sin(2 * np.pi * f * h * t) / h**1.3 for h in range(1, 7)) * np.exp(-t / 0.35)
        add_wrapped(out, s * 0.25, n_of(t0))
    out = lowpass(out, 2600)
    # 遠處：加上室內回響感
    tail = np.zeros(n)
    for k, g in [(0.09, 0.4), (0.19, 0.3), (0.33, 0.2)]:
        tail += np.roll(out, n_of(k)) * g
    return normalize(out + tail, -26)


def bicycle_bell(D=12):
    n = n_of(D)
    out = np.zeros(n)

    def ring(f, dur=0.9):
        t = np.arange(n_of(dur)) / SR
        s = np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 1.5 * t) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t)
        return s * np.exp(-t / 0.28) * (1 + 0.4 * np.sin(2 * np.pi * 22 * t))

    for t0 in (2.0, 2.28, 8.6):
        add_wrapped(out, ring(2700 + rng.uniform(-60, 60)) * 0.5, n_of(t0))
    # 腳踏車滑行的鏈條與輪軸聲
    for t0, d in [(1.6, 3.0), (8.0, 3.5)]:
        dn = n_of(d)
        tick = np.zeros(dn)
        tick[:: n_of(0.045)] = 1.0
        s = bandpass(tick + 0.1 * noise(dn), 1800, 5200) * np.sin(np.linspace(0, np.pi, dn)) ** 2
        add_wrapped(out, s * 0.12, n_of(t0))
    out += bandpass(noise(n), 200, 1500) * 0.01
    return normalize(out, -27)


def tinny_phrase(notes, step, tone_lo=400, tone_hi=3000):
    """窄頻、略失真的小旋律（留聲機的『喇叭』音色）"""
    n = n_of(step * len(notes))
    out = np.zeros(n)
    for i, f in enumerate(notes):
        if f is None:
            continue
        t = np.arange(n_of(step * 1.3)) / SR
        s = sum(np.sin(2 * np.pi * f * h * t) / h for h in range(1, 6)) * np.exp(-t / (step * 0.8)) * np.minimum(t / 0.01, 1)
        add_wrapped(out, s, n_of(i * step))
    return out


def gramophone(D=12):
    n = n_of(D)
    # 一小段五聲音階的示意音型（不是任何一首歌）
    notes = [392, 440, 523, 440, 392, None, 330, 392, 440, None, 392, 330]
    music = tinny_phrase(notes, D / len(notes))
    music = np.tanh(2.2 * music / (np.abs(music).max() + 1e-9))
    music = bandpass(music, 450, 2800)
    # 針與溝槽：每轉一圈的低頻咚咚聲（78 轉≈每 0.77 秒），加上爆裂雜音與沙沙聲
    rot = np.zeros(n)
    period = D / 13  # 讓循環長度剛好是整數圈
    for k in range(13):
        d = n_of(0.05)
        t = np.arange(d) / SR
        add_wrapped(rot, np.sin(2 * np.pi * 70 * t) * np.exp(-t / 0.015) * 0.5, n_of(k * period))
    crackle = np.zeros(n)
    idx = rng.integers(0, n, 70)
    crackle[idx] = rng.uniform(-1, 1, 70) * rng.uniform(0.2, 1.0, 70)
    crackle = bandpass(crackle, 1500, 6000) * 3
    hiss = bandpass(noise(n), 1200, 6500) * 0.06
    out = music * 0.55 + crackle * 0.35 + hiss + rot * 0.15
    return normalize(out, -26)


def vendor_calls(D=12):
    n = n_of(D)
    out = np.zeros(n)
    patterns = [
        (0.8, 150, [VOWEL['a'], VOWEL['o'], VOWEL['a']], [1.0, 1.35, 1.1, 0.9]),
        (4.6, 190, [VOWEL['e'], VOWEL['a'], VOWEL['u']], [1.1, 1.0, 1.4, 1.2]),
        (8.4, 135, [VOWEL['o'], VOWEL['e'], VOWEL['a']], [1.0, 1.25, 1.25, 0.85]),
    ]
    for start, base, vows, contour in patterns:
        for rep in range(2):
            s = voice(0.6, [base * c for c in contour], vows)
            s *= np.sin(np.linspace(0, np.pi, len(s))) ** 0.7
            add_wrapped(out, s, n_of(start + rep * 0.85))
    out = lowpass(out, 3300)
    # 廟埕的空間感
    tail = sum(np.roll(out, n_of(k)) * g for k, g in [(0.07, 0.35), (0.16, 0.25), (0.29, 0.15)])
    return normalize(out + tail, -26)


def trishaw(D=10):
    n = n_of(D)
    out = np.zeros(n)
    # 鈴聲（比腳踏車鈴低沉）
    for t0 in (2.2, 2.55):
        t = np.arange(n_of(0.9)) / SR
        s = (np.sin(2 * np.pi * 1850 * t) + 0.5 * np.sin(2 * np.pi * 2770 * t)) * np.exp(-t / 0.3)
        add_wrapped(out, s * 0.4, n_of(t0))
    # 鏈條與踏板的規律聲、木輪的滾動
    d = n_of(6.0)
    tick = np.zeros(d)
    tick[:: n_of(0.11)] = 1.0
    chain = bandpass(tick + 0.05 * noise(d), 1200, 4500) * np.sin(np.linspace(0, np.pi, d)) ** 1.5
    add_wrapped(out, chain * 0.14, n_of(0.5))
    roll = bandpass(noise(d), 80, 450) * np.sin(np.linspace(0, np.pi, d)) ** 1.5
    add_wrapped(out, roll * 0.25, n_of(0.5))
    return normalize(out, -27)


def radio(D=12):
    n = n_of(D)
    # 調幅收音機：窄頻（300–3200 Hz）、人聲般的起伏（只有節奏，沒有內容）、底噪與偶爾的選台雜訊
    talk = babble(D, voices=2, lo=300, hi=3200)
    talk = np.tanh(1.8 * talk / (np.abs(talk).max() + 1e-9))
    hiss = bandpass(noise(n), 400, 3500) * 0.18
    hum = np.sin(2 * np.pi * 60 * np.arange(n) / SR) * 0.03  # 60 Hz 電源哼聲（臺灣市電 60 Hz）
    sweep = np.zeros(n)
    d = n_of(0.6)
    t = np.arange(d) / SR
    add_wrapped(sweep, bandpass(noise(d), 500, 3000) * np.sin(np.pi * t / 0.6) ** 2 * 0.5, n_of(9.0))
    out = talk * 0.5 + hiss + hum + sweep
    return normalize(bandpass(out, 300, 3300), -26)


def scooter(D=12):
    n = n_of(D)
    out = np.zeros(n)
    for start, dur, peak in [(1.0, 5.0, 1.0), (7.6, 4.2, 0.7)]:
        dn = n_of(dur)
        x = np.linspace(0, 1, dn)
        f0 = 45 + 55 * np.sin(np.pi * x) ** 1.5 + 12 * x  # 引擎轉速：加速後減速
        ph = np.cumsum(f0) / SR
        eng = sum(np.sin(2 * np.pi * h * ph + h) * (1.0 / h**0.8) for h in range(1, 14))
        eng *= 1 + 0.35 * np.sin(2 * np.pi * np.cumsum(f0 / 2) / SR)  # 四行程的不均勻爆震
        eng = lowpass(eng, 1400)
        tire = bandpass(noise(dn), 600, 3500) * 0.25
        amp = np.sin(np.pi * x) ** 2  # 由遠而近再遠去
        add_wrapped(out, (eng + tire) * amp * peak, n_of(start))
    return normalize(out, -25)


SOUNDS = {
    'river-lap': river_lap,
    'wharf-calls': wharf_calls,
    'oars': oars,
    'street-murmur': babble,
    'gong-distant': gong_distant,
    'bicycle-bell': bicycle_bell,
    'gramophone': gramophone,
    'vendor-calls': vendor_calls,
    'trishaw': trishaw,
    'radio': radio,
    'scooter': scooter,
}


def encode(name, sig, out_dir):
    pad = n_of(PAD)
    full = np.concatenate([sig[-pad:], sig, sig[:pad]])
    pcm = (np.clip(full, -1, 1) * 32767).astype('<i2')
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / f'{name}.wav'
        with wave.open(str(wav), 'wb') as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes(pcm.tobytes())
        mp3 = Path(out_dir) / f'{name}.mp3'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(wav), '-ac', '1', '-ar', str(SR), '-b:a', '56k', '-map_metadata', '-1', str(mp3)], check=True)
        return mp3


def main():
    out_dir = Path(sys.argv[1] if len(sys.argv) > 1 else 'public/audio/ambience')
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, fn in SOUNDS.items():
        sig = fn()
        mp3 = encode(name, sig, out_dir)
        print(f'{name}: {len(sig) / SR:.1f}s 循環 → {mp3} ({mp3.stat().st_size / 1024:.0f} KB)')


if __name__ == '__main__':
    main()
