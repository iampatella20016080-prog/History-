#!/usr/bin/env python3
"""
環境音（真實錄音版）：把 CC0／公有領域的錄音剪成可無縫循環的 public/audio/ambience/*.mp3

- 來源清單（網址、作者、授權）在 SOURCES；每個輸出檔用了哪些來源、剪哪一段、做了哪些處理在 BUILD。
  兩者也記在 src/audio/ambienceCredits.js 與 public/audio/ambience/CREDITS.md（測試會檢查一致）。
- 只做剪輯、濾波、音量、淡入淡出、交叉淡化與混音，不加任何合成的聲音。
- 循環：取「循環長度 D + 交叉淡化 X」的片段，把多出的 X 秒以等功率交叉淡化疊回開頭，
  所以第 D 秒接回第 0 秒時波形連續，不會有喀聲；輸出時前後各多 1 秒循環內容（同 generate_ambience.py），
  網頁以 loopStart = 1、loopEnd = 1 + D 循環。
- 響度：每個檔案的方均根統一為 -22 dBFS（與原本的合成音相同，ERA_AMBIENCE 的 gain 不必重調），峰值不超過 -1 dBFS；
  車鈴這類短暫尖峰先用峰值限制（最多降 9 dB）處理，仍超過才整體降低音量。

用法：
  python3 tools/music/build_ambience_real.py <來源資料夾> [輸出資料夾] [名稱...]   （需要 numpy 與 ffmpeg；指定名稱時只輸出那幾個）
  來源資料夾裡沒有的檔案會依 SOURCES 的網址下載（Freesound 用免登入的高品質預覽 MP3；原始 WAV 需要登入）。
  下載的檔案先放在來源資料夾（隔離），確認內容與授權後才執行這個工具輸出到 public/。
"""
import subprocess
import sys
import tempfile
import urllib.request
import wave
from pathlib import Path

import numpy as np

SR = 32000
PAD = 1.0
BITRATE = '64k'
RMS_DB = -22.0
PEAK = 10 ** (-1 / 20)

# 來源：id → (下載網址, 存檔名)
SOURCES = {
    'fs318064': 'https://cdn.freesound.org/previews/318/318064_4457609-hq.mp3',
    'fs585316': 'https://cdn.freesound.org/previews/585/585316_12458758-hq.mp3',
    'fs792545': 'https://cdn.freesound.org/previews/792/792545_16169849-hq.mp3',
    'fs688055': 'https://cdn.freesound.org/previews/688/688055_8202516-hq.mp3',
    'fs826604': 'https://cdn.freesound.org/previews/826/826604_8432168-hq.mp3',
    'fs364806': 'https://cdn.freesound.org/previews/364/364806_179538-hq.mp3',
    'wc_mazurka1923': 'https://upload.wikimedia.org/wikipedia/commons/9/97/Mazurka_in_C_sharp_minor%2C_op._63%2C_no._3_%281923_recording%29.mp3',
    'fs350323': 'https://cdn.freesound.org/previews/350/350323_2205380-hq.mp3',
    'wc_bach1915': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Concerto_for_two_violins_Part_1_%281915_recording%29.mp3',
    'fs686530': 'https://cdn.freesound.org/previews/686/686530_14954609-hq.mp3',
    'fs826025': 'https://cdn.freesound.org/previews/826/826025_5828667-hq.mp3',
}


def n_of(sec):
    return int(round(sec * SR))


def load(src_dir, sid):
    path = Path(src_dir) / f'{sid}.mp3'
    if not path.exists():
        req = urllib.request.Request(SOURCES[sid], headers={'User-Agent': 'Mozilla/5.0 (ddc ambience build)'})
        path.write_bytes(urllib.request.urlopen(req, timeout=300).read())
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype='<f4').astype(np.float64)


def cut(x, start, dur):
    return x[n_of(start):n_of(start) + n_of(dur)].copy()


def band(x, lo=None, hi=None, slope=0.3):
    """FFT 濾波（線性，非環狀；在剪好的片段上做，邊緣由交叉淡化處理）"""
    n = len(x)
    pad = n_of(0.5)
    y = np.concatenate([x[pad:0:-1], x, x[-2:-pad - 2:-1]])  # 鏡射延伸，避免邊緣突波
    spec = np.fft.rfft(y)
    f = np.fft.rfftfreq(len(y), 1 / SR)
    m = np.ones_like(f)
    if lo:
        m *= np.clip((f - lo * (1 - slope)) / (lo * slope * 2), 0, 1)
    if hi:
        m *= np.clip(((hi * (1 + slope)) - f) / (hi * slope * 2), 0, 1)
    return np.fft.irfft(spec * m, len(y))[pad:pad + n]


def fade(x, fin=0.0, fout=0.0):
    x = x.copy()
    if fin:
        k = n_of(fin)
        x[:k] *= np.sin(np.linspace(0, np.pi / 2, k)) ** 2
    if fout:
        k = n_of(fout)
        x[-k:] *= np.cos(np.linspace(0, np.pi / 2, k)) ** 2
    return x


