import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Color, HalfFloatType, NearestFilter, OrthographicCamera, PerspectiveCamera, UnsignedByteType, Vector2, WebGLRenderTarget } from 'three'
import { LAYERS, RIVER } from '../config.js'
import { atmosphere, setAtmosphereOverlay } from '../atmosphere.js'
import { windDirection, windStrength } from '../motion.js'
import { COVER, decodeCover, findEaveEmitters, groundAt } from '../rainMath.js'
import { RAIN, effectiveWeather, stepWeather, weatherActive, weatherAvailable, weatherState, weatherSteady } from '../weather.js'
import { reflectionSize, reflectsInRiver, updateMirrorCamera } from '../rendering/planarReflection.js'
import { createCoverMaterial, createDripGeometry, createDripMaterial, createRainGeometry, createRainMaterial, rainRuntime } from '../rendering/rainShader.js'
import { waterUniforms } from '../rendering/waterShader.js'
import { transitionState } from '../transition.js'
import { useGameStore } from '../../state/useGameStore.js'

const WHITE = new Color('#ffffff')
const RETAG_FRAMES = 30

function setData(key, value) {
  if (typeof document !== 'undefined') document.documentElement.dataset[key] = value
}

/** 雨停、切回晴天或流暢畫質：雨勢歸零，年代光線回到原樣 */
function resetWeather() {
  Object.assign(weatherState, weatherSteady(false))
  setAtmosphereOverlay({ rain: 0 })
  waterUniforms.uRain.value = 0
}

/** 積水倒影要畫的物件：河面倒映的那些（牆、屋頂、窗、燈火、天空、燈籠、燈光），再加上招牌與燈火的光暈；室內不畫 */
function collectPuddle(root) {
  const out = []
  const visit = (object, inside) => {
    const interior = inside || (typeof object.name === 'string' && object.name.startsWith('interior-'))
    if (reflectsInRiver(object, interior) || (!interior && (object.name === 'signs' || object.name === 'glows'))) out.push(object)
    for (const child of object.children) visit(child, interior)
  }
  visit(root, false)
  return out
}

/** 街景的靜態網格（遮雨高度圖用；室內不算，室內在建築的屋頂底下） */
function collectCover(root) {
  const out = []
  const visit = (object) => {
    if (typeof object.name === 'string' && object.name.startsWith('interior-')) return
    if (object.isMesh && object.userData?.staticBatch) out.push(object)
    for (const child of object.children) visit(child)
  }
  if (root) visit(root)
  return out
}

/**
 * 雨（只在精緻畫質、下雨或地面還濕的時候掛載）：
 * 1. 年代街景掛上之後，從正上方畫一次遮雨高度圖，讀回來找出屋簷的滴水點（rainMath.js）
 * 2. 雨絲與水花一個網格、屋簷滴水一個網格（各一次繪製；不投射陰影、不參與描邊、不畫進倒影）
 * 3. 積水倒影：和河面倒映一樣用 planarReflection.js 對地面（y ≈ 0）鏡射，以低解析度畫一次，濕地面那一趟取樣
 */
