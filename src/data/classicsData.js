/**
 * 經典閱讀（三篇）：讀原文 → 理解 → 連結現代生活 → 反思。章節型態 `classic`（ui/story/chapters.jsx 的 ClassicChapter）。
 *
 * 查證紀錄：docs/research/classics-three.md。結論：
 * - 鄭用錫〈勸和論〉：原文依維基文庫轉錄本（公版）。成文年份有咸豐三年／四年兩說、是否專為頂下郊拚而作都查無確證，並列標待核；
 *   鄭用錫是竹塹人，原文沒有提到大稻埕，不寫成他到過大稻埕或參與頂下郊拚。
 * - 蔣渭水〈臨床講義〉：原文是日文，沒有取得可核對的版本；網路上的中文全文都是譯本（譯者不明），不引用。
 *   只放篇名、背景與本站自己整理的摘要，`excerpts` 是空的，並說明原因。
 * - 賴和〈一桿「稱仔」〉：原文依維基文庫轉錄本（公版）。分兩期連載（1926 年 2 月 14、21 日）；
 *   小說地點是虛構的「鎮南威麗村」，全文沒有出現彰化或大稻埕，只能當作「同時代的秤」。
 *
 * 白話與英文翻譯都是本站自己寫的，沒有抄任何譯本或課本。`original` 是原文（古文或日治時期白話文，保留不翻）；
 * 英文模式下 `plain`（白話）會換成 `plainEn`（英文翻譯）。
 *
 * 章節欄位：
 *   work       作品資料（label／value 兩欄）
 *   background 背景段落（paragraphs）
 *   excerpts   原文節選 [{ id, original, plain, note? }]；沒有節選時用 excerptNote 說明為什麼
 *   edition    版本與底本
 *   points     沒有原文節選時，本站整理的重點 [{ label, text }]（不是引文）
 *   glossary   詞語小辭典
 *   connect    連結現代生活的段落
 *   reflection 反思問題 { question, prompts }
 *   checks     查證狀態 [{ status, text }]；status：sourced（有出處）、pending（待核）、omitted（查無或不寫）
 */

export const QUAN_HE_LUN_ID = 'classic-quan-he-lun'
export const CLINICAL_LECTURE_ID = 'classic-clinical-lecture'
export const YI_GAN_CHENG_ZAI_ID = 'classic-yi-gan-cheng-zai'

export const CLASSIC_STATUS = {
  sourced: { label: '有出處', labelEn: 'Sourced' },
  pending: { label: '待核', labelEn: 'To be verified' },
  omitted: { label: '查無，不寫', labelEn: 'Not found, left out' },
}

