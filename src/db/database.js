import Dexie from 'dexie'

export const db = new Dexie('PersonalToolbox')

db.version(1).stores({
  lastTimeRecords: 'id, name, lastDate, updatedAt',
  countdowns: 'id, targetDate, updatedAt',
  inspirations: 'id, createdAt, updatedAt, *tags',
  favorites: 'toolId, createdAt',
  toolUsage: 'toolId, lastUsedAt',
  settings: 'key',
})
