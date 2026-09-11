import Dexie from 'dexie'
import { indexedDB, IDBKeyRange } from 'fake-indexeddb'
import { db } from '../src/db/db.js'
import { ensureDefaultCategories } from '../src/db/seed.js'

// 每个 DB 测试文件在 beforeEach 中显式调用，
// 保证任何 node --test 调用方式（含 --test 全量扫描）都成立。
export function installFakeIndexedDB() {
  Dexie.dependencies.indexedDB = indexedDB
  Dexie.dependencies.IDBKeyRange = IDBKeyRange
}

export async function resetDatabase() {
  db.close()
  await indexedDB.deleteDatabase('LastTimeDB')
  await indexedDB.deleteDatabase('PersonalToolbox')
  await db.open()
  await ensureDefaultCategories()
}
