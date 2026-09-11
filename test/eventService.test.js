import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { db } from '../src/db/db.js'
import { installFakeIndexedDB, resetDatabase } from '../test-helpers/setup-indexeddb.js'
import {
  createEvent,
  deleteEvent,
  getEventsByItemId,
  getLatestEvent,
  recordToday,
  updateEvent,
  validateEventInput,
} from '../src/services/eventService.js'
import { getTodayString } from '../src/utils/date.js'

beforeEach(async () => {
  installFakeIndexedDB()
  await resetDatabase()
})

async function createTestItem() {
  const now = new Date().toISOString()
  const id = 'item-1'
  await db.items.add({ id, name: '测试', categoryId: 'c', cycleType: 'none', cycleValue: null, note: '', createdAt: now, updatedAt: now })
  return id
}

describe('validateEventInput', () => {
  it('拒绝未来日期 / 非法日期 / 超长备注', () => {
    assert.throws(() => validateEventInput({ eventDate: '2999-01-01', note: '' }), /发生日期不能晚于今天/)
    assert.throws(() => validateEventInput({ eventDate: 'bad', note: '' }), /请选择有效日期/)
    assert.throws(() => validateEventInput({ eventDate: getTodayString(), note: 'x'.repeat(501) }), /备注/)
    assert.deepEqual(validateEventInput({ eventDate: getTodayString(), note: '  好  ' }), {
      eventDate: getTodayString(),
      note: '好',
    })
  })
})

describe('createEvent', () => {
  it('创建 Event 并更新 Item.updatedAt', async () => {
    const itemId = await createTestItem()
    const before = await db.items.get(itemId)
    await createEvent(itemId, '2026-01-05', '备注')
    const events = await getEventsByItemId(itemId)
    assert.equal(events.length, 1)
    assert.equal(events[0].eventDate, '2026-01-05')
    assert.equal(events[0].note, '备注')
    assert.ok((await db.items.get(itemId)).updatedAt > before.updatedAt)
  })

  it('事项不存在时报错', async () => {
    await assert.rejects(createEvent('ghost', getTodayString()), /事项不存在/)
  })

  it('拒绝同一事项同一天重复记录', async () => {
    const itemId = await createTestItem()
    await createEvent(itemId, '2026-01-05')
    await assert.rejects(createEvent(itemId, '2026-01-05'), /该日期已经有一条记录/)
  })
})

describe('recordToday', () => {
  it('首次创建今天的 Event，重复调用禁止创建', async () => {
    const itemId = await createTestItem()
    const first = await recordToday(itemId)
    assert.equal(first.created, true)
    assert.equal(first.event.eventDate, getTodayString())

    const second = await recordToday(itemId)
    assert.equal(second.created, false)
    assert.equal(second.event.id, first.event.id)

    assert.equal(await db.events.count(), 1)
  })

  it('同一天两个事项互不影响', async () => {
    const now = new Date().toISOString()
    await db.items.add({ id: 'item-2', name: '测试2', categoryId: 'c', cycleType: 'none', cycleValue: null, note: '', createdAt: now, updatedAt: now })
    const first = await createTestItem()
    const firstResult = await recordToday(first)
    const secondResult = await recordToday('item-2')
    assert.equal(firstResult.created, true)
    assert.equal(secondResult.created, true)
    assert.equal(await db.events.count(), 2)
  })

  it('事项不存在时报错', async () => {
    await assert.rejects(recordToday('ghost'), /事项不存在/)
  })
})

describe('getEventsByItemId / getLatestEvent', () => {
  it('按日期倒序返回', async () => {
    const itemId = await createTestItem()
    await createEvent(itemId, '2026-01-01')
    await createEvent(itemId, '2026-03-01')
    await createEvent(itemId, '2026-02-01')
    const events = await getEventsByItemId(itemId)
    assert.deepEqual(events.map((event) => event.eventDate), ['2026-03-01', '2026-02-01', '2026-01-01'])
    assert.equal((await getLatestEvent(itemId)).eventDate, '2026-03-01')
  })
})

describe('updateEvent / deleteEvent', () => {
  it('修改 Event 并更新 Item.updatedAt', async () => {
    const itemId = await createTestItem()
    await createEvent(itemId, '2026-01-01')
    const event = (await getEventsByItemId(itemId))[0]
    await updateEvent(event.id, { eventDate: '2026-01-02', note: '改' })
    const updated = await db.events.get(event.id)
    assert.equal(updated.eventDate, '2026-01-02')
    assert.equal(updated.note, '改')
  })

  it('未来日期拒绝修改', async () => {
    const itemId = await createTestItem()
    await createEvent(itemId, '2026-01-01')
    const event = (await getEventsByItemId(itemId))[0]
    await assert.rejects(updateEvent(event.id, { eventDate: '2999-01-01' }), /发生日期不能晚于今天/)
  })

  it('拒绝修改为同一事项已有的日期', async () => {
    const itemId = await createTestItem()
    await createEvent(itemId, '2026-01-01')
    await createEvent(itemId, '2026-01-02')
    const event = (await getEventsByItemId(itemId))[0]
    await assert.rejects(updateEvent(event.id, { eventDate: '2026-01-01' }), /该日期已经有一条记录/)
  })

  it('删除 Event', async () => {
    const itemId = await createTestItem()
    await createEvent(itemId, '2026-01-01')
    const event = (await getEventsByItemId(itemId))[0]
    await deleteEvent(event.id)
    assert.equal(await db.events.count(), 0)
  })
})
