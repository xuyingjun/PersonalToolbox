import Dexie from 'dexie'
import { DB_NAME, STORES } from './schema.js'

// 惰性实例化：Dexie 在构造时捕获依赖（indexedDB 等），
// 推迟到首次访问再构造，测试环境才能先用 fake-indexeddb 注入依赖。
let instance = null

function createInstance() {
  const database = new Dexie(DB_NAME)
  database.version(1).stores(STORES)
  return database
}

function getInstance() {
  if (!instance) instance = createInstance()
  return instance
}

export const db = new Proxy({}, {
  // 方法必须绑定到实例调用（否则 this 指向代理，Dexie 内部的属性写入会落空）
  get(target, property) {
    const value = getInstance()[property]
    return typeof value === 'function' ? value.bind(getInstance()) : value
  },
  set(target, property, value) {
    getInstance()[property] = value
    return true
  },
})
