import { Shape } from 'three'

/**
 * 山牆輪廓（建築側面）。u 軸為由立面往內的深度（0 → depth），v 軸為高度。
 * style: 'gable' 一般人字山牆；'horseback' 閩南式「馬背」圓弧山頭。
 */
export function gableShape(depth, wallHeight, ridgeHeight, style = 'gable') {
  const coping = 0.24
  const shape = new Shape()
  const mid = depth / 2
  const eaveY = wallHeight + coping
  const apexY = ridgeHeight + coping
  shape.moveTo(0, 0)
  shape.lineTo(depth, 0)
  shape.lineTo(depth, eaveY)
  if (style === 'horseback') {
    const r = 0.62
    const slopeAt = (u) => eaveY + (apexY - eaveY) * (1 - Math.abs(u - mid) / mid)
    const y = slopeAt(mid + r)
    // 山頭兩側的小收尾，讓馬背更有曲線
    shape.lineTo(mid + r + 0.18, slopeAt(mid + r + 0.18))
    shape.lineTo(mid + r, y + 0.08)
    shape.absarc(mid, y + 0.08, r, 0, Math.PI, false)
    shape.lineTo(mid - r - 0.18, slopeAt(mid - r - 0.18))
  } else {
    shape.lineTo(mid, apexY)
  }
  shape.lineTo(0, eaveY)
  shape.closePath()
  return shape
}

/**
 * 屋脊正面輪廓（x 沿屋寬、y 向上），擠出方向為前後厚度。
 * style: 'plain' 平脊；'curved' 兩端微翹；'swallowtail' 燕尾脊。
 */
export function ridgeShape(length, style = 'plain') {
  const half = length / 2
  const h = 0.32
  const shape = new Shape()
  if (style === 'swallowtail') {
    shape.moveTo(-half + 0.2, 0)
    shape.lineTo(half - 0.2, 0)
    shape.quadraticCurveTo(half + 0.35, 0.05, half + 0.78, 0.92)
    shape.lineTo(half + 0.56, 0.98)
    shape.lineTo(half + 0.6, 0.78)
    shape.quadraticCurveTo(half + 0.25, h + 0.05, half - 0.3, h)
    shape.lineTo(-half + 0.3, h)
    shape.quadraticCurveTo(-half - 0.25, h + 0.05, -half - 0.6, 0.78)
    shape.lineTo(-half - 0.56, 0.98)
    shape.lineTo(-half - 0.78, 0.92)
    shape.quadraticCurveTo(-half - 0.35, 0.05, -half + 0.2, 0)
  } else if (style === 'curved') {
    shape.moveTo(-half, 0)
    shape.lineTo(half, 0)
    shape.quadraticCurveTo(half + 0.2, 0.05, half + 0.32, 0.5)
    shape.lineTo(half + 0.12, 0.5)
    shape.quadraticCurveTo(half - 0.05, h, half - 0.3, h)
    shape.lineTo(-half + 0.3, h)
    shape.quadraticCurveTo(-half + 0.05, h, -half - 0.12, 0.5)
    shape.lineTo(-half - 0.32, 0.5)
    shape.quadraticCurveTo(-half - 0.2, 0.05, -half, 0)
  } else {
    shape.moveTo(-half, 0)
    shape.lineTo(half, 0)
    shape.lineTo(half + 0.06, h + 0.06)
    shape.lineTo(-half - 0.06, h + 0.06)
    shape.closePath()
  }
  return shape
}

/** 雀替（柱頭托架）的三角輪廓 */
export function bracketShape(size = 0.42) {
  const shape = new Shape()
  shape.moveTo(0, 0)
  shape.lineTo(size, 0)
  shape.quadraticCurveTo(size * 0.35, -size * 0.25, 0, -size)
  shape.closePath()
  return shape
}

/** 戎克船船身側面輪廓（x 為船長方向） */
export function junkHullShape(length) {
  const half = length / 2
  const shape = new Shape()
  shape.moveTo(-half, 1.55)
  shape.lineTo(-half + 0.5, 0.25)
  shape.quadraticCurveTo(-half + 1.4, -0.05, 0, 0)
  shape.quadraticCurveTo(half - 1.0, 0.05, half - 0.3, 0.55)
  shape.lineTo(half, 1.05)
  shape.lineTo(half - 0.25, 1.15)
  shape.quadraticCurveTo(0, 0.95, -half + 0.6, 1.6)
  shape.closePath()
  return shape
}

/** 帆（扇形撐條帆）輪廓 */
export function sailShape(width, height) {
  const shape = new Shape()
  shape.moveTo(-width * 0.42, 0)
  shape.lineTo(width * 0.5, 0)
  shape.lineTo(width * 0.42, height * 0.92)
  shape.quadraticCurveTo(0, height * 1.08, -width * 0.55, height * 0.86)
  shape.closePath()
  return shape
}
