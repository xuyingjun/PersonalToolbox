import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { installFakeIndexedDB, resetDatabase } from '../test-helpers/setup-indexeddb.js'
import { DEFAULT_THEME, getSetting, setSetting, THEME_KEY } from '../src/services/settingsService.js'

beforeEach(async () => {
  installFakeIndexedDB()
  await resetDatabase()
})

describe('settingsService', () => {
  it('无值时返回 fallback', async () => {
    assert.equal(await getSetting(THEME_KEY, DEFAULT_THEME), 'system')
  })

  it('写入后读回一致，再次写入覆盖', async () => {
    await setSetting(THEME_KEY, 'dark')
    assert.equal(await getSetting(THEME_KEY), 'dark')
    await setSetting(THEME_KEY, 'light')
    assert.equal(await getSetting(THEME_KEY), 'light')
  })
})
