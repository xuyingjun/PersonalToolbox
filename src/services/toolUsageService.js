import { db } from '../db/database.js'

export function getRecentToolUsage(limit = 4) {
  return db.toolUsage.orderBy('lastUsedAt').reverse().limit(limit).toArray()
}

export function markToolUsed(toolId) {
  return db.toolUsage.put({ toolId, lastUsedAt: new Date().toISOString() })
}
