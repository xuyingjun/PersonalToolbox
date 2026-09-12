// 零依赖 PWA 图标生成器：用 Node 内置 zlib 手写 PNG。
// 设计：暖橙渐变底 + 白色循环圆环（缺口 + 箭头）+ 中心圆点，呼应“拾光”：
// 圆环 = 周而复始的周期，中心圆点 = 此刻，缺口箭头 = 时间继续向前。
// 由 prebuild 自动运行，产物确定性一致。
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const GRADIENT_FROM = [251, 146, 60] // #fb923c 暖橙（左上）
const GRADIENT_TO = [234, 88, 12] // #ea580c 品牌橙（右下）
const GLYPH = [255, 255, 255]

const SIZES = [
  { size: 192, file: 'pwa-192x192.png' },
  { size: 512, file: 'pwa-512x512.png' }, // 兼作 maskable
  { size: 180, file: 'apple-touch-icon.png' },
]

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buffer) {
  let crc = -1
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ -1) >>> 0
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const typeBuffer = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])))
  return Buffer.concat([length, typeBuffer, data, crc])
}

function encodePng(size, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA

  const stride = size * 4 + 1
  const raw = Buffer.alloc(stride * size)
  for (let y = 0; y < size; y += 1) {
    raw[y * stride] = 0 // filter: None
    rgba.copy(raw, y * stride + 1, y * size * 4, (y + 1) * size * 4)
  }
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const lengthSq = dx * dx + dy * dy
  let t = lengthSq === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lengthSq
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

// 3x3 超采样抗锯齿
function render(size) {
  const center = size / 2
  const ringRadius = size * 0.31
  const ringHalfWidth = size * 0.023
  const dotRadius = size * 0.05

  // 缺口位于圆环右上（屏幕坐标系 y 向下，顺时针 = 角度增大）
  const gapStart = (295 * Math.PI) / 180
  const gapEnd = (345 * Math.PI) / 180

  // 箭头几何：位于缺口下缘（θ = gapStart），指向顺时针切线方向
  const gapAngle = gapStart
  const ux = Math.cos(gapAngle)
  const uy = Math.sin(gapAngle)
  const tx = -Math.sin(gapAngle)
  const ty = Math.cos(gapAngle)
  const anchor = [center + ux * ringRadius, center + uy * ringRadius]
  const tip = [anchor[0] + tx * size * 0.045, anchor[1] + ty * size * 0.045]
  const wingA = [anchor[0] - tx * size * 0.075 + ux * size * 0.032, anchor[1] - ty * size * 0.075 + uy * size * 0.032]
  const wingB = [anchor[0] - tx * size * 0.075 - ux * size * 0.032, anchor[1] - ty * size * 0.075 - uy * size * 0.032]

  const rgba = Buffer.alloc(size * size * 4)
  const samples = 3
  const step = 1 / samples

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let glyphHits = 0
      let bgHits = 0
      for (let sy = 0; sy < samples; sy += 1) {
        for (let sx = 0; sx < samples; sx += 1) {
          const px = x + (sx + 0.5) * step
          const py = y + (sy + 0.5) * step
          bgHits += 1

          const dist = Math.hypot(px - center, py - center)
          // 角度归一化到 [0, 2π) 后判断是否落在缺口区间
          let angle = Math.atan2(py - center, px - center)
          if (angle < 0) angle += Math.PI * 2
          const inGap = angle >= gapStart && angle <= gapEnd
          const onRing = !inGap && Math.abs(dist - ringRadius) <= ringHalfWidth
          const onArrow = distanceToSegment(px, py, tip[0], tip[1], wingA[0], wingA[1]) <= ringHalfWidth
            || distanceToSegment(px, py, tip[0], tip[1], wingB[0], wingB[1]) <= ringHalfWidth
          const onDot = dist <= dotRadius
          if (onRing || onArrow || onDot) glyphHits += 1
        }
      }

      const offset = (y * size + x) * 4
      const total = samples * samples
      const coverage = glyphHits / bgHits

      // 背景：左上 → 右下对角渐变（像素中心约 +0.5，统一按 (x + y + 1) 计）
      const gradient = (x + y + 1) / (2 * size) // 0 → 1
      const base = [
        GRADIENT_FROM[0] + (GRADIENT_TO[0] - GRADIENT_FROM[0]) * gradient,
        GRADIENT_FROM[1] + (GRADIENT_TO[1] - GRADIENT_FROM[1]) * gradient,
        GRADIENT_FROM[2] + (GRADIENT_TO[2] - GRADIENT_FROM[2]) * gradient,
      ]
      rgba[offset] = Math.round(base[0] + (GLYPH[0] - base[0]) * coverage)
      rgba[offset + 1] = Math.round(base[1] + (GLYPH[1] - base[1]) * coverage)
      rgba[offset + 2] = Math.round(base[2] + (GLYPH[2] - base[2]) * coverage)
      rgba[offset + 3] = 255
    }
  }
  return rgba
}

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(rootDir, 'public')
mkdirSync(publicDir, { recursive: true })

for (const { size, file } of SIZES) {
  const png = encodePng(size, render(size))
  writeFileSync(join(publicDir, file), png)
  console.log(`generated public/${file} (${png.length} bytes)`)
}
