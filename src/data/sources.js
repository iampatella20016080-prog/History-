/**
 * 文獻與歷史依據
 *
 * 所有店家共用同一份文獻清單，店家資料以 id 參照。
 * 每一筆都必須是可以公開查證的真實來源；請勿填入未經查證的引文。
 */
export const SOURCES = {
  'ith-lin-fu-zhen': {
    id: 'ith-lin-fu-zhen',
    // 依使用者指定的引用格式
    citation: '中央研究院臺灣史研究所檔案館，〈林復振商行〉。',
    publisher: '中央研究院臺灣史研究所檔案館',
    title: '林復振商行',
    url: 'https://archives.ith.sinica.edu.tw/collections_con.php?no=134',
    context:
      '收錄於該館「館藏選粹」專文〈追溯迪化街百年老店林復振商行與乾元藥行〉。',
    // 原頁面中刊載的史料圖像（名稱照錄原頁面圖說）
    records: [
      '1915年11月2日淡水林振源號致泰益號書信',
      '1933年9月17日臺北復振英記致泰益號書信',
    ],
    recordsNote:
      '上列書信圖像見於原頁面，圖像來源標示為「長崎泰益號文書，中研院臺史所檔案館數位典藏」。',
  },
}

export function getSource(id) {
  return SOURCES[id] ?? null
}
