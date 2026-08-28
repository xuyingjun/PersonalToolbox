import { db } from '../../db/database.js'
import { parseLocalDate, toLocalDateString } from '../../utils/date.js'

function validateCountdown(input, isNew) {
  const name = input.name.trim()
  const note = input.note.trim()
  if (!name) throw new Error('请输入倒计时名称。')
  if (name.length > 80) throw new Error('名称不能超过 80 个字符。')
  if (!parseLocalDate(input.targetDate)) throw new Error('请选择有效日期。')
  if (isNew && input.targetDate < toLocalDateString()) throw new Error('新倒计时不能选择过去日期。')
  if (note.length > 500) throw new Error('备注不能超过 500 个字符。')
  return { name, note, targetDate: input.targetDate }
}

export async function listCountdowns() {
  const records = await db.countdowns.toArray()
  return records.sort((first, second) => first.targetDate.localeCompare(second.targetDate))
}

export async function saveCountdown(input, id = null) {
  const record = validateCountdown(input, !id)
  const now = new Date().toISOString()
  if (id) {
    await db.countdowns.update(id, { ...record, updatedAt: now })
    return id
  }
  const newId = crypto.randomUUID()
  await db.countdowns.add({ id: newId, ...record, createdAt: now, updatedAt: now })
  return newId
}

export function deleteCountdown(id) {
  return db.countdowns.delete(id)
}