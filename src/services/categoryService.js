import { db } from '../db/db.js'
import { CATEGORY_ICON_OPTIONS } from '../constants/categoryIcons.js'

const NAME_MAX = 20

function validateName(name) {
  const trimmed = (name ?? '').trim()
  if (!trimmed) throw new Error('请输入分类名称。')
  if (trimmed.length > NAME_MAX) throw new Error(`分类名称不能超过 ${NAME_MAX} 个字符。`)
  return trimmed
}

function validateIcon(icon) {
  if (!CATEGORY_ICON_OPTIONS.includes(icon)) throw new Error('请选择有效的分类图标。')
  return icon
}

export async function getAllCategories() {
  return db.categories.orderBy('sortOrder').toArray()
}

export async function getCategoryUsageCounts() {
  const items = await db.items.toArray()
  return items.reduce((counts, item) => {
    counts[item.categoryId] = (counts[item.categoryId] ?? 0) + 1
    return counts
  }, {})
}

export async function createCategory(name, icon = '🏷️') {
  const trimmed = validateName(name)
  const validatedIcon = validateIcon(icon)
  const duplicate = await db.categories.where('name').equals(trimmed).first()
  if (duplicate) throw new Error('该分类已存在。')

  const all = await db.categories.toArray()
  const maxSortOrder = all.reduce((max, category) => Math.max(max, category.sortOrder ?? 0), -1)
  const now = new Date().toISOString()
  await db.categories.add({ id: crypto.randomUUID(), name: trimmed, icon: validatedIcon, sortOrder: maxSortOrder + 1, createdAt: now, updatedAt: now })
}

export async function updateCategory(id, name, icon) {
  const existing = await db.categories.get(id)
  if (!existing) throw new Error('分类不存在。')
  const trimmed = validateName(name)
  const validatedIcon = validateIcon(icon ?? existing.icon ?? '🏷️')

  const duplicate = await db.categories.where('name').equals(trimmed).first()
  if (duplicate && duplicate.id !== id) throw new Error('该分类已存在。')

  await db.categories.update(id, { name: trimmed, icon: validatedIcon, updatedAt: new Date().toISOString() })
}

export async function moveCategory(id, direction) {
  await db.transaction('rw', db.categories, async () => {
    const categories = await db.categories.orderBy('sortOrder').toArray()
    const index = categories.findIndex((category) => category.id === id)
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (index < 0 || targetIndex < 0 || targetIndex >= categories.length) return

    const now = new Date().toISOString()
    await db.categories.bulkPut([
      { ...categories[index], sortOrder: categories[targetIndex].sortOrder, updatedAt: now },
      { ...categories[targetIndex], sortOrder: categories[index].sortOrder, updatedAt: now },
    ])
  })
}

// 被 Item 引用的分类禁止删除（事务内校验，避免遗留悬空引用）。
export async function deleteCategory(id) {
  const existing = await db.categories.get(id)
  if (!existing) throw new Error('分类不存在。')

  await db.transaction('rw', db.categories, db.items, async () => {
    const inUse = await db.items.where('categoryId').equals(id).count()
    if (inUse > 0) throw new Error('该分类正在使用，无法删除。')
    await db.categories.delete(id)
  })
}
