/**
 * 黃玉階文史館的資料（與場景配置 huangYujieLayout.js 分開）
 *
 * 四類資料分開存放，介紹章節從這裡取用，不混在一起：
 * - VERIFIED_FACTS：有公開資料可以查證的史實（附 sourceIds）
 * - PHOTO_OBSERVATIONS：使用者提供的實地照片看得到的內容（不是史料，不推論年代或來歷）
 * - SCENARIO_DESIGN：3D 場景的情境設計與簡化（示意）
 * - PENDING：尚未核實、因此留空或不採用的資料
 *
 * 場館（文史館）、歷史商號（元珍豆醬店）、人物（黃玉階）與相關組織（協會）各自建檔，
 * 協會與文史館的關係待核實，不寫成館方、主辦或所有權人。
 */

/** 場館：現代的文史館。尚未核實的欄位一律為 null（不以黃玉階的遷居年份或協會的登記日代替） */
export const MUSEUM_RECORD = {
  id: 'huang-yujie-museum',
  name: '黃玉階文史館',
  kind: 'heritage',
  category: '文化據點',
  type: '文化展示／歷史街屋',
  era: 'revival',
  historicShop: 'yuanzhen',
  person: 'huang-yujie',
  /** 相鄰：從巷子正對立面時，右鄰是導演的豆花店（使用者照片） */
  neighbour: { right: 'action-bar' },
  buildingYear: null,
  openingDate: null,
  address: null,
  openingHours: null,
  operator: null,
  sourceIds: ['merit-2026-huang-yujie'],
}

/** 歷史商號：元珍豆醬店（「源珍」為另一種說法，兩塊招牌都照原樣保留，不自動改字） */
export const HISTORIC_SHOP = {
  id: 'yuanzhen',
  name: '元珍豆醬店',
  trade: '醬菜業',
  names: [
    { name: '元珍', note: '帳冊上的寫法；二樓窗下的匾額', sourceIds: ['merit-2026-huang-yujie'] },
    { name: '源珍', note: '地方耆老口述的說法；騎樓的綠色斜掛匾額、室內的布旗', sourceIds: ['merit-2026-huang-yujie'] },
  ],
  foundedYear: null,
  sourceIds: ['merit-2026-huang-yujie', 'tcmb-huang-yujie', 'ncl-huang-yujie'],
}

/** 人物 */
export const PERSON = {
  id: 'huang-yujie',
  name: '黃玉階',
  born: 1850,
  died: 1918,
  movedToDadaocheng: 1882,
  sourceIds: ['tcmb-huang-yujie', 'ncl-huang-yujie'],
}

/** 相關組織：與文史館的關係待核實（relationToMuseum 為 null） */
export const ORGANIZATIONS = [
  {
    id: 'taiwan-cultural-development-association',
    name: '社團法人臺灣文化事業發展協會',
    permitDate: '2023-10-18',
    permitBy: '內政部',
    registrationDate: '2024-05-16',
    registeredAt: '臺灣桃園地方法院',
    purpose: '文化記憶保存、文化調查、人才培訓及教育推廣',
    relationToMuseum: null,
    relationNote: '待核實：公開資料沒有說明協會與黃玉階文史館的營運、主辦或所有權關係。',
    sourceIds: ['judicial-2024-tcda'],
  },
]

/** 已查證的史實 */
export const VERIFIED_FACTS = [
  { id: 'life', text: '黃玉階生於1850年、逝於1918年，出生地是彰化大肚堡五汊港（今臺中市梧棲區）。', sourceIds: ['tcmb-huang-yujie', 'ncl-huang-yujie'] },
  { id: 'move', text: '1882年（光緒八年）遷居大稻埕。', sourceIds: ['tcmb-huang-yujie', 'ncl-huang-yujie'] },
  { id: 'trade', text: '經營醬菜業（醬菜坊），同時以漢醫行醫。', sourceIds: ['tcmb-huang-yujie', 'ncl-huang-yujie'] },
  { id: 'epidemic', text: '日治初期霍亂、鼠疫流行時奔走救治，不收謝禮。', sourceIds: ['tcmb-huang-yujie', 'ncl-huang-yujie'] },
  { id: 'license', text: '取得官方核發的醫生執照；年份有1897年（臺灣記憶）與1901年（國家文化記憶庫）兩種記載。', sourceIds: ['ncl-huang-yujie', 'tcmb-huang-yujie'] },
  { id: 'district', text: '1900–1917年擔任大稻埕區長。', sourceIds: ['ncl-huang-yujie'] },
  { id: 'reform', text: '被推為臺北天然足會與斷髮不改裝會的會長，推廣放足、斷髮。', sourceIds: ['ncl-huang-yujie', 'tcmb-huang-yujie'] },
  { id: 'museum', text: '百年前的元珍豆醬店，如今是黃玉階文史館；門口掛著「元珍」與「源珍」兩塊招牌。', sourceIds: ['merit-2026-huang-yujie'] },
  { id: 'exhibits', text: '館內有醬缸、「學貫中西」匾額與人體解剖圖。', sourceIds: ['merit-2026-huang-yujie'] },
  { id: 'education', text: '日治時期的初等教育：1898年國語傳習所改為公學校（臺籍兒童）與小學校（日籍兒童），1922年修訂臺灣教育令，1941年一律改稱國民學校。', sourceIds: ['ith-primary-education'] },
  { id: 'association', text: '社團法人臺灣文化事業發展協會：內政部2023年10月18日許可設立，2024年5月16日法人設立登記。', sourceIds: ['judicial-2024-tcda'] },
]

