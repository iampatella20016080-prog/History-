import test from 'node:test'
import assert from 'node:assert/strict'
import { Group, Matrix4, Mesh, PerspectiveCamera, Vector3, Vector4, DirectionalLight } from 'three'
import { RELIEF, blurWrap, heightFromPixels, normalsFromHeight, reliefNormals, roofHeight } from '../src/game/rendering/reliefMath.js'
import { REFLECT_BATCH_MATERIALS, collectReflected, reflectionSize, reflectsInRiver, riverInView, updateMirrorCamera } from '../src/game/rendering/planarReflection.js'
import { QUALITY_MODES } from '../src/game/quality.js'
import { patchWaterMaterial, waterReflectUniforms } from '../src/game/rendering/waterShader.js'
import { MeshToonMaterial } from 'three'
import { LAYERS } from '../src/game/config.js'

const decode = (v) => (v / 255) * 2 - 1

test('材質凹凸: 平坦的高度得到朝外的法線 (0, 0, 1)', () => {
  const n = normalsFromHeight(new Float32Array(16).fill(0.5), 4, 4, 3)
  for (let i = 0; i < 16; i++) {
    assert.ok(Math.abs(decode(n[i * 4])) < 0.01)
    assert.ok(Math.abs(decode(n[i * 4 + 1])) < 0.01)
    assert.ok(decode(n[i * 4 + 2]) > 0.99)
  }
})

test('材質凹凸: 凸起的右側法線朝 +u、下方朝 −v（貼圖上下翻轉後畫布往上是 +v）', () => {
  const w = 9
  const h = new Float32Array(w * w)
  h[4 * w + 4] = 1
  const n = normalsFromHeight(h, w, w, 2)
  const at = (x, y) => [decode(n[(y * w + x) * 4]), decode(n[(y * w + x) * 4 + 1])]
  assert.ok(at(5, 4)[0] > 0.3, '右邊朝右')
  assert.ok(at(3, 4)[0] < -0.3, '左邊朝左')
  assert.ok(at(4, 5)[1] < -0.3, '畫布下方（−v）朝下')
  assert.ok(at(4, 3)[1] > 0.3, '畫布上方（+v）朝上')
})

test('材質凹凸: 磚縫（灰白）比磚面低，地磚縫（暗）比地磚低', () => {
  // 一個磚紅像素、一個磚縫像素
  const brick = heightFromPixels(new Uint8ClampedArray([165, 94, 69, 255, 214, 196, 164, 255]), 2, 1, RELIEF.brick)
  assert.ok(brick[0] > 0.9 && brick[1] < 0.1)
  const pavers = heightFromPixels(new Uint8ClampedArray([216, 209, 195, 255, 164, 156, 142, 255]), 2, 1, RELIEF.pavers)
  assert.ok(pavers[0] > 0.9 && pavers[1] < 0.1)
})

test('材質凹凸: 屋瓦的筒瓦凸起、板瓦凹下，貼圖可無縫重複', () => {
  const S = 512
  const cw = S / 16
  assert.ok(roofHeight(cw * 1.5, 10, S) > roofHeight(cw * 0.5, 10, S) + 0.4)
  assert.ok(Math.abs(roofHeight(5, 30, S) - roofHeight(5 + S, 30 + S, S)) < 1e-9)
})

test('材質凹凸: 模糊與法線都環繞邊界（無縫）', () => {
  const w = 8
  const h = new Float32Array(w * w)
  for (let y = 0; y < w; y++) h[y * w] = 1
  const b = blurWrap(h, w, w, 1)
  assert.ok(Math.abs(b[1] - b[w - 1]) < 1e-6, '左右對稱地擴散')
  const pixels = new Uint8ClampedArray(64 * 64 * 4).fill(200)
  const n = reliefNormals(pixels, 64, 64, RELIEF.stone)
  assert.equal(n.length, 64 * 64 * 4)
})

