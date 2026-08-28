import { db } from '../db/database.js'

export function getFavorites() {
  return db.favorites.orderBy('createdAt').reverse().toArray()
}

export async function toggleFavorite(toolId) {
  const existing = await db.favorites.get(toolId)
  if (existing) {
    await db.favorites.delete(toolId)
    return false
  }

  await db.favorites.put({ toolId, createdAt: new Date().toISOString() })
  return true
}
