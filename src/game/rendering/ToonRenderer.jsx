import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  Color,
  DepthTexture,
  DoubleSide,
  FloatType,
  HalfFloatType,
  LinearFilter,
  MeshNormalMaterial,
  NearestFilter,
  ShaderMaterial,
  UnsignedByteType,
  Vector2,
  Vector3,
  WebGLRenderTarget,
} from 'three'
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'
import { LAYERS, PALETTE } from '../config.js'
import { atmosphere } from '../atmosphere.js'
import { getQualitySettings } from '../quality.js'
import { useGameStore } from '../../state/useGameStore.js'
import { renderState } from '../runtime.js'
import { transitionState } from '../transition.js'
import { lightPoolStrength, syncLightPoolPass } from '../lightPools.js'
import { createLightPoolPass } from './lightPoolPass.js'

/**
 * 卡通渲染管線（接管 R3F 的預設渲染）
 *
 * 1. 法線＋深度：以 MeshNormalMaterial 覆寫全場景，取得法線與深度
 * 2. 色彩：正常渲染（卡通材質、陰影）
 *    （精緻畫質）燈光落點：燈籠、路燈、店門口的燈照到地面與牆上（lightPoolPass.js）
 * 3. 輪廓：依深度二階差分與法線差異描出細黑線，遠處線條淡出
 * 4. 輸出：輕微景深（遠景柔焦）、年代調色、暗角、紙張顆粒，最後轉為 sRGB
 *
 * 年代轉場：霧氣（以流動的雜訊形成柔和的霧團）＋「水墨暈染」顯影——
 * 切換瞬間擷取舊畫面，再以筆刷般的遮罩由畫面中央向外逐步顯現新的街景。
 */

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const COMMON = /* glsl */ `
  uniform float uNear;
  uniform float uFar;
  float viewDistance(sampler2D depthTex, vec2 uv) {
    float d = texture2D(depthTex, uv).x;
    return (uNear * uFar) / (uFar - d * (uFar - uNear));
  }
`

const EDGE_FRAGMENT = /* glsl */ `
  uniform sampler2D tColor;
  uniform sampler2D tNormal;
  uniform sampler2D tDepth;
  uniform vec2 uTexel;
  uniform float uThickness;
  uniform vec3 uLineColor;
  uniform float uLineStrength;
  uniform vec2 uFade;
  uniform float uAO;
  uniform float uProjScale;
  varying vec2 vUv;
  ${COMMON}

  vec3 viewNormal(vec2 uv) {
    return texture2D(tNormal, uv).xyz * 2.0 - 1.0;
  }

  void main() {
    vec2 o = uTexel * uThickness;
    float z0 = viewDistance(tDepth, vUv);
    float i0 = 1.0 / z0;
    float iL = 1.0 / viewDistance(tDepth, vUv - vec2(o.x, 0.0));
    float iR = 1.0 / viewDistance(tDepth, vUv + vec2(o.x, 0.0));
    float iD = 1.0 / viewDistance(tDepth, vUv - vec2(0.0, o.y));
    float iU = 1.0 / viewDistance(tDepth, vUv + vec2(0.0, o.y));
    // 平面上 1/z 在螢幕空間呈線性，二階差分為 0；只有輪廓處（前景一側）會出現負值
    float lapX = (iL + iR - 2.0 * i0) / i0;
    float lapY = (iD + iU - 2.0 * i0) / i0;
    float depthEdge = smoothstep(0.012, 0.04, max(-min(lapX, lapY), 0.0));

    vec3 n0 = viewNormal(vUv);
    vec3 nR = viewNormal(vUv + vec2(o.x, 0.0));
    vec3 nU = viewNormal(vUv + vec2(0.0, o.y));
    float normalEdge = max(1.0 - dot(n0, nR), 1.0 - dot(n0, nU));
    normalEdge = smoothstep(0.24, 0.45, normalEdge);

    float edge = max(depthEdge, normalEdge);
    edge *= 1.0 - smoothstep(uFade.x, uFade.y, z0);
    vec3 color = texture2D(tColor, vUv).rgb;

    // 環境遮蔽（精緻模式）：與周圍深度比較，牆角、簷下、物件接地處略微變暗；
    // 深度差太大的（前後物件的輪廓）不計，避免出現光暈
    if (uAO > 0.001 && z0 < 140.0) {
      float radius = clamp(0.6 * uProjScale / z0, 2.0, 42.0);
      float occlusion = 0.0;
      for (int i = 0; i < 8; i++) {
        float a = float(i) * 0.78539816 + 0.3;
        float r = radius * (0.45 + 0.55 * fract(float(i) * 0.618034));
        float zi = viewDistance(tDepth, vUv + vec2(cos(a), sin(a)) * r * uTexel);
        float dz = z0 - zi;
        occlusion += smoothstep(0.004 * z0 + 0.02, 0.03 * z0 + 0.18, dz) * (1.0 - smoothstep(0.08 * z0 + 0.6, 0.16 * z0 + 1.4, dz));
      }
      color *= 1.0 - uAO * (occlusion / 8.0);
    }

    color = mix(color, uLineColor, edge * uLineStrength);
    gl_FragColor = vec4(color, 1.0);
  }
`