test('材質凹凸: 列出的材質都有高度設定與強度', () => {
  for (const key of ['brick', 'roof', 'wood', 'planks', 'stone', 'pavers', 'granite']) {
    assert.ok(RELIEF[key], key)
    assert.ok(RELIEF[key].strength > 0 && RELIEF[key].normalScale > 0)
  }
})

function mainCamera(position, target) {
  const camera = new PerspectiveCamera(50, 1.6, 0.1, 800)
  camera.position.set(...position)
  camera.lookAt(new Vector3(...target))
  camera.updateMatrixWorld()
  camera.updateProjectionMatrix()
  return camera
}

function project(matrix, p) {
  const v = new Vector4(p.x, p.y, p.z, 1).applyMatrix4(matrix)
  return [v.x / v.w, v.y / v.w]
}

test('河面倒映: 水面上的一點取樣到的倒影，正是它對應的岸上那一點', () => {
  const W = -1.05
  const camera = mainCamera([-41, 3, 3.5], [-72, -0.8, -1])
  const virtual = new PerspectiveCamera(50, 1.6, 0.1, 800)
  const tm = new Matrix4()
  assert.equal(updateMirrorCamera(camera, virtual, W, tm), true)
  assert.ok(Math.abs(virtual.position.y - (2 * W - 3)) < 1e-9)
  for (const q of [new Vector3(-60, 5, 2), new Vector3(-90, 12, -10), new Vector3(-50, 0.5, 6)]) {
    // 岸上的 Q 的倒影：從鏡頭看向 Q 的鏡像，視線與水面的交點 P
    const mirrored = new Vector3(q.x, 2 * W - q.y, q.z)
    const t = (camera.position.y - W) / (camera.position.y - mirrored.y)
    const p = camera.position.clone().lerp(mirrored, t)
    const [pu, pv] = project(tm, p)
    const [qu, qv] = project(tm, q)
    assert.ok(Math.abs(pu - qu) < 1e-6 && Math.abs(pv - qv) < 1e-6, `${pu},${pv} vs ${qu},${qv}`)
  }
})

test('河面倒映: 水面下的幾何被斜截面切掉、水面上的保留', () => {
  const W = -1.05
  const camera = mainCamera([-41, 3, 3.5], [-72, -0.8, -1])
  const virtual = new PerspectiveCamera(50, 1.6, 0.1, 800)
  updateMirrorCamera(camera, virtual, W, new Matrix4())
  const clipZ = (p) => {
    const v = new Vector4(p.x, p.y, p.z, 1).applyMatrix4(virtual.matrixWorldInverse).applyMatrix4(virtual.projectionMatrix)
    return v.z / v.w
  }
  assert.ok(clipZ(new Vector3(-60, W + 2, 0)) > -1, '水面上：在近裁切面之後')
  assert.ok(clipZ(new Vector3(-60, W - 2, 0)) < -1, '水面下：被裁掉')
})

test('河面倒映: 鏡頭在水面下時不畫', () => {
  const camera = mainCamera([-60, -3, 0], [-70, -3, 0])
  assert.equal(updateMirrorCamera(camera, new PerspectiveCamera(), -1.05, new Matrix4()), false)
})

test('河面倒映: 圖層篩選只收牆、屋頂、燈火、天空與燈光，不收地面、人物與室內', () => {
  const batch = (material) => Object.assign(new Mesh(), { userData: { staticBatch: true, material } })
  assert.ok(reflectsInRiver(batch('brick')))
  assert.ok(reflectsInRiver(batch('lanternLit')))
  assert.ok(!reflectsInRiver(batch('asphalt')))
  assert.ok(!reflectsInRiver(batch('contact')))
  assert.ok(!reflectsInRiver(batch('glassClear')))
  assert.ok(!reflectsInRiver(new Mesh()), '人物、招牌沒有標記')
  assert.ok(reflectsInRiver(Object.assign(new Mesh(), { userData: { reflect: true } })))
  assert.ok(reflectsInRiver(new DirectionalLight()))
  for (const m of ['asphalt', 'pavers', 'earth', 'interior', 'contact', 'glassClear']) assert.ok(!REFLECT_BATCH_MATERIALS.has(m), m)

  const root = new Group()
  const street = new Group()
  street.add(batch('roof'), batch('pavers'))
  const interior = new Group()
  interior.name = 'interior-luguo'
  interior.add(batch('brick'), new DirectionalLight())
  root.add(street, interior, new DirectionalLight())
  const picked = collectReflected(root)
  assert.equal(picked.length, 3, '街景的屋頂與所有燈光（含室內的燈，燈光組合與主畫面相同）；室內的網格略過')
  assert.ok(!picked.some((o) => o.isMesh && o.userData.material === 'brick'))
})

