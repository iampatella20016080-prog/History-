"""
檢查 public/audio 的循環配樂（以 ffmpeg 解碼 MP3，模擬網頁以 loopStart／loopEnd 連續循環播放 45 秒）

用法：python3 tools/music/analyze.py [--json 輸出檔]

檢查項目（全部是客觀數值，不能取代實際試聽）：
- 循環長度是否為 15.000 秒
- 週期性：循環區間前後多出的 1 秒，是否與循環開頭／結尾的內容相同（循環接點無縫的前提）
- 接點：45 秒連播中，兩個接點的樣本跳動量與 20 毫秒音量，和整首的一般情況比較（找爆音與空白）
- 峰值（是否削波）、近似 K 加權響度（五首是否一致）、9 kHz 以上的高頻能量比例
- 突然的重音：20 毫秒音量相對於前後一秒中位數的最大比值
"""

import argparse
import json
import math
import os
import subprocess

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SR = 44100
LOOP_START = 1.0
LOOP_END = 16.0
ERAS = ['qing-port', 'banquet', 'modern', 'postwar', 'revival']


def decode(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype='<f4').reshape(-1, 2).astype(np.float64)


def window_rms(x, size):
    mono = x.mean(axis=1)
    count = len(mono) // size
    return np.sqrt(np.mean(mono[: count * size].reshape(count, size) ** 2, axis=1))


def k_weighted_rms(x):
    spectrum = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(x.shape[0], 1 / SR)
    hp = np.clip((f - 20) / 60, 0, 1)
    shelf = 1 + 0.58 * np.clip((f - 1000) / 2000, 0, 1)
    y = np.fft.irfft(spectrum * (hp * shelf)[:, None], n=x.shape[0], axis=0)
    return float(np.sqrt(np.mean(y ** 2)))


def analyze(era):
    path = os.path.join(ROOT, 'public', 'audio', f'era-{era}.mp3')
    data = decode(path)
    a = int(round(LOOP_START * SR))
    b = int(round(LOOP_END * SR))
    loop = data[a:b]
    n = loop.shape[0]
    # 週期性：檔案中循環區間之後的內容應等於循環開頭、之前的內容應等於循環結尾
    tail = min(int(0.9 * SR), data.shape[0] - b)
    after = data[b:b + tail]
    head_err = float(np.sqrt(np.mean((after - loop[:tail]) ** 2)) / (np.sqrt(np.mean(loop[:tail] ** 2)) + 1e-12))
    before = data[a - tail:a]
    tail_err = float(np.sqrt(np.mean((before - loop[-tail:]) ** 2)) / (np.sqrt(np.mean(loop[-tail:] ** 2)) + 1e-12))
    # 45 秒連播（如同 AudioBufferSourceNode 以 loopStart／loopEnd 循環）
    stream = np.concatenate([loop, loop, loop])
    diff = np.abs(np.diff(stream.mean(axis=1)))
    seams = [n, 2 * n]
    seam_jump = max(float(diff[s - 1]) for s in seams)
    typical_jump = float(np.percentile(diff, 99.9))
    rms20 = window_rms(stream, int(0.02 * SR))
    seam_windows = [float(rms20[s // int(0.02 * SR)]) for s in seams]
    min_rms_db = 20 * math.log10(float(np.min(rms20)) + 1e-12)
    seam_rms_db = 20 * math.log10(min(seam_windows) + 1e-12)
    # 突然的重音：20 毫秒音量 / 前後一秒的中位數
    half = int(1.0 / 0.02 / 2)
    ratios = []
    padded = np.concatenate([rms20[-half:], rms20, rms20[:half]])
    for i in range(len(rms20)):
        med = np.median(padded[i:i + 2 * half])
        ratios.append(rms20[i] / (med + 1e-9))
    spectrum = np.abs(np.fft.rfft(loop.mean(axis=1))) ** 2
    freqs = np.fft.rfftfreq(n, 1 / SR)
    hf_ratio = float(spectrum[freqs > 9000].sum() / spectrum.sum())
    return {
        'era': era,
        'file': os.path.relpath(path, ROOT),
        'bytes': os.path.getsize(path),
        'decodedSeconds': round(data.shape[0] / SR, 3),
        'loopSeconds': round(n / SR, 6),
        'periodicErrorAfterLoop': round(head_err, 4),
        'periodicErrorBeforeLoop': round(tail_err, 4),
        'seamJump': round(seam_jump, 5),
        'typicalJump99_9': round(typical_jump, 5),
        'min20msRmsDb': round(min_rms_db, 1),
        'seam20msRmsDb': round(seam_rms_db, 1),
        'peakDb': round(20 * math.log10(float(np.max(np.abs(stream)))), 2),
        'kWeightedRmsDb': round(20 * math.log10(k_weighted_rms(loop)), 2),
        'above9kHzEnergy': round(hf_ratio, 5),
        'maxTransientRatio': round(float(np.max(ratios)), 2),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--json')
    args = parser.parse_args()
    results = [analyze(era) for era in ERAS]
    louds = [r['kWeightedRmsDb'] for r in results]
    ok = True
    for r in results:
        checks = {
            '循環 15 秒': abs(r['loopSeconds'] - 15.0) < 1e-6,
            '週期性': r['periodicErrorAfterLoop'] < 0.1 and r['periodicErrorBeforeLoop'] < 0.1,
            '接點無爆音': r['seamJump'] <= r['typicalJump99_9'],
            '接點無空白': r['seam20msRmsDb'] > r['min20msRmsDb'] - 1 and r['seam20msRmsDb'] > -50,
            '無削波': r['peakDb'] < -1.0,
            '高頻柔和': r['above9kHzEnergy'] < 0.002,
        }
        r['checks'] = checks
        ok &= all(checks.values())
        marks = '、'.join(f"{k}{'✔' if v else '✘'}" for k, v in checks.items())
        print(f"{r['era']:10s} 峰值 {r['peakDb']:6.2f} dBFS｜響度 {r['kWeightedRmsDb']:6.2f} dB｜週期誤差 {r['periodicErrorAfterLoop']:.3f}/{r['periodicErrorBeforeLoop']:.3f}｜接點跳動 {r['seamJump']:.4f}（一般 99.9% {r['typicalJump99_9']:.4f}）｜接點 20ms 音量 {r['seam20msRmsDb']} dB（最低 {r['min20msRmsDb']} dB）｜9kHz 以上 {r['above9kHzEnergy']*100:.3f}%｜最大瞬間比 {r['maxTransientRatio']}")
        print('           ' + marks)
    spread = max(louds) - min(louds)
    print(f'五首響度差 {spread:.2f} dB')
    ok &= spread < 1.0
    if args.json:
        with open(args.json, 'w') as f:
            json.dump({'tracks': results, 'loudnessSpreadDb': round(spread, 2)}, f, ensure_ascii=False, indent=2, default=bool)
    raise SystemExit(0 if ok else 1)


if __name__ == '__main__':
    main()
