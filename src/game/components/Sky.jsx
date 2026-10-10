import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide, Color, IcosahedronGeometry, MeshToonMaterial, ShaderMaterial, Vector3 } from 'three'
import { LAYERS, PALETTE, SUN } from '../config.js'
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

const SKY_FRAGMENT = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uBottom;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  varying vec3 vDir;
  void main() {
    vec3 d = normalize(vDir);
    float h = d.y;
    vec3 color = mix(uHorizon, uTop, smoothstep(0.02, 0.6, h));
    color = mix(color, uBottom, smoothstep(0.0, -0.25, h));
    float s = max(dot(d, uSunDir), 0.0);
    color += uSunColor * (pow(s, 28.0) * 0.32 + pow(s, 5.0) * 0.1);
    gl_FragColor = vec4(color, 1.0);
  }
`

function useNoOutlineLayer(ref) {
  useEffect(() => {
    ref.current?.traverse((object) => object.layers.set(LAYERS.NO_OUTLINE))
  }, [ref])
}

/** 漸層天空、太陽光暈與卡通雲朵 */
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
          uTop: { value: new Color(PALETTE.skyTop) },
          uHorizon: { value: new Color(PALETTE.skyHorizon) },
          uBottom: { value: new Color(PALETTE.haze) },
          uSunDir: { value: new Vector3(...SUN.offset).normalize() },
          uSunColor: { value: new Color('#ffe2b0') },
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
    const material = new MeshToonMaterial({
      vertexColors: true,
      gradientMap: getMaterials().gradientMap,
      emissive: new Color('#c9c2b4'),
      emissiveIntensity: 0.55,
      fog: false,
    })
    return { geometry: batch.geometry, material }
  }, [])

  useFrame(({ camera }, delta) => {
    dome.current?.position.copy(camera.position)
    if (clouds.current) clouds.current.rotation.y += delta * 0.003
  })

  return (
    <group ref={group}>
      <mesh ref={dome} material={skyMaterial} renderOrder={-1000} frustumCulled={false}>
        <sphereGeometry args={[900, 32, 16]} />
      </mesh>
      <mesh ref={clouds} geometry={cloud.geometry} material={cloud.material} />
    </group>
  )
}

export { useNoOutlineLayer }
