/**
 * 五個年代的背景音樂設定表（eraId → 音檔）
 *
 * 目前的五首都是「合成配樂草稿」：以 tools/music/generate_drafts.py 用程式離線合成，
 * 不是真實樂器錄音，也不宣稱還原當年的實際音樂。
 *
 * 音檔格式：17 秒的 MP3，中間 1–16 秒是精確 15 秒的循環區間，前後各多 1 秒循環內容
 * （曲尾最後 1 秒＋完整 15 秒＋曲首前 1 秒）。網頁以 Web Audio 的 AudioBufferSourceNode
 * 設定 loop、loopStart、loopEnd 循環播放；換成正式配樂時，維持同樣格式，
 * 或修改這裡的 loopStart／loopEnd 即可。
 */
const DRAFT = '合成配樂草稿'
const GENERATOR = 'tools/music/generate_drafts.py（numpy 加法合成＋循環殘響，ffmpeg 轉 MP3 160 kbps）'

export const MUSIC_TRACKS = {
  'qing-port': {
    eraId: 'qing-port',
    title: '港口商街',
    file: 'audio/era-qing-port.mp3',
    loopStart: 1,
    loopEnd: 16,
    tempo: '96 BPM・4/4・6 小節',
    voices: ['琵琶感撥弦主旋律（含輪指）', '竹笛回應短句', '輕木擊步伐'],
    mood: 'D 宮五聲音階，輕巧、有貨物往來的步行感',
    source: DRAFT,
    generator: GENERATOR,
  },
  banquet: {
    eraId: 'banquet',
    title: '酒樓繁華',
    file: 'audio/era-banquet.mp3',
    loopStart: 1,
    loopEnd: 16,
    tempo: '64 BPM・4/4・4 小節',
    voices: ['洞簫感長旋律（倚音裝飾）', '古箏感撥弦分解和弦', '克制的拍板'],
    mood: 'A 羽調五聲，典雅舒展，宴席與晚間社交',
    source: DRAFT,
    generator: GENERATOR,
  },
  modern: {
    eraId: 'modern',
    title: '摩登大稻埕',
    file: 'audio/era-modern.mp3',
    loopStart: 1,
    loopEnd: 16,
    tempo: '128 BPM・輕搖擺・8 小節',
    voices: ['柔和鋼琴主旋律（左手和弦外殼）', '撥奏低音提琴行進低音', '鼓刷'],
    mood: 'F 大調，復古西餐廳與咖啡館',
    source: DRAFT,
    generator: GENERATOR,
  },
  postwar: {
    eraId: 'postwar',
    title: '庶民生活',
    file: 'audio/era-postwar.mp3',
    loopStart: 1,
    loopEnd: 16,
    tempo: '96 BPM・4/4・6 小節',
    voices: ['木吉他主旋律', '柔和手風琴伴奏（含低音鍵）', '輕木擊'],
    mood: 'G 大調，親切略帶俏皮，廟口與市場漫步',
    source: DRAFT,
    generator: GENERATOR,
  },
  revival: {
    eraId: 'revival',
    title: '老屋新生',
    file: 'audio/era-revival.mp3',
    loopStart: 1,
    loopEnd: 16,
    tempo: '96 BPM・直拍半速感・6 小節',
    voices: ['柔和電鋼琴和弦', '尼龍弦吉他短旋律', '輕刷奏與沙鈴'],
    mood: '清新放鬆、多留白，現代茶館與老屋餐館',
    source: DRAFT,
    generator: GENERATOR,
  },
}

export function getMusicTrack(eraId) {
  return MUSIC_TRACKS[eraId] ?? null
}
