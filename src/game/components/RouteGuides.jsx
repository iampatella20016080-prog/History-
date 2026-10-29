import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, MeshToonMaterial } from 'three'
import { getInspectable } from '../../data/inspectObjects.js'
import { getRoute } from '../../data/teaRoute.js'
import { routeProgress } from '../themeRoute.js'
import { getMaterials } from '../rendering/materials.js'
import { useGameStore } from '../../state/useGameStore.js'
import { damp } from '../utils/math.js'

let guideMaterial = null
function getGuideMaterial() {
  if (!guideMaterial) {
    guideMaterial = new MeshToonMaterial({ color: '#4f7b62', emissive: new Color('#9fd8b4'), emissiveIntensity: 0.5, gradientMap: getMaterials().gradientMap })
  }
  return guideMaterial
}

/** 主題路線的引導標示：還沒完成的節點上方，浮著一枚綠色的小菱標（完成就消失） */
function Guide({ position }) {
  const group = useRef()
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (!group.current) return
    const { mode, transitioning, viewMode } = useGameStore.getState()
    const visible = mode === 'explore' && !transitioning && viewMode === 'explore'
    group.current.position.y = position[1] + Math.sin(t * 2.1 + position[0]) * 0.12
    group.current.rotation.y += delta * 1.4
    group.current.scale.setScalar(damp(group.current.scale.x, visible ? 1 : 0.001, 6, delta))
  })
  return (
    <group ref={group} position={position} scale={0.001}>
      <mesh material={getGuideMaterial()} scale={[0.22, 0.34, 0.22]}>
        <octahedronGeometry args={[1, 0]} />
      </mesh>
    </group>
  )
}

/**
 * 主題探索模式的街上引導（第 10 階段）：
 * 進行中路線還沒完成的節點，在對應的店家、路人或器物上方放引導標示；順序自由，全部一起亮。
 */
export function RouteGuides({ world }) {
  const activeRouteId = useGameStore((state) => state.activeRouteId)
  const journal = useGameStore((state) => state.journal)
  const route = activeRouteId ? getRoute(activeRouteId) : null

  const guides = useMemo(() => {
    if (!route || route.eraId !== world.eraId) return []
    const positions = []
    for (const node of routeProgress(route, journal)) {
      if (node.done) continue
      if (node.npcIds) {
        for (const npcId of node.npcIds) {
          const npc = (world.npcs ?? []).find((item) => item.id === npcId)
          if (npc) positions.push({ id: `${node.id}-${npcId}`, position: [npc.position[0], 2.5, npc.position[2]] })
        }
      } else if (node.inspectableId) {
        const item = getInspectable(node.inspectableId)
        if (item) positions.push({ id: node.id, position: [item.prompt[0], item.prompt[1] + 0.8, item.prompt[2]] })
      } else if (node.shopId) {
        const model = world.shopModels.find((item) => item.shop.id === node.shopId)
        if (model) positions.push({ id: node.id, position: [model.anchors.marker.x, model.anchors.marker.y + 1.1, model.anchors.marker.z] })
      }
    }
    return positions
  }, [route, journal, world])

  return guides.map((guide) => <Guide key={guide.id} position={guide.position} />)
}