def loop_from(seg, D, X):
    """seg 長度 D + X：把尾端 X 秒等功率交叉淡化疊回開頭，得到長度 D 的無縫循環"""
    n, k = n_of(D), n_of(X)
    assert len(seg) >= n + k, (len(seg), n + k)
    seg = seg[:n + k]
    out = seg[:n].copy()
    t = np.linspace(0, np.pi / 2, k)
    out[:k] = seg[:k] * np.sin(t) + seg[n:n + k] * np.cos(t)
    return out


def place(buf, sig, at):
    """把 sig 放在循環的 at 秒，超過尾端就環繞回開頭（循環裡的事件不會被切斷）"""
    idx = (np.arange(len(sig)) + n_of(at)) % len(buf)
    np.add.at(buf, idx, sig)


def tile(seg, D, X):
    """短的底噪片段反覆交叉淡化接成 D + X 秒，再做成循環"""
    need = n_of(D + X) + n_of(X)
    out = seg.copy()
    k = n_of(X)
    t = np.linspace(0, np.pi / 2, k)
    while len(out) < need:
        nxt = seg.copy()
        out = np.concatenate([out[:-k], out[-k:] * np.cos(t) + nxt[:k] * np.sin(t), nxt[k:]])
    return loop_from(out, D, X)


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)


def limit(x, ceiling, max_cut_db=9.0):
    """峰值限制：在超過 ceiling 的瞬間降低增益（起音 5 毫秒、釋放 150 毫秒，最多降 max_cut_db），
    讓車鈴、輪子喀噠這類短暫的尖峰不會把整個檔案的音量壓得很小"""
    need = np.minimum(1.0, ceiling / (np.abs(x) + 1e-12))
    need = np.maximum(need, 10 ** (-max_cut_db / 20))
    hold = n_of(0.005)
    need = np.minimum.reduce([np.roll(need, k) for k in range(-hold, hold + 1)])  # 提前 5 毫秒降（循環內容，環繞也正確）
    rel = np.exp(-1 / n_of(0.15))
    g = np.empty_like(need)
    cur = 1.0
    for i, v in enumerate(need):
        cur = v if v < cur else v + (cur - v) * rel
        g[i] = cur
    return x * g


def normalize(x):
    x = x - x.mean()
    x = x * 10 ** ((RMS_DB - rms_db(x)) / 20)
    if np.abs(x).max() > PEAK:
        x = limit(x, PEAK)
    p = np.abs(x).max()
    return x * PEAK / p if p > PEAK else x


# ---------- 各聲音（D：循環長度，秒） ----------

def river_lap(src):
    # Hudson 河卵石岸邊的拍岸水聲：10–24 秒（沒有人聲、車聲）；去掉 120 Hz 以下的風噪
    x = load(src, 'fs318064')
    return loop_from(band(cut(x, 10.0, 14.0), lo=120), 12, 2.0)


def oars(src):
    # 芬蘭湖上的舊木划艇：8–22 秒的划槳、槳架摩擦與水花（避開 23 秒處最大聲的一下）
    x = load(src, 'fs585316')
    return loop_from(band(cut(x, 8.0, 14.0), lo=60), 12, 2.0)


def gong_distant(src):
    # 香港醒獅的鑼鼓：15–33 秒（連續段落）；低通 1.8 kHz、去低頻，做成「遠處傳來」的距離感
    x = load(src, 'fs792545')
    return loop_from(band(cut(x, 15.0, 18.0), lo=120, hi=1800), 16, 2.0)


def bicycle_bell(src):
    # 腳踏車滑行經過（4.2 秒）＋傳統機械車鈴：單響（1.6–4.6 秒）與連響（19.2–22.6 秒），放在 14 秒循環的不同位置
    ride = band(load(src, 'fs826604'), lo=80)
    bell = load(src, 'fs688055')
    one = fade(cut(bell, 1.6, 3.0), 0.02, 1.2)
    two = fade(cut(bell, 19.2, 3.4), 0.02, 1.2)
    buf = np.zeros(n_of(14))
    place(buf, fade(ride, 0.3, 0.3) * 1.6, 1.0)
    place(buf, one * 0.8, 2.6)
    place(buf, two * 0.6, 9.0)
    return buf


def gramophone(src):
    # 拉赫曼尼諾夫 1923 年 Victor 唱片（蕭邦〈升 c 小調馬厝卡〉）2.5–24.5 秒，加上 1916 年 Victrola 留聲機的唱針雜音（反覆接成連續底噪）；
    # 帶通 250 Hz–4.5 kHz 模擬喇叭留聲機；音樂前後淡入淡出，循環接點落在只有唱針雜音的地方
    music = band(cut(load(src, 'wc_mazurka1923'), 2.5, 22.0), lo=250, hi=4500)
    surface = band(cut(load(src, 'fs350323'), 1.5, 12.0), lo=250, hi=4500)
    D = 26
    bed = tile(surface, D, 1.5)
    bed *= 10 ** ((rms_db(music) - 14 - rms_db(bed)) / 20)  # 雜音比音樂小 14 dB
    buf = bed.copy()
    place(buf, fade(music, 1.0, 2.5), 2.0)
    return buf


