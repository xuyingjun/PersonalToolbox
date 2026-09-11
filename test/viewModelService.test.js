import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { STATUS } from '../src/services/statusService.js'
import {
  filterItemViewModels,
  buildItemViewModels,
  getItemViewModel,
  sortItemViewModels,
} from '../src/services/viewModelService.js'
import { db } from '../src/db/db.js'
import { installFakeIndexedDB, resetDatabase } from '../test-helpers/setup-indexeddb.js'

const TODAY = '2026-09-11'
const ISO = '2026-09-01T00:00:00.000Z'

const categories = [
  { id: 'c-life', name: '生活', sortOrder: 0 },
  { id: 'c-other', name: '其他', sortOrder: 7 },
]

const items = [
  { id: 'i-overdue', name: '洗牙', categoryId: 'c-life', cycleType: 'daily', cycleValue: null, note: '半年一次', createdAt: ISO, updatedAt: '2026-09-02T00:00:00.000Z' },
  { id: 'i-upcoming', name: '换机油', categoryId: 'c-other', cycleType: 'weekly', cycleValue: null, note: '', createdAt: ISO, updatedAt: '2026-09-05T00:00:00.000Z' },
  { id: 'i-nocycle', name: '清理空调', categoryId: 'c-life', cycleType: 'none', cycleValue: null, note: '', createdAt: ISO, updatedAt: '2026-09-06T00:00:00.000Z' },
  { id: 'i-empty', name: '给孩子剪头发', categoryId: 'c-life', cycleType: 'monthly', cycleValue: null, note: '', createdAt: ISO, updatedAt: '2026-09-07T00:00:00.000Z' },
]

const events = [
  { id: 'e-1', itemId: 'i-overdue', eventDate: '2026-09-01', note: '', createdAt: ISO, updatedAt: ISO },
  { id: 'e-2', itemId: 'i-overdue', eventDate: '2026-09-05', note: '', createdAt: ISO, updatedAt: ISO },
  { id: 'e-3', itemId: 'i-overdue', eventDate: '2026-09-09', note: '', createdAt: ISO, updatedAt: ISO },
  { id: 'e-4', itemId: 'i-upcoming', eventDate: '2026-09-05', note: '', createdAt: ISO, updatedAt: ISO },
  { id: 'e-5', itemId: 'i-nocycle', eventDate: '2026-08-01', note: '', createdAt: ISO, updatedAt: ISO },
]

beforeEach(async () => {
  installFakeIndexedDB()
  await resetDatabase()
})

function build() {
  return buildItemViewModels({ items, events, categories, today: TODAY, upcomingThreshold: 7 })
}

describe('buildItemViewModels', () => {
  it('推导 latestEvent / nextDate / status / recordedToday', () => {
    const viewModels = build()
    const overdue = viewModels.find((item) => item.id === 'i-overdue')
    assert.equal(overdue.latestEvent.eventDate, '2026-09-09')
    // daily + 09-09 = 09-10 < 今天 → OVERDUE
    assert.equal(overdue.status, STATUS.OVERDUE)
    assert.equal(overdue.elapsedDays, 2)
    assert.equal(overdue.recordedToday, false)
    assert.equal(overdue.category, '生活')

    const upcoming = viewModels.find((item) => item.id === 'i-upcoming')
    assert.equal(upcoming.nextDate, '2026-09-12')
    assert.equal(upcoming.status, STATUS.UPCOMING)
    assert.equal(upcoming.attentionLevel, 2)

    const nocycle = viewModels.find((item) => item.id === 'i-nocycle')
    assert.equal(nocycle.status, STATUS.NO_CYCLE)
    assert.equal(nocycle.nextDate, null)

    const empty = viewModels.find((item) => item.id === 'i-empty')
    assert.equal(empty.status, STATUS.NO_RECORD)
    assert.equal(empty.latestEvent, null)
    assert.equal(empty.recordedToday, false)
  })

  it('统计：不足 2 条 interval 为 null，3 条计算平均/最短/最长', () => {
    const viewModels = build()
    const overdue = viewModels.find((item) => item.id === 'i-overdue')
    assert.equal(overdue.statistics.eventCount, 3)
    assert.equal(overdue.statistics.averageInterval, 4)
    assert.equal(overdue.statistics.minimumInterval, 4)
    assert.equal(overdue.statistics.maximumInterval, 4)

    const upcoming = viewModels.find((item) => item.id === 'i-upcoming')
    assert.equal(upcoming.statistics.eventCount, 1)
    assert.equal(upcoming.statistics.averageInterval, null)
  })

  it('cycle 提供类型/值/中文标签', () => {
    const viewModels = build()
    const overdue = viewModels.find((item) => item.id === 'i-overdue')
    assert.deepEqual(overdue.cycle, { type: 'daily', value: null, label: '每天' })
    const nocycle = viewModels.find((item) => item.id === 'i-nocycle')
    assert.equal(nocycle.cycle.label, '不设置')
  })
})

describe('getItemViewModel', () => {
  it('只组装指定事项的数据', async () => {
    const category = await db.categories.where('name').equals('其他').first()
    await db.items.bulkAdd([
      items[0],
      { ...items[1], categoryId: category.id },
    ])
    await db.events.bulkAdd(events.slice(0, 4))
    const result = await getItemViewModel('i-upcoming')
    assert.equal(result.id, 'i-upcoming')
    assert.equal(result.statistics.eventCount, 1)
    assert.equal(result.category, '其他')
  })
})

describe('filterItemViewModels', () => {
  const viewModels = build()

  it('按名称搜索', () => {
    assert.deepEqual(filterItemViewModels(viewModels, '洗牙').map((item) => item.id), ['i-overdue'])
  })

  it('按分类搜索', () => {
    const ids = filterItemViewModels(viewModels, '其他').map((item) => item.id)
    assert.deepEqual(ids, ['i-upcoming'])
  })

  it('按备注搜索', () => {
    assert.deepEqual(filterItemViewModels(viewModels, '半年一次').map((item) => item.id), ['i-overdue'])
  })

  it('空关键字返回全部', () => {
    assert.equal(filterItemViewModels(viewModels, '  ').length, 4)
  })
})

describe('sortItemViewModels', () => {
  const viewModels = build()

  it('最需要关注：OVERDUE → UPCOMING → NO_CYCLE → NO_RECORD', () => {
    const ids = sortItemViewModels(viewModels, 'attention').map((item) => item.id)
    assert.deepEqual(ids, ['i-overdue', 'i-upcoming', 'i-nocycle', 'i-empty'])
  })

  it('最近记录：按 latestEvent 降序，无记录最后', () => {
    const ids = sortItemViewModels(viewModels, 'recent').map((item) => item.id)
    assert.deepEqual(ids, ['i-overdue', 'i-upcoming', 'i-nocycle', 'i-empty'])
  })

  it('最久没记录：从未记录最前，然后按日期升序', () => {
    const ids = sortItemViewModels(viewModels, 'oldest').map((item) => item.id)
    assert.deepEqual(ids, ['i-empty', 'i-nocycle', 'i-upcoming', 'i-overdue'])
  })

  it('最近修改：按 updatedAt 降序', () => {
    const ids = sortItemViewModels(viewModels, 'updated').map((item) => item.id)
    assert.deepEqual(ids, ['i-empty', 'i-nocycle', 'i-upcoming', 'i-overdue'])
  })
})
