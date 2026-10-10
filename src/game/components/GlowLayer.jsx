import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, ShaderMaterial } from 'three'
import { LAYERS } from '../config.js'
import { atmosphere } from '../atmosphere.js'

/**
 * 燈火光暈（面向鏡頭的柔光）與地面光暈（燈下的暖色光圈）。
 * 亮度隨年代的 glow 值變化：白天幾乎看不見，入夜時讓街道浮現溫暖的燈火。
 */
const GLOW_VERTEX = /* glsl */ `
  attribute vec3 aCenter;
  attribute vec2 aCorner;
  attribute vec3 aColor;
  attribute vec2 aParams;
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vCorner;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(aCenter, 1.0);
    float flicker = 1.0 + aParams.y * (sin(uTime * 6.3 + aCenter.x * 3.1) * 0.07 + sin(uTime * 11.7 + aCenter.z * 1.7) * 0.05);
    float size = aParams.x * flicker;
    mv.xy += aCorner * size;
    // 稍微往鏡頭方向移動，避免光暈被牆面切掉一半
    mv.z += min(size * 0.45, 0.7);
    gl_Position = projectionMatrix * mv;
    vCorner = aCorner;
    vColor = aColor;
    vAlpha = uIntensity * flicker * (1.0 - smoothstep(70.0, 170.0, -mv.z));
  }
`

const GLOW_FRAGMENT = /* glsl */ `
  varying vec2 vCorner;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float r = length(vCorner);
    float core = exp(-r * r * 9.0);
    float halo = exp(-r * r * 2.6) * 0.45;
    float a = (core + halo) * (1.0 - smoothstep(0.82, 1.0, r)) * vAlpha;
    gl_FragColor = vec4(vColor, a);
  }
`

const POOL_VERTEX = /* glsl */ `
  attribute vec2 aCorner;
  attribute vec3 aColor;
  uniform float uIntensity;
  varying vec2 vCorner;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    vCorner = aCorner;
    vColor = aColor;
    vAlpha = uIntensity * (1.0 - smoothstep(60.0, 140.0, -mv.z));
  }
`

const POOL_FRAGMENT = /* glsl */ `
  varying vec2 vCorner;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float r = length(vCorner);
    float a = smoothstep(1.0, 0.0, r);
    a = a * a * vAlpha;
    gl_FragColor = vec4(vColor, a);
  }
`

const CORNERS = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, -1],
  [1, 1],
  [-1, 1],
]

const _color = new Color()

function glowGeometry(glows) {
  const n = glows.length * 6
  const center = new Float32Array(n * 3)
  const corner = new Float32Array(n * 2)
  const color = new Float32Array(n * 3)
  const params = new Float32Array(n * 2)
  glows.forEach((glow, i) => {
    _color.set(glow.color)
    CORNERS.forEach(([cx, cy], k) => {
      const v = i * 6 + k
      center.set(glow.position, v * 3)
      corner.set([cx, cy], v * 2)
      color.set([_color.r, _color.g, _color.b], v * 3)
      params.set([glow.size * 0.5, glow.flicker ?? 0], v * 2)
    })
  })
  const geometry = new BufferGeometry()
  // position 只用來計算包圍球（實際位置由 aCenter 決定）
  geometry.setAttribute('position', new BufferAttribute(center, 3))
  geometry.setAttribute('aCenter', new BufferAttribute(center, 3))
  geometry.setAttribute('aCorner', new BufferAttribute(corner, 2))
  geometry.setAttribute('aColor', new BufferAttribute(color, 3))
  geometry.setAttribute('aParams', new BufferAttribute(params, 2))
  geometry.computeBoundingSphere()
  geometry.boundingSphere.radius += 3
  return geometry
}

function poolGeometry(pools) {
  const n = pools.length * 6
  const position = new Float32Array(n * 3)
  const corner = new Float32Array(n * 2)
  const color = new Float32Array(n * 3)
  pools.forEach((pool, i) => {
    _color.set(pool.color)
    const [x, y, z] = pool.position
    CORNERS.forEach(([cx, cy], k) => {
      const v = i * 6 + k
      position.set([x + cx * pool.radius, y + 0.012 + i * 0.0004, z + cy * pool.radius], v * 3)
      corner.set([cx, cy], v * 2)
      color.set([_color.r, _color.g, _color.b], v * 3)
    })
  })
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(position, 3))
  geometry.setAttribute('aCorner', new BufferAttribute(corner, 2))
  geometry.setAttribute('aColor', new BufferAttribute(color, 3))
  geometry.computeBoundingSphere()
  return geometry
}

function additiveMaterial(vertexShader, fragmentShader, uniforms) {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    fog: false,
  })
}

const sharedUniforms = {
  uTime: { value: 0 },
  uGlowIntensity: { value: 0 },
  uPoolIntensity: { value: 0 },
}

export function GlowLayer({ glows, pools }) {
  const layer = useMemo(() => {
    const glowMaterial = additiveMaterial(GLOW_VERTEX, GLOW_FRAGMENT, {
      uTime: sharedUniforms.uTime,
      uIntensity: sharedUniforms.uGlowIntensity,
    })
    const poolMaterial = additiveMaterial(POOL_VERTEX, POOL_FRAGMENT, { uIntensity: sharedUniforms.uPoolIntensity })
    poolMaterial.polygonOffset = true
    poolMaterial.polygonOffsetFactor = -2
    poolMaterial.polygonOffsetUnits = -2
    return {
      glowGeometry: glows.length ? glowGeometry(glows) : null,
      poolGeometry: pools.length ? poolGeometry(pools) : null,
      glowMaterial,
      poolMaterial,
    }
  }, [glows, pools])

  useEffect(
    () => () => {
      layer.glowGeometry?.dispose()
      layer.poolGeometry?.dispose()
      layer.glowMaterial.dispose()
      layer.poolMaterial.dispose()
    },
    [layer],
  )

  useFrame((state) => {
    const glow = atmosphere.current.glow
    const night = Math.min(1, Math.max(0, (glow - 0.06) / 0.94))
    sharedUniforms.uTime.value = state.clock.elapsedTime
    sharedUniforms.uGlowIntensity.value = night * 0.95
    sharedUniforms.uPoolIntensity.value = night * night * 0.55
  })

  const setLayer = (object) => object.layers.set(LAYERS.NO_OUTLINE)
  return (
    <>
      {layer.poolGeometry && (
        <mesh geometry={layer.poolGeometry} material={layer.poolMaterial} renderOrder={1} onUpdate={setLayer} />
      )}
      {layer.glowGeometry && (
        <mesh geometry={layer.glowGeometry} material={layer.glowMaterial} renderOrder={2} onUpdate={setLayer} />
      )}
    </>
  )
}
