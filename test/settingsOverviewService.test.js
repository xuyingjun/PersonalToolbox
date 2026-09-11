import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { db } from '../src/db/db.js'
import { getSettingsOverview } from '../src/services/settingsOverviewService.js'
import { installFakeIndexedDB, resetDatabase } from '../test-helpers/setup-indexeddb.js'

beforeEach(async () => {
  installFakeIndexedDB()
  await resetDatabase()
})

describe('settingsOverviewService', () => {
  it('返回事项、记录与分类数量', async () => {
    const category = await db.categories.orderBy('sortOrder').first()
    const now = new Date().toISOString()
    await db.items.add({ id: 'i-1', name: '体检', categoryId: category.id, cycleType: 'none', cycleValue: null, note: '', createdAt: now, updatedAt: now })
    await db.events.add({ id: 'e-1', itemId: 'i-1', eventDate: '2026-09-01', note: '', createdAt: now, updatedAt: now })

    assert.deepEqual(await getSettingsOverview(), { itemCount: 1, eventCount: 1, categoryCount: 8 })
  })
})