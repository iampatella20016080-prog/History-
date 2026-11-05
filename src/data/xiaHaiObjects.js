import { XH_INSPECT_SPOTS } from './xiaHaiLayout.js'

/**
 * 霞海城隍廟殿內可以近看的器物（第 11 階段；格式見 data/inspectLayers.js）。
 * 3D 模型在 builders/xiaHaiInspect.js；文字與查證見 docs/research/interior-xia-hai-cheng-huang.md 第 3 節。
 * 廟的原則（第 5 階段）：神像、供品、祭祀細節沒有出處就不畫、不寫；清末殿內的圖像查無，依現況照片的寫「現況」。
 * 香爐是共用器物（之後慈聖宮也用）；慈聖宮的形制等出處補齊再加。
 */

const XH = 'xia-hai-cheng-huang'

export const XH_OBJECTS = {
  'incense-burner': {
    id: 'incense-burner',
    title: '神案上的香爐',
    titleEn: 'The altar censer',
    lead: '霞海城隍廟正殿供桌上一只銅鑄的圓爐，八寸高、直徑約一尺；香插進去，煙往上，神像都被燻黑了。慈聖宮的是長案上一件深色圓爐，形制待核。',
    leadEn: 'At Xiahai, a round cast-bronze censer on the offering table, eight inches tall and about a foot across; the sticks go in, the smoke goes up, and the images above are black with it. Cisheng’s is a dark round censer on a long table, its form to be verified.',
    actions: [{ id: 'offer', label: '插一炷香', labelEn: 'Offer a stick', doneLabel: '退開', doneLabelEn: 'Step back' }],
    paragraphs: ['尺寸與材質依廟方「廟宇藝術」祭祀用具頁；清末殿內的香與供品的樣式查無，本站不畫供品。'],
    paragraphsEn: ['Size and material follow the temple’s page on ritual objects; what incense and offerings looked like in the Qing interior is not found, and this site draws no offerings.'],
    sourceIds: ['tpecitygod-art-05'],
    layers: {
      form: [
        {
          text: '霞海城隍廟：「正殿主神龕前方供桌上，安置一只銅鑄圓形香爐，爐身約八寸高，直徑約一尺」。〔照片〕現況照片裡是深色的圓爐，爐身浮雕龍紋。',
          textEn: 'Xiahai: “on the offering table before the main shrine stands a round cast-bronze censer about eight inches tall and a foot across”. In present-day photographs it is dark, with dragons in relief.',
          sourceIds: ['tpecitygod-art-05', 'commons-xiahai-interior'],
        },
        {
          text: '這只爐是不是清末就在：查無；模型依現況的形制。',
          textEn: 'Whether this censer was already there in the Qing period: not found; the model follows its present form.',
          status: 'pending',
        },
        {
          text: '慈聖宮：〔照片〕2025 年正殿供桌兩端的金色器物是插百合的花瓶，不是爐；香爐在神將前的長案上，是一件深色圓爐，只有遠景，材質與款識查無，形制待核——Commons 檔名裡的「古老金爐」「舊金爐」是燒金紙的金爐，不是香爐。本站近看的模型借霞海城隍廟銅爐的形制。',
          textEn: 'Cisheng: in the 2025 photographs the gilt objects at the ends of the offering table are vases holding lilies, not censers; the censer is a dark round one on the long table before the guardians, seen only from a distance, its material and inscription unknown and its form to be verified—the “old furnaces” in Commons filenames are paper-burning furnaces, not censers. This site’s close-up model borrows the form of the Xiahai bronze censer.',
          sourceIds: ['commons-cisheng-interior', 'commons-cisheng-furnace'],
          status: 'pending',
        },
      ],
      making: [
        {
          text: '不是食物。清末殿內的香與供品的樣式查無，本站不畫供品。',
          textEn: 'Not a foodstuff. What incense and offerings looked like in the Qing interior is not found, and this site draws no offerings.',
          status: 'pending',
        },
      ],
      use: [
        {
          text: '今日香客在廟埕的天公爐（1980 年才設）插香，不插殿內的爐；清末的做法查無，這裡的「插一炷香」只是示意。',
          textEn: 'Today worshippers place their sticks in the forecourt censer (installed only in 1980), not the one in the hall; the Qing practice is not found, and “offer a stick” here is illustrative.',
          sourceIds: ['tpecitygod-art-05'],
          status: 'reconstruction',
        },
      ],
      where: [
        { text: '霞海城隍廟正殿的供桌（港口商街，銅爐）。', textEn: 'The offering table in the main hall of Xiahai (harbour era; the bronze censer).' },
        { text: '慈聖宮正殿（酒樓繁華到老屋新生）：2025 年的照片裡供桌兩端是金色花瓶，不是爐；香爐在旁邊的長案上，是一件深色圓爐，只有遠景，材質與款識查無。', textEn: 'Cisheng’s main hall (banquet to revival eras): in the 2025 photographs the gilt objects at the ends of the offering table are flower vases, not censers; the censer is a dark round one on the long side table, seen only from a distance, its material and inscription unknown.', sourceIds: ['commons-cisheng-interior'], status: 'pending' },
      ],
      evidence: [
        {
          text: '廟方「廟宇藝術」祭祀用具頁；Wikimedia Commons 殿內照片（2020–2023，CC BY-SA 4.0，本站只引用觀察）。',
          textEn: 'The temple’s page on ritual objects; Wikimedia Commons interior photographs (2020–2023, CC BY-SA 4.0; this site cites observations only).',
          sourceIds: ['tpecitygod-art-05', 'commons-xiahai-interior'],
        },
        {
          text: '慈聖宮香爐的款識：本站沒有找到；臺灣廟宇香爐的款識通常是年款加廟名或捐獻者，刻在爐身或爐底。',
          textEn: 'The inscription on Cisheng’s censer: not found by this site; temple censers in Taiwan usually carry a date and the temple’s or donor’s name on the body or base.',
          status: 'pending',
        },
      ],
    },
  },

  'chenghuang-shrine': {
    id: 'chenghuang-shrine',
    title: '霞海城隍的神龕',
    titleEn: 'The City God’s shrine',
    lead: '木雕透雕、貼金的花罩，背板畫著蟠龍；龕正中是建廟時雕的鎮殿城隍，三尺六高，戴公爵帽、披刺繡的雪衣袍，長髯垂到腰，臉被香火燻黑了。',
    leadEn: 'A carved and gilt openwork canopy with a coiled dragon painted on the back board; in the centre the hall’s City God, carved when the temple was built, three feet six tall, in a duke’s cap and an embroidered robe, beard to the waist, face blackened by incense.',
    actions: [{ id: 'bow', label: '合掌', labelEn: 'Bow', doneLabel: '退開', doneLabelEn: 'Step back' }],
    paragraphs: ['神像的尺寸與服飾依廟方「廟宇藝術」神像頁；花罩與背板依現況照片，清末是不是同樣子查無。模型是簡化的人形，不做臉部細節。'],
    paragraphsEn: ['Sizes and dress follow the temple’s page on its images; the canopy and back board follow present-day photographs, and whether they looked the same in the Qing period is not found. The figures are simplified, with no facial detail.'],
    sourceIds: ['tpecitygod-art-03', 'tpecitygod-art-04'],
    layers: {
      form: [
        {
          text: '廟方：「正殿神龕作木雕花罩裝飾」「正殿後方神龕牆面作蟠龍彩繪裝飾」。〔照片〕紅、金色木雕透雕花罩，上方三格人物堵、兩側透雕格子；背板白底，金與彩繪的蟠龍與祥雲，龍頭正在城隍上方。',
          textEn: 'The temple: “the main shrine is dressed with a carved wooden canopy” and “the wall behind is painted with a coiled dragon”. In photographs: a red-and-gold openwork canopy with three figure panels above and lattice at the sides; a white back board with a gilt and painted dragon among clouds, its head directly over the god.',
          sourceIds: ['tpecitygod-art-03', 'commons-xiahai-interior'],
        },
        {
          text: '鎮殿「老祖」：建廟時雕，像高三尺六寸（約 1.1 公尺）硬身木雕，古代公爵帽、刺繡雪衣式神袍，端坐龕正中，雙目垂視，長髯垂至腰際，面容已呈黑色。',
          textEn: 'The hall image: carved when the temple was built, three feet six (about 1.1 m), a hard-bodied wooden figure in an ancient duke’s cap and an embroidered robe, seated in the centre, eyes lowered, beard to the waist, face now black.',
          sourceIds: ['tpecitygod-art-04'],
        },
        {
          text: '龕內配祀：文武判官、牛馬將軍各二尺三；謝將軍二尺二、范將軍一尺三；劍印童、日夜遊神一尺六，多在建廟之初雕造；謝將軍座款光緒元年（1875）。龕左右另有約八尺的大型文武判官神偶。',
          textEn: 'Inside the shrine: civil and military judges and the ox and horse generals at two feet three; General Xie at two feet two and General Fan at one foot three; the sword-and-seal boys and the day and night patrols at one foot six, most carved at the founding; General Xie’s base is dated 1875. Beside the shrine stand civil and military judges about eight feet tall.',
          sourceIds: ['tpecitygod-art-04'],
        },
        {
          text: '今日的花罩與紋樣是不是清末的原物：查無；本站依現況照片畫。',
          textEn: 'Whether today’s canopy and its patterns are the Qing originals: not found; this site follows the present photographs.',
          status: 'pending',
        },
        {
          text: '今天的花罩可能是 1997 年前後整修的樣子：當時報紙寫「座龕鑲上窗櫺、牆面改飾白石」（經維基百科腳註轉引，原報未讀）；1935 年的重修碑記說建廟七十六年來「丹青剝落」——清末的龕應該比今天的舊、比今天的素。',
          textEn: 'Today’s canopy may be the look of the repair around 1997: a newspaper of the time says the shrine was fitted with lattice and the walls refaced in white stone (cited via a Wikipedia footnote; the paper itself not read). The 1935 restoration stele says that in seventy-six years the paintwork had peeled—so the Qing shrine was probably older and plainer than today’s.',
          sourceIds: ['xiahai-stele-1935'],
          status: 'pending',
        },
      ],
      making: [{ text: '不是食物；神像是木雕，神袍是刺繡。', textEn: 'Not a foodstuff: the images are carved wood, the robes embroidered.', sourceIds: ['tpecitygod-art-04'] }],
      use: [
        {
          text: '開基的神像 1859 年嵌入廟牆之中，看不到；鎮殿的是另雕的。',
          textEn: 'The founding image was sealed into the temple wall in 1859 and cannot be seen; the hall image is a separate carving.',
          sourceIds: ['tpecitygod-art-04'],
        },
        {
          text: '本站只畫兩尊有出處的神像：主神城隍（1853 年從艋舺迎來的霞海城隍；龕中是建廟時雕的鎮殿像）與右室的城隍夫人（1893 年起）。龕內的配祀、謝范將軍與文武判官的大神偶、夫人兩旁的宮娥，清末是否已在沒有出處，不畫，以簾幕示意。',
          textEn: 'This site draws only the two images with sources: the City God (brought from Bangka in 1853; the shrine holds the hall image carved at the founding) and the consort in the right-hand room (from 1893). The attendant images, the great figures of Generals Xie and Fan and the judges, and the consort’s maids have no source for the Qing period and are not drawn; curtains stand in their place.',
          sourceIds: ['tpecitygod-art-04', 'tpecitygod-god-02'],
          status: 'reconstruction',
        },
        {
          text: '本站讓人物只走到神案前，神龕一帶不能進去（示意）。',
          textEn: 'On this site you can walk only as far as the altar table; the shrine area is closed off (illustrative).',
          status: 'reconstruction',
        },
        {
          text: '右側偏殿的城隍夫人：廟方引大正十四年（1925）7 月 5 日《臺灣日日新報》，右室的城隍娘是光緒十九年（1893）九間仔街的「阿仙舍」創設的，兩邊有宮娥。原報本站沒有核對到，版次與標題不詳；所以清末版本把夫人龕放右室，標 1893 年起。',
          textEn: 'The consort in the right-hand room: the temple quotes the Taiwan Nichinichi Shinpō of 5 July 1925—the image in the right room was set up in 1893 by Ah-sian of Kau-king-a Street, with a palace maid on either side. This site could not check the original, only the temple’s transcription, without page or headline; hence the consort is in the right room, from 1893.',
          sourceIds: ['tpecitygod-god-02'],
          status: 'pending',
        },
      ],
      where: [{ text: '霞海城隍廟港口商街的正殿。', textEn: 'The main hall of Xiahai in the harbour era.' }],
      evidence: [
        {
          text: '廟方「廟宇藝術」建築裝飾頁、神像頁；Wikimedia Commons 殿內照片（舟集 2020、Sean Chiu 2020、阿道 2023，CC BY-SA 4.0）。',
          textEn: 'The temple’s pages on decoration and images; Wikimedia Commons photographs by Boattoad (2020), Sean Chiu (2020) and Adao (2023), CC BY-SA 4.0.',
          sourceIds: ['tpecitygod-art-03', 'tpecitygod-art-04', 'commons-xiahai-interior'],
        },
        {
          text: '清末殿內的圖像或文字描述：本站沒有找到。1871 年《淡水廳志》的祠祀與寺觀兩卷都沒有記大稻埕的城隍廟；日治初期《臺灣慣習記事》《臺灣日日新報》的相關段落要到館內資料庫查。',
          textEn: 'No image or written description of the Qing-era interior was found. The 1871 Tamsui Sub-prefecture Gazetteer records no City God temple at Dadaocheng in its rites or temples chapters; early Japanese-era sources must be checked in library databases.',
          sourceIds: ['danshui-tingzhi-1871'],
          status: 'pending',
        },
      ],
    },
  },

  'qing-plaques': {
    id: 'qing-plaques',
    title: '清代的匾額',
    titleEn: 'The Qing plaques',
    lead: '神龕上方三方黑底金字的匾：中間「其盛矣乎」是 1864 年淡水同知鄭元杰題的，兩旁「藻鑑分明」「威靈海內」是 1879 年的；正殿前大楣朝外還有 1856 年的「天眼時開」。',
    leadEn: 'Three black plaques with gold characters above the shrine: in the centre “How flourishing!” from the Tamsui sub-prefect Zheng Yuanjie in 1864, at the sides “Clear as a mirror” and “Awesome power within the seas” from 1879; on the main hall’s front beam, facing out, “Heaven’s eye opens in time” from 1856.',
    actions: [{ id: 'read', label: '抬頭讀', labelEn: 'Read them', doneLabel: '低頭', doneLabelEn: 'Look down' }],
    paragraphs: ['匾的字、年代與位置依廟方「廟宇藝術」匾額與楹聯頁。本站的年代是 1853–1895 整段，1885、1890 年的兩方也掛上。'],
    paragraphsEn: ['The wording, dates and positions follow the temple’s page on plaques and couplets. This site’s era spans 1853–1895, so the 1885 and 1890 plaques hang too.'],
    sourceIds: ['tpecitygod-art-06'],
    layers: {
      form: [
        {
          text: '〔照片〕神龕上方的大楣並列三方黑底金字木匾、雕花木框。廟方列的位置：「其盛矣乎」神龕上方中央、「藻鑑分明」右、「威靈海內」左；「天眼時開」正殿前大楣中央朝外；「正直無私」（1885）拜殿前大楣左、「昭靈聿應」（1890）右，都朝內。本站的左右以神明的方向為準。',
          textEn: 'In photographs three black-and-gold wooden plaques in carved frames hang side by side over the shrine. The temple’s list: “How flourishing!” centre, “Clear as a mirror” right, “Awesome power within the seas” left; “Heaven’s eye opens in time” on the main hall’s front beam facing out; “Upright and impartial” (1885) left and “Bright response” (1890) right on the vestibule beam, facing in. Left and right here are the god’s.',
          sourceIds: ['tpecitygod-art-06', 'commons-xiahai-interior'],
        },
      ],
      making: [{ text: '不是食物。', textEn: 'Not a foodstuff.' }],
      use: [
        {
          text: '「天眼時開」咸豐丙辰（1856）淡北眾等——廟還沒蓋好就題了；「其盛矣乎」同治三年（1864）淡水同知鄭元杰；「藻鑑分明」光緒五年（1879）周光宸；「威靈海內」光緒五年淡北霞海紳商士庶；「正直無私」光緒十一年（1885）；「昭靈聿應」光緒十六年（1890）。',
          textEn: '“Heaven’s eye opens in time”, 1856, from the people of northern Tamsui—before the temple was finished; “How flourishing!”, 1864, from the sub-prefect Zheng Yuanjie; “Clear as a mirror”, 1879, from Zhou Guangchen; “Awesome power within the seas”, 1879, from the gentry and merchants of Xiahai; “Upright and impartial”, 1885; “Bright response”, 1890.',
          sourceIds: ['tpecitygod-art-06'],
        },
        {
          text: '主神龕兩側的楹聯「天理昭彰，看如何結局；人心奸險，待這裡關防」是蘇斐然的木聯，今在城隍夫人龕內；清末掛在哪裡查無，本站放在主神龕兩側。',
          textEn: 'The couplet beside the main shrine—“Heaven’s law is plain: see how it ends; men’s hearts are crooked: here they are watched”—is Su Feiran’s wooden couplet, now inside the consort’s shrine; where it hung in the Qing period is not found, and this site places it beside the main shrine.',
          sourceIds: ['tpecitygod-art-06'],
          status: 'pending',
        },
      ],
      where: [{ text: '霞海城隍廟港口商街的正殿與拜殿。', textEn: 'The main hall and vestibule of Xiahai in the harbour era.' }],
      evidence: [
        {
          text: '廟方「廟宇藝術」匾額與楹聯頁；內政部臺灣宗教文化地圖（「匾額為清代」）；Wikimedia Commons 照片。',
          textEn: 'The temple’s page on plaques and couplets; the Ministry of the Interior’s religious culture map (“Qing plaques”); Wikimedia Commons photographs.',
          sourceIds: ['tpecitygod-art-06', 'moi-xiahai-temple', 'commons-xiahai-interior'],
        },
      ],
    },
  },

  'yiyonggong-tablet': {
    id: 'yiyonggong-tablet',
    title: '義勇公的祿位',
    titleEn: 'The tablet of the Righteous and Brave',
    lead: '咸豐三年頂下郊拚，三十八個同安人為了護送城隍神像戰死；廟裡不雕他們的像，立一方綠底金字的牌位，兩側五列寫著三十八個名字。',
    leadEn: 'In the 1853 feud, thirty-eight Tong’an men died escorting the City God’s image; the temple carves no statues of them but keeps a green-and-gold tablet, their thirty-eight names in five columns on either side.',
    actions: [{ id: 'read', label: '讀名字', labelEn: 'Read the names', doneLabel: '退開', doneLabelEn: 'Step back' }],
    paragraphs: ['牌位的尺寸與字依廟方「廟宇藝術」神像頁；模型的名字只畫筆畫。今日罩在牌位外的玻璃框是現代的，本站不畫。'],
    paragraphsEn: ['The tablet’s size and wording follow the temple’s page on its images; the model shows the names only as strokes. The glass case around it today is modern and not modelled.'],
    sourceIds: ['tpecitygod-art-04', 'nchdb-xiahai-monument'],
    layers: {
      form: [
        {
          text: '牌位高二尺八（約 0.85 公尺），木雕安金，綠底金字「海內會義勇諸公之祿位」，兩側五列書 38 人名，外飾透雕安金蟠龍，罩玻璃框（玻璃框是現代，不畫）。〔照片〕綠底金字牌位、金色蟠龍透雕外框。',
          textEn: 'The tablet is two feet eight (about 0.85 m), carved and gilt, green ground with gold characters “Seat of the Righteous and Brave of the Hainei Society”, the thirty-eight names in five columns at the sides, an openwork gilt dragon frame, and a glass case (modern, not modelled). In photographs: green-and-gold tablet, gilt dragon frame.',
          sourceIds: ['tpecitygod-art-04', 'commons-xiahai-interior'],
        },
        {
          text: '義勇公龕「最為簡潔」：沒有花罩，只在左右大楣下設楹聯。今天的聯是 1996 年陳壽彝寫的藏頭聯（「義」「勇」起頭）。清末有沒有聯、聯文是什麼：廟方列的清代楹聯只有蘇斐然那一對，義勇公龕的查無，本站只畫素聯板。',
          textEn: 'The shrine is “the plainest”: no canopy, only couplets under the beams at either side. The present couplet, written by Chen Shouyi in 1996, opens its lines with “righteous” and “brave”. Whether a couplet hung here in the Qing, and what it said, is not found—the only Qing couplet the temple lists is Su Feiran’s—so this site shows blank boards.',
          sourceIds: ['tpecitygod-art-03', 'tpecitygod-art-06'],
          status: 'pending',
        },
      ],
      making: [{ text: '不是食物。', textEn: 'Not a foodstuff.' }],
      use: [
        {
          text: '國家文化資產網：建廟即「配祀三十八義勇公」；廟方引昭和九年（1934）《臺北霞海城隍廟沿革誌》記義勇公由來，38 人名單全列。',
          textEn: 'The national heritage register says the thirty-eight were enshrined from the founding; the temple quotes the 1934 temple chronicle for their story and lists all thirty-eight names.',
          sourceIds: ['nchdb-xiahai-monument', 'tpecitygod-god-04'],
        },
        {
          text: '1934 年的《臺北霞海城隍廟沿革誌》：三十八人陣亡後，「海內派下感念為公受厄，共議配祀霞海城隍廟西廡，曰義勇公」——義勇公供在西廡（側廊），不在正殿裡；今天在正殿左側偏後的配殿。本站把龕放正殿左後角是示意。',
          textEn: 'The 1934 temple chronicle: after the thirty-eight died, “the Hainei branch, grieving that they suffered for the common cause, agreed to enshrine them in the west gallery of the Xiahai City God temple as the Righteous and Brave”—so they were kept in a side gallery, not in the main hall; today they are in the side chapel behind and left of the hall. Placing the shrine at the hall’s rear left is this site’s approximation.',
          sourceIds: ['xiahai-chronicle-1934', 'tpecitygod-god-04'],
          status: 'reconstruction',
        },
        {
          text: '後來：今天龕上的匾「舍身成仁」是 1934 年海內會立的，清末還沒有，本站港口商街的殿內不畫。',
          textEn: 'Later: the plaque above the shrine today, “Giving one’s life for righteousness”, was set up by the Hainei Society in 1934; it did not exist in the Qing and is not modelled in this site’s harbour-era hall.',
          sourceIds: ['tpecitygod-art-06'],
        },
      ],
      where: [{ text: '霞海城隍廟港口商街正殿左後的小龕。', textEn: 'The small shrine at the rear left of Xiahai’s main hall in the harbour era.' }],
      evidence: [
        {
          text: '國家文化資產網古蹟頁；廟方神像頁、神明頁；Wikimedia Commons 照片（舟集 2020、阿道 2023）。',
          textEn: 'The national heritage register; the temple’s pages on images and deities; Wikimedia Commons photographs by Boattoad (2020) and Adao (2023).',
          sourceIds: ['nchdb-xiahai-monument', 'tpecitygod-art-04', 'tpecitygod-god-04', 'commons-xiahai-interior'],
        },
      ],
    },
  },
}

const spot = (id, objectId, label, labelEn) => ({ id, eraId: 'qing-port', shopId: XH, objectId, label, labelEn, level: 0, ...XH_INSPECT_SPOTS[id] })

export const XH_INSPECTABLES = [
  spot('xh-shrine', 'chenghuang-shrine', '正殿的主神龕', 'The main shrine'),
  spot('xh-censer', 'incense-burner', '供桌上的銅香爐', 'Bronze censer on the offering table'),
  spot('xh-plaques', 'qing-plaques', '神龕上方的清代匾額', 'Qing plaques above the shrine'),
  spot('xh-yiyong', 'yiyonggong-tablet', '左後角的義勇公祿位', 'Tablet of the Righteous and Brave'),
]