const FINAL_FRAGMENT = /* glsl */ `
  uniform sampler2D tInput;
  uniform sampler2D tDepth;
  uniform sampler2D tSnapshot;
  uniform sampler2D tBloom;
  uniform float uBloom;
  uniform vec2 uTexel;
  uniform float uFocus;
  uniform float uFocusRange;
  uniform float uBlurRamp;
  uniform float uMaxBlur;
  uniform float uExposure;
  uniform float uSaturation;
  uniform float uContrast;
  uniform vec3 uTint;
  uniform vec3 uShadowTint;
  uniform vec3 uHighlightTint;
  uniform float uLift;
  uniform float uVignette;
  uniform float uMist;
  uniform vec3 uMistColor;
  uniform float uDissolve;
  uniform float uTime;
  uniform float uAspect;
  varying vec2 vUv;
  ${COMMON}

  float coc(float z) {
    return clamp((abs(z - uFocus) - uFocusRange) / uBlurRamp, 0.0, 1.0);
  }

  // Khronos PBR Neutral：保留色相的溫和色調映射
  vec3 neutralToneMap(vec3 color) {
    const float startCompression = 0.8 - 0.04;
    const float desaturation = 0.15;
    float x = min(color.r, min(color.g, color.b));
    float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
    color -= offset;
    float peak = max(color.r, max(color.g, color.b));
    if (peak < startCompression) return color;
    float d = 1.0 - startCompression;
    float newPeak = 1.0 - d * d / (peak + d - startCompression);
    color *= newPeak / peak;
    float g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0);
    return mix(color, vec3(newPeak), g);
  }

  vec3 linearToSRGB(vec3 c) {
    return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
  }

  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  vec3 grade(vec3 color) {
    color *= uExposure;
    color = neutralToneMap(color);
    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color = mix(vec3(luma), color, uSaturation);
    color = (color - 0.5) * uContrast + 0.5;
    color *= uTint;
    // 分離色調：暗部往冷色、亮部往暖色偏；暗部提亮（只有低光線的年代設定，其他年代為中性值，結果不變）
    float l2 = dot(clamp(color, 0.0, 1.0), vec3(0.2126, 0.7152, 0.0722));
    color *= mix(uShadowTint, uHighlightTint, smoothstep(0.06, 0.6, l2));
    color += uLift * uShadowTint * (1.0 - smoothstep(0.0, 0.32, l2));
    return color;
  }

  void main() {
    float z0 = viewDistance(tDepth, vUv);
    float c0 = coc(z0);
    vec3 color = texture2D(tInput, vUv).rgb;
    #if DOF_TAPS > 0
    if (c0 > 0.02) {
      vec3 acc = color;
      float wsum = 1.0;
      float radius = c0 * uMaxBlur;
      for (int i = 0; i < DOF_TAPS; i++) {
        float fi = float(i);
        float r = sqrt((fi + 0.5) / float(DOF_TAPS)) * radius;
        float a = fi * 2.39996323;
        vec2 uv = vUv + vec2(cos(a), sin(a)) * r * uTexel;
        // 不把清晰的前景混進模糊的背景
        float w = clamp(coc(viewDistance(tDepth, uv)) / c0, 0.0, 1.0);
        acc += texture2D(tInput, uv).rgb * w;
        wsum += w;
      }
      color = acc / wsum;
    }
    #endif

    // 非常輕微的光暈（精緻模式）：只來自燈籠、燈火等高亮處
    if (uBloom > 0.001) color += texture2D(tBloom, vUv).rgb * uBloom;

    vec2 q = vUv - 0.5;
    vec2 aspectQ = q * vec2(uAspect, 1.0);

    // 水墨暈染顯影：由畫面中央向外、沿著筆刷般的雜訊邊界逐步顯現新畫面
    if (uDissolve < 0.999) {
      vec3 previous = texture2D(tSnapshot, vUv).rgb;
      float brush = fbm(aspectQ * 3.2 + vec2(0.0, uTime * 0.05)) * 0.65 + fbm(aspectQ * 9.0) * 0.35;
      float radial = length(aspectQ) * 0.75;
      float field = radial * 0.55 + brush * 0.6;
      float edge = uDissolve * 1.25 - 0.08;
      float reveal = smoothstep(field - 0.08, field + 0.08, edge);
      // 暈染邊緣帶一點紙張的暖色
      float rim = smoothstep(0.0, 0.08, edge - field + 0.08) * (1.0 - reveal);
      color = mix(previous, color, reveal);
      color = mix(color, uMistColor * 1.05, rim * 0.35);
    }

    color = grade(color);

    // 霧氣：緩慢流動的霧團，邊緣較濃、中央較淡
    if (uMist > 0.001) {
      float drift = fbm(aspectQ * 2.4 + vec2(uTime * 0.07, -uTime * 0.03));
      float wisps = fbm(aspectQ * 5.5 - vec2(uTime * 0.11, uTime * 0.02));
      float density = uMist * (0.55 + drift * 0.55 + wisps * 0.2) * (0.75 + length(aspectQ) * 0.6);
      color = mix(color, uMistColor, clamp(density, 0.0, 0.94));
    }

    float vignette = smoothstep(0.92, 0.32, length(q * vec2(1.0, 1.12)));
    color *= mix(1.0 - uVignette, 1.0, vignette);
    color = linearToSRGB(clamp(color, 0.0, 1.0));
    color += (hash12(gl_FragCoord.xy) - 0.5) * 0.024;
    gl_FragColor = vec4(color, 1.0);
  }
`

