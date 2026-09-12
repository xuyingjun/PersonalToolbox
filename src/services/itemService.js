import { db } from '../db/db.js'
import { CYCLE_TYPES } from '../db/schema.js'
import { validateEventInput } from './eventService.js'

const NAME_MAX = 80
const NOTE_MAX = 500
export const CUSTOM_MAX_DAYS = 3650

export function validateItemInput(input) {
  const name = (input.name ?? '').trim()
  const note = (input.note ?? '').trim()
  if (!name) throw new Error('请输入事项名称。')
  if (name.length > NAME_MAX) throw new Error(`事项名称不能超过 ${NAME_MAX} 个字符。`)
  if (!CYCLE_TYPES.includes(input.cycleType)) throw new Error('请选择有效周期。')
  if (note.length > NOTE_MAX) throw new Error(`备注不能超过 ${NOTE_MAX} 个字符。`)

  let cycleValue = null
  if (input.cycleType === 'custom') {
    if (!Number.isInteger(input.cycleValue) || input.cycleValue <= 0 || input.cycleValue > CUSTOM_MAX_DAYS) {
      throw new Error('请输入有效的周期天数。')
    }
    cycleValue = input.cycleValue
  }

  return { name, categoryId: input.categoryId, cycleType: input.cycleType, cycleValue, note }
}

// 分类不存在时回退到“生活”，再回退到 sortOrder 最小的分类。
async function resolveCategoryId(categoryId) {
  if (categoryId && (await db.categories.get(categoryId))) return categoryId
  const categories = await db.categories.orderBy('sortOrder').toArray()
  if (categories.length === 0) throw new Error('分类不存在，请先初始化分类。')
  return (categories.find((category) => category.name === '生活') ?? categories[0]).id
}

export async function createItem(data) {
  const validated = validateItemInput(data)
  const now = new Date().toISOString()
  const item = {
    id: crypto.randomUUID(),
    ...validated,
    categoryId: await resolveCategoryId(validated.categoryId),
    createdAt: now,
    updatedAt: now,
  }
  await db.items.add(item)
  return item.id
}

// 新增事项 +（可选）首条 Event，单事务保证原子性，失败整体回滚。
export async function createItemWithEvent(data, eventDate) {
  const validated = validateItemInput(data)
  const validatedEvent = eventDate ? validateEventInput({ eventDate, note: '' }) : null

  const now = new Date().toISOString()
  const item = {
    id: crypto.randomUUID(),
    ...validated,
    categoryId: await resolveCategoryId(validated.categoryId),
    createdAt: now,
    updatedAt: now,
  }

  await db.transaction('rw', db.items, db.events, async () => {
    await db.items.add(item)
    if (validatedEvent) {
      await db.events.add({
        id: crypto.randomUUID(),
        itemId: item.id,
        ...validatedEvent,
        createdAt: now,
        updatedAt: now,
      })
    }
  })

  return item.id
}

export async function updateItem(id, data) {
  const existing = await db.items.get(id)
  if (!existing) throw new Error('事项不存在。')
  const validated = validateItemInput({ ...existing, ...data })
  await db.items.update(id, { ...validated, categoryId: await resolveCategoryId(validated.categoryId), updatedAt: new Date().toISOString() })
}

// 删除事项时级联删除其全部 Event，单事务原子。
export async function deleteItem(id) {
  const existing = await db.items.get(id)
  if (!existing) throw new Error('事项不存在。')
  await db.transaction('rw', db.items, db.events, async () => {
    await db.events.where('itemId').equals(id).delete()
    await db.items.delete(id)
  })
}

export async function getItem(id) {
  return (await db.items.get(id)) ?? null
}