test('河面倒映: 河面不在畫面裡時不畫倒影那一趟', () => {
  assert.equal(riverInView(mainCamera([-41, 3, 3.5], [-72, -0.8, -1]), -44.6, -1.05), true, '河岸看向河面')
  assert.equal(riverInView(mainCamera([30, 1.8, 0], [60, 2.2, 0]), -44.6, -1.05), false, '街尾背對河')
  assert.equal(riverInView(mainCamera([-10, 1.8, 0], [-40, 2.0, 0]), -44.6, -1.05), true, '沿街望向河')
})

test('河面倒映: 倒影貼圖用低解析度', () => {
  assert.deepEqual(reflectionSize(2240, 1400, 0.35), [784, 490])
  assert.deepEqual(reflectionSize(100, 50, 0.1), [64, 64])
})

test('畫質: 流暢不做材質凹凸與倒映，精緻都做', () => {
  assert.equal(QUALITY_MODES.smooth.relief, false)
  assert.equal(QUALITY_MODES.smooth.waterReflection, 0)
  assert.equal(QUALITY_MODES.fine.relief, true)
  assert.ok(QUALITY_MODES.fine.waterReflection > 0 && QUALITY_MODES.fine.waterReflection <= 0.5)
  assert.equal(LAYERS.REFLECT, 2)
  assert.notEqual(LAYERS.REFLECT, LAYERS.NO_OUTLINE)
})

function compileWater(reflect) {
  const material = patchWaterMaterial(new MeshToonMaterial())
  material.userData.planarReflection = reflect
  const shader = {
    uniforms: {},
    vertexShader: '#include <common>\n#include <project_vertex>',
    fragmentShader: '#include <common>\n#include <map_fragment>\n#include <opaque_fragment>',
  }
  material.onBeforeCompile(shader)
  return { material, shader }
}

test('流暢畫質: 水面著色器與現在完全相同（沒有倒影貼圖、沒有多的 uniform、程式快取鍵不變）', () => {
  const { material, shader } = compileWater(false)
  assert.equal(material.customProgramCacheKey(), 'river-water')
  assert.ok(!shader.fragmentShader.includes('tReflect'))
  assert.ok(!('tReflect' in shader.uniforms))
  // 與加入倒影前的著色器逐字相同：拿掉倒影的兩段插入點後內容不變
  assert.ok(shader.fragmentShader.includes('uniform float uEdgeX;\n        \n  uniform float uTime;'))
  const fine = compileWater(true)
  assert.equal(fine.material.customProgramCacheKey(), 'river-water-reflect')
  assert.ok(fine.shader.fragmentShader.includes('texture2D(tReflect'))
  assert.equal(fine.shader.uniforms.tReflect, waterReflectUniforms.tReflect)
})

test('流暢畫質: 關閉材質凹凸不會碰到沒有法線貼圖的材質（不重新編譯、不產生法線貼圖）', async () => {
  const { setRelief, reliefTextureKeys } = await import('../src/game/rendering/relief.js')
  const material = new MeshToonMaterial()
  const version = material.version
  setRelief(false, () => [{ brick: material, roof: material }])
  assert.equal(material.version, version)
  assert.equal(material.normalMap, null)
  assert.deepEqual(reliefTextureKeys(), [])
})
