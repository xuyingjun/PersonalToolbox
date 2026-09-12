import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { db } from '../src/db/db.js'
import { initDatabase } from '../src/db/seed.js'
import { installFakeIndexedDB, resetDatabase } from '../test-helpers/setup-indexeddb.js'

beforeEach(async () => {
  installFakeIndexedDB()
  await resetDatabase()
})

describe('initDatabase', () => {
  it('清除已废弃的 theme 设置', async () => {
    await db.settings.put({ key: 'theme', value: 'dark' })
    await initDatabase()
    assert.equal(await db.settings.get('theme'), undefined)
  })

  it('清理动作不影响其他设置', async () => {
    await db.settings.put({ key: 'upcomingThreshold', value: 14 })
    await initDatabase()
    assert.equal((await db.settings.get('upcomingThreshold')).value, 14)
  })
})
