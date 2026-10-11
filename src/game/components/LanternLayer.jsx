import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  BufferAttribute,
  Color,
  CylinderGeometry,
  Euler,
  Matrix4,
  MeshToonMaterial,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { atmosphere } from '../atmosphere.js'
import { getMaterials } from '../rendering/materials.js'

/**
 * 街上所有的燈籠（實例化繪製：一個年代只需一次繪製）。
 * 燈籠以頂端的掛點為軸心隨風輕擺；亮度依年代的 glow 值變化。
 */
function colored(geometry, hex) {
  const g = geometry.index ? geometry.toNonIndexed() : geometry
  const c = new Color(hex)
  const colors = new Float32Array(g.attributes.position.count * 3)
  for (let i = 0; i < colors.length; i += 3) colors.set([c.r, c.g, c.b], i)
  g.setAttribute('color', new BufferAttribute(colors, 3))
  return g
}

function lanternGeometry() {
  // 原點在掛點，燈籠本體在下方
  const body = new SphereGeometry(0.25, 14, 10)
  body.scale(1, 1.25, 1)
  body.translate(0, -0.42, 0)
  const top = new CylinderGeometry(0.13, 0.13, 0.07, 10)
  top.translate(0, -0.1, 0)
  const bottom = new CylinderGeometry(0.13, 0.13, 0.07, 10)
  bottom.translate(0, -0.74, 0)
  const tassel = new CylinderGeometry(0.015, 0.05, 0.24, 6)
  tassel.translate(0, -0.9, 0)
  const merged = mergeGeometries([
    colored(body, '#ffffff'),
    colored(top, '#2f2620'),
    colored(bottom, '#2f2620'),
    colored(tassel, '#e3b45a'),
  ])
  merged.computeBoundingSphere()
  return merged
}

let sharedGeometry = null
let sharedMaterial = null

function getLanternAssets() {
  if (!sharedGeometry) {
    sharedGeometry = lanternGeometry()
    sharedMaterial = new MeshToonMaterial({
      gradientMap: getMaterials().gradientMap,
      vertexColors: true,
      emissive: new Color('#ff8a4c'),
      emissiveIntensity: 0.2,
    })
    // 只有燈籠紙面發光（依頂點色亮度），上下木蓋保持暗色
    sharedMaterial.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n totalEmissiveRadiance *= smoothstep(0.2, 0.6, vColor.r);',
      )
    }
    sharedMaterial.customProgramCacheKey = () => 'lantern-glow'
  }
  return { geometry: sharedGeometry, material: sharedMaterial }
}

const _matrix = new Matrix4()
const _position = new Vector3()
const _quat = new Quaternion()
const _euler = new Euler()
const _scale = new Vector3()
const _color = new Color()

export function LanternLayer({ lanterns }) {
  const mesh = useRef()
  const { geometry, material } = useMemo(getLanternAssets, [])

  useEffect(() => {
    const instance = mesh.current
    if (!instance) return
    lanterns.forEach((lantern, i) => {
      instance.setColorAt(i, _color.set(lantern.color ?? '#c0553b'))
    })
    if (instance.instanceColor) instance.instanceColor.needsUpdate = true
  }, [lanterns])

  useFrame((state) => {
    const instance = mesh.current
    if (!instance) return
    const t = state.clock.elapsedTime
    lanterns.forEach((lantern, i) => {
      const s = lantern.scale ?? 1
      const [x, y, z] = lantern.position
      _position.set(x, y + 0.42 * s, z)
      _euler.set(Math.sin(t * 0.9 + i * 1.3) * 0.035, lantern.rotationY ?? 0, Math.sin(t * 1.3 + i * 1.7) * 0.06)
      _quat.setFromEuler(_euler)
      _matrix.compose(_position, _quat, _scale.set(s, s, s))
      instance.setMatrixAt(i, _matrix)
    })
    instance.instanceMatrix.needsUpdate = true
    material.emissiveIntensity = 0.18 + atmosphere.current.glow * 0.95 * atmosphere.current.lanternGlow
  })

  if (!lanterns.length) return null
  return <instancedMesh ref={mesh} args={[geometry, material, lanterns.length]} castShadow frustumCulled={false} />
}
