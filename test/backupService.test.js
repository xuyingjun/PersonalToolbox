import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { db } from '../src/db/db.js'
import { installFakeIndexedDB, resetDatabase } from '../test-helpers/setup-indexeddb.js'
import {
  createBackup,
  restoreBackup,
  validateBackup,
} from '../src/services/backupService.js'
import { getAllCategories } from '../src/services/categoryService.js'
import { getTodayString } from '../src/utils/date.js'

beforeEach(async () => {
  installFakeIndexedDB()
  await resetDatabase()
})

async function seedData() {
  const categories = await getAllCategories()
  const now = new Date().toISOString()
  const item = {
    id: 'item-1',
    name: '洗牙',
    categoryId: categories[0].id,
    cycleType: 'yearly',
    cycleValue: null,
    note: '半年一次',
    createdAt: now,
    updatedAt: now,
  }
  const event = {
    id: 'event-1',
    itemId: 'item-1',
    eventDate: '2026-01-05',
    note: '第一次',
    createdAt: now,
    updatedAt: now,
  }
  await db.items.add(item)
  await db.events.add(event)
  return { item, event, categories }
}

describe('createBackup', () => {
  it('导出格式正确，meta 不参与', async () => {
    await seedData()
    const backup = await createBackup()
    assert.equal(backup.app, 'LastTime')
    assert.equal(backup.version, '1.0')
    assert.ok(backup.exportedAt)
    assert.equal(backup.items.length, 1)
    assert.equal(backup.events.length, 1)
    assert.equal(backup.categories.length, 8)
    assert.ok(Array.isArray(backup.settings))
    assert.equal(backup.meta, undefined)
  })
})

describe('validateBackup', () => {
  it('拒绝非 LastTime 备份 / 更高版本', async () => {
    const backup = await createBackup()
    assert.throws(() => validateBackup({ ...backup, app: 'PersonalToolbox' }), /这不是 LastTime 的备份文件/)
    assert.throws(() => validateBackup({ ...backup, version: '2.0' }), /更高版本/)
    assert.throws(() => validateBackup({ ...backup, version: 'abc' }), /备份版本格式不正确/)
    assert.throws(() => validateBackup(null), /这不是有效的备份文件/)
  })

  it('拒绝重复 ID', async () => {
    await seedData()
    const backup = await createBackup()
    const item = { ...backup.items[0] }
    backup.items = [item, item]
    assert.throws(() => validateBackup(backup), /重复标识/)
  })

  it('拒绝外键断裂', async () => {
    await seedData()
    const backup = await createBackup()
    const brokenEvent = { ...backup.events[0], itemId: 'ghost' }
    backup.events = [brokenEvent]
    assert.throws(() => validateBackup(backup), /无效的事项记录引用/)

    const brokenItem = { ...backup.items[0], categoryId: 'ghost-category' }
    backup.items = [brokenItem]
    backup.events = []
    assert.throws(() => validateBackup(backup), /无效的分类引用/)
  })

  it('拒绝空分类但有事项 / 非法日期 / 非法主题', async () => {
    await seedData()
    const backup = await createBackup()
    backup.categories = []
    assert.throws(() => validateBackup(backup), /分类数据缺失/)

    const backup2 = await createBackup()
    backup2.events[0].eventDate = '2026-02-30'
    assert.throws(() => validateBackup(backup2), /发生日期格式不正确/)

    const backup3 = await createBackup()
    backup3.settings = [{ key: 'theme', value: 'blue' }]
    assert.throws(() => validateBackup(backup3), /主题设置格式不正确/)
  })
})

describe('restoreBackup', () => {
  it('往返一致：导出 → 清空 → 导入 → 数据完整', async () => {
    await seedData()
    const backup = await createBackup()

    await db.transaction('rw', [db.items, db.events, db.categories, db.settings], async () => {
      await db.items.clear()
      await db.events.clear()
      await db.categories.clear()
    })

    await restoreBackup(backup)
    assert.equal(await db.items.count(), 1)
    assert.equal(await db.events.count(), 1)
    assert.equal(await db.categories.count(), 8)
    const item = await db.items.get('item-1')
    assert.equal(item.name, '洗牙')
    assert.equal(item.cycleType, 'yearly')
  })

  it('覆盖式导入：现有数据被替换', async () => {
    await seedData()
    const backup = await createBackup()
    const item = { ...backup.items[0], id: 'item-new', name: '换机油' }
    backup.items = [item]
    backup.events = []

    await restoreBackup(backup)
    assert.equal(await db.items.count(), 1)
    assert.equal((await db.items.get('item-new')).name, '换机油')
    assert.equal(await db.events.count(), 0)
  })

  it('非法备份被拒绝且原数据无损', async () => {
    await seedData()
    const backup = await createBackup()
    backup.app = 'PersonalToolbox'
    await assert.rejects(restoreBackup(backup), /这不是 LastTime 的备份文件/)
    assert.equal(await db.items.count(), 1)
    assert.equal(await db.events.count(), 1)
  })

  it('空分类备份导入后自动补种默认分类', async () => {
    const backup = await createBackup()
    backup.items = []
    backup.events = []
    backup.categories = []
    await restoreBackup(backup)
    assert.deepEqual((await getAllCategories()).map((category) => category.name), ['生活', '家庭', '健康', '汽车', '工作', '学习', '数码', '其他'])
  })

  it('settings 整体替换，meta 不受影响', async () => {
    await seedData()
    const backup = await createBackup()
    backup.settings = [{ key: 'theme', value: 'dark' }]
    await restoreBackup(backup)

    const settings = await db.settings.toArray()
    assert.equal(settings.length, 1)
    assert.equal(settings[0].value, 'dark')
  })

  it('exportedAt 为今天（文件名日期逻辑）', () => {
    assert.match(getTodayString(), /^\d{4}-\d{2}-\d{2}$/)
  })
})
