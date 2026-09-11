import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { db } from '../src/db/db.js'
import { installFakeIndexedDB, resetDatabase } from '../test-helpers/setup-indexeddb.js'
import {
  createItem,
  createItemWithEvent,
  deleteItem,
  getAllItems,
  searchItems,
  updateItem,
  validateItemInput,
} from '../src/services/itemService.js'
import { getAllCategories } from '../src/services/categoryService.js'

beforeEach(async () => {
  installFakeIndexedDB()
  await resetDatabase()
})

const baseInput = { name: '洗牙', categoryId: null, cycleType: 'none', cycleValue: null, note: '' }

describe('validateItemInput', () => {
  it('名称为空 / 超长 / 非法周期 / 超长备注', () => {
    assert.throws(() => validateItemInput({ ...baseInput, name: '  ' }), /请输入事项名称/)
    assert.throws(() => validateItemInput({ ...baseInput, name: 'x'.repeat(81) }), /不能超过 80/)
    assert.throws(() => validateItemInput({ ...baseInput, cycleType: 'unknown' }), /请选择有效周期/)
    assert.throws(() => validateItemInput({ ...baseInput, note: 'x'.repeat(501) }), /备注/)
  })

  it('custom 周期值校验', () => {
    assert.throws(() => validateItemInput({ ...baseInput, cycleType: 'custom', cycleValue: 0 }), /周期天数/)
    assert.throws(() => validateItemInput({ ...baseInput, cycleType: 'custom', cycleValue: 1.5 }), /周期天数/)
    assert.throws(() => validateItemInput({ ...baseInput, cycleType: 'custom', cycleValue: null }), /周期天数/)
    const validated = validateItemInput({ ...baseInput, cycleType: 'custom', cycleValue: 30 })
    assert.equal(validated.cycleValue, 30)
  })

  it('非 custom 周期强制 cycleValue 为 null', () => {
    const validated = validateItemInput({ ...baseInput, cycleType: 'weekly', cycleValue: 99 })
    assert.equal(validated.cycleValue, null)
  })
})

describe('createItem / updateItem', () => {
  it('创建时分类缺失回退到“生活”', async () => {
    const id = await createItem({ ...baseInput, name: '洗牙' })
    const item = await db.items.get(id)
    const categories = await getAllCategories()
    assert.equal(item.categoryId, categories.find((category) => category.name === '生活').id)
  })

  it('指定分类正常生效', async () => {
    const categories = await getAllCategories()
    const target = categories.find((category) => category.name === '家庭')
    const id = await createItem({ ...baseInput, categoryId: target.id })
    assert.equal((await db.items.get(id)).categoryId, target.id)
  })

  it('updateItem 合并更新并打时间戳', async () => {
    const id = await createItem({ ...baseInput })
    await updateItem(id, { name: '换机油', cycleType: 'monthly' })
    const item = await db.items.get(id)
    assert.equal(item.name, '换机油')
    assert.equal(item.cycleType, 'monthly')
  })

  it('searchItems 匹配 name / note', async () => {
    await createItem({ ...baseInput, name: '洗牙', note: '半年一次' })
    await createItem({ ...baseInput, name: '换机油' })
    assert.equal((await searchItems('洗牙')).length, 1)
    assert.equal((await searchItems('半年')).length, 1)
    assert.equal((await searchItems('不存在')).length, 0)
  })
})

describe('createItemWithEvent', () => {
  it('带日期创建 Item + Event', async () => {
    const id = await createItemWithEvent({ ...baseInput, name: '洗牙' }, '2026-08-01')
    assert.equal(await db.items.count(), 1)
    assert.equal(await db.events.count(), 1)
    const event = await db.events.where('itemId').equals(id).first()
    assert.equal(event.eventDate, '2026-08-01')
  })

  it('不传日期只创建 Item', async () => {
    await createItemWithEvent({ ...baseInput }, null)
    assert.equal(await db.items.count(), 1)
    assert.equal(await db.events.count(), 0)
  })

  it('非法日期整体回滚（原子性）', async () => {
    await assert.rejects(createItemWithEvent({ ...baseInput }, 'bad-date'), /请选择有效日期/)
    assert.equal(await db.items.count(), 0)
    assert.equal(await db.events.count(), 0)
  })
})

describe('deleteItem', () => {
  it('级联删除关联 Events', async () => {
    const id = await createItemWithEvent({ ...baseInput }, '2026-08-01')
    await createItemWithEvent({ ...baseInput, name: '另一件' }, '2026-08-02')
    await deleteItem(id)
    assert.equal(await db.items.count(), 1)
    assert.equal(await db.events.count(), 1)
    assert.equal(await getAllItems().then((items) => items[0].name), '另一件')
  })

  it('事项不存在时报错', async () => {
    await assert.rejects(deleteItem('ghost'), /事项不存在/)
  })
})
