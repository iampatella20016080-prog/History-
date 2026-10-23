import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Box3, Box3Helper, Color, Group } from 'three'
import { DEBUG_FLICKER_ENABLED, flickerDebugState } from '../debugFlicker.js'

/**
 * 閃爍除錯面板（DEBUG_FLICKER；預設關閉，網址加上 ?debug=flicker 也可以開啟）：
 * 用來確認畫面閃爍屬於哪一類問題——
 * - 外框：每個網格的邊界方塊（重疊的網格、重複建立的模型一眼就看得出來）
 * - 名稱：在主控台列出場景裡的網格名稱、材質與數量（年代切換後有沒有殘留的舊模型）
 * - 關閉陰影、關閉透明物件、關閉依距離的顯示切換（人物、室內一律顯示）
 * - 單獨隱藏：街景的立面（合併的靜態網格）、貼花（招牌文字、展板、紙標籤）
 */
const OPTIONS = [
  ['bounds', '外框'],
  ['shadows', '關閉陰影'],
  ['transparent', '關閉透明物件'],
  ['lod', '關閉距離切換'],
  ['facade', '隱藏立面'],
  ['decals', '隱藏貼花'],
]
const DECAL_MATERIALS = new Set(['exhibit', 'riceExhibit', 'paper'])

export function FlickerDebug() {
  if (!DEBUG_FLICKER_ENABLED) return null
  return <FlickerDebugPanel />
}

function FlickerDebugPanel() {
  const { scene, gl } = useThree()
  const helpers = useRef(new Group())
  const lastBounds = useRef(false)
  const hidden = useRef(new Set())

  useEffect(() => {
    const group = helpers.current
    group.name = 'flicker-debug-bounds'
    scene.add(group)
    const panel = document.createElement('div')
    panel.className = 'flicker-debug'
    panel.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:9999;background:rgba(20,16,12,.85);color:#f4ead6;font:13px/1.6 sans-serif;padding:8px 12px;border-radius:6px'
    panel.innerHTML = '<strong>DEBUG_FLICKER</strong><br>' + OPTIONS.map(([key, label]) => `<label style="display:block"><input type="checkbox" data-key="${key}"> ${label}</label>`).join('') + '<button type="button" data-list>列出網格</button>'
    panel.addEventListener('change', (event) => {
      const key = event.target.dataset.key
      if (key) flickerDebugState[key] = event.target.checked
    })
    panel.querySelector('[data-list]').addEventListener('click', () => {
      const rows = []
      scene.traverse((o) => {
        if (!o.isMesh) return
        const material = Array.isArray(o.material) ? o.material.map((m) => m.name || m.type).join(',') : o.material?.name || o.material?.type
        rows.push({ name: o.name || o.parent?.name || '(未命名)', material, vertices: o.geometry?.attributes?.position?.count ?? 0, visible: o.visible })
      })
      console.table(rows)
      const eras = []
      scene.traverse((o) => o.name?.startsWith('era-') && eras.push(o.name))
      console.info('[DEBUG_FLICKER] 年代群組：', eras)
    })
    document.body.appendChild(panel)
    if (typeof window !== 'undefined') window.__flickerDebug = flickerDebugState
    return () => {
      scene.remove(group)
      panel.remove()
    }
  }, [scene])

  useFrame(() => {
    const state = flickerDebugState
    gl.shadowMap.enabled = !state.shadows
    // 外框：每次開啟時重新產生（場景換了年代也會反映）
    if (state.bounds !== lastBounds.current) {
      lastBounds.current = state.bounds
      helpers.current.clear()
      if (state.bounds) {
        scene.traverse((o) => {
          if (!o.isMesh || o.parent === helpers.current) return
          const box = new Box3().setFromObject(o)
          if (!box.isEmpty() && box.getSize(o.position.clone()).length() < 400) helpers.current.add(new Box3Helper(box, new Color('#ff3b6b')))
        })
      }
    }
    scene.traverse((o) => {
      if (!o.isMesh || o.parent === helpers.current) return
      const material = o.material
      const isTransparent = material?.transparent
      const isDecal = DECAL_MATERIALS.has(o.userData?.material) || o.name === 'signs'
      const isFacade = o.userData?.staticBatch && !isDecal
      const hide = (state.transparent && isTransparent) || (state.decals && isDecal) || (state.facade && isFacade)
      if (hide) {
        if (o.visible) hidden.current.add(o)
        o.visible = false
      } else if (hidden.current.has(o)) {
        hidden.current.delete(o)
        o.visible = true
      }
    })
  })
  return null
}
