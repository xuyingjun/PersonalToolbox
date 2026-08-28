import { db } from '../db/database.js'
import { parseLocalDate } from '../utils/date.js'

const BACKUP_VERSION = 1
const MAX_BACKUP_SIZE = 5 * 1024 * 1024
const TABLE_NAMES = [
  'lastTimeRecords',
  'countdowns',
  'inspirations',
  'favorites',
  'toolUsage',
  'settings',
]

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
  backup.lastTimeRecords.forEach((record) => {
    assertRecordBase(record, '最后一次记录')
    assertText(record.name, '事项名称', 80)
    assertText(record.note, '事项备注', 500, true)
    if (!parseLocalDate(record.lastDate)) throw new Error('备份中的上一次日期格式不正确。')
  })
  backup.countdowns.forEach((record) => {
    assertRecordBase(record, '倒计时记录')
    assertText(record.name, '倒计时名称', 80)
    assertText(record.note, '倒计时备注', 500, true)
    if (!parseLocalDate(record.targetDate)) throw new Error('备份中的目标日期格式不正确。')
  })
  backup.inspirations.forEach((record) => {
    assertRecordBase(record, '灵感记录')
    assertText(record.content, '灵感内容', 2000)
    if (!Array.isArray(record.tags) || record.tags.length > 10 || record.tags.some((tag) => typeof tag !== 'string' || !tag || tag.length > 30)) {
      throw new Error('备份中的灵感标签格式不正确。')
    }
  })
  backup.favorites.forEach((record) => {
    if (!isIsoTimestamp(record.createdAt)) throw new Error('备份中的收藏时间格式不正确。')
  })
  backup.toolUsage.forEach((record) => {
    if (!isIsoTimestamp(record.lastUsedAt)) throw new Error('备份中的最近使用时间格式不正确。')
  })
  backup.settings.forEach((record) => {
    if (!record || typeof record !== 'object' || Array.isArray(record) || !('value' in record)) throw new Error('备份中的设置格式不正确。')
  })
}

export function validateBackup(backup) {
  if (!backup || typeof backup !== 'object' || Array.isArray(backup)) throw new Error('这不是有效的备份文件。')
  if (!Number.isInteger(backup.version)) throw new Error('备份缺少版本信息。')
  if (backup.version > BACKUP_VERSION) throw new Error('备份来自更高版本的应用，当前版本无法导入。')

  TABLE_NAMES.forEach((name) => assertArray(backup[name], name))
  assertUniqueIds(backup.lastTimeRecords, 'id', '最后一次记录')
  assertUniqueIds(backup.countdowns, 'id', '倒计时记录')
  assertUniqueIds(backup.inspirations, 'id', '灵感记录')
  assertUniqueIds(backup.favorites, 'toolId', '收藏记录')
  assertUniqueIds(backup.toolUsage, 'toolId', '最近使用记录')
  assertUniqueIds(backup.settings, 'key', '设置记录')
  validateRows(backup)

  return backup
}

export async function createBackup() {
  const data = await db.transaction('r', TABLE_NAMES.map((name) => db[name]), async () => {
    const entries = await Promise.all(TABLE_NAMES.map(async (name) => [name, await db[name].toArray()]))
    return Object.fromEntries(entries)
  })

  return {
    version: BACKUP_VERSION,
    appVersion: '0.1.0',
    exportedAt: new Date().toISOString(),
    ...data,
  }
}

export async function exportBackup() {
  const json = JSON.stringify(await createBackup(), null, 2)
  const file = new File([json], 'personal-toolbox-backup.json', { type: 'application/json' })

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: '我的个人工具箱备份' })
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

export async function restoreBackup(backup) {
  validateBackup(backup)
  await db.transaction('rw', TABLE_NAMES.map((name) => db[name]), async () => {
    for (const name of TABLE_NAMES) await db[name].clear()
    for (const name of TABLE_NAMES) {
      if (backup[name].length > 0) await db[name].bulkAdd(backup[name])
    }
  })
}

export async function clearAllData() {
  await db.transaction('rw', TABLE_NAMES.map((name) => db[name]), async () => {
    for (const name of TABLE_NAMES) await db[name].clear()
  })
}