const COPY_FRAGMENT = /* glsl */ `
  uniform sampler2D tInput;
  varying vec2 vUv;
  void main() {
    gl_FragColor = texture2D(tInput, vUv);
  }
`

/** 光暈：取出高亮部分並縮小（四點平均） */
const BRIGHT_FRAGMENT = /* glsl */ `
  uniform sampler2D tInput;
  uniform vec2 uTexel;
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(tInput, vUv + uTexel * vec2(-1.0, -1.0)).rgb;
    c += texture2D(tInput, vUv + uTexel * vec2(1.0, -1.0)).rgb;
    c += texture2D(tInput, vUv + uTexel * vec2(-1.0, 1.0)).rgb;
    c += texture2D(tInput, vUv + uTexel * vec2(1.0, 1.0)).rgb;
    c *= 0.25;
    float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
    float knee = smoothstep(0.85, 1.6, luma);
    gl_FragColor = vec4(c * knee, 1.0);
  }
`

/** 光暈：九點高斯模糊（水平或垂直） */
const BLUR_FRAGMENT = /* glsl */ `
  uniform sampler2D tInput;
  uniform vec2 uDirection;
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(tInput, vUv).rgb * 0.227027;
    c += texture2D(tInput, vUv + uDirection * 1.384615).rgb * 0.316216;
    c += texture2D(tInput, vUv - uDirection * 1.384615).rgb * 0.316216;
    c += texture2D(tInput, vUv + uDirection * 3.230769).rgb * 0.070270;
    c += texture2D(tInput, vUv - uDirection * 3.230769).rgb * 0.070270;
    gl_FragColor = vec4(c, 1.0);
  }
`