export const QUAN_HE_LUN_CHAPTER = {
  id: QUAN_HE_LUN_ID,
  type: 'classic',
  tab: '經典閱讀：勸和論',
  tabEn: 'Classic: An Exhortation to Peace',
  title: '經典閱讀：鄭用錫〈勸和論〉',
  titleEn: 'Classic reading: Zheng Yongxi, “An Exhortation to Peace”',
  lead: '1853年頂下郊拚之後，艋舺的同安人逃到大稻埕；差不多同一個時期，淡水廳一帶也在為「分類」械鬥。竹塹的進士鄭用錫寫了一篇不到八百字的文章，勸大家和解。',
  leadEn: 'After the Xiajiao fight of 1853, the Tong’an people of Bangka fled to Dadaocheng; at about the same time, communities across the Tamsui region were fighting along lines of “classification”. Zheng Yongxi, a jinshi of Zhuqian, wrote an essay of fewer than eight hundred characters urging people to make peace.',
  work: [
    { label: '作者', labelEn: 'Author', value: '鄭用錫，竹塹的進士', valueEn: 'Zheng Yongxi, a jinshi of Zhuqian' },
    { label: '篇名', labelEn: 'Title', value: '〈勸和論〉（勸人和解的論說文）', valueEn: '“Quan He Lun” (“An Exhortation to Peace”), an essay urging reconciliation' },
    { label: '成文', labelEn: 'Written', value: '咸豐三年（1853）五月，或咸豐四年（1854）——兩說並列，待核', valueEn: 'The fifth month of Xianfeng 3 (1853) or Xianfeng 4 (1854): two accounts, listed side by side, to be verified' },
    { label: '收錄', labelEn: 'Collected in', value: '一般教材說收在《北郭園全集》；本站讀的轉錄本沒有註明底本，待核', valueEn: 'Teaching materials say it is collected in the Beiguo Garden Collected Works; the transcription this site read names no base text, to be verified' },
  ],
  background: [
    '作者與地點｜鄭用錫是竹塹（今新竹）的進士，不是大稻埕人。本站沒有查到他到過大稻埕或參與頂下郊拚的出處，所以不這樣寫；這篇放在霞海城隍廟，只因為它寫的是同一個時期、淡水廳一帶的事。',
    '文章在說什麼｜原文談的是「分類」：人們依籍貫分成閩與粵、漳與泉，彼此械鬥；文中點名「新、艋」（新莊、艋舺）一帶「村市半成邱墟」。原文沒有點名頂下郊拚、同安或三邑，也沒有談商業利益。頂下郊拚是泉州三邑人與同安人的衝突，文中談的「漳、泉」是另一組對立，所以本站不說這篇專為頂下郊拚而作（維基百科有這種說法，但沒有註腳，標待核）。',
    '年份｜成文年份有兩說：咸豐三年五月（高中國文學習網），或咸豐四年（維基百科引《百年見聞肚皮集》，沒有註腳，我們也沒找到該書）。原文說「未有如去年之甚也」，這個「去年」是哪一年，也跟著成文年份而不同。本站並列兩說，不挑一個。',
  ],
  backgroundEn: [
    'Author and place | Zheng Yongxi was a jinshi of Zhuqian (today’s Hsinchu), not a man of Dadaocheng. This site found no source for his visiting Dadaocheng or taking part in the Xiajiao fight, so it does not say so; the essay is placed at the Xiahai City God Temple only because it concerns the same period and the Tamsui region.',
    'What the essay says | The original is about “classification”: people divided by place of origin into Min and Yue, Zhang and Quan, and fought one another; it names “Xin and Meng” (Xinzhuang and Bangka) as places where “half the villages and markets became ruins”. It does not name the Xiajiao fight, Tong’an or the Sanyi people, and it says nothing about commercial interests. The Xiajiao fight was a clash between the Sanyi people of Quanzhou and the Tong’an people, whereas the “Zhang and Quan” of the essay are a different pair of opponents, so this site does not say the essay was written specifically for the Xiajiao fight (Wikipedia says so, but without a footnote; marked to be verified).',
    'The year | There are two accounts of when it was written: the fifth month of Xianfeng 3 (Senior High Chinese Learning Web) or Xianfeng 4 (Wikipedia, citing the Book of a Hundred Years’ Hearsay, without a footnote; this site could not find that book). The original says “never as bad as last year”, and which year “last year” is depends on the year of writing. This site shows both accounts and picks neither.',
  ],
  excerpts: [
    {
      id: 'qhl-brothers',
      original: '夫人與禽各為一類、邪與正各為一類，此不可不分。乃同此血氣、同此官骸、同為國家之良民、同為鄉閭之善人，無分土、無分民，即子夏所言「四海皆兄弟」是也，況當共處一隅？',
      plain: '人和禽獸是不同的類，邪惡和正直是不同的類，這種分別不能不講。但大家有一樣的血氣、一樣的身體，一樣是國家的良民、鄉里的好人，不分這塊地、那群人——這就是子夏說的「四海之內都是兄弟」，何況是住在同一個角落的人呢？',
      plainEn: 'Human beings and beasts are different kinds, and the wicked and the upright are different kinds; such distinctions must be drawn. But we share the same blood and breath and the same bodies, and all of us are good subjects of the state and good people of the neighbourhood. There is no dividing of land and no dividing of people. This is what Zixia meant when he said that all within the four seas are brothers, and how much more so for people who live together in one corner.',
      note: '先承認「人與禽」「邪與正」要分，再說同鄉的人不該用籍貫再分一次。注意作者劃分的標準是「善惡」，不是「籍貫」。',
      noteEn: 'The author first grants that humans and beasts, and the wicked and the upright, must be told apart, and then says fellow villagers should not be divided again by origin. Note that his standard for dividing is good and evil, not place of origin.',
    },
    {
      id: 'qhl-hands',
      original: '在字義，友從兩手、朋從兩肉。是朋友如一身左右手，即吾身之肉也。今試執塗人而語之曰：「爾其自戕爾手，爾其自噬爾肉！」鮮不拂然而怒！何今分類至於此極耶？',
      plain: '從字形來看，「友」是兩隻手，「朋」是兩塊肉。朋友就像一個人的左右手，是自己身上的肉。現在隨便拉一個路人，對他說「你去砍自己的手、咬自己的肉！」，很少有人不生氣的。那為什麼現在的分類鬥爭，竟然到了這種地步？',
      plainEn: 'As for the characters: 友 is made of two hands and 朋 of two pieces of flesh. So friends are like the left and right hands of one body; they are the flesh of one’s own body. Now try seizing a passer-by and saying to him, “Cut off your own hand! Bite your own flesh!” Few would not flare up in anger. Why, then, has the splitting into factions come to such an extreme?',
      note: '「友」「朋」的字形說法是作者自己的字源解釋，不是字源學的結論。讀的時候可以分開看：比喻的力量，和考據的準確。',
      noteEn: 'The account of the shapes of 友 and 朋 is the author’s own etymology, not a finding of etymological scholarship. Read it in two parts: the force of the metaphor, and the accuracy of the scholarship.',
    },
    {
      id: 'qhl-wish',
      original: '予生長是邦，自念士為四民之首，不能與在事諸公竭誠化導，力挽而更張之，滋愧實甚。願今以後，父誡其子、兄告其弟，各革面、各洗心，勿懷夙忿、勿蹈前愆。既親其所親、亦親其所疏，一體同仁，斯內患不生、外禍不至。',
      plain: '我生長在這塊土地上，想到讀書人是士農工商四種人之首，卻不能和辦事的各位誠心勸導、扭轉局面，非常慚愧。希望從今以後，父親告誡兒子，哥哥告誡弟弟，每個人都改變面貌、洗淨心思，不要抱著舊日的怨氣，不要再重犯從前的過錯。既愛自己親近的人，也愛自己疏遠的人，把大家看成一體、同樣仁愛，這樣內部的禍患不會產生，外來的災禍也不會到來。',
      plainEn: 'I was born and raised in this land, and when I think that a scholar stands at the head of the four classes of people yet has been unable to join the officials in persuading people sincerely and turning things around, I am deeply ashamed. From now on, let fathers warn their sons and elder brothers tell their younger brothers; let each change his countenance and cleanse his heart, hold no old grudges and repeat no former mistakes. Love those close to you and love those distant from you too, and treat everyone as one body with the same benevolence; then no trouble will arise within, and no disaster will come from outside.',
      note: '作者把自己放進去：他說身為讀書人，卻沒能出力化解，覺得慚愧。再看他的辦法：從家庭裡父誡子、兄告弟開始。',
      noteEn: 'The author includes himself: as a scholar he feels ashamed not to have done more to resolve the quarrels. Note his method, which begins inside the family, with fathers warning sons and elder brothers telling younger brothers.',
    },
  ],
  edition: '底本：維基文庫〈勸和論〉轉錄本（修訂2171801，公有領域）。標點是編者所加；與《北郭園全集》原刊逐字核對沒有做，標待核。白話與英文翻譯是本站自己寫的。',
  editionEn: 'Base text: the Wikisource transcription of “Quan He Lun” (revision 2171801, public domain). The punctuation was added by the editors; a word-for-word check against the original printing in the Beiguo Garden Collected Works has not been done and is marked to be verified. The plain-Chinese and English translations were written by this site.',
  glossary: [
    { term: '分類', termEn: 'Fenlei (classification)', definition: '依籍貫、族群把人分成不同陣營；「分類械鬥」就是不同陣營之間的武力衝突。', definitionEn: 'Dividing people into camps by place of origin or ethnic group; “fenlei armed feuds” were violent clashes between such camps.' },
    { term: '閩、粵、漳、泉', termEn: 'Min, Yue, Zhang, Quan', definition: '閩指福建人、粵指廣東人；漳、泉是福建的漳州府與泉州府。文中的對立有兩組：閩與粵、漳與泉。', definitionEn: 'Min means people from Fujian and Yue people from Guangdong; Zhang and Quan are the prefectures of Zhangzhou and Quanzhou in Fujian. The essay speaks of two pairs of opponents: Min and Yue, and Zhang and Quan.' },
    { term: '子夏', termEn: 'Zixia', definition: '孔子的學生。「四海之內，皆兄弟也」出自《論語·顏淵》。', definitionEn: 'A disciple of Confucius. “Within the four seas, all are brothers” comes from the Analects, chapter Yan Yuan.' },
    { term: '四民之首', termEn: 'Head of the four classes', definition: '士、農、工、商稱為四民，讀書人（士）排在最前。', definitionEn: 'Scholars, farmers, artisans and merchants were the four classes; the scholar came first.' },
  ],
  connect: [
    '標籤與陣營｜今天不用刀棍，但「分類」的邏輯還在：地域、族群、政黨、世代、網路社群的標籤，讓人先看到「他是哪一類」，才看到「他是誰」。醫療現場也有分界：科別、職類、病人與家屬的立場。（這一段是本站的延伸，不是作者的原意。）',
    '勸和的限制｜〈勸和論〉訴諸倫理與情感——手足、左右手——沒有談對立背後的資源與利益怎麼分配。今天談和解，也常要問：只是勸大家友善，還是同時處理造成對立的原因？',
  ],
  connectEn: [
    'Labels and camps | Today no one fights with knives and clubs, but the logic of “classification” remains: labels of region, ethnic group, party, generation or online community make us see “what kind of person he is” before we see “who he is”. Healthcare has its divides as well: specialties, professions, the positions of patients and families. (This paragraph is this site’s extension, not the author’s meaning.)',
    'The limits of urging peace | “Quan He Lun” appeals to ethics and feeling—siblings, the left and right hands—and does not discuss how resources and interests behind the opposition are shared out. Talk of reconciliation today also often has to ask: is it only urging everyone to be friendly, or is it also dealing with the causes of the opposition?',
  ],
  reflection: {
    question: '你最近一次用「他是哪一類人」來理解別人，是什麼時候？那個標籤讓你多看到了什麼，又讓你漏掉了什麼？',
    questionEn: 'When did you last understand someone by “what kind of person he is”? What did that label let you see, and what did it make you miss?',
    prompts: [
      '鄭用錫用「左右手、自己的肉」勸人和解。這個比喻在今天對你有說服力嗎？它對哪些人比較沒效？',
      '如果對立的原因是資源或利益，只靠「勸和」夠嗎？你會再加上什麼？',
      '在你所處的團隊（班級、社團、實習單位）裡，有沒有一條看不見的分類線？',
    ],
    promptsEn: [
      'Zheng Yongxi urges peace with “the left and right hands” and “one’s own flesh”. Does the image persuade you today? For whom would it work less well?',
      'If the cause of the opposition is resources or interests, is urging peace enough? What would you add?',
      'In a group you belong to (a class, a club, a placement), is there an invisible line of classification?',
    ],
  },
  checks: [
    { status: 'sourced', text: '原文節選依維基文庫轉錄本；文中談閩粵、漳泉的分類，點名新莊、艋舺一帶。', textEn: 'The excerpts follow the Wikisource transcription; the essay discusses the divisions between Min and Yue and between Zhang and Quan and names the Xinzhuang and Bangka area.' },
    { status: 'sourced', text: '鄭用錫是竹塹的進士（高中國文學習網）。', textEn: 'Zheng Yongxi was a jinshi of Zhuqian (Senior High Chinese Learning Web).' },
    { status: 'pending', text: '成文年份：咸豐三年五月，或咸豐四年。', textEn: 'Year of writing: the fifth month of Xianfeng 3, or Xianfeng 4.' },
    { status: 'pending', text: '是否專為頂下郊拚而作：原文沒有點名，維基百科有此說但沒有註腳。', textEn: 'Whether it was written specifically for the Xiajiao fight: the text does not name it; Wikipedia says so but without a footnote.' },
    { status: 'pending', text: '是否收在《北郭園全集》，以及轉錄本與原刊的逐字差異。', textEn: 'Whether it is collected in the Beiguo Garden Collected Works, and any word-for-word differences between the transcription and the original printing.' },
    { status: 'omitted', text: '鄭用錫到過大稻埕、參與頂下郊拚：查無出處，不寫。', textEn: 'Zheng Yongxi visiting Dadaocheng or taking part in the Xiajiao fight: no source found, left out.' },
  ],
  sourceIds: ['wikisource-quan-he-lun', 'cerclearning-quan-he-lun', 'wiki-zheng-yong-xi'],
}

