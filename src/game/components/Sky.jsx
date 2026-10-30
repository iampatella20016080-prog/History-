import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide, Color, IcosahedronGeometry, MeshToonMaterial, ShaderMaterial, Vector3 } from 'three'
import { LAYERS } from '../config.js'
import { atmosphere } from '../atmosphere.js'
import { QUALITY_MODES } from '../quality.js'
import { useGameStore } from '../../state/useGameStore.js'
import { PartBuilder } from '../builders/PartBuilder.js'
import { getMaterials } from '../rendering/materials.js'
import { createRng, range } from '../utils/random.js'

const SKY_VERTEX = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = p.xyww;
  }
`

/**
 * 天空：三段漸層、太陽光暈與地平線的暖光帶；入夜時浮現星星。
 */
const SKY_FRAGMENT = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uBottom;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform float uStars;
  uniform float uTime;
  varying vec3 vDir;

  float hash13(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }

  void main() {
    vec3 d = normalize(vDir);
    float h = d.y;
    vec3 color = mix(uHorizon, uTop, smoothstep(0.02, 0.6, h));
    color = mix(color, uBottom, smoothstep(0.0, -0.25, h));
    float s = max(dot(d, uSunDir), 0.0);
    // 太陽光暈＋沿地平線擴散的暖光
    float horizonBand = exp(-abs(h - max(uSunDir.y, 0.0) * 0.5) * 9.0) * pow(max(dot(normalize(vec3(d.x, 0.0, d.z)), normalize(vec3(uSunDir.x, 0.0, uSunDir.z))), 0.0), 3.0);
    color += uSunColor * (pow(s, 28.0) * 0.32 + pow(s, 5.0) * 0.12 + horizonBand * 0.16);
    if (uStars > 0.001 && h > 0.04) {
      vec3 p = d * 260.0;
      vec3 cell = floor(p);
      float rnd = hash13(cell);
      if (rnd > 0.982) {
        vec3 f = fract(p) - 0.5;
        float star = smoothstep(0.22, 0.0, length(f));
        float twinkle = 0.65 + 0.35 * sin(uTime * (1.5 + rnd * 3.0) + rnd * 80.0);
        color += vec3(1.0, 0.95, 0.85) * star * twinkle * uStars * smoothstep(0.04, 0.35, h) * (rnd - 0.982) * 55.0;
      }
    }
    gl_FragColor = vec4(color, 1.0);
  }
`

/** 天空與雲畫進河面倒映（精緻畫質，components/RiverReflection.jsx） */
const REFLECT = { reflect: true }

function useNoOutlineLayer(ref) {
  useEffect(() => {
    ref.current?.traverse((object) => object.layers.set(LAYERS.NO_OUTLINE))
  }, [ref])
}

/** 漸層天空、太陽光暈、星星與卡通雲朵 */
export function Sky() {
  const dome = useRef()
  const clouds = useRef()
  const group = useRef()
  useNoOutlineLayer(group)

  const skyMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: SKY_VERTEX,
        fragmentShader: SKY_FRAGMENT,
        side: BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uTop: { value: new Color() },
          uHorizon: { value: new Color() },
          uBottom: { value: new Color() },
          uSunDir: { value: new Vector3(0, 1, 0) },
          uSunColor: { value: new Color() },
          uStars: { value: 0 },
          uTime: { value: 0 },
        },
      }),
    [],
  )

  const cloud = useMemo(() => {
    const rng = createRng(2024)
    const b = new PartBuilder()
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2 + range(rng, -0.25, 0.25)
      const radius = range(rng, 380, 560)
      const cx = Math.cos(angle) * radius
      const cz = Math.sin(angle) * radius
      const cy = range(rng, 70, 130)
      const puffs = 4 + Math.floor(rng() * 4)
      for (let k = 0; k < puffs; k++) {
        const r = range(rng, 9, 20)
        b.add('plain', new IcosahedronGeometry(r, 1), {
          position: [cx + range(rng, -28, 28), cy + range(rng, -4, 6), cz + range(rng, -14, 14)],
          scale: [1.5, 0.62, 1],
          rotation: [0, angle, 0],
          tint: k % 3 === 0 ? '#f3eee2' : '#fbf8f0',
        })
      }
    }
    const [batch] = b.build()
    // 流暢模式只畫前一半的雲（每朵雲由連續的幾團組成，以頂點數的一半近似）
    const vertexCount = batch.geometry.attributes.position.count
    const halfCount = Math.floor(vertexCount / 2 / 3) * 3
    const material = new MeshToonMaterial({
      vertexColors: true,
      gradientMap: getMaterials().gradientMap,
      emissive: new Color('#c9c2b4'),
      emissiveIntensity: 0.55,
      fog: false,
    })
    return { geometry: batch.geometry, material, vertexCount, halfCount }
  }, [])

  const detail = useGameStore((state) => QUALITY_MODES[state.qualityMode]?.detail !== false)
  useEffect(() => {
    cloud.geometry.setDrawRange(0, detail ? cloud.vertexCount : cloud.halfCount)
  }, [cloud, detail])

  useFrame(({ camera, clock }, delta) => {
    dome.current?.position.copy(camera.position)
    if (clouds.current) clouds.current.rotation.y += delta * 0.003
    const a = atmosphere.current
    const u = skyMaterial.uniforms
    u.uTop.value.copy(a.skyTop)
    u.uHorizon.value.copy(a.skyHorizon)
    u.uBottom.value.copy(a.skyBottom)
    u.uSunDir.value.copy(a.sunDirection)
    u.uSunColor.value.copy(a.sunGlow)
    u.uStars.value = a.stars
    u.uTime.value = clock.elapsedTime
    cloud.material.color.copy(a.cloudColor)
    cloud.material.emissive.copy(a.cloudEmissive)
  })

  return (
    <group ref={group}>
      <mesh ref={dome} material={skyMaterial} renderOrder={-1000} frustumCulled={false} userData={REFLECT}>
        <sphereGeometry args={[900, 32, 16]} />
      </mesh>
      <mesh ref={clouds} geometry={cloud.geometry} material={cloud.material} userData={REFLECT} />
    </group>
  )
}

export { useNoOutlineLayer }
