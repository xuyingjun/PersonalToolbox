import { db } from '../db/db.js'

export async function getSettingsOverview() {
  const [itemCount, eventCount, categoryCount] = await Promise.all([
    db.items.count(),
    db.events.count(),
    db.categories.count(),
  ])

  return { itemCount, eventCount, categoryCount }
}