export const CLINICAL_LECTURE_CHAPTER = {
  id: CLINICAL_LECTURE_ID,
  type: 'classic',
  tab: '經典閱讀：臨床講義',
  tabEn: 'Classic: Clinical Lectures',
  title: '經典閱讀：蔣渭水〈臨床講義〉',
  titleEn: 'Classic reading: Jiang Weishui, “Clinical Lectures”',
  lead: '1921年，臺灣文化協會成立後不久，醫師蔣渭水在協會《會報》的創刊號上，用病歷的格式「診斷」一位叫「臺灣」的病人。',
  leadEn: 'In 1921, soon after the Taiwan Cultural Association was founded, the physician Jiang Weishui used the form of a medical case record in the first issue of its Bulletin to “diagnose” a patient called “Taiwan”.',
  work: [
    { label: '作者', labelEn: 'Author', value: '蔣渭水，醫師、臺灣文化協會專務理事', valueEn: 'Jiang Weishui, physician and managing director of the Taiwan Cultural Association' },
    { label: '篇名', labelEn: 'Title', value: '〈臨床講義〉（日文副題的寫法各說不一，待核）', valueEn: '“Clinical Lectures” (the wording of the Japanese subtitle varies between accounts, to be verified)' },
    { label: '刊載', labelEn: 'Published', value: '臺灣文化協會《會報》創刊號，1921年11月（28日發行，或文末落款30日，待核）', valueEn: 'First issue of the Taiwan Cultural Association’s Bulletin, November 1921 (issued on the 28th, or dated the 30th at the end; to be verified)' },
    { label: '語言', labelEn: 'Language', value: '日文原文；本站沒有取得日文原刊', valueEn: 'Written in Japanese; this site has not obtained the Japanese original' },
  ],
  background: [
    '為什麼放在這裡｜蔣渭水1916年在大稻埕太平町開設大安醫院（見前一章）。1921年協會成立後，協會的活動包括發行會報、設置讀報社、辦講習會與夏季學校（國立臺灣圖書館《臺灣學通訊》）。〈臨床講義〉是他把醫師的工作方式，用在社會問題上的一篇文章。',
    '內容｜他把臺灣當成病人，診斷出病名是在世界文化裡像個「低能兒」（立法院展場資訊的用語），病因是知識（智識）的營養不良，開出五項處方：正規學校教育、補習教育、幼稚園、圖書館、讀報社（立法院；國家圖書館紀念論壇報導）。「知識」與「智識」是各家中譯的用字不同，原文是日文。',
    '《會報》的遭遇｜創刊號因刊載這篇與〈苦悶的靈魂〉被禁止發行，第二期起改為先檢閱才能出版（《臺灣學通訊》第123期）。',
  ],
  backgroundEn: [
    'Why it is here | In 1916 Jiang Weishui opened Daan Hospital in Taiping-chō, Dadaocheng (see the previous chapter). After the Association was founded in 1921, its activities included publishing a bulletin, setting up newspaper-reading societies, and holding lecture courses and summer schools (Newsletter of Taiwan Studies, National Library of Taiwan). “Clinical Lectures” is an essay in which he applied a physician’s way of working to a social problem.',
    'Content | He treats Taiwan as a patient and diagnoses it as a sort of “low-ability child” among the world’s cultures (the wording of the Legislative Yuan’s exhibition information), the cause being malnutrition of knowledge (or intellect), and prescribes five remedies: formal school education, supplementary education, kindergartens, libraries and newspaper-reading societies (Legislative Yuan; report on the National Central Library forum). “Knowledge” and “intellect” are different choices in different Chinese renderings; the original is in Japanese.',
    'What happened to the Bulletin | The first issue was banned from distribution for carrying this essay and “The Tormented Soul”, and from the second issue on the Bulletin had to be censored before publication (Newsletter of Taiwan Studies, no. 123).',
  ],
  excerpts: [],
  excerptNote: '這一篇沒有原文節選。原文是日文，本站沒有取得日文原刊或《蔣渭水遺集》的影像；網路上流傳的中文全文都是譯本，譯者不明，本站不引用，也不把譯本當成「原文」。下面的重點是本站依官方展場資訊與報導整理的摘要，不是引文。想讀全文，可以向學校圖書館調閱《蔣渭水遺集》（日文），或查國家圖書館、蔣渭水文化基金會的數位資料。',
  excerptNoteEn: 'There is no excerpt of the original for this piece. The original is in Japanese, and this site has not obtained images of the Japanese original or of the Collected Works of Jiang Weishui; the Chinese full texts circulating online are translations by unnamed translators, which this site does not quote and does not treat as “the original”. The points below were put together by this site from official exhibition information and news reports; they are not quotations. To read the whole text, ask your library for the Collected Works of Jiang Weishui (in Japanese), or look for the digital materials of the National Central Library and the Chiang Wei-shui Cultural Foundation.',
  edition: '版本：未取得原文。要補原文節選，需要日文原刊（《會報》創刊號）或《蔣渭水遺集》的影像，並確認其公版狀態。',
  editionEn: 'Edition: the original has not been obtained. To add an excerpt, the Japanese original (first issue of the Bulletin) or images of the Collected Works of Jiang Weishui are needed, with their public-domain status confirmed.',
  points: [
    { label: '形式', labelEn: 'Form', text: '以病歷（臨床講義）的格式寫成，把臺灣當成一位病人來診斷。', textEn: 'Written in the form of a medical case record (a “clinical lecture”), treating Taiwan as a patient to be diagnosed.' },
    { label: '病名', labelEn: 'Diagnosis', text: '臺灣在世界文化裡像個發育不良的孩子（立法院展場資訊用「世界文化的低能兒」）。', textEn: 'Taiwan is like a poorly developed child among the world’s cultures (the Legislative Yuan’s exhibition information uses “a low-ability child of world culture”).' },
    { label: '病因', labelEn: 'Cause', text: '知識（智識）的營養不良。', textEn: 'Malnutrition of knowledge (or intellect).' },
    { label: '處方', labelEn: 'Prescriptions', text: '正規學校教育、補習教育、幼稚園、圖書館、讀報社，共五項。', textEn: 'Five: formal school education, supplementary education, kindergartens, libraries and newspaper-reading societies.' },
  ],
  glossary: [
    { term: '臨床講義', termEn: 'Clinical lecture', definition: '醫學教育裡，老師在病人身邊示範問診、診斷與處置的講課；蔣渭水借用這種體裁，把社會寫成「病例」。', definitionEn: 'In medical education, a lecture in which the teacher demonstrates history-taking, diagnosis and management at the patient’s side; Jiang Weishui borrowed the genre to write society up as a “case”.' },
    { term: '臺灣文化協會', termEn: 'Taiwan Cultural Association', definition: '1921年成立的民間團體，辦會報、讀報社、講習會與夏季學校。', definitionEn: 'A civil association founded in 1921 that ran a bulletin, newspaper-reading societies, lecture courses and summer schools.' },
    { term: '讀報社', termEn: 'Newspaper-reading society', definition: '設在各地、提供報紙給民眾閱讀的場所。', definitionEn: 'A place set up in various localities to let people read newspapers.' },
  ],
  connect: [
    '診斷的力量與風險｜把社會當成病人，問題就有了結構：先看症狀、找病因、再開處方。但這個比喻也有風險——誰有資格診斷？「病人」是整個社會，還是被貼上「不足」標籤的某些人？醫學生每天練習的臨床推理（病史、檢查、鑑別診斷、處置），可以拿來檢查這篇文章的論證。',
    '今天的「知識營養」｜當年的處方是學校、圖書館、讀報社；今天的問題常不是資訊太少，而是太多。社群媒體上的偏方與不實醫療訊息，是不是另一種「營養不良」——吃得多，卻不均衡？（這是本站的延伸提問，不是蔣渭水的原意。）',
  ],
  connectEn: [
    'The power and risk of diagnosis | Treating society as a patient gives the problem a structure: look at the symptoms, find the cause, then prescribe. But the metaphor carries risk too. Who is qualified to diagnose? Is the “patient” the whole society, or only some people labelled as “lacking”? The clinical reasoning that medical students practise every day (history, examination, differential diagnosis, management) can be used to test this essay’s argument.',
    'Today’s “nutrition of knowledge” | The prescriptions then were schools, libraries and newspaper-reading societies; today the problem is often not too little information but too much. Folk remedies and false medical information on social media: are they another kind of malnutrition, eating plenty but unevenly? (This is a question posed by this site, not Jiang Weishui’s meaning.)',
  ],
  reflection: {
    question: '如果你要為今天的臺灣（或你所在的社群）寫一份「臨床講義」，病名、病因和處方各是什麼？你會用什麼證據支持你的診斷？',
    questionEn: 'If you were to write a “clinical lecture” for today’s Taiwan (or the community you belong to), what would the diagnosis, cause and prescriptions be? What evidence would you use to support your diagnosis?',
    prompts: [
      '蔣渭水的五項處方，哪些今天已經做到？哪些做了，卻沒有解決問題？',
      '醫學的診斷需要檢查與證據。用醫學比喻談社會問題，有哪些地方可以類比，哪些地方會誤導？',
      '如果「資訊營養不良」是今天的病因，你會開什麼處方——對一般民眾、對醫療專業人員各是什麼？',
    ],
    promptsEn: [
      'Which of Jiang Weishui’s five prescriptions have been carried out today? Which were carried out without solving the problem?',
      'Medical diagnosis needs examination and evidence. Where can the medical metaphor be applied to social problems, and where does it mislead?',
      'If “malnutrition of information” is the cause today, what would you prescribe—for the general public, and for healthcare professionals?',
    ],
  },
  checks: [
    { status: 'sourced', text: '以病歷格式診斷臺灣、五項處方（立法院展場資訊；國家圖書館紀念論壇報導）。', textEn: 'It diagnoses Taiwan in the form of a case record and gives five prescriptions (Legislative Yuan exhibition information; report on the National Central Library forum).' },
    { status: 'sourced', text: '原文以日文撰寫，1921年11月發表於《會報》第一期（立法院）。', textEn: 'The original was written in Japanese and published in November 1921 in the first issue of the Bulletin (Legislative Yuan).' },
    { status: 'sourced', text: '《會報》創刊號被禁止發行（《臺灣學通訊》第123期）。', textEn: 'The first issue of the Bulletin was banned (Newsletter of Taiwan Studies, no. 123).' },
    { status: 'pending', text: '刊出日期：28日發行，或文末落款30日。', textEn: 'Date of issue: published on the 28th, or dated the 30th at the end.' },
    { status: 'pending', text: '日文原文的版本，以及被禁後是否有改訂版。', textEn: 'Which edition of the Japanese original, and whether a revised edition appeared after the ban.' },
    { status: 'omitted', text: '病歷的欄位細節（姓名、原籍等）：只見二手轉述，不寫。', textEn: 'The fields of the case record (name, native place and so on): found only in secondary retellings, left out.' },
    { status: 'omitted', text: '任何中文全文：譯者與授權不明，不引用。', textEn: 'Any Chinese full text: translator and licence unknown, not quoted.' },
  ],
  sourceIds: ['ly-daap-clinical-lecture', 'taiwannews-2021-clinical-lecture-100', 'ntl-taiwan-studies-123', 'tcmb-jiang-wei-shui'],
}

