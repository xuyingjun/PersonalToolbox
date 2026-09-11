// 零依赖 PWA 图标生成器：用 Node 内置 zlib 手写 PNG。
// 设计：全出血圆角 teal 底 + 白色时钟表盘（圆环 + 10:10 指针 + 中心点）。
// 由 prebuild 自动运行，产物确定性一致。
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const BG = [15, 107, 102] // #0f6b66
const FG = [255, 255, 255]

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

function isInsideRoundedRect(x, y, half, radius) {
  const dx = Math.max(Math.abs(x - half) - (half - radius), 0)
  const dy = Math.max(Math.abs(y - half) - (half - radius), 0)
  return dx * dx + dy * dy <= radius * radius
}

// 3x3 超采样抗锯齿
function render(size) {
  const half = size / 2
  const radius = size * 0.22
  const ringRadius = size * 0.17
  const ringHalfWidth = size * 0.014
  const handLength = size * 0.11
  const handHalfWidth = size * 0.013
  const dotRadius = size * 0.022
  // 10:10 指针：时针垂直向上，分针 2 点方向
  const hourEnd = [half, half - handLength]
  const minuteEnd = [half + handLength * Math.sin(Math.PI / 3), half - handLength * Math.cos(Math.PI / 3)]

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
          if (!isInsideRoundedRect(px, py, half, radius)) continue
          bgHits += 1
          const dist = Math.hypot(px - half, py - half)
          const onRing = Math.abs(dist - ringRadius) <= ringHalfWidth
          const onHour = distanceToSegment(px, py, half, half, hourEnd[0], hourEnd[1]) <= handHalfWidth
          const onMinute = distanceToSegment(px, py, half, half, minuteEnd[0], minuteEnd[1]) <= handHalfWidth
          const onDot = dist <= dotRadius
          if (onRing || onHour || onMinute || onDot) glyphHits += 1
        }
      }

      const offset = (y * size + x) * 4
      const total = samples * samples
      if (bgHits === 0) {
        rgba[offset + 3] = 0 // 透明
      } else {
        const coverage = glyphHits / bgHits
        rgba[offset] = Math.round(BG[0] + (FG[0] - BG[0]) * coverage)
        rgba[offset + 1] = Math.round(BG[1] + (FG[1] - BG[1]) * coverage)
        rgba[offset + 2] = Math.round(BG[2] + (FG[2] - BG[2]) * coverage)
        rgba[offset + 3] = 255
      }
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
