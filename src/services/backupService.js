import { db } from '../db/db.js'
import { CATEGORY_ICON_OPTIONS, DEFAULT_CATEGORY_ICONS, getCategoryIcon } from '../constants/categoryIcons.js'
import { CYCLE_TYPES } from '../db/schema.js'
import { DEFAULT_CATEGORIES } from '../db/seed.js'
import { getTodayString, parseLocalDate } from '../utils/date.js'
import { CUSTOM_MAX_DAYS } from './itemService.js'
import { validateSetting } from './settingsService.js'

const BACKUP_APP = 'LastTime'
const BACKUP_VERSION = '1.0'
const MAX_BACKUP_SIZE = 5 * 1024 * 1024
const TABLE_NAMES = ['items', 'events', 'categories', 'settings']

// 导入时逐行清洗：只保留白名单字段，剥离多余/未知字段
const FIELDS = {
  items: ['id', 'name', 'categoryId', 'cycleType', 'cycleValue', 'note', 'createdAt', 'updatedAt'],
  events: ['id', 'itemId', 'eventDate', 'note', 'createdAt', 'updatedAt'],
  categories: ['id', 'name', 'icon', 'sortOrder', 'createdAt', 'updatedAt'],
  settings: ['key', 'value'],
}

function sanitizeRows(table, rows) {
  const fields = FIELDS[table]
  return rows.map((row) => {
    const sanitized = Object.fromEntries(fields.map((field) => [field, row[field]]))
    if (table === 'categories') sanitized.icon = getCategoryIcon(row.name, row.icon)
    return sanitized
  })
}

function assertArray(value, name) {
  if (!Array.isArray(value)) throw new Error(`备份中的 ${name} 格式不正确。`)
}

function assertUniqueIds(records, key, name) {
  const values = records.map((record) => record?.[key])
  if (values.some((value) => typeof value !== 'string' || !value)) {
    throw new Error(`备份中的 ${name} 缺少有效标识。`)
  }
  if (new Set(values).size !== values.length) throw new Error(`备份中的 ${name} 存在重复标识。`)
}

function isIsoTimestamp(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function assertText(value, name, maxLength, allowEmpty = false) {
  if (typeof value !== 'string' || (!allowEmpty && !value.trim()) || value.length > maxLength) {
    throw new Error(`备份中的 ${name} 格式不正确。`)
  }
}

function assertRecordBase(record, name) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error(`备份中的 ${name} 格式不正确。`)
  if (!isIsoTimestamp(record.createdAt) || !isIsoTimestamp(record.updatedAt)) throw new Error(`备份中的 ${name} 时间格式不正确。`)
}

function validateRows(backup) {
  backup.items.forEach((record) => {
    assertRecordBase(record, '事项')
    assertText(record.name, '事项名称', 80)
    assertText(record.note ?? '', '事项备注', 500, true)
    assertText(record.categoryId, '事项分类', 40)
    if (!CYCLE_TYPES.includes(record.cycleType)) throw new Error('备份中的周期格式不正确。')
    if (record.cycleType === 'custom') {
      if (!Number.isInteger(record.cycleValue) || record.cycleValue <= 0 || record.cycleValue > CUSTOM_MAX_DAYS) {
        throw new Error('备份中的周期天数格式不正确。')
      }
    } else if (record.cycleValue != null) {
      throw new Error('备份中的周期值格式不正确。')
    }
  })

  backup.events.forEach((record) => {
    assertRecordBase(record, '记录')
    assertText(record.itemId, '记录归属', 40)
    if (!parseLocalDate(record.eventDate)) throw new Error('备份中的发生日期格式不正确。')
    if (record.eventDate > getTodayString()) throw new Error('备份中的发生日期不能晚于今天。')
    assertText(record.note ?? '', '记录备注', 500, true)
  })

  backup.categories.forEach((record) => {
    assertRecordBase(record, '分类')
    assertText(record.name, '分类名称', 20)
    if (record.name !== record.name.trim()) throw new Error('备份中的分类名称格式不正确。')
    if (record.icon != null && !CATEGORY_ICON_OPTIONS.includes(record.icon)) throw new Error('备份中的分类图标格式不正确。')
    if (!Number.isInteger(record.sortOrder) || record.sortOrder < 0) throw new Error('备份中的分类排序格式不正确。')
  })

  backup.settings.forEach((record) => {
    if (!record || typeof record !== 'object' || Array.isArray(record)) throw new Error('备份中的设置格式不正确。')
    assertText(record.key, '设置键', 60)
    if (!('value' in record)) throw new Error('备份中的设置格式不正确。')
    try {
      validateSetting(record.key, record.value)
    } catch {
      throw new Error('备份中的设置格式不正确。')
    }
  })

  const categoryNames = backup.categories.map((record) => record.name)
  if (new Set(categoryNames).size !== categoryNames.length) throw new Error('备份中存在重复分类名称。')
  const sortOrders = backup.categories.map((record) => record.sortOrder)
  if (new Set(sortOrders).size !== sortOrders.length) throw new Error('备份中存在重复分类排序。')

  const eventKeys = backup.events.map((record) => `${record.itemId}\u0000${record.eventDate}`)
  if (new Set(eventKeys).size !== eventKeys.length) throw new Error('备份中存在同一事项同一天的重复记录。')
}

