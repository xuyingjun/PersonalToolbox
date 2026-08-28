import { db } from '../../db/database.js'

function normalizeTags(value) {
  const values = Array.isArray(value) ? value : value.split(/[\s#，,]+/)
  return [...new Set(values.map((tag) => tag.trim().replace(/^#/, '')).filter(Boolean))].slice(0, 10)
}

function validateInspiration(input) {
  const content = input.content.trim()
  if (!content) throw new Error('请输入灵感内容。')
  if (content.length > 2000) throw new Error('内容不能超过 2000 个字符。')
  const tags = normalizeTags(input.tags)
  if (tags.some((tag) => tag.length > 30)) throw new Error('单个标签不能超过 30 个字符。')
  return { content, tags }
}

export async function listInspirations(sort = 'created') {
  const records = await db.inspirations.toArray()
  const field = sort === 'updated' ? 'updatedAt' : 'createdAt'
  return records.sort((first, second) => second[field].localeCompare(first[field]))
}

export async function saveInspiration(input, id = null) {
  const record = validateInspiration(input)
  const now = new Date().toISOString()
  if (id) {
    await db.inspirations.update(id, { ...record, updatedAt: now })
    return id
  }
  const newId = crypto.randomUUID()
  await db.inspirations.add({ id: newId, ...record, createdAt: now, updatedAt: now })
  return newId
}

export function deleteInspiration(id) {
  return db.inspirations.delete(id)
}