export const YI_GAN_CHENG_ZAI_CHAPTER = {
  id: YI_GAN_CHENG_ZAI_ID,
  type: 'classic',
  tab: '經典閱讀：一桿「稱仔」',
  tabEn: 'Classic: “A Steelyard”',
  title: '經典閱讀：賴和〈一桿「稱仔」〉',
  titleEn: 'Classic reading: Lai He, “A Steelyard”',
  lead: '林華泰的茶行裡，桿秤是買賣的根據。1926年，《臺灣民報》分兩期刊出一篇小說，寫的也是一桿秤——但它不在茶行，也不在大稻埕。',
  leadEn: 'In a tea hong like Lin Huatai, the steelyard is the basis of every sale. In 1926 the Taiwan Minpao ran a story in two instalments about a steelyard too—but it is not in a tea hong, and not in Dadaocheng.',
  work: [
    { label: '作者', labelEn: 'Author', value: '賴和，署名懶雲；彰化人，維基百科說他也是醫師（待核）', valueEn: 'Lai He, signing as Lanyun; from Changhua, and Wikipedia says he was also a physician (to be verified)' },
    { label: '篇名', labelEn: 'Title', value: '〈一桿「稱仔」〉（小說；「稱仔」是臺灣話的「秤」）', valueEn: '“A Steelyard” (a short story; 稱仔 is the Taiwanese word for a scale)' },
    { label: '發表', labelEn: 'Published', value: '《臺灣民報》第92、93號，1926年2月14日、21日，分兩期連載；1925年12月4日完成', valueEn: 'Taiwan Minpao nos. 92 and 93, 14 and 21 February 1926, in two instalments; completed on 4 December 1925' },
    { label: '地點', labelEn: 'Setting', value: '小說裡的「鎮南威麗村」與鎮上（虛構的地名）；原文沒有出現「彰化」，也不是大稻埕', valueEn: '“Weili Village of Zhennan” and the town in the story (invented place names); the text never says “Changhua”, and it is not Dadaocheng' },
  ],
  background: [
    '同時代的秤｜故事發生在小說裡的村子與鎮上，不是大稻埕。放在林華泰酒樓繁華版，是因為年代相同（1926年落在1895–1930年），主題都是秤：臺史博的說明寫，昭和年間（1926年起）以後才開始出現用磅仔秤重的方式，之前多用桿秤。小說裡的秤是菜販的秤，不是茶行的秤，兩者的形制不能互相推。',
    '故事大要｜貧農秦得參因病欠債，改賣生菜；他向鄰居借來一桿新秤。巡警來要菜，得參把菜過了秤，巡警嫌他「打扣」，說秤不好，把秤折斷丟棄，還記下他的姓名住處；隔天他被以「違犯度量衡規則」罰三塊錢。結尾以含蓄的筆法收束，本站不替它補完。',
    '賴和的後記｜他說這一幕悲劇「看過好久」，讀了法朗士的〈克拉格比〉（Crainquebille）之後，才覺得這樣的事不一定只在未開化的國度發生。原文只說「看過」，沒有指明是哪一件真實案件，本站不指認。',
  ],
  backgroundEn: [
    'A scale of the same time | The story takes place in a village and a town in the story, not in Dadaocheng. It is placed in the banquet-era Lin Huatai because the periods match (1926 falls within 1895–1930) and the subject is the same, a scale: the National Museum of Taiwan History’s note says that weighing on a platform bōng-á began only in the Shōwa years (from 1926), while the steelyard was mostly used before. The scale in the story belongs to a vegetable seller, not a tea hong, and the forms of the two cannot be inferred from each other.',
    'The story in brief | Qin Deshen, a poor farmer in debt through illness, turns to selling vegetables, borrowing a new steelyard from a neighbour. A policeman asks for some vegetables; Deshen weighs them, the policeman accuses him of taking off a “discount” and says the scale is no good, snaps it and throws it away, and notes down his name and address. The next day he is fined three dollars for “violating the weights-and-measures regulations”. The ending is told with restraint, and this site does not complete it.',
    'Lai He’s postscript | He says he had “seen this tragedy long ago”, and that only after reading Anatole France’s Crainquebille did he feel that such things do not happen only in unenlightened countries. The text says only that he “saw” it and does not identify a real case, and this site does not identify one either.',
  ],
  excerpts: [
    {
      id: 'ygcz-borrow',
      original: '一天早上，得參買一擔生菜回來，想吃過早飯，就到鎮上去，這時候，他妻子纔覺到缺少一桿稱仔。「怎麼好？」得參想，「要買一桿，可是官廳的專利品，不是便宜的東西，那兒來得錢？」她妻子趕快到隔鄰去借一桿回來，幸鄰家的好意，把一桿尚覺新新的借來。',
      plain: '一天早上，得參買了一擔生菜回來，打算吃過早飯就到鎮上去賣，這時他妻子才發現家裡少了一桿秤。「怎麼辦？」得參想，「要買一桿，秤是官廳專賣的東西，不便宜，哪來的錢？」妻子連忙到隔壁借了一桿，幸好鄰居好心，把一桿還很新的借給她。',
      plainEn: 'One morning Deshen came home with a load of fresh vegetables, meaning to take them to town after breakfast, and only then did his wife notice that they had no steelyard. “What shall we do?” Deshen thought. “To buy one—the officials hold the monopoly on them, and they are not cheap. Where would the money come from?” His wife hurried next door and borrowed one; out of kindness the neighbour lent them a steelyard that still looked new.',
      note: '注意兩個細節：秤是「官廳的專利品」，要買不便宜；借來的是一桿新秤。後面出問題的，不是秤本身。',
      noteEn: 'Note two details: the scale is a monopoly of the authorities and costly to buy, and the one borrowed is new. What goes wrong later is not the scale itself.',
    },
    {
      id: 'ygcz-scale',
      original: '「不，稱稱看！」巡警幾番推辭著說。誠實的參，亦就掛上稱仔稱一稱，說：\n「大人，真客氣啦！才一斤十四兩。」本來，經過秤稱過，就算買賣，就是有錢的交關，不是白要，亦不能說是贈與。\n「不錯罷？」巡警說。\n「不錯，本有兩斤足，因是大人要的…… 」參說。這句話是平常買賣的口吻，不是贈送的表示。\n「稱仔不好罷，兩斤就兩斤，何須打扣？」巡警變色地說。\n「不，還新新呢！」參泰然地回答。\n「拿過來！」巡警赫怒了。\n「稱花還很明瞭。」參從容地捧過去說。巡警接在手裡，約略考察一下說：\n「不堪用了，拿到警署去！」\n「什麼緣故？修理不可嗎？」參說。\n「不去嗎？」巡警怒叱著。「不去？畜生！」撲的一聲，巡警把稱仔打斷擲棄，隨抽出胸前的小帳子，把參的名姓、住處，記下。',
      plain: '「不，稱稱看！」巡警推辭了幾次，這麼說。老實的得參就把菜掛上秤稱了一稱，說：\n「大人，您太客氣了！才一斤十四兩。」照理，東西過了秤就算買賣，是有付錢的交易，不是白拿，也不能算是送的。\n「沒錯吧？」巡警說。\n「沒錯，本來夠兩斤，因為是大人要的……」得參說。這是做生意常有的口氣，不是要送人的意思。\n「秤不準吧？兩斤就兩斤，何必打折扣？」巡警變了臉色說。\n「不，這秤還很新呢！」得參鎮定地回答。\n「拿過來！」巡警大怒。\n「秤桿上的星花還很清楚。」得參從容地雙手遞過去。巡警接在手裡，大略看了看，說：\n「不能用了，拿到警署去！」\n「為什麼？修一修不行嗎？」得參說。\n「你不去？」巡警怒斥，「不去？畜生！」啪的一聲，巡警把秤折斷丟在地上，抽出胸前的小簿子，把得參的姓名和住處記了下來。',
      plainEn: '“No—weigh it!” said the policeman, after refusing several times. Honest Deshen hung the vegetables on the scale and weighed them, and said:\n“You are too polite, sir! Only one catty fourteen taels.” By rights, once something has been weighed it is a sale, a paying customer’s trade; it is not taken for nothing, and it cannot be called a gift.\n“That is right, isn’t it?” said the policeman.\n“It is right. It was a full two catties to begin with, but since it is for you, sir....” said Deshen. This was the ordinary talk of a sale, not the language of a gift.\n“The scale must be no good,” said the policeman, his face changing. “Two catties is two catties. Why take a discount?”\n“No, it is still new!” Deshen answered calmly.\n“Hand it over!” the policeman roared.\n“The marks on the beam are still quite clear,” Deshen said, offering it steadily. The policeman took it, gave it a quick look and said:\n“Not fit for use. Bring it to the police station!”\n“Why? Can’t it be repaired?” said Deshen.\n“You won’t come?” the policeman shouted. “You won’t? You animal!” With a crack the policeman snapped the scale and threw it down, drew a small notebook from his chest, and wrote down Deshen’s name and address.',
      note: '前面一段：得參要把幾莖好菜送給巡警，巡警推辭，要求過秤。這一段的關鍵是「誰說了算」：秤是新的、星花清楚，巡警卻說它不堪用。「稱花」指秤桿上的星花刻度。巡警的「畜生」是辱罵的話。',
      noteEn: 'The part just before: Deshen offers the policeman a few stalks of good vegetables, the policeman declines and demands that they be weighed. The key of this passage is “who has the say”: the scale is new and its marks are clear, yet the policeman says it is unfit for use. 稱花 means the star marks on the beam. “Animal” is an insult from the policeman.',
    },
    {
      id: 'ygcz-postscript',
      original: '這一幕悲劇，看過好久，每欲描寫出來，但一經回憶，總被悲哀填滿了腦袋，不能著筆。近日看到法朗士的克拉格比，才覺這樣事，不一定在未開的國裡，凡強權行使的地上，總會發生，遂不顧文字的陋劣，就寫出和文家批判。',
      plain: '這一幕悲劇，我看到已經很久了，每次想把它寫出來，一回想，腦子就被悲哀填滿，沒辦法下筆。最近讀到法朗士的〈克拉格比〉，才覺得這樣的事不一定只發生在未開化的國度，只要是強權施行的地方，總會發生。於是不顧文字拙劣，把它寫了出來，請人批評。',
      plainEn: 'I saw this tragedy long ago and have always wanted to write it down, but each time I recalled it my head filled with sorrow and I could not put pen to paper. Recently I read Anatole France’s Crainquebille, and only then did I feel that such things do not necessarily happen only in unenlightened countries: wherever power is wielded by force, they are bound to happen. So, heedless of my clumsy writing, I have written it out for others to criticise.',
      note: '最後一句「和文家批判」，轉錄本的字義不確定（可能有訛字），白話只譯成「請人批評」，待核。',
      noteEn: 'The last phrase, 和文家批判, is uncertain in the transcription (a character may be wrong); the plain-Chinese version renders it only as “for others to criticise”, to be verified.',
    },
  ],
  edition: '底本：維基文庫〈一桿稱仔〉轉錄本（修訂11117070，公有領域），含賴和的【後記】；頁面標題用「稱」、內文用「穪」。與《臺灣民報》原刊逐字核對沒有做，標待核。白話與英文翻譯是本站自己寫的。',
  editionEn: 'Base text: the Wikisource transcription of “Yi Gan Cheng Zai” (revision 11117070, public domain), with Lai He’s postscript; the page title uses 稱 and the body 穪. A word-for-word check against the Taiwan Minpao original has not been done and is marked to be verified. The plain-Chinese and English translations were written by this site.',
  glossary: [
    { term: '稱仔', termEn: 'Chengzai (steelyard)', definition: '臺灣話的「秤」，這裡是桿秤：秤桿、秤鉤與滑動的秤錘，秤桿上有星花刻度。', definitionEn: 'The Taiwanese word for a scale; here a steelyard with a beam, a hook and a sliding weight, the beam marked with stars.' },
    { term: '度量衡規則', termEn: 'Weights-and-measures regulations', definition: '規定長度、容量、重量的計量標準與器具的法規；小說裡的罰款就是以「違犯度量衡規則」為由。', definitionEn: 'Rules fixing the standards and instruments for length, volume and weight; the fine in the story is imposed for “violating” them.' },
    { term: '斤、兩', termEn: 'Catty and tael', definition: '舊制的重量單位。小說裡的菜稱出「一斤十四兩」，與「兩斤足」差了兩兩。', definitionEn: 'Traditional units of weight. In the story the vegetables weigh “one catty fourteen taels”, two taels short of a full two catties.' },
  ],
  connect: [
    '秤與信任｜秤是度量衡：買賣雙方都要相信同一把尺。小說裡，秤本身沒有問題（新秤、星花清楚），問題在誰有權決定「準不準」。醫學生每天用量表、儀器和標準值判斷「正常」與「異常」；當手上的標準值遇上眼前的人，誰的判斷算數？（這一段是本站的延伸。）',
    '規則與權力｜秦得參沒有做錯什麼，卻要付出罰款。規則為了公平而設，但執行時的權力落差——檢查的人與被檢查的人、有資格判斷的人與只能接受判斷的人——仍然存在。醫療與行政現場也有這種落差。',
  ],
  connectEn: [
    'Scales and trust | A scale is a measure: buyer and seller must both trust the same yardstick. In the story, nothing is wrong with the scale itself (it is new, its marks are clear); the question is who has the right to decide whether it is “accurate”. Medical students use scales, instruments and reference values every day to judge “normal” and “abnormal”; when the reference value meets the person in front of you, whose judgement counts? (This paragraph is this site’s extension.)',
    'Rules and power | Qin Deshen has done nothing wrong, yet he must pay a fine. Rules are made for fairness, but in their enforcement a gap in power remains: between the one who inspects and the one inspected, between those qualified to judge and those who can only accept the judgement. Healthcare and administration have such gaps too.',
  ],
  reflection: {
    question: '故事裡的秤沒有問題，問題出在「誰說了算」。你在學校、醫療或日常生活裡，見過「規則沒錯、執行出問題」的情形嗎？你當時站在哪一邊？',
    questionEn: 'In the story nothing is wrong with the scale; the problem is who has the say. Have you seen, at school, in healthcare or in daily life, a case where the rule was right but its enforcement went wrong? Which side were you on?',
    prompts: [
      '如果你是那天在攤邊看見這一幕的路人，你可以做什麼？現在的你，在哪些場合手上握著「決定準不準」的權力？',
      '賴和說「凡強權行使的地上，總會發生」。你同意這句話嗎？有哪些制度可以減少這樣的事？',
      '桿秤靠一個支點與一個平衡。你認為公平的「平衡」需要哪些條件？',
    ],
    promptsEn: [
      'If you had been a passer-by at the stall that day, what could you have done? In which situations do you now hold the power to decide what is “accurate”?',
      'Lai He says that such things are bound to happen wherever power is wielded by force. Do you agree? What institutions could reduce them?',
      'A steelyard depends on a fulcrum and a balance. What conditions do you think a fair “balance” needs?',
    ],
  },
  checks: [
    { status: 'sourced', text: '原文節選依維基文庫轉錄本；連載於《臺灣民報》第92、93號（1926年2月14日、21日）。', textEn: 'The excerpts follow the Wikisource transcription; serialised in the Taiwan Minpao nos. 92 and 93 (14 and 21 February 1926).' },
    { status: 'sourced', text: '全文沒有出現「彰化」與「大稻埕」；地名是「鎮南威麗村」。', textEn: 'The words “Changhua” and “Dadaocheng” do not appear in the text; the place name is “Weili Village of Zhennan”.' },
    { status: 'sourced', text: '賴和是彰化人，筆名有懶雲（維基文庫作者頁）。', textEn: 'Lai He was from Changhua, and Lanyun is one of his pen names (Wikisource author page).' },
    { status: 'pending', text: '賴和是醫師、1914年畢業於醫學校：只見維基百科，條目沒有註腳。', textEn: 'That Lai He was a physician who graduated from the medical school in 1914: found only on Wikipedia, whose entry carries no footnote.' },
    { status: 'pending', text: '轉錄本與《臺灣民報》原刊的逐字差異（例如「稱」與「穪」並用）。', textEn: 'Word-for-word differences between the transcription and the Taiwan Minpao original (for example 稱 and 穪 used together).' },
    { status: 'omitted', text: '故事發生在彰化：原文沒有說，不寫。', textEn: 'That the story takes place in Changhua: the text does not say so, left out.' },
    { status: 'omitted', text: '後記的悲劇是哪一件真實案件、賴和與文化協會的關係：查無，不寫。', textEn: 'Which real case the tragedy in the postscript refers to, and Lai He’s relationship with the Cultural Association: not found, left out.' },
  ],
  sourceIds: ['wikisource-yi-gan-cheng-zai', 'wikisource-lai-he-author', 'wiki-lai-he', 'nmth-steelyard-2002-005-0156'],
}

