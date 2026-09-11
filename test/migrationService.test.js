import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Dexie from 'dexie'
import { indexedDB } from 'fake-indexeddb'
import { db } from '../src/db/db.js'
import { installFakeIndexedDB, resetDatabase } from '../test-helpers/setup-indexeddb.js'
import { detectLegacyData, runMigration } from '../src/services/migrationService.js'

beforeEach(async () => {
  installFakeIndexedDB()
  await resetDatabase()
})

// 构造旧版“个人工具箱”数据库（仅声明旧表，与旧应用同构）
async function seedLegacy(records) {
  const legacy = new Dexie('PersonalToolbox')
  legacy.version(1).stores({ lastTimeRecords: 'id, name, lastDate, updatedAt' })
  await legacy.open()
  await legacy.lastTimeRecords.bulkAdd(records)
  legacy.close()
}

const legacyRecord = (overrides = {}) => ({
  id: 'legacy-1',
  name: '洗牙',
  lastDate: '2026-08-01',
  note: '半年一次',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
  ...overrides,
})

describe('detectLegacyData', () => {
  it('无旧库时 found=false', async () => {
    const result = await detectLegacyData()
    assert.equal(result.found, false)
    assert.equal(result.count, 0)
  })

  it('有旧库时返回记录数', async () => {
    await seedLegacy([legacyRecord()])
    const result = await detectLegacyData()
    assert.equal(result.found, true)
    assert.equal(result.count, 1)
  })
})

describe('runMigration', () => {
  it('每条旧记录 → 1 Item；lastDate 有效 → 1 Event', async () => {
    await seedLegacy([
      legacyRecord(),
      legacyRecord({ id: 'legacy-2', name: '换机油', lastDate: '' }),
      legacyRecord({ id: 'legacy-3', name: '清理空调', lastDate: 'bad-date' }),
    ])

    const result = await runMigration()
    assert.equal(result.migrated, true)
    assert.equal(result.itemCount, 3)
    assert.equal(result.eventCount, 1)
    assert.equal(await db.items.count(), 3)
    assert.equal(await db.events.count(), 1)
  })

  it('映射规则：其他分类 / none 周期 / 时间戳沿用 / Event 时间=旧 updatedAt', async () => {
    await seedLegacy([legacyRecord()])
    await runMigration()

    const item = await db.items.get('legacy-1')
    const other = await db.categories.where('name').equals('其他').first()
    assert.equal(item.categoryId, other.id)
    assert.equal(item.cycleType, 'none')
    assert.equal(item.cycleValue, null)
    assert.equal(item.note, '半年一次')
    assert.equal(item.createdAt, '2025-01-01T00:00:00.000Z')
    assert.equal(item.updatedAt, '2026-08-01T10:00:00.000Z')

    const event = await db.events.where('itemId').equals('legacy-1').first()
    assert.equal(event.eventDate, '2026-08-01')
    assert.equal(event.note, '半年一次')
    assert.equal(event.createdAt, '2026-08-01T10:00:00.000Z')
    assert.equal(event.updatedAt, '2026-08-01T10:00:00.000Z')
  })

  it('名称为空 → 未命名事项；超长截断', async () => {
    await seedLegacy([legacyRecord({ name: '', note: 'x'.repeat(600) })])
    await runMigration()
    const item = await db.items.get('legacy-1')
    assert.equal(item.name, '未命名事项')
    assert.equal(item.note.length, 500)
  })

  it('幂等：第二次不重复迁移，旧库不删除', async () => {
    await seedLegacy([legacyRecord()])
    await runMigration()
    const second = await runMigration()
    assert.equal(second.migrated, false)
    assert.equal(await db.items.count(), 1)
    assert.equal(await db.events.count(), 1)
    assert.equal((await db.meta.get('migrationVersion')).value, 1)
    // 旧库仍在
    const legacyDb = await indexedDB.databases()
    assert.ok(legacyDb.some((database) => database.name === 'PersonalToolbox'))
  })

  it('旧 id 与目标冲突时重映射，两条都保留', async () => {
    const now = new Date().toISOString()
    await db.items.add({ id: 'legacy-1', name: '已有事项', categoryId: 'x', cycleType: 'none', cycleValue: null, note: '', createdAt: now, updatedAt: now })
    await seedLegacy([legacyRecord()])
    await runMigration()
    assert.equal(await db.items.count(), 2)
    const migrated = await db.items.where('name').equals('洗牙').first()
    assert.ok(migrated)
    assert.notEqual(migrated.id, 'legacy-1')
    assert.equal(await db.events.count(), 1)
  })

  it('写入失败整体回滚（故障注入）', async () => {
    await seedLegacy([legacyRecord()])
    const originalBulkAdd = db.events.bulkAdd.bind(db.events)
    db.events.bulkAdd = async () => {
      throw new Error('注入故障')
    }
    await assert.rejects(runMigration(), /注入故障/)
    db.events.bulkAdd = originalBulkAdd

    assert.equal(await db.items.count(), 0)
    assert.equal(await db.events.count(), 0)
    assert.equal(await db.meta.get('migrationVersion'), undefined)
  })

  it('旧库无数据时不迁移', async () => {
    await seedLegacy([])
    const result = await runMigration()
    assert.equal(result.migrated, false)
    assert.equal(await db.meta.get('migrationVersion'), undefined)
  })
})
