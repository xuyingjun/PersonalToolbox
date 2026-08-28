import { db } from '../../db/database.js'
import { parseLocalDate, toLocalDateString } from '../../utils/date.js'

function validateRecord(input) {
  const name = input.name.trim()
  const note = input.note.trim()
  if (!name) throw new Error('请输入事项名称。')
  if (name.length > 80) throw new Error('事项名称不能超过 80 个字符。')
  if (!parseLocalDate(input.lastDate)) throw new Error('请选择有效日期。')
  if (input.lastDate > toLocalDateString()) throw new Error('上一次日期不能晚于今天。')
  if (note.length > 500) throw new Error('备注不能超过 500 个字符。')
  return { name, note, lastDate: input.lastDate }
}

export async function listLastTimeRecords(sort = 'oldest') {
  const records = await db.lastTimeRecords.toArray()
  return records.sort((first, second) => {
    if (sort === 'newest') return second.lastDate.localeCompare(first.lastDate)
    if (sort === 'updated') return second.updatedAt.localeCompare(first.updatedAt)
    return first.lastDate.localeCompare(second.lastDate)
  })
}

export async function saveLastTimeRecord(input, id = null) {
  const record = validateRecord(input)
  const now = new Date().toISOString()
  if (id) {
    await db.lastTimeRecords.update(id, { ...record, updatedAt: now })
    return id
  }
  const newId = crypto.randomUUID()
  await db.lastTimeRecords.add({ id: newId, ...record, createdAt: now, updatedAt: now })
  return newId
}

export function markLastTimeToday(id) {
  return db.lastTimeRecords.update(id, {
    lastDate: toLocalDateString(),
    updatedAt: new Date().toISOString(),
  })
}

export function deleteLastTimeRecord(id) {
  return db.lastTimeRecords.delete(id)
}