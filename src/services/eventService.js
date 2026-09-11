import { db } from '../db/db.js'
import { getTodayString, parseLocalDate } from '../utils/date.js'

const NOTE_MAX = 500

export function validateEventInput(input) {
  const note = (input.note ?? '').trim()
  if (!parseLocalDate(input.eventDate)) throw new Error('请选择有效日期。')
  if (input.eventDate > getTodayString()) throw new Error('发生日期不能晚于今天。')
  if (note.length > NOTE_MAX) throw new Error(`备注不能超过 ${NOTE_MAX} 个字符。`)
  return { eventDate: input.eventDate, note }
}

export async function createEvent(itemId, eventDate, note = '') {
  const validated = validateEventInput({ eventDate, note })
  const now = new Date().toISOString()
  await db.transaction('rw', db.events, db.items, async () => {
    const item = await db.items.get(itemId)
    if (!item) throw new Error('事项不存在。')
    const duplicate = await db.events.where('[itemId+eventDate]').equals([itemId, validated.eventDate]).first()
    if (duplicate) throw new Error('该日期已经有一条记录。')
    await db.events.add({ id: crypto.randomUUID(), itemId, ...validated, createdAt: now, updatedAt: now })
    await db.items.update(itemId, { updatedAt: now })
  })
}

export async function updateEvent(id, data) {
  const existing = await db.events.get(id)
  if (!existing) throw new Error('记录不存在。')
  const validated = validateEventInput({ ...existing, ...data })
  await db.transaction('rw', db.events, db.items, async () => {
    const duplicates = await db.events.where('[itemId+eventDate]').equals([existing.itemId, validated.eventDate]).toArray()
    if (duplicates.some((event) => event.id !== id)) throw new Error('该日期已经有一条记录。')
    await db.events.update(id, { ...validated, updatedAt: new Date().toISOString() })
    await db.items.update(existing.itemId, { updatedAt: new Date().toISOString() })
  })
}

export async function deleteEvent(id) {
  const existing = await db.events.get(id)
  if (!existing) throw new Error('记录不存在。')
  await db.transaction('rw', db.events, db.items, async () => {
    await db.events.delete(id)
    await db.items.update(existing.itemId, { updatedAt: new Date().toISOString() })
  })
}

export async function getEventsByItemId(itemId) {
  const events = await db.events.where('itemId').equals(itemId).toArray()
  return events.sort((first, second) => second.eventDate.localeCompare(first.eventDate))
}

export async function getLatestEvent(itemId) {
  const events = await getEventsByItemId(itemId)
  return events[0] ?? null
}

// 核心动作“今天做了”：
// 1. 取今天 YYYY-MM-DD
// 2. 同一天已有 Event 则禁止重复创建
// 3. 否则创建 Event 并更新 Item.updatedAt（同一事务）
export async function recordToday(itemId) {
  const today = getTodayString()
  const now = new Date().toISOString()

  return db.transaction('rw', db.events, db.items, async () => {
    const item = await db.items.get(itemId)
    if (!item) throw new Error('事项不存在。')

    const existing = await db.events.where('[itemId+eventDate]').equals([itemId, today]).first()
    if (existing) return { created: false, event: existing }

    const event = { id: crypto.randomUUID(), itemId, eventDate: today, note: '', createdAt: now, updatedAt: now }
    await db.events.add(event)
    await db.items.update(itemId, { updatedAt: now })
    return { created: true, event }
  })
}