/** 使用者提供的實地照片看得到的內容（照片編號依提供的順序） */
export const PHOTO_OBSERVATIONS = [
  { id: 'neighbour', text: '站在巷子裡正對兩棟建築：左邊是紅磚拱窗的文史館，右邊是灰色立面的導演的豆花店，兩棟的騎樓相連。', photos: [1, 2] },
  { id: 'facade', text: '二層紅磚街屋：二樓三組拱形窗（中央較寬）、四道磚柱與拱頂的放射狀磚紋；窗下中央是黑底金字的「元珍」匾額，左右是淺色邊框的彩色陶飾板。', photos: [4] },
  { id: 'columns', text: '一樓兩根紅磚圓柱、灰色柱頭，後面是退縮的木造門面；門前有木質花槽與植栽，牆面有風化的深色痕跡與牆縫植物。', photos: [1, 4] },
  { id: 'arcade', text: '騎樓頂部露出深褐色的木梁與木板，有綠色斜掛的「源珍」匾額、木櫃式的構件與暖色的吊燈；騎樓的介紹板標題提到「立面交趾陶」。', photos: [2, 3] },
  { id: 'beams', text: '室內保留裸露的木梁與木板天花，可以看到修補過的木料與金屬固定構件。', photos: [3, 5, 6] },
  { id: 'jars', text: '入口一側與醬料陳列區擺著深褐色的陶醬缸，部分加蓋或用紅布、麻布封口，貼著「醬」「醋」的紅色菱形紙。', photos: [2, 7, 13] },
  { id: 'walls', text: '一面木板牆是黃玉階的人物展示（肖像看板、醫療公衛與社會參與的說明、裝框的文件）；另一面大型展板的標題是「日治初期大稻埕的初等教育發展」。', photos: [5, 7, 8, 12] },
  { id: 'study', text: '後牆掛著黑底金字的「學貫中西」匾額，下方是淺綠色的老窗框、人體解剖圖掛軸與鋪深藍桌布的小展桌。', photos: [6, 15] },
  { id: 'shelves', text: '高到天花的深色木製開放層架：牛皮紙包裝與紅紙封條、竹編與藤編提籃、綁紅繩的小陶甕、茶具與鍋具、便當提盒、書籍、舊式電視與玻璃燈具。', photos: [6, 10, 16] },
  { id: 'tea', text: '茶席：圓形竹托盤上的黑色茶壺與杯底朝上的茶杯；上方懸掛米白布面、紅色紋樣的大型布旗與「源珍」小布旗。', photos: [9, 11, 14] },
  { id: 'gathering', text: '中央是深色長木桌與長板凳，可以坐下聽導覽、翻閱資料。', photos: [12] },
]

/** 3D 場景的情境設計與簡化 */
export const SCENARIO_DESIGN = [
  { id: 'size', text: '建築與室內的尺寸依照片的比例估算，不是測量；照片沒有拍到的展間深處是簡化的配置。' },
  { id: 'ceramics', text: '立面的彩色陶飾板以簡化的浮雕表現，保留照片中的配置與色彩，沒有替換成其他圖樣。' },
  { id: 'boards', text: '展板上的小字以版面示意（標題、年代軸、段落、圖片與城市剪影），不逐字重建館方的展板；可以閱讀的文字是本站另外整理的「網站延伸整理」。' },
  { id: 'objects', text: '層架、醬缸、茶具與器物是依照片簡化的示意，不是館藏的複製，也不代表確切的年代。' },
  { id: 'omitted', text: '照片裡的路人、車牌、鏡頭光斑與行動電源機、交通錐等現代雜物沒有放進場景；兩棟室內之間沒有打通新的門。' },
  { id: 'upstairs', text: '只製作照片拍到的一樓；二樓只有外觀，沒有虛構二樓的展覽。' },
]

/** 尚未核實的資料：留空或不採用 */
export const PENDING = [
  { id: 'building-year', field: '老屋的興建年', note: '未查到可靠資料，留空。' },
  { id: 'opening-date', field: '文史館的開館日', note: '未查到可靠資料，留空（不以協會的登記日代替）。' },
  { id: 'address', field: '詳細門牌', note: '依照片與相鄰的豆花店，位在迪化街一段224巷；門牌未核實，留空。' },
  { id: 'hours', field: '開放時間', note: '未核實，不列出。' },
  { id: 'operator', field: '營運單位與協會的關係', note: '公開資料沒有說明，待核實。' },
  { id: 'girls-school', field: '請願設立女子分校', note: '只見於《人間福報》的文章，校名與年份待其他資料核實。' },
  { id: 'board-schools', field: '館內教育展板上的校名與年份', note: '照片中的小字沒有逐一核對，本站不轉載；也不能因為館內有教育展，就推論這棟建築以前是學校。' },
  { id: 'zhishantang', field: '至善堂', note: '臺灣記憶記載黃玉階創建「至善堂」會所；豆花店的介紹提到空間提供者財團法人台北市至善堂。兩者是否為同一組織的延續，本站未核實。' },
]
