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
  WebGLRenderTarget,
} from 'three'
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js'
import { LAYERS, PALETTE } from '../config.js'
import { renderState } from '../runtime.js'

/**
 * 卡通渲染管線（接管 R3F 的預設渲染）
 *
 * 1. 法線＋深度：以 MeshNormalMaterial 覆寫全場景，取得法線與深度
 * 2. 色彩：正常渲染（卡通材質、陰影）
 * 3. 輪廓：依深度二階差分與法線差異描出細黑線，遠處線條淡出
 * 4. 輸出：輕微景深（遠景柔焦）、色調、暗角、紙張顆粒，最後轉為 sRGB
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
    color = mix(color, uLineColor, edge * uLineStrength);
    gl_FragColor = vec4(color, 1.0);
  }
`

const FINAL_FRAGMENT = /* glsl */ `
  uniform sampler2D tInput;
  uniform sampler2D tDepth;
  uniform vec2 uTexel;
  uniform float uFocus;
  uniform float uFocusRange;
  uniform float uBlurRamp;
  uniform float uMaxBlur;
  uniform float uExposure;
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

  void main() {
    float z0 = viewDistance(tDepth, vUv);
    float c0 = coc(z0);
    vec3 color = texture2D(tInput, vUv).rgb;
    if (c0 > 0.02) {
      vec3 acc = color;
      float wsum = 1.0;
      float radius = c0 * uMaxBlur;
      for (int i = 0; i < 12; i++) {
        float fi = float(i);
        float r = sqrt((fi + 0.5) / 12.0) * radius;
        float a = fi * 2.39996323;
        vec2 uv = vUv + vec2(cos(a), sin(a)) * r * uTexel;
        // 不把清晰的前景混進模糊的背景
        float w = clamp(coc(viewDistance(tDepth, uv)) / c0, 0.0, 1.0);
        acc += texture2D(tInput, uv).rgb * w;
        wsum += w;
      }
      color = acc / wsum;
    }
    color *= uExposure;
    color = neutralToneMap(color);
    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color = mix(vec3(luma), color, 0.9);
    color *= vec3(1.025, 1.0, 0.955);
    vec2 q = vUv - 0.5;
    float vignette = smoothstep(0.92, 0.32, length(q * vec2(1.0, 1.12)));
    color *= mix(0.83, 1.0, vignette);
    color = linearToSRGB(clamp(color, 0.0, 1.0));
    color += (hash12(gl_FragCoord.xy) - 0.5) * 0.024;
    gl_FragColor = vec4(color, 1.0);
  }
`

function createPipeline(gl) {
  const supportsHalfFloat =
    gl.extensions.has('EXT_color_buffer_float') || gl.extensions.has('EXT_color_buffer_half_float')
  const colorType = supportsHalfFloat ? HalfFloatType : UnsignedByteType

  const normalTarget = new WebGLRenderTarget(1, 1, { type: UnsignedByteType, depthBuffer: true })
  normalTarget.texture.minFilter = NearestFilter
  normalTarget.texture.magFilter = NearestFilter
  normalTarget.texture.generateMipmaps = false
  normalTarget.depthTexture = new DepthTexture(1, 1, FloatType)

  const colorTarget = new WebGLRenderTarget(1, 1, { type: colorType, samples: 4 })
  colorTarget.texture.minFilter = LinearFilter
  colorTarget.texture.generateMipmaps = false
  const compositeTarget = new WebGLRenderTarget(1, 1, { type: colorType })
  compositeTarget.texture.minFilter = LinearFilter
  compositeTarget.texture.generateMipmaps = false

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
      uFar: { value: 1600 },
      uLineColor: { value: new Color(PALETTE.ink) },
      uLineStrength: { value: 0.88 },
      uFade: { value: new Vector2(38, 150) },
    },
  })

  const finalMaterial = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FINAL_FRAGMENT,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tInput: { value: compositeTarget.texture },
      tDepth: { value: normalTarget.depthTexture },
      uTexel: { value: new Vector2(1, 1) },
      uNear: { value: 0.3 },
      uFar: { value: 1600 },
      uFocus: { value: 8 },
      uFocusRange: { value: 16 },
      uBlurRamp: { value: 90 },
      uMaxBlur: { value: 4 },
      uExposure: { value: 1.0 },
    },
  })

  const edgeQuad = new FullScreenQuad(edgeMaterial)
  const finalQuad = new FullScreenQuad(finalMaterial)
  const size = new Vector2()
  const current = new Vector2()
  const normalClear = new Color(0.5, 0.5, 1.0)
  const skyClear = new Color(PALETTE.skyHorizon)
  const savedClear = new Color()

  function resize(width, height) {
    normalTarget.setSize(width, height)
    colorTarget.setSize(width, height)
    compositeTarget.setSize(width, height)
    edgeMaterial.uniforms.uTexel.value.set(1 / width, 1 / height)
    finalMaterial.uniforms.uTexel.value.set(1 / width, 1 / height)
  }

  function render(scene, camera) {
    gl.getDrawingBufferSize(size)
    if (!size.equals(current)) {
      current.copy(size)
      resize(size.x, size.y)
    }
    const dpr = gl.getPixelRatio()
    for (const material of [edgeMaterial, finalMaterial]) {
      material.uniforms.uNear.value = camera.near
      material.uniforms.uFar.value = camera.far
    }
    edgeMaterial.uniforms.uThickness.value = Math.min(2, Math.max(1, dpr))
    finalMaterial.uniforms.uFocus.value = renderState.focusDistance
    finalMaterial.uniforms.uMaxBlur.value = 3.6 * dpr * renderState.blurStrength

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

    // 3. 輪廓
    gl.setRenderTarget(compositeTarget)
    edgeQuad.render(gl)

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
    normalMaterial.dispose()
    edgeMaterial.dispose()
    finalMaterial.dispose()
    edgeQuad.dispose()
    finalQuad.dispose()
  }

  return { render, dispose }
}

export function ToonRenderer() {
  const gl = useThree((state) => state.gl)
  const pipeline = useMemo(() => createPipeline(gl), [gl])

  useEffect(() => {
    gl.shadowMap.autoUpdate = false
    return () => pipeline.dispose()
  }, [gl, pipeline])

  // priority 1：接管渲染（其餘 useFrame 皆先於此執行）
  useFrame(({ scene, camera }) => pipeline.render(scene, camera), 1)
  return null
}