def trishaw(src):
    # 腳踏車滑行經過（放慢到 0.8 倍，聽起來較重、較慢）＋日本松戶車站附近錄的腳踏車鈴兩次
    ride = band(load(src, 'fs826604'), lo=60)
    slow = np.interp(np.arange(0, len(ride) - 1, 0.8), np.arange(len(ride)), ride)
    bell = load(src, 'fs364806')
    a = fade(cut(bell, 1.5, 2.3), 0.02, 0.8)
    b = fade(cut(bell, 6.7, 2.0), 0.02, 0.8)
    buf = np.zeros(n_of(12))
    place(buf, fade(slow, 0.4, 0.4) * 2.5, 0.8)
    place(buf, a * 0.35, 2.4)
    place(buf, b * 0.3, 8.2)
    return buf


def radio(src):
    # 1915 年 Victor 唱片（巴哈〈雙小提琴協奏曲〉，克萊斯勒與津巴利斯特）40–56 秒，帶通 300 Hz–3.4 kHz 模擬調幅收音機；
    # 加上 SABA 真空管收音機在 AM 波段的底噪（0–24 秒，沒有電台內容），音樂前後淡入淡出，接點只有底噪
    music = band(cut(load(src, 'wc_bach1915'), 40.0, 16.0), lo=300, hi=3400)
    static = band(cut(load(src, 'fs686530'), 1.0, 22.0), lo=200, hi=4000)
    D = 20
    bed = loop_from(static, D, 2.0)
    bed *= 10 ** ((rms_db(music) - 12 - rms_db(bed)) / 20)  # 底噪比音樂小 12 dB
    buf = bed.copy()
    place(buf, fade(music, 1.5, 2.0), 2.0)
    return buf


def rain(src):
    # 雨天（第 14 階段，只在精緻畫質）：老社區中庭入口雨棚下的大雨，屋簷漏水滴在地面與草地上。
    # 剪 120–142 秒（雨勢平穩、沒有雷聲與人聲）；去掉 80 Hz 以下的低頻轟聲
    x = load(src, 'fs826025')
    return loop_from(band(cut(x, 120.0, 22.0), lo=80), 20, 2.0)


BUILD = {
    'river-lap': river_lap,
    'oars': oars,
    'gong-distant': gong_distant,
    'bicycle-bell': bicycle_bell,
    'gramophone': gramophone,
    'trishaw': trishaw,
    'radio': radio,
    'rain': rain,
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
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(wav), '-ac', '1', '-ar', str(SR), '-c:a', 'libmp3lame',
                        '-b:a', BITRATE, '-map_metadata', '-1', str(mp3)], check=True)
        return mp3


def seam_check(mp3, D):
    """解碼輸出檔檢查循環接點（不論解碼器在開頭多補幾毫秒都成立，因為前後 1 秒是循環內容的延伸）：
    - jump：播放時 loopEnd 前一個樣本接到 loopStart 的樣本差，除以接點前後 0.5 秒內相鄰樣本差的第 99 百分位；
      不大於 1 表示接點沒有比平常更突兀的跳動（喀聲）
    - period：接點附近 y[t] 與 y[t + D] 的差，相對整個檔案的方均根（dB）；只剩 MP3 編碼誤差"""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(mp3), '-f', 'f32le', '-'], check=True, capture_output=True).stdout
    y = np.frombuffer(raw, dtype='<f4').astype(np.float64)
    a, b, h = n_of(PAD), n_of(PAD + D), n_of(0.5)
    played = np.concatenate([y[b - h:b], y[a:a + h]])
    diffs = np.abs(np.diff(played))
    jump = diffs[h - 1] / (np.percentile(diffs, 99) + 1e-12)
    w = n_of(0.8)
    d = y[a - n_of(0.4):a - n_of(0.4) + w] - y[b - n_of(0.4):b - n_of(0.4) + w]
    return jump, rms_db(d) - rms_db(y), len(y) / SR


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    src = Path(sys.argv[1])
    src.mkdir(parents=True, exist_ok=True)
    out_dir = Path(sys.argv[2] if len(sys.argv) > 2 else 'public/audio/ambience')
    out_dir.mkdir(parents=True, exist_ok=True)
    only = set(sys.argv[3:])
    for name, fn in BUILD.items():
        if only and name not in only:
            continue
        sig = normalize(fn(src))
        D = len(sig) / SR
        mp3 = encode(name, sig, out_dir)
        jump, period, total = seam_check(mp3, D)
        ok = 'OK' if jump <= 1 else '接點有跳動'
        print(f'{name}: 循環 {D:.1f}s，檔長 {total:.2f}s，{mp3.stat().st_size / 1024:.0f} KB；接點跳動比 {jump:.2f}、週期差 {period:.1f} dB {ok}')


if __name__ == '__main__':
    main()
