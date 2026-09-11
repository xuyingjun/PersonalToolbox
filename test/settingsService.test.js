import { beforeEach, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { db } from '../src/db/db.js'
import { installFakeIndexedDB, resetDatabase } from '../test-helpers/setup-indexeddb.js'
import {
  DEFAULT_THEME,
  getSetting,
  setSetting,
  THEME_KEY,
  UPCOMING_THRESHOLD_KEY,
} from '../src/services/settingsService.js'

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

  it('关注范围只接受 1–30 的整数', async () => {
    await setSetting(UPCOMING_THRESHOLD_KEY, 10)
    assert.equal(await getSetting(UPCOMING_THRESHOLD_KEY), 10)
    await assert.rejects(setSetting(UPCOMING_THRESHOLD_KEY, 0), /1–30/)
    await assert.rejects(setSetting(UPCOMING_THRESHOLD_KEY, 3.5), /1–30/)
  })

  it('拒绝未知设置项', async () => {
    await assert.rejects(setSetting('unknown', true), /不支持的设置项/)
  })

  it('旧版非法值读取时回退默认值', async () => {
    await db.settings.put({ key: UPCOMING_THRESHOLD_KEY, value: 'bad' })
    assert.equal(await getSetting(UPCOMING_THRESHOLD_KEY, 7), 7)
  })
})