/** 三篇經典在店家與年代裡的位置（遊戲內由 shops.js 掛上；測試核對） */
export const CLASSICS = [
  { id: QUAN_HE_LUN_ID, shopId: 'xia-hai-cheng-huang', eraId: 'qing-port', chapter: QUAN_HE_LUN_CHAPTER },
  { id: CLINICAL_LECTURE_ID, shopId: 'jiang-shan-lou', eraId: 'banquet', chapter: CLINICAL_LECTURE_CHAPTER },
  { id: YI_GAN_CHENG_ZAI_ID, shopId: 'lin-hua-tai', eraId: 'banquet', chapter: YI_GAN_CHENG_ZAI_CHAPTER },
]

/** 桿秤器物「照片與文獻」層的延伸閱讀指引（併進 INSPECT_OBJECTS 的 tea-scale） */
export const TEA_SCALE_CLASSIC_NOTE = {
  text: '延伸閱讀：同時代的另一桿秤——賴和〈一桿「稱仔」〉（1926）。小說裡的是菜販的秤，地點是虛構的鎮南威麗村，不是大稻埕，也不是茶行的秤；見酒樓繁華年代林華泰茶行的「經典閱讀」章節。',
  textEn: 'Further reading: another steelyard of the same age, in Lai He’s “A Steelyard” (1926). The scale in the story is a vegetable seller’s, set in the invented Weili Village of Zhennan, not Dadaocheng and not a tea hong’s scale; see the “Classic reading” chapter of Lin Huatai in the banquet-hall era.',
  sourceIds: ['wikisource-yi-gan-cheng-zai'],
}
