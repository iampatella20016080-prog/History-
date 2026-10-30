import { useEffect, useState } from 'react'
import { getEra } from '../data/eras.js'
import { routeNodePoint } from '../data/routes.js'
import { PIER, PLAZA, RIVER, STREET } from '../game/config.js'
import { playerState } from '../game/runtime.js'
import { nodeEra } from '../game/themeRoute.js'

/** 地圖範圍（世界座標的 x 與 z；北方 z < 0 在上） */
const VIEW = { minX: -55, maxX: 56, minZ: -13, maxZ: 26 }

/**
 * 主題路線的地圖（第 12 階段）：遊戲街景的俯視示意圖，標出路線的節點與你的位置。
 * 節點編號依路線的順序，但順序自由；完成的節點打勾，其他年代的節點變淡並寫上年代。
 * 街景本身是情境示意（不是真實的相對位置；真實位置見「年表與地圖」的對照地圖）。
 */
export function RouteMap({ route, progress, eraId }) {
  const [player, setPlayer] = useState(() => [playerState.position.x, playerState.position.z])
  useEffect(() => {
    const timer = setInterval(() => setPlayer([playerState.position.x, playerState.position.z]), 400)
    return () => clearInterval(timer)
  }, [])

  const rowEnd = STREET.rowEndX
  return (
    <svg
      className="route-map"
      viewBox={`${VIEW.minX} ${VIEW.minZ} ${VIEW.maxX - VIEW.minX} ${VIEW.maxZ - VIEW.minZ}`}
      role="img"
      aria-label={`${route.title}的路線地圖`}
    >
      <rect className="route-map__river" x={VIEW.minX} y={VIEW.minZ} width={RIVER.edgeX - VIEW.minX} height={VIEW.maxZ - VIEW.minZ} />
      <rect className="route-map__ground" x={PIER.minX} y={-PIER.halfWidth} width={PIER.maxX - PIER.minX} height={PIER.halfWidth * 2} />
      <rect className="route-map__ground" x={PLAZA.minX} y={-PLAZA.halfDepth} width={PLAZA.maxX - PLAZA.minX} height={PLAZA.halfDepth * 2} />
      <rect className="route-map__block" x={STREET.rowStartX} y={-STREET.facadeZ - 8} width={rowEnd - STREET.rowStartX} height={8} />
      <rect className="route-map__block" x={STREET.rowStartX} y={STREET.facadeZ} width={rowEnd - STREET.rowStartX} height={8} />
      <rect className="route-map__ground" x={STREET.rowStartX} y={-STREET.facadeZ} width={STREET.endFacadeX - STREET.rowStartX} height={STREET.facadeZ * 2} />
      <text className="route-map__label" x={-50} y={-6}>
        淡水河
      </text>
      <text className="route-map__label" x={-8} y={0.9}>
        迪化街
      </text>
      {progress.map((node, i) => {
        const point = routeNodePoint({ ...node, eraId: nodeEra(route, node) })
        if (!point) return null
        const here = nodeEra(route, node) === eraId
        return (
          <g key={node.id} className={`route-map__node${node.done ? ' is-done' : ''}${here ? '' : ' is-elsewhere'}`} transform={`translate(${point[0]} ${point[1]})`}>
            <circle r="2.3" />
            <text y="0.9">{node.done ? '✓' : i + 1}</text>
            {!here && (
              <text className="route-map__era" y="5.2">
                {getEra(nodeEra(route, node))?.title}
              </text>
            )}
          </g>
        )
      })}
      <circle className="route-map__player" cx={player[0]} cy={player[1]} r="1.3" />
    </svg>
  )
}
