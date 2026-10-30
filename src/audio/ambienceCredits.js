/**
 * 環境音的來源與授權記錄（資料檔；人看的版本是 public/audio/ambience/CREDITS.md，測試檢查兩者一致）
 *
 * - 只用 CC0 或公有領域的錄音（CC-BY 等需要署名的授權先不用）。
 * - AMBIENCE_SOURCES：每一個下載的原始錄音（網址、作者、授權、原始檔名、錄音地點與時間）。
 * - AMBIENCE_CREDITS：每一個輸出的音檔用了哪些錄音、剪哪一段、做了哪些處理；
 *   `context` 不是空的就是「情境示意」：錄音不是當年、當地的聲音，只取它的聲響質感。
 * - 剪輯程式：tools/music/build_ambience_real.py（只剪輯、濾波、調整音量與交叉淡化，沒有加入合成的聲音）。
 */

const CC0 = { license: 'CC0-1.0', licenseName: 'CC0 1.0（公眾領域貢獻宣告）', licenseNameEn: 'CC0 1.0 (Public Domain Dedication)', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/' }
const FREESOUND_PREVIEW = 'Freesound 免登入的高品質預覽 MP3（128 kbps）；原始檔需要登入才能下載'
const FREESOUND_PREVIEW_EN = 'Freesound high-quality preview MP3 (128 kbps), available without logging in; the original file requires a login to download'

export const AMBIENCE_LICENSES = ['CC0-1.0', 'PD']

export const AMBIENCE_SOURCES = {
  fs318064: {
    title: 'Water_Lapping_River.wav',
    author: 'ceich93',
    url: 'https://freesound.org/people/ceich93/sounds/318064/',
    ...CC0,
    originalFile: 'Water_Lapping_River.wav',
    recorded: '美國哈德遜河卵石岸邊，夜間（上傳於 2015-07-30）',
    recordedEn: 'On a pebbly bank of the Hudson River, USA, at night (uploaded 2015-07-30)',
    downloaded: FREESOUND_PREVIEW,
    downloadedEn: FREESOUND_PREVIEW_EN,
  },
  fs763822: {
    title: 'CRWDBatl_Crowd Grunting, Exerting, Metered, Rowing_ShaneVincent_GSC24_XY-AKG214-96k.wav',
    author: 'ShangusBurger（Shane Vincent）',
    url: 'https://freesound.org/people/ShangusBurger/sounds/763822/',
    ...CC0,
    originalFile: 'CRWDBatl_Crowd Grunting, Exerting, Metered, Rowing_ShaneVincent_GSC24_XY-AKG214-96k.wav',
    recorded: 'GameSoundCon 2024 的群眾錄音：一群人依節奏一起出力的悶喊，像同步划大船（無詞；上傳於 2024-11-06）',
    downloaded: FREESOUND_PREVIEW,
    downloadedEn: FREESOUND_PREVIEW_EN,
  },
  fs585316: {
    title: '2021-08-30-rowing-boat-009.wav',
    author: 'ilmari_freesound',
    url: 'https://freesound.org/people/ilmari_freesound/sounds/585316/',
    ...CC0,
    originalFile: '2021-08-30-rowing-boat-009.wav',
    recorded: '芬蘭塞馬湖（Lake Saimaa）上的舊木划艇，2021-08-30',
    recordedEn: 'An old wooden rowing boat on Lake Saimaa, Finland, 2021-08-30',
    downloaded: FREESOUND_PREVIEW,
    downloadedEn: FREESOUND_PREVIEW_EN,
  },
  fs623986: {
    title: '2022-03-13-muzha-market-ambience-zoom-h5-clippy.wav',
    author: 'ilmari_freesound',
    url: 'https://freesound.org/people/ilmari_freesound/sounds/623986/',
    ...CC0,
    originalFile: '2022-03-13-muzha-market-ambience-zoom-h5-clippy.wav',
    recorded: '臺北木柵市場，週六的熱鬧時段，2022-03-13',
    downloaded: FREESOUND_PREVIEW,
    downloadedEn: FREESOUND_PREVIEW_EN,
  },
  fs792545: {
    title: 'Chinese Hong Kong folk drums and gongs beating 02',
    author: 'Jor92',
    url: 'https://freesound.org/people/Jor92/sounds/792545/',
    ...CC0,
    originalFile: 'Chinese Hong Kong folk drums and gongs beating 02',
    recorded: '香港路邊店家前的醒獅鑼鼓（上傳於 2025-03-15）',
    recordedEn: 'Lion-dance drums and gongs in front of a roadside shop in Hong Kong (uploaded 2025-03-15)',
    downloaded: FREESOUND_PREVIEW,
    downloadedEn: FREESOUND_PREVIEW_EN,
  },
  fs688055: {
    title: 'Traditional Bicycle Bell.wav',
    author: 'trpete',
    url: 'https://freesound.org/people/trpete/sounds/688055/',
    ...CC0,
    originalFile: 'Traditional Bicycle Bell.wav',
    recorded: '英國傳統機械式腳踏車鈴的單響與連響（上傳於 2023-05-20）',
    recordedEn: 'Single and repeated rings of a traditional British mechanical bicycle bell (uploaded 2023-05-20)',
    downloaded: FREESOUND_PREVIEW,
    downloadedEn: FREESOUND_PREVIEW_EN,
  },
  fs826604: {
    title: 'bicycle_rideby_stereo_01',
    author: 'submergent',
    url: 'https://freesound.org/people/submergent/sounds/826604/',
    ...CC0,
    originalFile: 'bicycle_rideby_stereo_01',
    recorded: '舊十段變速腳踏車在粗糙路面滑行經過（上傳於 2025-09-15）',
    recordedEn: 'An old ten-speed bicycle rolling past on a rough road surface (uploaded 2025-09-15)',
    downloaded: FREESOUND_PREVIEW,
    downloadedEn: FREESOUND_PREVIEW_EN,
  },
  fs364806: {
    title: 'Japan_Matsudo_Bicycle_Bell_2.wav',
    author: 'RutgerMuller',
    url: 'https://freesound.org/people/RutgerMuller/sounds/364806/',
    ...CC0,
    originalFile: 'Japan_Matsudo_Bicycle_Bell_2.wav',
    recorded: '日本千葉縣松戶車站附近的腳踏車鈴，2016 年 10 月下旬',
    recordedEn: 'A bicycle bell near Matsudo Station, Chiba Prefecture, Japan, late October 2016',
    downloaded: FREESOUND_PREVIEW,
    downloadedEn: FREESOUND_PREVIEW_EN,
  },
  wc_mazurka1923: {
    title: 'Mazurka in C sharp minor, op. 63, no. 3 (1923 recording)',
    author: '作曲：蕭邦（1810–1849）；演奏：拉赫曼尼諾夫（1873–1943）；Victor 唱片 1008（B-24644，第 8 次錄音），1923-12-27',
    authorEn: 'Composer: Frédéric Chopin (1810–1849); performer: Sergei Rachmaninoff (1873–1943); Victor record 1008 (B-24644, take 8), 27 December 1923',
    url: 'https://commons.wikimedia.org/wiki/File:Mazurka_in_C_sharp_minor,_op._63,_no._3_(1923_recording).mp3',
    license: 'PD',
    licenseName: '公有領域（錄音：1923 年在美國出版，已進入美國公有領域，臺灣著作權法的錄音保護期（公開發表後 50 年）也已屆滿；演奏者逝世逾 80 年。作曲：作者逝世逾 170 年）',
    licenseNameEn: 'Public domain (recording: published in the United States in 1923, now in the US public domain, and the 50-year protection for sound recordings under Taiwan’s Copyright Act has also expired; the performer died more than 80 years ago. Composition: the composer died more than 170 years ago)',
    licenseUrl: 'https://commons.wikimedia.org/wiki/Template:PD-US-record-expired',
    originalFile: 'Mazurka_in_C_sharp_minor,_op._63,_no._3_(1923_recording).mp3',
    recorded: '78 轉蟲膠唱片，美國國會圖書館 National Jukebox 轉錄（https://www.loc.gov/item/jukebox-38676/）',
    recordedEn: '78 rpm shellac record, transferred by the Library of Congress National Jukebox (https://www.loc.gov/item/jukebox-38676/)',
    downloaded: 'Wikimedia Commons 原始檔',
    downloadedEn: 'Original file from Wikimedia Commons',
  },
  fs350323: {
    title: '071416 Victor Victrola playing a record end loop.wav',
    author: 'thaighaudio',
    url: 'https://freesound.org/people/thaighaudio/sounds/350323/',
    ...CC0,
    originalFile: '071416 Victor Victrola playing a record end loop.wav',
    recorded: '1916 年 Victor Victrola VV-XI 留聲機播完 78 轉唱片後唱針在終端溝槽的雜音（錄於 2016-07-14）',
    recordedEn: 'The stylus noise in the run-out groove after a 78 rpm record finished on a 1916 Victor Victrola VV-XI gramophone (recorded 2016-07-14)',
    downloaded: FREESOUND_PREVIEW,
    downloadedEn: FREESOUND_PREVIEW_EN,
  },
  wc_bach1915: {
    title: 'Concerto for two violins Part 1 (1915 recording)',
    author: '作曲：巴哈（1685–1750）；演奏：克萊斯勒、津巴利斯特（小提琴），Walter B. Rogers 指揮；Victor 唱片 76028（C-15560，第 4 次錄音），1915-01-04',
    authorEn: 'Composer: Johann Sebastian Bach (1685–1750); performers: Fritz Kreisler and Efrem Zimbalist (violins), conducted by Walter B. Rogers; Victor record 76028 (C-15560, take 4), 4 January 1915',
    url: 'https://commons.wikimedia.org/wiki/File:Concerto_for_two_violins_Part_1_(1915_recording).mp3',
    license: 'PD',
    licenseName: '公有領域（錄音：1915 年在美國出版，已進入美國公有領域，臺灣著作權法的錄音保護期（公開發表後 50 年）也已屆滿。作曲：作者逝世逾 270 年）',
    licenseNameEn: 'Public domain (recording: published in the United States in 1915, now in the US public domain, and the 50-year protection for sound recordings under Taiwan’s Copyright Act has also expired. Composition: the composer died more than 270 years ago)',
    licenseUrl: 'https://commons.wikimedia.org/wiki/Template:PD-old-auto-record-expired',
    originalFile: 'Concerto_for_two_violins_Part_1_(1915_recording).mp3',
    recorded: '78 轉蟲膠唱片，美國國會圖書館 National Jukebox 轉錄（https://www.loc.gov/item/jukebox-11983/）',
    recordedEn: '78 rpm shellac record, transferred by the Library of Congress National Jukebox (https://www.loc.gov/item/jukebox-11983/)',
    downloaded: 'Wikimedia Commons 原始檔',
    downloadedEn: 'Original file from Wikimedia Commons',
  },
  fs686530: {
    title: 'German Radio Saba_AM.wav',
    author: 'Anellide',
    url: 'https://freesound.org/people/Anellide/sounds/686530/',
    ...CC0,
    originalFile: 'German Radio Saba_AM.wav',
    recorded: '德國 SABA 2000 Transeuropa 真空管收音機在 AM 波段選台的雜訊，錄於比利時布魯塞爾（上傳於 2023-05-09）',
    recordedEn: 'Tuning noise on the AM band of a German SABA 2000 Transeuropa valve radio, recorded in Brussels, Belgium (uploaded 2023-05-09)',
    downloaded: FREESOUND_PREVIEW,
    downloadedEn: FREESOUND_PREVIEW_EN,
  },
  fs450702: {
    title: 'scooters pass by slow and medium speed.flac',
    author: 'kyles',
    url: 'https://freesound.org/people/kyles/sounds/450702/',
    ...CC0,
    originalFile: 'scooters pass by slow and medium speed.flac',
    recorded: '機車以慢速、中速經過（地點未註明；上傳於 2018-12-06）',
    downloaded: FREESOUND_PREVIEW,
    downloadedEn: FREESOUND_PREVIEW_EN,
  },
}

/** 每個輸出音檔（public/audio/ambience/<id>.mp3）的來源與剪輯 */
export const AMBIENCE_CREDITS = {
  'river-lap': {
    sources: ['fs318064'],
    edits: '剪 10–24 秒（沒有人聲、車聲的段落）；去掉 120 Hz 以下的風噪；尾端 2 秒交叉淡化接回開頭成 12 秒循環。',
    editsEn: 'Cut from 10–24 s (a stretch with no voices or traffic); wind noise below 120 Hz removed; the last 2 s cross-faded into the start to make a 12-second loop.',
    context: '情境示意：美國哈德遜河的卵石岸，不是淡水河；只取河水拍岸的聲響。',
    contextEn: 'Illustrative: a pebbly bank of the Hudson River in the USA, not the Tamsui River; only the sound of water lapping the shore is used.',
  },
  'wharf-calls': {
    sources: ['fs763822'],
    edits: '剪 1.2–12.4 秒的八次出力；帶通 90 Hz–2.5 kHz 營造距離感；放在 16 秒循環的開頭，其餘留白。',
    context: '情境示意：工作室錄的群眾出力聲，不是清末碼頭；只用無詞的悶喊，不放任何語言的吆喝內容。',
  },
  oars: {
    sources: ['fs585316'],
    edits: '剪 8–22 秒的划槳、槳架摩擦與水花（避開 23 秒處最大聲的一下）；去掉 60 Hz 以下；交叉淡化成 12 秒循環。',
    editsEn: 'Cut from 8–22 s of oar strokes, oarlock rubbing and splashes (avoiding the loudest knock at 23 s); everything below 60 Hz removed; cross-faded into a 12-second loop.',
    context: '情境示意：芬蘭湖上的木划艇，不是淡水河上的舢舨。',
    contextEn: 'Illustrative: a wooden rowing boat on a Finnish lake, not a sampan on the Tamsui River.',
  },
  'street-murmur': {
    sources: ['fs623986'],
    edits: '剪 20–40 秒（沒有突出的敲擊聲）；帶通 100 Hz–6 kHz，讓人聲只剩嘈雜感；交叉淡化成 18 秒循環。',
    context: '情境示意：2022 年臺北木柵市場的人聲，五個年代共用；用自動語音辨識（Whisper）檢查沒有辨識出清楚的句子。',
  },
  'gong-distant': {
    sources: ['fs792545'],
    edits: '剪 15–33 秒的連續段落；帶通 120 Hz–1.8 kHz，做成遠處傳來的鑼鼓；交叉淡化成 16 秒循環。',
    editsEn: 'Cut from a continuous stretch at 15–33 s; band-passed 120 Hz–1.8 kHz to sound like drums and gongs from far away; cross-faded into a 16-second loop.',
    context: '情境示意：香港醒獅的鑼鼓，不是日治時期大稻埕的演出；實際的樂器與曲目待核。',
    contextEn: 'Illustrative: Hong Kong lion-dance drums and gongs, not a performance in Dadaocheng in the Japanese period; the actual instruments and repertoire are to be verified.',
  },
  'bicycle-bell': {
    sources: ['fs826604', 'fs688055'],
    edits: '腳踏車滑行經過（4.2 秒）放在第 1 秒；車鈴單響（1.6–4.6 秒）放在第 2.6 秒、連響（19.2–22.6 秒）放在第 9 秒；14 秒循環，接點落在無聲處。',
    editsEn: 'A bicycle rolling past (4.2 s) placed at 1 s; a single bell ring (1.6–4.6 s) at 2.6 s and a repeated ring (19.2–22.6 s) at 9 s; a 14-second loop with the join falling in silence.',
    context: '情境示意：英國傳統車鈴與現代腳踏車，不是 1930 年代臺灣的錄音。',
    contextEn: 'Illustrative: a traditional British bell and a modern bicycle, not a recording from 1930s Taiwan.',
  },
  gramophone: {
    sources: ['wc_mazurka1923', 'fs350323'],
    edits: '唱片剪 2.5–24.5 秒，前後淡入 1 秒、淡出 2.5 秒，放在第 2 秒；Victrola 唱針雜音（1.5–13.5 秒）反覆交叉淡化接成連續底噪，比音樂小 14 dB；兩者帶通 250 Hz–4.5 kHz 模擬喇叭留聲機；26 秒循環，接點只有唱針雜音。',
    editsEn: 'The record cut from 2.5–24.5 s, faded in over 1 s and out over 2.5 s, placed at 2 s; the Victrola stylus noise (1.5–13.5 s) repeatedly cross-faded into a continuous bed, 14 dB quieter than the music; both band-passed 250 Hz–4.5 kHz to imitate a horn gramophone; a 26-second loop whose join contains only stylus noise.',
    context: '情境示意：1934 年開業的波麗路西餐廳以 78 轉電唱機播古典樂（見 docs/research/bolero.md），這裡用年代相近、已是公有領域的 1923 年唱片；不是當年大稻埕實際播放的那一張。',
    contextEn: 'Illustrative: the Bolero Western restaurant, opened in 1934, played classical music on a 78 rpm electric record player (see docs/research/bolero.md); here a 1923 record of similar date, now in the public domain, is used, not the one actually played in Dadaocheng at the time.',
  },
  'vendor-calls': {
    sources: ['fs623986'],
    edits: '剪同一段錄音裡較熱鬧的 135–153 秒（攤位前的人聲與交易聲）；帶通 100 Hz–7 kHz；交叉淡化成 16 秒循環。',
    context: '情境示意：2022 年臺北木柵市場，不是 1945–1980 年的慈聖宮廟口；找不到授權清楚的臺灣叫賣錄音，改用聽不出清楚句子的市場人聲（Whisper 檢查）。',
  },
  trishaw: {
    sources: ['fs826604', 'fs364806'],
    edits: '腳踏車滑行經過放慢到 0.8 倍（較重、較慢）、音量提高，放在第 0.8 秒；松戶的車鈴兩段（降低音量）（1.5–3.8、6.7–8.7 秒）放在第 2.4、8.2 秒；12 秒循環，接點落在無聲處。',
    editsEn: 'The bicycle roll-by slowed to 0.8× (heavier, slower) and louder, placed at 0.8 s; two bell passages from Matsudo (quietened) (1.5–3.8 and 6.7–8.7 s) placed at 2.4 and 8.2 s; a 12-second loop with the join falling in silence.',
    context: '情境示意：用腳踏車與日本車鈴組成三輪車經過的聲音，沒有找到授權清楚的三輪車錄音。',
    contextEn: 'Illustrative: a bicycle and a Japanese bell combined to make the sound of a trishaw passing; no clearly licensed trishaw recording was found.',
  },
  radio: {
    sources: ['wc_bach1915', 'fs686530'],
    edits: '唱片剪 40–56 秒，帶通 300 Hz–3.4 kHz 模擬調幅收音機，前後淡入 1.5 秒、淡出 2 秒，放在第 2 秒；SABA 收音機 AM 底噪（1–23 秒，沒有電台內容）帶通 200 Hz–4 kHz、比音樂小 12 dB，交叉淡化成 20 秒循環；接點只有底噪。',
    editsEn: 'The record cut from 40–56 s, band-passed 300 Hz–3.4 kHz to imitate an AM radio, faded in over 1.5 s and out over 2 s, placed at 2 s; the SABA radio’s AM noise bed (1–23 s, with no station content) band-passed 200 Hz–4 kHz and 12 dB quieter than the music, cross-faded into a 20-second loop; the join contains only the noise bed.',
    context: '情境示意：收音機播放的內容用公有領域的 1915 年古典樂唱片代替，不是當年臺灣電台的節目；收音機雜訊錄自德國 SABA 真空管收音機（機種年代未查證）。',
    contextEn: 'Illustrative: what the radio plays is replaced by a public-domain 1915 classical record, not a programme of a Taiwanese station of the time; the radio noise was recorded from a German SABA valve radio (model date unverified).',
  },
  scooter: {
    sources: ['fs450702'],
    edits: '剪 1–29 秒（兩輛機車在第 5、22 秒經過）；去掉 50 Hz 以下的風噪；交叉淡化成 26 秒循環。',
    context: '情境示意：錄音地點未註明，不是迪化街。',
  },
}

/** 載入失敗時的備援：第 9 階段程式合成的示意音（tools/music/generate_ambience.py，沒有第三方素材） */
export const AMBIENCE_FALLBACK_SOURCE = '由 tools/music/generate_ambience.py 以 numpy 濾波雜訊與加法合成，沒有第三方素材'
export const AMBIENCE_FALLBACK_SOURCE_EN = 'Synthesised by tools/music/generate_ambience.py from numpy-filtered noise and additive synthesis, with no third-party material'