function Rain({ world }) {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const [drips, setDrips] = useState(null)
  const res = useMemo(() => {
    const cover = new WebGLRenderTarget(COVER.width, COVER.height, { type: UnsignedByteType, depthBuffer: true })
    cover.texture.minFilter = NearestFilter
    cover.texture.magFilter = NearestFilter
    cover.texture.generateMipmaps = false
    const w = COVER.maxX - COVER.minX
    const d = COVER.maxZ - COVER.minZ
    const coverCamera = new OrthographicCamera(-w / 2, w / 2, d / 2, -d / 2, 0.1, COVER.top - COVER.minY + 4)
    coverCamera.position.set((COVER.minX + COVER.maxX) / 2, COVER.top, (COVER.minZ + COVER.maxZ) / 2)
    coverCamera.up.set(0, 0, -1)
    coverCamera.lookAt(coverCamera.position.x, 0, coverCamera.position.z)
    coverCamera.updateMatrixWorld()
    coverCamera.layers.set(LAYERS.COVER)
    const half = gl.capabilities.isWebGL2 && gl.extensions.has('EXT_color_buffer_float')
    const puddle = new WebGLRenderTarget(64, 64, { type: half ? HalfFloatType : UnsignedByteType, depthBuffer: true })
    puddle.texture.generateMipmaps = false
    const virtual = new PerspectiveCamera()
    virtual.layers.set(LAYERS.PUDDLE)
    const rainMaterial = createRainMaterial()
    const dripMaterial = createDripMaterial()
    return {
      cover,
      coverCamera,
      coverMaterial: createCoverMaterial(),
      pixels: new Uint8Array(COVER.width * COVER.height * 4),
      puddle,
      virtual,
      rainGeometry: createRainGeometry(),
      rainMaterial,
      dripMaterial,
    }
  }, [gl])
  const state = useRef({ world: null, wait: 0, frame: 0, tagged: [] })
  const size = useMemo(() => new Vector2(), [])
  const saved = useMemo(() => new Color(), [])

  useEffect(() => {
    rainRuntime.puddle = res.puddle.texture
    if (import.meta.env.DEV && typeof window !== 'undefined' && window.__DDC__) window.__DDC__.rain = { runtime: rainRuntime, state: state.current, res }
    return () => {
      for (const object of state.current.tagged) object.layers.disable(LAYERS.PUDDLE)
      state.current.tagged = []
      rainRuntime.cover = null
      rainRuntime.coverReady = false
      rainRuntime.puddle = null
      rainRuntime.puddleReady = false
      res.cover.dispose()
      res.puddle.dispose()
      res.coverMaterial.dispose()
      res.rainGeometry.dispose()
      res.rainMaterial.dispose()
      res.dripMaterial.dispose()
      if (import.meta.env.DEV && typeof window !== 'undefined' && window.__DDC__) delete window.__DDC__.rain
    }
  }, [res])
  useEffect(() => () => drips?.dispose(), [drips])

  /** 從正上方畫遮雨高度圖，讀回來找屋簷 */
  function renderCover() {
    const meshes = collectCover(scene.getObjectByName(`era-${world.eraId}`))
    for (const mesh of meshes) mesh.layers.enable(LAYERS.COVER)
    const previous = gl.getRenderTarget()
    const alpha = gl.getClearAlpha()
    gl.getClearColor(saved)
    const shadowUpdate = gl.shadowMap.needsUpdate
    gl.shadowMap.needsUpdate = false
    const background = scene.background
    scene.background = null
    scene.overrideMaterial = res.coverMaterial
    gl.setRenderTarget(res.cover)
    gl.setClearColor(0x000000, 0)
    gl.clear(true, true, false)
    gl.render(scene, res.coverCamera)
    scene.overrideMaterial = null
    scene.background = background
    gl.readRenderTargetPixels(res.cover, 0, 0, COVER.width, COVER.height, res.pixels)
    gl.setRenderTarget(previous)
    gl.setClearColor(saved, alpha)
    gl.shadowMap.needsUpdate = shadowUpdate
    for (const mesh of meshes) mesh.layers.disable(LAYERS.COVER)
    const heights = decodeCover(res.pixels)
    const emitters = findEaveEmitters(heights, COVER, { ground: (x) => groundAt(x, RIVER.edgeX, RIVER.waterLevel), max: RAIN.maxDrips })
    rainRuntime.cover = res.cover.texture
    rainRuntime.coverReady = true
    res.rainMaterial.uniforms.tCover.value = res.cover.texture
    state.current.emitters = emitters.length
    if (import.meta.env.DEV) state.current.emitterList = emitters
    setDrips(createDripGeometry(emitters))
  }

  useFrame(({ camera, clock }) => {
    const s = state.current
    // 年代街景換上（EraScene 掛載）後等兩個影格，網格都建好才畫遮雨高度圖；
    // 換年代的這兩個影格沿用舊的圖（轉場的水墨暈染蓋著，不會一下乾一下濕）
    if (s.world !== world) {
      if (transitionState.mountedWorld === world && ++s.wait > 2) {
        s.world = world
        s.wait = 0
        renderCover()
      }
    }
    const t = clock.elapsedTime
    const a = atmosphere.current
    gl.getDrawingBufferSize(size)
    const pixel = (2 * Math.tan((camera.fov * Math.PI) / 360)) / Math.max(1, size.y)
    const strength = windStrength(t)
    const [wx, wz] = windDirection(t)
    const u = res.rainMaterial.uniforms
    u.uTime.value = t
    u.uAmount.value = rainRuntime.coverReady ? weatherState.rain : 0
    u.uPixel.value = pixel
    u.uWind.value.set(wx * strength * 2.4, wz * strength * 2.4)
    u.uColor.value.copy(a.skyHorizon).lerp(WHITE, 0.4)
    const d = res.dripMaterial.uniforms
    d.uTime.value = t
    d.uDrip.value = weatherState.drip
    d.uRain.value = weatherState.rain
    d.uPixel.value = pixel
    d.uColor.value.copy(a.skyHorizon).lerp(WHITE, 0.5)

    // 積水倒影：地面濕的時候每個影格畫一次（年代切換、室內產生後每 30 個影格重新標記）
    if (s.frame++ % RETAG_FRAMES === 0) {
      const next = collectPuddle(scene)
      const keep = new Set(next)
      for (const object of s.tagged) if (!keep.has(object)) object.layers.disable(LAYERS.PUDDLE)
      for (const object of next) object.layers.enable(LAYERS.PUDDLE)
      s.tagged = next
    }
    rainRuntime.puddleReady = false
    if (s.frame < 3 || !camera.isPerspectiveCamera || !(weatherState.puddle > 0.001 || weatherState.wet > 0.001)) return
    const { virtual } = res
    virtual.fov = camera.fov
    virtual.aspect = camera.aspect
    if (!updateMirrorCamera(camera, virtual, rainRuntime.puddleY, rainRuntime.puddleMatrix)) return
    const [w, h] = reflectionSize(size.x, size.y, RAIN.puddleScale)
    if (res.puddle.width !== w || res.puddle.height !== h) res.puddle.setSize(w, h)
    const previous = gl.getRenderTarget()
    const alpha = gl.getClearAlpha()
    gl.getClearColor(saved)
    const shadowUpdate = gl.shadowMap.needsUpdate
    gl.shadowMap.needsUpdate = false
    gl.setRenderTarget(res.puddle)
    gl.setClearColor(a.skyHorizon, 1)
    gl.clear(true, true, false)
    gl.render(scene, virtual)
    gl.setRenderTarget(previous)
    gl.setClearColor(saved, alpha)
    gl.shadowMap.needsUpdate = shadowUpdate
    rainRuntime.puddleReady = true
  }, 0.6)

  const noOutline = (mesh) => mesh.layers.set(LAYERS.NO_OUTLINE)
  return (
    <group name="rain">
      <mesh name="rain-streaks" geometry={res.rainGeometry} material={res.rainMaterial} frustumCulled={false} renderOrder={6} onUpdate={noOutline} />
      {drips && <mesh name="rain-drips" geometry={drips} material={res.dripMaterial} frustumCulled={false} renderOrder={6} onUpdate={noOutline} />}
    </group>
  )
}

