import { deckInspectSpot } from './qingBoardingLayout.js'

/**
 * 清末搭船：帆船甲板上可以近看的器物（第 11 階段的五層資訊格式，見 data/inspectLayers.js）。
 * 查證紀錄見 docs/research/qing-boarding.md；形制查無的部分標「歷史情境重建」（reconstruction）。
 * 鴉片箱先不做（等使用者確認）。
 */
export const QING_BOARDING_OBJECTS = {
  'camphor-box': {
    id: 'camphor-box',
    title: '襯鉛樟腦箱',
    titleEn: 'Lead-lined camphor box',
    lead: '清代臺灣的樟腦經香港轉運出口，裝在襯鉛的木箱裡，防止揮發——箱子的大小與外觀查無，模型是重建。',
    leadEn: 'In the Qing period Taiwan camphor went out through Hong Kong packed in lead-lined wooden boxes to stop it evaporating; the box’s size and look are not found, so the model is a reconstruction.',
    actions: [{ id: 'lid', label: '掀開箱蓋', labelEn: 'Lift the lid', doneLabel: '蓋回箱蓋', doneLabelEn: 'Close the lid' }],
    reconstruction: true,
    sourceIds: ['davidson-formosa-1903'],
    layers: {
      form: [
        { text: 'Davidson（1903）記載，以前經香港出口的樟腦裝在襯鉛的木箱（wooden boxes lined with lead）裡。', textEn: 'Davidson (1903) records that camphor formerly exported through Hong Kong was packed in wooden boxes lined with lead.', sourceIds: ['davidson-formosa-1903'] },
        { text: '箱子的尺寸、木料、鉛襯的厚薄與綑紮方式都查無：模型是依茶箱的做法重建的。', textEn: 'The box’s dimensions, timber, lead thickness and binding are not found: the model is reconstructed on the pattern of the tea chest.', status: 'reconstruction' },
      ],
      making: [
        { text: '華商把樟腦存在大木桶裡，有時加水蓋著防止揮發；日治初期改用桶裝，樟腦油裝在舊煤油鐵罐裡，專賣以後改用帆布袋（Davidson）。', textEn: 'Chinese merchants kept camphor in large wooden tubs, sometimes covered with water to stop it evaporating; in the early Japanese period tubs were used, camphor oil went into old kerosene tins, and after the monopoly canvas bags replaced them (Davidson).', sourceIds: ['davidson-formosa-1903'] },
      ],
      use: [
        { text: '樟腦是清末臺灣繼茶之後的重要出口品；這裡放在甲板上，當作準備順河送到淡水出口的貨（貨怎麼裝上帆船查無）。', textEn: 'Camphor was late-Qing Taiwan’s major export after tea; here it sits on deck as cargo bound downriver to Tamsui for export (how cargo was loaded onto the junk is not found).', status: 'reconstruction' },
      ],
      where: [{ text: '只在港口商街的帆船甲板上。', textEn: 'Only on the junk’s deck in the Harbour Merchant Street era.' }],
      evidence: [
        { text: 'Davidson, The Island of Formosa（1903）樟腦章：約第 432 頁的運輸損耗段落。', textEn: 'Davidson, The Island of Formosa (1903), camphor chapter: the passage on losses in transport, about p. 432.', sourceIds: ['davidson-formosa-1903'] },
        { text: '清末樟腦箱的照片或實物：沒有找到。', textEn: 'A photograph or surviving example of a late-Qing camphor box: not found.', status: 'pending' },
      ],
    },
  },
  'ballast-stones': {
    id: 'ballast-stones',
    title: '壓艙石',
    titleEn: 'Ballast stones',
    lead: '空船要壓艙才穩。1867 年的淡水海關報告說，數百艘戎克船把壓艙石倒進河裡，河道越淤越淺。',
    leadEn: 'An empty hull needs ballast to sit steady. The 1867 Tamsui customs report says hundreds of junks dumped their ballast stones into the river, silting it up.',
    actions: [{ id: 'lift', label: '拿起一塊', labelEn: 'Pick one up', doneLabel: '放回去', doneLabelEn: 'Put it back' }],
    reconstruction: true,
    sourceIds: ['tamsui-trade-report-1867', 'tamsui-trade-report-1879'],
    layers: {
      form: [
        { text: '艙底的石頭：大小、產地與有沒有另外裝袋都查無，這裡畫成一堆拳頭到人頭大的河石。', textEn: 'Stones in the bottom of the hold: their size, origin and whether they were bagged are not found; here they are drawn as a heap of river stones from fist- to head-sized.', status: 'reconstruction' },
      ],
      making: [
        { text: '1867 年淡水海關報告：這一年有 689 艘戎克船進港，海關以每艘平均 70 噸估算。', textEn: 'Tamsui customs report for 1867: 689 junks entered the port that year, which the customs reckoned at an average of 70 tons each.', sourceIds: ['tamsui-trade-report-1867'] },
      ],
      use: [
        { text: '同一份報告說，數百艘戎克船把壓艙石倒進河裡，和河口的沙洲一起讓港口變淺。', textEn: 'The same report says that hundreds of junks discharged their ballast into the river, which together with the bar at the mouth was making the harbour shallower.', sourceIds: ['tamsui-trade-report-1867'] },
        { text: '1879 年的報告：大稻埕到港口之間，只有吃水不到三呎的船可以通行；沙洲每年冬天增厚一到一呎半。', textEn: 'The 1879 report: between Twatutia and the port no boat drawing more than three feet could be used; the bar grew one to one and a half feet thicker every winter.', sourceIds: ['tamsui-trade-report-1879'] },
      ],
      where: [{ text: '只在港口商街的帆船甲板上（貨艙口往下看）。', textEn: 'Only on the junk’s deck in the Harbour Merchant Street era (look down through the hatch).' }],
      evidence: [
        { text: 'Tamsui Trade Report for 1867（收在 Reports on Trade at the Treaty Ports in China）：進港船數在第 80 頁、壓艙石在第 82 頁的 Harbours 一節。', textEn: 'Tamsui Trade Report for 1867 (in Reports on Trade at the Treaty Ports in China): the number of junks on p. 80, the ballast on p. 82 under “Harbours”.', sourceIds: ['tamsui-trade-report-1867'] },
        { text: 'Tamsui Trade Report for 1879：港務長 Brenan 的段落，約第 184 頁（頁碼由頁眉推得）。', textEn: 'Tamsui Trade Report for 1879: the harbour master Brenan’s passage, about p. 184 (page inferred from the running head).', sourceIds: ['tamsui-trade-report-1879'] },
      ],
    },
  },
  'boat-eye': {
    id: 'boat-eye',
    title: '船眼',
    titleEn: 'Boat eye',
    lead: '船首左右各一隻眼睛，眼周塗紅——記憶庫描述的「紅頭仔」內河貨船就是這樣；Davidson 的基隆河照片上，船首也有一個圓形的標記。',
    leadEn: 'An eye on each side of the bow, ringed in red: that is how the Memory Bank describes the “red-head” river cargo boat, and Davidson’s Keelung River photograph shows a round mark on the bow too.',
    actions: [{ id: 'turn', label: '轉到另一側', labelEn: 'Turn to the other side', doneLabel: '轉回來', doneLabelEn: 'Turn back' }],
    reconstruction: true,
    sourceIds: ['tcmb-junk-keelung', 'davidson-formosa-1903', 'zhu-qinbin-ship-paint-2018'],
    layers: {
      form: [
        { text: '國家文化記憶庫〈戎克船〉：紅頭仔是河川用的平底貨船，船首左右雕有凸出的眼睛，眼睛周圍塗紅。', textEn: 'Taiwan Cultural Memory Bank, “Junk”: the red-head was a flat-bottomed river cargo boat with a carved, protruding eye on each side of the bow, the eyes ringed in red.', sourceIds: ['tcmb-junk-keelung'] },
        { text: 'Davidson 1903 的圖版〈A View on the Keelung River at Maruyama〉（約 1897）：單桅、高長方形帆、船中蓆篷，船首有一個圓形標記。', textEn: 'Davidson’s 1903 plate “A View on the Keelung River at Maruyama” (about 1897): one mast, a tall rectangular sail, a mat shelter amidships, and a round mark on the bow.', sourceIds: ['davidson-formosa-1903', 'tcmb-keelung-river-junk'] },
        { text: '眼睛的大小、雕法與顏色細節查無：模型是依描述重建的。', textEn: 'The size, carving and exact colours of the eye are not found: the model is reconstructed from the description.', status: 'reconstruction' },
      ],
      making: [
        { text: '清代出海帆船的船頭油飾依省分不同：雍正元年定江南青、浙江白、福建綠、廣東紅（朱勤濱 2018 轉引《大清會典則例》）——這是出海船的規定，內河船沒有這種規定。', textEn: 'Qing seagoing junks were painted at the bow by province: in 1723 Jiangnan blue, Zhejiang white, Fujian green and Guangdong red (Zhu Qinbin 2018, citing the Qing statutes). That rule was for seagoing vessels; river boats had no such rule.', sourceIds: ['zhu-qinbin-ship-paint-2018'] },
      ],
      use: [
        { text: '記憶庫說紅頭仔船長約 12 公尺、寬約 4 公尺、高約 1.5 公尺、載重約 12 公噸，但沒有標原始測量與年代，待核。', textEn: 'The Memory Bank gives the red-head as about 12 m long, 4 m wide and 1.5 m high, carrying about 12 tonnes, but without its original measurement or date; to be verified.', status: 'pending', sourceIds: ['tcmb-junk-keelung'] },
      ],
      where: [{ text: '只在港口商街的帆船船首。', textEn: 'Only on the junk’s bow in the Harbour Merchant Street era.' }],
      evidence: [
        { text: 'Davidson 1903 圖版（公版；參考圖存在 docs/qing-boarding/reference/）：地點是基隆河、年代是日治初期，用在清末大稻埕標「推定相近」。', textEn: 'Davidson’s 1903 plate (public domain; reference copy in docs/qing-boarding/reference/): the place is the Keelung River and the date the early Japanese period, so for late-Qing Dadaocheng it is marked “probably similar”.', sourceIds: ['davidson-formosa-1903'] },
        { text: '「紅頭船」是接駁小船的俗稱：只見〈大稻埕碼頭〉一處，沒有附參考文獻，待核不用。', textEn: '“Red-head boat” as the common name for the ferry boat: found only in the “Dadaocheng Wharf” entry, without a reference; to be verified and not used.', status: 'pending', sourceIds: ['tcmb-dadaocheng-wharf'] },
      ],
    },
  },
}

/** 甲板上可以近看的器物（位置由 qingBoardingLayout.js 的本地座標換算；茶箱沿用既有的 tea-chest） */
export const QING_BOARDING_INSPECTABLES = [
  { id: 'junk-tea-chest', eraId: 'qing-port', objectId: 'tea-chest', label: '艙口板上的茶箱', labelEn: 'Tea chests on the hatch', ...deckInspectSpot('junk-tea-chest') },
  { id: 'junk-camphor-box', eraId: 'qing-port', objectId: 'camphor-box', label: '襯鉛的樟腦箱', labelEn: 'Lead-lined camphor box', ...deckInspectSpot('junk-camphor-box') },
  { id: 'junk-ballast-stones', eraId: 'qing-port', objectId: 'ballast-stones', label: '艙底的壓艙石', labelEn: 'Ballast stones in the hold', ...deckInspectSpot('junk-ballast-stones') },
  { id: 'junk-boat-eye', eraId: 'qing-port', objectId: 'boat-eye', label: '船首的船眼', labelEn: 'Eye on the bow', ...deckInspectSpot('junk-boat-eye') },
]
