// LastTimeDB 结构定义。
// 注意：这里只定义"事实数据"——Item（关注什么）、Event（何时真实发生过）、
// Category（分类）。lastDate / nextDate / status / statistics 一律动态计算，禁止落库。

export const DB_NAME = 'LastTimeDB'

export const STORES = {
  items: 'id, name, categoryId, cycleType, createdAt, updatedAt',
  // [itemId+eventDate] 是复合索引（不是字段），仅供 recordToday 去重查询使用
  events: 'id, itemId, eventDate, [itemId+eventDate], createdAt, updatedAt',
  categories: 'id, name, sortOrder',
  settings: 'key',
  meta: 'key',
}

export const CYCLE_TYPES = [
  'none',
  'daily',
  'weekly',
  'biweekly',
  'monthly',
  'quarterly',
  'halfYear',
  'yearly',
  'custom',
]

export const CYCLE_LABELS = {
  none: '不设置',
  daily: '每天',
  weekly: '每周',
  biweekly: '每两周',
  monthly: '每月',
  quarterly: '每季度',
  halfYear: '每半年',
  yearly: '每年',
  custom: '自定义',
}

export function formatCycleLabel(cycleType, cycleValue) {
  if (!cycleType || cycleType === 'none') return CYCLE_LABELS.none
  if (cycleType === 'custom') return `每 ${cycleValue} 天`
  return CYCLE_LABELS[cycleType] ?? CYCLE_LABELS.none
}

export const SCHEMA_VERSION = '1.0'
export const APP_VERSION = '1.0.0'