function createPipeline(gl, initialQuality) {
  let quality = initialQuality
  const supportsHalfFloat =
    gl.extensions.has('EXT_color_buffer_float') || gl.extensions.has('EXT_color_buffer_half_float')
  const colorType = supportsHalfFloat ? HalfFloatType : UnsignedByteType

  const normalTarget = new WebGLRenderTarget(1, 1, { type: UnsignedByteType, depthBuffer: true })
  normalTarget.texture.minFilter = NearestFilter
  normalTarget.texture.magFilter = NearestFilter
  normalTarget.texture.generateMipmaps = false
  normalTarget.depthTexture = new DepthTexture(1, 1, FloatType)

  const colorTarget = new WebGLRenderTarget(1, 1, { type: colorType, samples: quality.msaa })
  colorTarget.texture.minFilter = LinearFilter
  colorTarget.texture.generateMipmaps = false
  const compositeTarget = new WebGLRenderTarget(1, 1, { type: colorType })
  compositeTarget.texture.minFilter = LinearFilter
  compositeTarget.texture.generateMipmaps = false
  // 年代轉場時保存的舊畫面
  const snapshotTarget = new WebGLRenderTarget(1, 1, { type: colorType })
  snapshotTarget.texture.minFilter = LinearFilter
  snapshotTarget.texture.generateMipmaps = false

  const normalMaterial = new MeshNormalMaterial({ side: DoubleSide })

  const edgeMaterial = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: EDGE_FRAGMENT,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tColor: { value: colorTarget.texture },
      tNormal: { value: normalTarget.texture },
      tDepth: { value: normalTarget.depthTexture },
      uTexel: { value: new Vector2(1, 1) },
      uThickness: { value: 1 },
      uNear: { value: 0.3 },
      uFar: { value: 900 },
      uLineColor: { value: new Color(PALETTE.ink) },
      uLineStrength: { value: 0.88 },
      uFade: { value: new Vector2(38, 150) },
      uAO: { value: quality.ao },
      uProjScale: { value: 500 },
    },
  })

  const finalMaterial = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FINAL_FRAGMENT,
    defines: { DOF_TAPS: quality.dofTaps },
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tInput: { value: compositeTarget.texture },
      tDepth: { value: normalTarget.depthTexture },
      tSnapshot: { value: snapshotTarget.texture },
      tBloom: { value: compositeTarget.texture },
      uBloom: { value: 0 },
      uTexel: { value: new Vector2(1, 1) },
      uNear: { value: 0.3 },
      uFar: { value: 900 },
      uFocus: { value: 8 },
      uFocusRange: { value: 16 },
      uBlurRamp: { value: 90 },
      uMaxBlur: { value: 4 },
      uExposure: { value: 1.0 },
      uSaturation: { value: 0.9 },
      uContrast: { value: 1.0 },
      uTint: { value: new Vector3(1.025, 1.0, 0.955) },
      uShadowTint: { value: new Vector3(1, 1, 1) },
      uHighlightTint: { value: new Vector3(1, 1, 1) },
      uLift: { value: 0 },
      uVignette: { value: 0.17 },
      uMist: { value: 0 },
      uMistColor: { value: new Color('#efe6d2') },
      uDissolve: { value: 1 },
      uTime: { value: 0 },
      uAspect: { value: 1 },
    },
  })

  const copyMaterial = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: COPY_FRAGMENT,
    depthTest: false,
    depthWrite: false,
    uniforms: { tInput: { value: compositeTarget.texture } },
  })

  const edgeQuad = new FullScreenQuad(edgeMaterial)
  const finalQuad = new FullScreenQuad(finalMaterial)
  const copyQuad = new FullScreenQuad(copyMaterial)

  // 光暈（只在精緻模式配置）：四分之一解析度的高亮擷取＋兩次模糊
  const brightMaterial = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: BRIGHT_FRAGMENT,
    depthTest: false,
    depthWrite: false,
    uniforms: { tInput: { value: compositeTarget.texture }, uTexel: { value: new Vector2(1, 1) } },
  })
  const blurMaterial = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: BLUR_FRAGMENT,
    depthTest: false,
    depthWrite: false,
    uniforms: { tInput: { value: null }, uDirection: { value: new Vector2() } },
  })
  const brightQuad = new FullScreenQuad(brightMaterial)
  const blurQuad = new FullScreenQuad(blurMaterial)
  let bloom = null
  // 燈光落點（只在精緻畫質建立；流暢畫質不建立、不編譯）
  let lightPools = null
  let lightPoolsActive = false

  function createBloom() {
    const make = () => {
      const target = new WebGLRenderTarget(1, 1, { type: colorType, depthBuffer: false })
      target.texture.minFilter = LinearFilter
      target.texture.generateMipmaps = false
      return target
    }
    bloom = { a: make(), b: make(), width: 0, height: 0 }
    finalMaterial.uniforms.tBloom.value = bloom.a.texture
  }

  function disposeBloom() {
    if (!bloom) return
    bloom.a.dispose()
    bloom.b.dispose()
    bloom = null
    finalMaterial.uniforms.tBloom.value = compositeTarget.texture
  }

  function renderBloom() {
    const width = Math.max(1, Math.floor(current.x / 4))
    const height = Math.max(1, Math.floor(current.y / 4))
    if (bloom.width !== width || bloom.height !== height) {
      bloom.a.setSize(width, height)
      bloom.b.setSize(width, height)
      bloom.width = width
      bloom.height = height
    }
    brightMaterial.uniforms.uTexel.value.set(1 / current.x, 1 / current.y)
    gl.setRenderTarget(bloom.a)
    brightQuad.render(gl)
    blurMaterial.uniforms.tInput.value = bloom.a.texture
    blurMaterial.uniforms.uDirection.value.set(1 / width, 0)
    gl.setRenderTarget(bloom.b)
    blurQuad.render(gl)
    blurMaterial.uniforms.tInput.value = bloom.b.texture
    blurMaterial.uniforms.uDirection.value.set(0, 1 / height)
    gl.setRenderTarget(bloom.a)
    blurQuad.render(gl)
  }

  /** 套用畫質設定（可在執行中隨時切換，不需要重新建立渲染器） */
  function setQuality(next) {
    quality = next
    if (colorTarget.samples !== next.msaa) {
      colorTarget.samples = next.msaa
      colorTarget.dispose()
    }
    if (finalMaterial.defines.DOF_TAPS !== next.dofTaps) {
      finalMaterial.defines.DOF_TAPS = next.dofTaps
      finalMaterial.needsUpdate = true
    }
    edgeMaterial.uniforms.uAO.value = next.ao
    finalMaterial.uniforms.uBloom.value = next.bloom
    if (next.bloom > 0 && !bloom) createBloom()
    else if (next.bloom <= 0) disposeBloom()
    lightPools = syncLightPoolPass(lightPools, next, () => createLightPoolPass(colorType))
    const data = typeof document !== 'undefined' ? document.documentElement.dataset : {}
    data.msaa = String(colorTarget.samples)
    data.ao = String(next.ao)
    data.bloom = String(next.bloom)
    data.lightPools = lightPools ? '1' : '0'
  }

  const size = new Vector2()
  const current = new Vector2()
  const normalClear = new Color(0.5, 0.5, 1.0)
  const skyClear = new Color(PALETTE.skyHorizon)
  const savedClear = new Color()
  const paper = new Color('#f4ecdc')
  const startTime = performance.now()

  function resize(width, height) {
    normalTarget.setSize(width, height)
    colorTarget.setSize(width, height)
    compositeTarget.setSize(width, height)
    snapshotTarget.setSize(width, height)
    edgeMaterial.uniforms.uTexel.value.set(1 / width, 1 / height)
    finalMaterial.uniforms.uTexel.value.set(1 / width, 1 / height)
    finalMaterial.uniforms.uAspect.value = width / Math.max(1, height)
  }

  function updateUniforms(camera, dpr) {
    const a = atmosphere.current
    for (const material of [edgeMaterial, finalMaterial]) {
      material.uniforms.uNear.value = camera.near
      material.uniforms.uFar.value = camera.far
    }
    const edge = edgeMaterial.uniforms
    edge.uThickness.value = Math.min(2, Math.max(1, dpr))
    edge.uLineColor.value.copy(a.lineColor)
    edge.uLineStrength.value = a.lineStrength
    edge.uProjScale.value = current.y / (2 * Math.tan((camera.fov * Math.PI) / 360))
    const u = finalMaterial.uniforms
    u.uFocus.value = renderState.focusDistance
    u.uMaxBlur.value = 3.6 * dpr * renderState.blurStrength
    u.uExposure.value = a.exposure
    u.uSaturation.value = a.saturation
    u.uContrast.value = a.contrast
    u.uTint.value.set(a.tintR, a.tintG, a.tintB)
    u.uShadowTint.value.set(a.shadowR, a.shadowG, a.shadowB)
    u.uHighlightTint.value.set(a.highlightR, a.highlightG, a.highlightB)
    u.uLift.value = a.lift
    u.uVignette.value = a.vignette
    u.uMist.value = transitionState.mist
    // 霧色：年代霧氣顏色往紙張白偏移，入夜時也保持柔和的亮度
    u.uMistColor.value.copy(a.fogColor).lerp(paper, 0.55)
    u.uDissolve.value = transitionState.dissolve
    u.uTime.value = (performance.now() - startTime) / 1000
    skyClear.copy(a.skyHorizon)
    // 燈光落點：依年代的 glow 值（白天的年代為 0，整趟略過）；有燈光落點時燈本身的光暈也稍微加強
    const poolStrength = lightPools ? lightPoolStrength(a.glow) : 0
    lightPoolsActive = Boolean(lightPools?.update(camera, transitionState.mountedWorld?.glows, poolStrength))
    u.uBloom.value = quality.bloom * (1 + poolStrength * 0.6)
  }

  function render(scene, camera) {
    gl.getDrawingBufferSize(size)
    if (!size.equals(current)) {
      current.copy(size)
      resize(size.x, size.y)
    }
    updateUniforms(camera, gl.getPixelRatio())

    gl.getClearColor(savedClear)
    const savedAlpha = gl.getClearAlpha()

    // 1. 法線＋深度
    camera.layers.disable(LAYERS.NO_OUTLINE)
    const background = scene.background
    scene.background = null
    scene.overrideMaterial = normalMaterial
    gl.setRenderTarget(normalTarget)
    gl.setClearColor(normalClear, 1)
    gl.clear(true, true, false)
    gl.render(scene, camera)
    scene.overrideMaterial = null
    scene.background = background
    camera.layers.enable(LAYERS.NO_OUTLINE)

    // 2. 色彩（陰影貼圖只在這一趟更新）
    gl.shadowMap.needsUpdate = true
    gl.setRenderTarget(colorTarget)
    gl.setClearColor(skyClear, 1)
    gl.clear(true, true, false)
    gl.render(scene, camera)

    // 燈光落點（精緻畫質、有燈的年代）：輪廓趟改讀加上光斑的畫面
    edgeMaterial.uniforms.tColor.value = lightPoolsActive
      ? lightPools.render(gl, colorTarget.texture, normalTarget.texture, normalTarget.depthTexture, current.x, current.y)
      : colorTarget.texture

    // 3. 輪廓
    gl.setRenderTarget(compositeTarget)
    edgeQuad.render(gl)

    // 轉場：保存目前畫面
    if (transitionState.snapshotRequested) {
      gl.setRenderTarget(snapshotTarget)
      copyQuad.render(gl)
      transitionState.snapshotRequested = false
      transitionState.snapshotReady = true
    }

    if (bloom) renderBloom()

    // 4. 輸出到畫面
    gl.setRenderTarget(null)
    finalQuad.render(gl)
    gl.setClearColor(savedClear, savedAlpha)
  }

  function dispose() {
    normalTarget.depthTexture?.dispose()
    normalTarget.dispose()
    colorTarget.dispose()
    compositeTarget.dispose()
    snapshotTarget.dispose()
    normalMaterial.dispose()
    edgeMaterial.dispose()
    finalMaterial.dispose()
    copyMaterial.dispose()
    edgeQuad.dispose()
    finalQuad.dispose()
    copyQuad.dispose()
    disposeBloom()
    lightPools?.dispose()
    brightMaterial.dispose()
    blurMaterial.dispose()
    brightQuad.dispose()
    blurQuad.dispose()
  }

  setQuality(quality)
  return { render, dispose, setQuality }
}

export function ToonRenderer() {
  const gl = useThree((state) => state.gl)
  const qualityMode = useGameStore((state) => state.qualityMode)
  const pipeline = useMemo(() => createPipeline(gl, getQualitySettings(useGameStore.getState().qualityMode)), [gl])

  useEffect(() => {
    gl.shadowMap.autoUpdate = false
    return () => pipeline.dispose()
  }, [gl, pipeline])

  // 畫質切換：反鋸齒、景深、環境遮蔽、光暈立即更新
  useEffect(() => {
    pipeline.setQuality(getQualitySettings(qualityMode))
  }, [pipeline, qualityMode])

  // priority 1：接管渲染（其餘 useFrame 皆先於此執行）
  useFrame(({ scene, camera }) => pipeline.render(scene, camera), 1)
  return null
}
