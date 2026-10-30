import { Box3, Frustum, Matrix4, Plane, Vector3, Vector4 } from 'three'

/**
 * 河面倒映的純邏輯（只用 Three 的數學類別，不依賴 React／WebGL，可以直接單測）。
 *
 * 只在精緻畫質：把主鏡頭對水面（y = 水位）鏡射成一台虛擬鏡頭，以低解析度畫一次
 * 「岸上的主要量體、燈火、天空與遠山」，水面著色器再用 textureMatrix 取樣（加上波紋扭曲）。
 * 做法與 three 的 Reflector 相同：虛擬鏡頭是正常（不鏡射）的鏡頭，所以面的正反不會顛倒；
 * 投影矩陣用斜截面（oblique near plane）把水面以下的東西切掉，堤防在水下的部分不會出現在倒影裡。
 */

/**
 * 會出現在倒影裡的街景材質（依材質合併的靜態網格）：牆、屋頂、木作、窗與燈火。
 * 不畫：地面（倒影裡看不到）、接地暗影與半透明玻璃、室內陳設、布料與小道具（細部，省三角形）。
 */
export const REFLECT_BATCH_MATERIALS = new Set([
  'plaster',
  'stucco',
  'brick',
  'tile',
  'roof',
  'wood',
  'planks',
  'stone',
  'granite',
  'whiteTile',
  'mosaicTile',
  'shutter',
  'steel',
  'windowLit',
  'lanternLit',
  'bulb',
  'glassWarm',
  'glass',
])

/**
 * 這個物件要不要畫進倒影：標了 userData.reflect 的（天空、雲、遠山、燈籠），
 * 或街景裡材質在清單上的靜態網格。室內（interior-* 群組裡的）一律不畫；人物、船、招牌沒有標記，也不畫。
 * 燈光全部都要在倒影的圖層上（Three 的燈光一樣依鏡頭圖層篩選）：少了會全黑；
 * 和主畫面的燈光組合不同時，共用的材質每一趟都得換一次著色器程式，所以室內的燈也一起標。
 */
export function reflectsInRiver(object, insideInterior = false) {
  if (object.isLight) return true
  if (insideInterior || !object.isMesh) return false
  const data = object.userData ?? {}
  if (data.reflect) return true
  return Boolean(data.staticBatch) && REFLECT_BATCH_MATERIALS.has(data.material)
}

/** 走訪場景，回傳要畫進倒影的物件（interior-* 群組整個略過） */
export function collectReflected(root) {
  const out = []
  const visit = (object, inside) => {
    const interior = inside || (typeof object.name === 'string' && object.name.startsWith('interior-'))
    if (reflectsInRiver(object, interior)) out.push(object)
    for (const child of object.children) visit(child, interior)
  }
  visit(root, false)
  return out
}

const _camPos = new Vector3()
const _dir = new Vector3()
const _up = new Vector3()
const _target = new Vector3()
const _rotation = new Matrix4()
const _plane = new Plane()
const _clip = new Vector4()
const _q = new Vector4()
const UP = new Vector3(0, 1, 0)

/** 0–1 的貼圖座標偏移（NDC −1..1 → 0..1） */
const BIAS = new Matrix4().set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1)

/**
 * 把 camera 對 y = waterY 的水面鏡射到 virtual（PerspectiveCamera），更新 textureMatrix。
 * 鏡頭在水面以下時回傳 false（不畫）。clipBias 讓水面上一點點的東西也被切掉，避免岸邊的接縫閃爍。
 */
export function updateMirrorCamera(camera, virtual, waterY, textureMatrix, clipBias = 0.003) {
  camera.updateMatrixWorld()
  _camPos.setFromMatrixPosition(camera.matrixWorld)
  if (_camPos.y <= waterY) return false
  _rotation.extractRotation(camera.matrixWorld)
  _dir.set(0, 0, -1).applyMatrix4(_rotation)
  _up.set(0, 1, 0).applyMatrix4(_rotation)

  virtual.position.set(_camPos.x, 2 * waterY - _camPos.y, _camPos.z)
  virtual.up.copy(_up).reflect(UP)
  _target.copy(_dir).reflect(UP).add(virtual.position)
  virtual.lookAt(_target)
  virtual.far = camera.far
  virtual.near = camera.near
  virtual.updateMatrixWorld()
  virtual.projectionMatrix.copy(camera.projectionMatrix)

  // 貼圖矩陣：世界座標 → 倒影貼圖的 0–1 座標（斜截面只改投影矩陣的 z 列，xy 不受影響）
  textureMatrix.copy(BIAS).multiply(virtual.projectionMatrix).multiply(virtual.matrixWorldInverse)

  // 斜截面：近裁切面換成水面（鏡頭空間），水面以下的幾何被裁掉
  _plane.setFromNormalAndCoplanarPoint(UP, _target.set(0, waterY, 0))
  _plane.applyMatrix4(virtual.matrixWorldInverse)
  _clip.set(_plane.normal.x, _plane.normal.y, _plane.normal.z, _plane.constant)
  const e = virtual.projectionMatrix.elements
  _q.x = (Math.sign(_clip.x) + e[8]) / e[0]
  _q.y = (Math.sign(_clip.y) + e[9]) / e[5]
  _q.z = -1
  _q.w = (1 + e[10]) / e[14]
  _clip.multiplyScalar(2 / _clip.dot(_q))
  e[2] = _clip.x
  e[6] = _clip.y
  e[10] = _clip.z + 1 - clipBias
  e[14] = _clip.w
  virtual.projectionMatrixInverse.copy(virtual.projectionMatrix).invert()
  return true
}

/** 倒影貼圖的大小：畫面大小乘上比例（至少 64 像素，取偶數） */
export function reflectionSize(width, height, scale) {
  const even = (v) => Math.max(64, Math.round((v * scale) / 2) * 2)
  return [even(width), even(height)]
}

const _frustum = new Frustum()
const _viewProjection = new Matrix4()

/**
 * 河面在不在鏡頭的視錐裡（河面是 x ≤ edgeX 的一大片水平面）。不在時這個影格不畫倒影那一趟——
 * 在街尾背對河、或在店裡時省下整趟繪製。
 */
export function riverInView(camera, edgeX, waterY, width = 1100, depth = 1600) {
  camera.updateMatrixWorld()
  _viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  _frustum.setFromProjectionMatrix(_viewProjection)
  return _frustum.intersectsBox(_riverBox.set(_min.set(edgeX - width, waterY - 0.05, -depth / 2), _max.set(edgeX, waterY + 0.05, depth / 2)))
}
const _riverBox = new Box3()
const _min = new Vector3()
const _max = new Vector3()
