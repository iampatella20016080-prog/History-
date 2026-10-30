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
const DRAFT_EN = 'Synthesised draft score'
const GENERATOR = 'tools/music/generate_drafts.py（numpy 加法合成＋循環殘響，ffmpeg 轉 MP3 160 kbps）'
const GENERATOR_EN = 'tools/music/generate_drafts.py (numpy additive synthesis with looped reverb; MP3 160 kbps via ffmpeg)'

export const MUSIC_TRACKS = {
  'qing-port': {
    eraId: 'qing-port',
    title: '港口商街',
    titleEn: 'Harbour Merchant Street',
    file: 'audio/era-qing-port.mp3',
    loopStart: 1,
    loopEnd: 16,
    tempo: '96 BPM・4/4・6 小節',
    tempoEn: '96 BPM · 4/4 · 6 bars',
    voices: ['琵琶感撥弦主旋律（含輪指）', '竹笛回應短句', '輕木擊步伐'],
    voicesEn: ['Pipa-like plucked lead melody (with tremolo)', 'Bamboo-flute response phrases', 'Light woodblock tread'],
    mood: 'D 宮五聲音階，輕巧、有貨物往來的步行感',
    moodEn: 'D-gong pentatonic scale; light, with the stride of goods coming and going',
    source: DRAFT,
    sourceEn: DRAFT_EN,
    generator: GENERATOR,
    generatorEn: GENERATOR_EN,
  },
  banquet: {
    eraId: 'banquet',
    title: '酒樓繁華',
    titleEn: 'Banquet Hall Boom',
    file: 'audio/era-banquet.mp3',
    loopStart: 1,
    loopEnd: 16,
    tempo: '64 BPM・4/4・4 小節',
    tempoEn: '64 BPM · 4/4 · 4 bars',
    voices: ['洞簫感長旋律（倚音裝飾）', '古箏感撥弦分解和弦', '克制的拍板'],
    voicesEn: ['Dongxiao-like long melody (with grace notes)', 'Guzheng-like plucked broken chords', 'Restrained clapper'],
    mood: 'A 羽調五聲，典雅舒展，宴席與晚間社交',
    moodEn: 'A-yu pentatonic mode; elegant and expansive, for banquets and evening socialising',
    source: DRAFT,
    sourceEn: DRAFT_EN,
    generator: GENERATOR,
    generatorEn: GENERATOR_EN,
  },
  modern: {
    eraId: 'modern',
    title: '摩登大稻埕',
    titleEn: 'Modern Dadaocheng',
    file: 'audio/era-modern.mp3',
    loopStart: 1,
    loopEnd: 16,
    tempo: '128 BPM・輕搖擺・8 小節',
    tempoEn: '128 BPM · light swing · 8 bars',
    voices: ['柔和鋼琴主旋律（左手和弦外殼）', '撥奏低音提琴行進低音', '鼓刷'],
    voicesEn: ['Soft piano lead melody (left-hand chord shells)', 'Pizzicato double-bass walking bass', 'Brushed drums'],
    mood: 'F 大調，復古西餐廳與咖啡館',
    moodEn: 'F major; a retro Western restaurant and cafe',
    source: DRAFT,
    sourceEn: DRAFT_EN,
    generator: GENERATOR,
    generatorEn: GENERATOR_EN,
  },
  postwar: {
    eraId: 'postwar',
    title: '庶民生活',
    titleEn: 'Everyday Life',
    file: 'audio/era-postwar.mp3',
    loopStart: 1,
    loopEnd: 16,
    tempo: '96 BPM・4/4・6 小節',
    tempoEn: '96 BPM · 4/4 · 6 bars',
    voices: ['木吉他主旋律', '柔和手風琴伴奏（含低音鍵）', '輕木擊'],
    voicesEn: ['Acoustic guitar lead melody', 'Soft accordion accompaniment (with bass keys)', 'Light woodblock'],
    mood: 'G 大調，親切略帶俏皮，廟口與市場漫步',
    moodEn: 'G major; friendly and slightly playful, for strolling the temple forecourt and market',
    source: DRAFT,
    sourceEn: DRAFT_EN,
    generator: GENERATOR,
    generatorEn: GENERATOR_EN,
  },
  revival: {
    eraId: 'revival',
    title: '老屋新生',
    titleEn: 'Old Houses, New Life',
    file: 'audio/era-revival.mp3',
    loopStart: 1,
    loopEnd: 16,
    tempo: '96 BPM・直拍半速感・6 小節',
    tempoEn: '96 BPM · straight beat, half-time feel · 6 bars',
    voices: ['柔和電鋼琴和弦', '尼龍弦吉他短旋律', '輕刷奏與沙鈴'],
    voicesEn: ['Soft electric-piano chords', 'Nylon-string guitar short melody', 'Light brushing and shaker'],
    mood: '清新放鬆、多留白，現代茶館與老屋餐館',
    moodEn: 'Fresh and relaxed with plenty of space; modern teahouses and old-house restaurants',
    source: DRAFT,
    sourceEn: DRAFT_EN,
    generator: GENERATOR,
    generatorEn: GENERATOR_EN,
  },
}

export function getMusicTrack(eraId) {
  return MUSIC_TRACKS[eraId] ?? null
}