function validateReferences(backup) {
  const itemIds = new Set(backup.items.map((record) => record.id))
  const categoryIds = new Set(backup.categories.map((record) => record.id))

  if (categoryIds.size === 0 && backup.items.length > 0) throw new Error('备份中的分类数据缺失。')

  for (const record of backup.events) {
    if (!itemIds.has(record.itemId)) throw new Error('备份中存在无效的事项记录引用。')
  }
  for (const record of backup.items) {
    if (!categoryIds.has(record.categoryId)) throw new Error('备份中存在无效的分类引用。')
  }
}

export function validateBackup(backup) {
  if (!backup || typeof backup !== 'object' || Array.isArray(backup)) throw new Error('这不是有效的备份文件。')
  if (backup.app !== BACKUP_APP) throw new Error('这不是 LastTime 的备份文件。')
  if (typeof backup.version !== 'string') throw new Error('备份缺少版本信息。')
  if (parseFloat(backup.version) > parseFloat(BACKUP_VERSION)) {
    throw new Error('备份来自更高版本的应用，当前版本无法导入。')
  }
  if (backup.version !== BACKUP_VERSION) throw new Error('备份版本格式不正确。')
  if (!isIsoTimestamp(backup.exportedAt)) throw new Error('备份的导出时间格式不正确。')

  TABLE_NAMES.forEach((name) => assertArray(backup[name], name))
  assertUniqueIds(backup.items, 'id', '事项')
  assertUniqueIds(backup.events, 'id', '记录')
  assertUniqueIds(backup.categories, 'id', '分类')
  assertUniqueIds(backup.settings, 'key', '设置')
  validateRows(backup)
  validateReferences(backup)

  return backup
}

export async function createBackup() {
  const data = await db.transaction('r', TABLE_NAMES.map((name) => db[name]), async () => {
    const entries = await Promise.all(TABLE_NAMES.map(async (name) => [name, await db[name].toArray()]))
    return Object.fromEntries(entries)
  })

  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    ...data,
  }
}

export async function exportBackup() {
  const json = JSON.stringify(await createBackup(), null, 2)
  const file = new File([json], `LastTime-backup-${getTodayString()}.json`, { type: 'application/json' })

  // iOS 优先走系统分享面板，桌面走 <a download>
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: 'LastTime 数据备份' })
    return
  }

  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export async function readBackupFile(file) {
  if (!file) throw new Error('请选择备份文件。')
  if (file.size > MAX_BACKUP_SIZE) throw new Error('备份文件不能超过 5MB。')
  let parsed
  try {
    parsed = JSON.parse(await file.text())
  } catch {
    throw new Error('无法解析 JSON 文件。')
  }
  return validateBackup(parsed)
}

// 覆盖式导入：单事务清空并写入，任何一步失败 Dexie 整体回滚。
// meta 不参与导入；categories 为空时在同一事务内补种默认分类。
export async function restoreBackup(backup) {
  validateBackup(backup)
  await db.transaction('rw', TABLE_NAMES.map((name) => db[name]), async () => {
    for (const name of TABLE_NAMES) await db[name].clear()
    for (const name of TABLE_NAMES) {
      const rows = sanitizeRows(name, backup[name])
      if (rows.length > 0) await db[name].bulkAdd(rows)
    }
    if (backup.categories.length === 0) {
      const now = new Date().toISOString()
      const categories = DEFAULT_CATEGORIES.map((name, index) => ({
        id: crypto.randomUUID(),
        name,
        icon: DEFAULT_CATEGORY_ICONS[name],
        sortOrder: index,
        createdAt: now,
        updatedAt: now,
      }))
      await db.categories.bulkAdd(categories)
    }
  })
}
