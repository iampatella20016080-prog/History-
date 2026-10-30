import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferAttribute, BufferGeometry, Color, DoubleSide, MeshBasicMaterial } from 'three'
import { atmosphere } from '../atmosphere.js'
import { useNoOutlineLayer } from './Sky.jsx'

/**
 * 層層遠山（剪紙般的分層色塊，營造景深）。
 * 西側隔著淡水河的近景山形為觀音山的意象化輪廓。
 * 方位角 phi：方向 = (cos phi, 0, sin phi)；西方 = PI、北方 = 1.5 PI。
 */
function ridgeGeometry({ radius, from, to, segments, height, color, hazeColor }) {
  const positions = []
  const colors = []
  const top = new Color(color)
  const base = new Color(hazeColor)
  const points = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const phi = from + (to - from) * t
    points.push({ x: Math.cos(phi) * radius, z: Math.sin(phi) * radius, h: height(t) })
  }
  const bottom = -30
  for (let i = 0; i < segments; i++) {
    const a = points[i]
    const b = points[i + 1]
    const quad = [
      [a.x, a.h, a.z, top],
      [a.x, bottom, a.z, base],
      [b.x, b.h, b.z, top],
      [b.x, b.h, b.z, top],
      [a.x, bottom, a.z, base],
      [b.x, bottom, b.z, base],
    ]
    for (const [x, y, z, c] of quad) {
      positions.push(x, y, z)
      colors.push(c.r, c.g, c.b)
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3))
  return geometry
}

function noise(t, seed) {
  return (
    Math.sin(t * 13.1 + seed) * 0.5 +
    Math.sin(t * 29.7 + seed * 2.1) * 0.25 +
    Math.sin(t * 61.3 + seed * 3.7) * 0.12
  )
}

function profile(points) {
  return (t) => {
    for (let i = 0; i < points.length - 1; i++) {
      const [t0, h0] = points[i]
      const [t1, h1] = points[i + 1]
      if (t >= t0 && t <= t1) {
        const k = (t - t0) / (t1 - t0)
        const s = k * k * (3 - 2 * k)
        return h0 + (h1 - h0) * s
      }
    }
    return points[points.length - 1][1]
  }
}

export function Mountains() {
  const group = useRef()
  useNoOutlineLayer(group)

  const layers = useMemo(() => {
    const far = ridgeGeometry({
      radius: 760,
      from: 0,
      to: Math.PI * 2,
      segments: 160,
      height: (t) => 34 + noise(t, 1.3) * 16 + Math.max(0, Math.sin(t * Math.PI * 2 - 1.2)) * 30,
      color: '#c5cdc6',
      hazeColor: '#e6e2d2',
    })
    const north = ridgeGeometry({
      radius: 560,
      from: Math.PI * 1.08,
      to: Math.PI * 1.92,
      segments: 90,
      height: (t) => 40 + Math.sin(t * Math.PI) * 42 + noise(t, 4.2) * 10,
      color: '#adb9ad',
      hazeColor: '#e3e0cf',
    })
    const southEast = ridgeGeometry({
      radius: 520,
      from: -Math.PI * 0.55,
      to: Math.PI * 0.82,
      segments: 110,
      height: (t) => 20 + noise(t, 7.7) * 9 + Math.sin(t * Math.PI) * 12,
      color: '#b9c2b2',
      hazeColor: '#e5e1d0',
    })
    const guanyin = ridgeGeometry({
      radius: 410,
      from: Math.PI * 0.83,
      to: Math.PI * 1.15,
      segments: 70,
      height: profile([
        [0, 2],
        [0.1, 9],
        [0.2, 20],
        [0.3, 29],
        [0.38, 35],
        [0.46, 44],
        [0.52, 49],
        [0.58, 43],
        [0.66, 38],
        [0.74, 30],
        [0.84, 19],
        [0.93, 9],
        [1, 3],
      ]),
      color: '#94a394',
      hazeColor: '#d9dccb',
    })
    const material = new MeshBasicMaterial({ vertexColors: true, fog: false, side: DoubleSide })
    return { geometries: [far, north, southEast, guanyin], material }
  }, [])

  // 遠山的色調隨年代的天色變化（入夜時轉為藍紫色剪影）
  useFrame(() => {
    layers.material.color.copy(atmosphere.current.mountains)
  })

  return (
    <group ref={group}>
      {layers.geometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry} material={layers.material} renderOrder={-900 + i} frustumCulled={false} userData={{ reflect: true }} />
      ))}
    </group>
  )
}