/** 精緻畫質：每個影格推進雨勢，疊上雨天的光線；下雨或地面還濕時掛載 Rain */
function WeatherClock({ world, raining }) {
  const [active, setActive] = useState(() => {
    // 一開始就下雨（網址參數、記住的選擇，或從流暢畫質切回來）：直接是下了一陣子的樣子
    Object.assign(weatherState, weatherSteady(raining))
    return raining
  })
  const activeRef = useRef(active)
  useEffect(() => () => resetWeather(), [])
  useEffect(() => setData('weather', raining ? 'rain' : 'clear'), [raining])

  useFrame((_, delta) => {
    stepWeather(weatherState, delta, raining)
    setAtmosphereOverlay({ rain: weatherState.sky })
    waterUniforms.uRain.value = weatherState.rain
    const on = weatherActive(weatherState)
    if (on !== activeRef.current) {
      activeRef.current = on
      setActive(on)
      setData('rainActive', on ? '1' : '0')
    }
  }, 0.3)

  useEffect(() => setData('rainActive', active ? '1' : '0'), [active])
  return active ? <Rain world={world} /> : null
}

/**
 * 天氣（第 14 階段）：只在精緻畫質。流暢畫質（iPad、觸控裝置的預設）什麼都不掛載、不建立、不編譯，
 * 雨勢一直是 0，年代光線、河面與環境音都和以前相同。
 */
export function WeatherDirector({ world }) {
  const available = useGameStore((state) => weatherAvailable(state.qualityMode))
  const raining = useGameStore((state) => effectiveWeather(state.qualityMode, state.weather) === 'rain')
  useEffect(() => {
    if (available) return
    resetWeather()
    setData('weather', 'clear')
    setData('rainActive', '0')
  }, [available])
  return available ? <WeatherClock world={world} raining={raining} /> : null
}
