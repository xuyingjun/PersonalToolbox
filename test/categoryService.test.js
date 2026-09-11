import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { db } from '../src/db/db.js'
import { installFakeIndexedDB, resetDatabase } from '../test-helpers/setup-indexeddb.js'
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryUsageCounts,
  moveCategory,
  updateCategory,
} from '../src/services/categoryService.js'

beforeEach(async () => {
  installFakeIndexedDB()
  await resetDatabase()
})

describe('默认分类', () => {
  it('首开即有 8 个默认分类且按 sortOrder 排序', async () => {
    const categories = await getAllCategories()
    assert.deepEqual(categories.map((category) => category.name), ['生活', '家庭', '健康', '汽车', '工作', '学习', '数码', '其他'])
    assert.ok(categories.every((category) => category.icon))
  })
})

describe('createCategory / updateCategory', () => {
  it('新增排到最后，重名拒绝', async () => {
    await createCategory('宠物', '🎯')
    const categories = await getAllCategories()
    assert.equal(categories.at(-1).name, '宠物')
    assert.equal(categories.at(-1).icon, '🎯')
    await assert.rejects(createCategory('宠物'), /该分类已存在/)
  })

  it('空名/超长拒绝', async () => {
    await assert.rejects(createCategory(' '), /请输入分类名称/)
    await assert.rejects(createCategory('x'.repeat(21)), /不能超过 20/)
  })

  it('改名且重名拒绝', async () => {
    const categories = await getAllCategories()
    const target = categories.find((category) => category.name === '生活')
    await updateCategory(target.id, '日常', '🧹')
    assert.deepEqual(
      { name: (await db.categories.get(target.id)).name, icon: (await db.categories.get(target.id)).icon },
      { name: '日常', icon: '🧹' },
    )
    await assert.rejects(updateCategory(target.id, '家庭'), /该分类已存在/)
  })

  it('拒绝非法图标', async () => {
    await assert.rejects(createCategory('宠物', 'not-an-icon'), /有效的分类图标/)
  })
})

describe('deleteCategory', () => {
  it('未被使用的分类可删除', async () => {
    const categories = await getAllCategories()
    const target = categories.find((category) => category.name === '学习')
    await deleteCategory(target.id)
    assert.equal(await db.categories.count(), 7)
  })

  it('被 Item 引用的分类禁止删除', async () => {
    const categories = await getAllCategories()
    const target = categories.find((category) => category.name === '健康')
    const now = new Date().toISOString()
    await db.items.add({ id: 'i-1', name: '体检', categoryId: target.id, cycleType: 'none', cycleValue: null, note: '', createdAt: now, updatedAt: now })
    await assert.rejects(deleteCategory(target.id), /该分类正在使用，无法删除/)
    assert.equal(await db.categories.count(), 8)
  })
})

describe('分类使用数量与排序', () => {
  it('统计每个分类关联的事项数', async () => {
    const categories = await getAllCategories()
    const target = categories.find((category) => category.name === '健康')
    const now = new Date().toISOString()
    await db.items.bulkAdd([
      { id: 'i-1', name: '体检', categoryId: target.id, cycleType: 'none', cycleValue: null, note: '', createdAt: now, updatedAt: now },
      { id: 'i-2', name: '洗牙', categoryId: target.id, cycleType: 'none', cycleValue: null, note: '', createdAt: now, updatedAt: now },
    ])

    assert.equal((await getCategoryUsageCounts())[target.id], 2)
  })

  it('与相邻分类交换顺序，边界移动无操作', async () => {
    const before = await getAllCategories()
    await moveCategory(before[1].id, 'up')
    const moved = await getAllCategories()
    assert.deepEqual(moved.slice(0, 2).map((category) => category.id), [before[1].id, before[0].id])

    await moveCategory(moved[0].id, 'up')
    assert.equal((await getAllCategories())[0].id, moved[0].id)
  })
})
