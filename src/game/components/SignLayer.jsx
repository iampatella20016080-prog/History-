import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferAttribute, BufferGeometry, Color, DoubleSide, MeshToonMaterial } from 'three'
import { atmosphere } from '../atmosphere.js'
import { getMaterials } from '../rendering/materials.js'
import { createSignAtlas, signKey } from '../rendering/signTexture.js'

/**
 * 招牌與布幡：整個年代的招牌畫在同一張圖集上，合併成一個網格（一次繪製）。
 * 布幡另外成一個網格，頂點著色器讓布面隨風輕擺（幅度很小，輪廓線仍能對齊）。
 */
function quadGeometry(items, rects, { segments = 1, sway = false } = {}) {
  const rows = segments
  const vertsPerItem = rows * 6
  const count = items.length * vertsPerItem
  const position = new Float32Array(count * 3)
  const normal = new Float32Array(count * 3)
  const uv = new Float32Array(count * 2)
  const swayAttr = sway ? new Float32Array(count * 2) : null
  let v = 0
  items.forEach((item, index) => {
    const rect = rects.get(signKey(item))
    if (!rect) return
    const [u0, v0, u1, v1] = rect
    const r = item.rotationY ?? 0
    const rx = Math.cos(r)
    const rz = -Math.sin(r)
    // tilt：繞招牌的左右軸前傾（正值上緣往前，例如斜掛在騎樓下的匾額）；預設直立
    const tilt = item.tilt ?? 0
    const ct = Math.cos(tilt)
    const st = Math.sin(tilt)
    const nx = Math.sin(r) * ct
    const ny = -st
    const nz = Math.cos(r) * ct
    // 招牌的「上」方向：直立時是 +y，前傾時往法線方向偏
    const ux = Math.sin(r) * st
    const uy = ct
    const uz = Math.cos(r) * st
    const [cx, cy, cz] = item.position
    const hw = item.width / 2
    const hh = item.height / 2
    const phase = index * 1.37
    const corner = (sx, t) => {
      // sx: -1 左、1 右；t: 0 頂端、1 底端
      const up = hh - t * item.height
      position[v * 3] = cx + rx * hw * sx + ux * up
      position[v * 3 + 1] = cy + uy * up
      position[v * 3 + 2] = cz + rz * hw * sx + uz * up
      normal[v * 3] = nx
      normal[v * 3 + 1] = ny
      normal[v * 3 + 2] = nz
      uv[v * 2] = sx < 0 ? u0 : u1
      uv[v * 2 + 1] = v0 + (v1 - v0) * t
      if (swayAttr) {
        swayAttr[v * 2] = t
        swayAttr[v * 2 + 1] = phase
      }
      v++
    }
    for (let k = 0; k < rows; k++) {
      const t0 = k / rows
      const t1 = (k + 1) / rows
      corner(-1, t0)
      corner(-1, t1)
      corner(1, t0)
      corner(1, t0)
      corner(-1, t1)
      corner(1, t1)
    }
  })
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(position.subarray(0, v * 3), 3))
  geometry.setAttribute('normal', new BufferAttribute(normal.subarray(0, v * 3), 3))
  geometry.setAttribute('uv', new BufferAttribute(uv.subarray(0, v * 2), 2))
  if (swayAttr) geometry.setAttribute('aSway', new BufferAttribute(swayAttr.subarray(0, v * 2), 2))
  geometry.computeBoundingSphere()
  return geometry
}

const swayUniforms = { uTime: { value: 0 } }

export function SignLayer({ signs, banners }) {
  const layer = useMemo(() => {
    const atlas = createSignAtlas([...signs, ...banners])
    const { gradientMap } = getMaterials()
    const material = new MeshToonMaterial({
      map: atlas.texture,
      gradientMap,
      alphaTest: 0.5,
      emissive: new Color('#ffffff'),
      emissiveMap: atlas.texture,
      emissiveIntensity: 0.06,
    })
    const signGeometry = signs.length ? quadGeometry(signs, atlas.rects) : null
    let bannerGeometry = null
    let bannerMaterial = null
    if (banners.length) {
      bannerGeometry = quadGeometry(banners, atlas.rects, { segments: 6, sway: true })
      bannerMaterial = material.clone()
      bannerMaterial.side = DoubleSide
      bannerMaterial.onBeforeCompile = (shader) => {
        shader.uniforms.uTime = swayUniforms.uTime
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', '#include <common>\nattribute vec2 aSway;\nuniform float uTime;')
          .replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
            float swing = aSway.x * aSway.x;
            transformed += objectNormal * swing * (sin(uTime * 1.6 + aSway.y) * 0.05 + sin(uTime * 3.1 + aSway.y * 2.3) * 0.015);`,
          )
      }
      bannerMaterial.customProgramCacheKey = () => 'banner-sway'
    }
    return { atlas, material, signGeometry, bannerGeometry, bannerMaterial }
  }, [signs, banners])

  useEffect(
    () => () => {
      layer.atlas.dispose()
      layer.material.dispose()
      layer.signGeometry?.dispose()
      layer.bannerGeometry?.dispose()
      layer.bannerMaterial?.dispose()
    },
    [layer],
  )

  useFrame((state) => {
    swayUniforms.uTime.value = state.clock.elapsedTime
    const glow = atmosphere.current.glow
    layer.material.emissiveIntensity = 0.05 + glow * 0.3
    if (layer.bannerMaterial) layer.bannerMaterial.emissiveIntensity = layer.material.emissiveIntensity
  })

  return (
    <>
      {layer.signGeometry && <mesh geometry={layer.signGeometry} material={layer.material} receiveShadow />}
      {layer.bannerGeometry && (
        <mesh geometry={layer.bannerGeometry} material={layer.bannerMaterial} receiveShadow castShadow />
      )}
    </>
  )
}
