import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { ERAS } from '../src/data/eras.js'
import { TEA_THEME, getShop, getTheme, getThemeMembers, getThemeVersions } from '../src/data/shops.js'

/** 茶的主線：四家店共用主題 tea，五個年代各有代表店家，彼此可以互相找到 */
describe('茶的主線：主題', () => {
  test('五個年代各有一個代表店家，而且那家店在那個年代真的出現', () => {
    assert.deepEqual(Object.keys(TEA_THEME.versions), ERAS.map((era) => era.id))
    for (const era of ERAS) {
      const id = TEA_THEME.versions[era.id]
      assert.ok(era.availableStores.includes(id), `${era.id} 的代表 ${id} 不在名錄裡`)
      assert.ok(getShop(id).buildingByEra[era.id], `${era.id} 的代表 ${id} 沒有建築`)
    }
  })

  test('四家成員都標了主題 tea，而且都開放探索', () => {
    assert.deepEqual(TEA_THEME.members, ['dodd-tea-house', 'lin-hua-tai', 'you-ji', 'xin-fang-chun'])
    for (const id of TEA_THEME.members) {
      const shop = getShop(id)
      assert.equal(shop.theme, 'tea', id)
      assert.equal(shop.status, 'open', id)
      assert.equal(getTheme(shop.theme).title, '大稻埕的茶')
    }
  })

  test('從任何一家都能找到其他三家與它們出現的年代；代表版本不含自己', () => {
    const members = getThemeMembers(getShop('you-ji'))
    assert.deepEqual(
      members.map((item) => [item.shop.id, item.eraIds]),
      [
        ['dodd-tea-house', ['qing-port']],
        ['lin-hua-tai', ['qing-port', 'banquet', 'modern', 'postwar', 'revival']],
        ['xin-fang-chun', ['modern', 'postwar', 'revival']],
      ],
    )
    const versions = getThemeVersions(getShop('xin-fang-chun'))
    assert.deepEqual(
      versions.map((item) => [item.eraId, item.shop.id]),
      [
        ['qing-port', 'dodd-tea-house'],
        ['banquet', 'you-ji'],
        ['postwar', 'lin-hua-tai'],
      ],
    )
    // 沒有 members 的主題（魷魚羹）不受影響
    assert.deepEqual(getThemeMembers(getShop('temple-squid-stall')), [])
  })
})
