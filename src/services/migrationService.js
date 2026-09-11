// 旧版“个人工具箱”数据迁移。
// 旧库 PersonalToolbox.lastTimeRecords（id, name, lastDate, note, createdAt, updatedAt）
// 迁移规则（严格按需求文档）：
// - 每条旧记录 → 1 个 Item（cycleType=none，不推测周期）+ lastDate 有效时 1 个 Event
// - 严禁推测周期、严禁伪造历史记录
// - 幂等：meta.migrationVersion >= 1 后不再迁移
// - 永不删除旧库
import Dexie from 'dexie'
import { db } from '../db/db.js'
import { parseLocalDate } from '../utils/date.js'

const LEGACY_DB_NAME = 'PersonalToolbox'
const LEGACY_TABLE = 'lastTimeRecords'
const MIGRATION_VERSION = 1
const NAME_MAX = 80
const NOTE_MAX = 500

export const migrationConstants = { LEGACY_DB_NAME, LEGACY_TABLE, MIGRATION_VERSION }

// 运行环境里的 IndexedDB 实现：浏览器取全局对象，Node 测试取 Dexie.dependencies（fake-indexeddb）
function resolveIndexedDB() {
  return Dexie.dependencies?.indexedDB ?? globalThis.indexedDB ?? null
}

// 旧库只读访问：直接用原生 IndexedDB 读取，对旧库的实际结构/版本漂移免疫。
async function readLegacyRecords(sourceDbName) {
  const idb = resolveIndexedDB()
  if (!idb) return []

  // 先检查旧库是否存在，避免 open() 意外创建一个空库
  if (typeof idb.databases === 'function') {
    const databases = await idb.databases().catch(() => [])
    if (!databases.some((database) => database.name === sourceDbName)) return []
  }

  return new Promise((resolve) => {
    const request = idb.open(sourceDbName)
    request.onerror = () => resolve([])
    request.onsuccess = () => {
      const legacyDb = request.result
      try {
        if (!legacyDb.objectStoreNames.contains(LEGACY_TABLE)) {
          legacyDb.close()
          resolve([])
          return
        }
        const readRequest = legacyDb.transaction(LEGACY_TABLE, 'readonly').objectStore(LEGACY_TABLE).getAll()
        readRequest.onsuccess = () => {
          legacyDb.close()
          resolve(readRequest.result ?? [])
        }
        readRequest.onerror = () => {
          legacyDb.close()
          resolve([])
        }
      } catch {
        legacyDb.close()
        resolve([])
      }
    }
  })
}

export async function detectLegacyData({ sourceDbName = LEGACY_DB_NAME } = {}) {
  const records = await readLegacyRecords(sourceDbName)
  return { found: records.length > 0, count: records.length }
}

export async function runMigration({ sourceDbName = LEGACY_DB_NAME, targetDb = db } = {}) {
  // 幂等门：已迁移过则直接跳过
  const meta = await targetDb.meta.get('migrationVersion')
  if (meta && meta.value >= MIGRATION_VERSION) return { migrated: false, itemCount: 0, eventCount: 0 }

  const records = await readLegacyRecords(sourceDbName)
  if (records.length === 0) return { migrated: false, itemCount: 0, eventCount: 0 }

  // 目标已有 ID（避免沿用旧 id 时冲突），冲突则重映射为新 UUID
  const existingIds = new Set((await targetDb.items.toArray()).map((item) => item.id))
  const fallbackCategory = await targetDb.categories.orderBy('sortOrder').first()
  if (!fallbackCategory) throw new Error('分类尚未初始化，无法迁移。')
  const categoryId = (await targetDb.categories.where('name').equals('其他').first())?.id ?? fallbackCategory.id

  const items = []
  const events = []
  const now = new Date().toISOString()

  for (const record of records) {
    let itemId = typeof record.id === 'string' && record.id ? record.id : crypto.randomUUID()
    if (existingIds.has(itemId)) itemId = crypto.randomUUID()
    existingIds.add(itemId)

    const name = (record.name ?? '').trim().slice(0, NAME_MAX) || '未命名事项'
    const note = (record.note ?? '').trim().slice(0, NOTE_MAX)
    const createdAt = isIsoTimestamp(record.createdAt) ? record.createdAt : now
    const updatedAt = isIsoTimestamp(record.updatedAt) ? record.updatedAt : now

    items.push({
      id: itemId,
      name,
      categoryId,
      cycleType: 'none',
      cycleValue: null,
      note,
      createdAt,
      updatedAt,
    })

    if (parseLocalDate(record.lastDate)) {
      events.push({
        id: crypto.randomUUID(),
        itemId,
        eventDate: record.lastDate,
        note,
        createdAt: updatedAt,
        updatedAt,
      })
    }
  }

  // 单事务写入；数量校验失败抛错 → 整体回滚（含 meta）
  await targetDb.transaction('rw', targetDb.items, targetDb.events, targetDb.meta, async () => {
    const itemsBefore = await targetDb.items.count()
    const eventsBefore = await targetDb.events.count()
    await targetDb.items.bulkAdd(items)
    await targetDb.events.bulkAdd(events)
    if ((await targetDb.items.count()) !== itemsBefore + items.length) {
      throw new Error('迁移校验失败：事项数量不一致。')
    }
    if ((await targetDb.events.count()) !== eventsBefore + events.length) {
      throw new Error('迁移校验失败：记录数量不一致。')
    }
    await targetDb.meta.put({ key: 'migrationVersion', value: MIGRATION_VERSION })
  })

  return { migrated: true, itemCount: items.length, eventCount: events.length }
}

function isIsoTimestamp(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}
