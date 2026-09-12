import { db } from './db.js'
import { APP_VERSION, SCHEMA_VERSION } from './schema.js'
import { DEFAULT_CATEGORY_ICONS } from '../constants/categoryIcons.js'

export const DEFAULT_CATEGORIES = ['生活', '家庭', '健康', '汽车', '工作', '学习', '数码', '其他']

// 仅在 categories 为空时播种默认分类。
// 这样导入的空分类备份也能自愈，且用户创建过的分类在重启后不会被覆盖。
export async function ensureDefaultCategories(target = db) {
  const existing = await target.categories.count()
  if (existing > 0) return

  const now = new Date().toISOString()
  const categories = DEFAULT_CATEGORIES.map((name, index) => ({
    id: crypto.randomUUID(),
    name,
    icon: DEFAULT_CATEGORY_ICONS[name],
    sortOrder: index,
    createdAt: now,
    updatedAt: now,
  }))
  await target.categories.bulkAdd(categories)
}

// 应用启动入口：打开数据库 → 播种默认分类 → 写入版本元数据。
// 在 React 渲染之前调用，避免 StrictMode 双执行。
export async function initDatabase() {
  await db.open()
  await db.settings.delete('theme') // 清理已废弃的主题设置（旧库遗留）
  await ensureDefaultCategories()
  await db.meta.bulkPut([
    { key: 'schemaVersion', value: SCHEMA_VERSION },
    { key: 'appVersion', value: APP_VERSION },
  ])
}
