// 全部业务日期计算统一入口。
// 规则：
// 1. 所有日期用本地 YYYY-MM-DD 字符串表示（自然日，非 24 小时）
// 2. 禁止 new Date('YYYY-MM-DD') 做业务计算（时区陷阱）
// 3. 未来日期按本地日历计算，禁止用 UTC 逻辑代替本地日期

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const DAY_IN_MILLISECONDS = 86_400_000

const CYCLE_ADD_DAYS = { daily: 1, weekly: 7, biweekly: 14 }
const CYCLE_ADD_MONTHS = { monthly: 1, quarterly: 3, halfYear: 6, yearly: 12 }

export function formatLocalDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTodayString() {
  return formatLocalDate(new Date())
}

// 严格解析 YYYY-MM-DD；格式非法或日期不存在（如 2023-02-29）返回 null。
export function parseLocalDate(value) {
  const match = DATE_PATTERN.exec(value)
  if (!match) return null

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  if (formatLocalDate(date) !== value) return null
  return date
}

// 有符号日历日差：dateB − dateA（dateB 更晚时为正数）。
// 通过本地年月日构造 UTC 时间戳再相减，避免时区/夏令时误差。
export function differenceInCalendarDays(dateA, dateB) {
  const earlier = typeof dateA === 'string' ? parseLocalDate(dateA) : dateA
  const later = typeof dateB === 'string' ? parseLocalDate(dateB) : dateB
  if (!earlier || !later) return 0

  const earlierUtc = Date.UTC(earlier.getFullYear(), earlier.getMonth(), earlier.getDate())
  const laterUtc = Date.UTC(later.getFullYear(), later.getMonth(), later.getDate())
  return Math.round((laterUtc - earlierUtc) / DAY_IN_MILLISECONDS)
}

// 今天 = 0 天，昨天 = 1 天（过去为正数）。
export function getElapsedDays(eventDate, today = getTodayString()) {
  return differenceInCalendarDays(eventDate, today)
}

// 本地日历加法：parse 后 setDate，由 Date 处理跨月/跨年/闰年。
export function addDays(dateString, days) {
  const date = parseLocalDate(dateString)
  if (!date) return null
  date.setDate(date.getDate() + days)
  return formatLocalDate(date)
}

// 按月加法的月末钳制规则：
// 2026-01-31 + 1月 = 2026-02-28（闰年 2024-01-31 → 2024-02-29）
// 2024-02-29 + 1年 = 2025-02-28（钳制后以 28 号为准继续推进）
// 非月末不粘滞：2026-02-28 + 1月 = 2026-03-28
export function addCycle(dateString, cycleType, cycleValue) {
  const date = parseLocalDate(dateString)
  if (!date) return null
  if (!cycleType || cycleType === 'none') return null

  if (cycleType === 'custom') {
    if (!Number.isInteger(cycleValue) || cycleValue <= 0) return null
    return addDays(dateString, cycleValue)
  }

  if (CYCLE_ADD_DAYS[cycleType]) return addDays(dateString, CYCLE_ADD_DAYS[cycleType])

  const monthsToAdd = CYCLE_ADD_MONTHS[cycleType]
  if (!monthsToAdd) return null

  const totalMonths = date.getMonth() + monthsToAdd
  const year = date.getFullYear() + Math.floor(totalMonths / 12)
  const month = totalMonths % 12
  const lastDay = new Date(year, month + 1, 0).getDate()
  const day = Math.min(date.getDate(), lastDay)
  return formatLocalDate(new Date(year, month, day))
}

export function isToday(dateString, today = getTodayString()) {
  return parseLocalDate(dateString) !== null && dateString === today
}

export function isFuture(dateString, today = getTodayString()) {
  return differenceInCalendarDays(today, dateString) > 0
}

export function isPast(dateString, today = getTodayString()) {
  return differenceInCalendarDays(today, dateString) < 0
}

export function formatDate(dateString) {
  const date = parseLocalDate(dateString)
  if (!date) return dateString
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

// 过去：今天 / 昨天 / 前天 / N天前；未来：明天 / 还有 N 天。
export function formatRelativeDays(dateString, today = getTodayString()) {
  const days = differenceInCalendarDays(dateString, today)
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days === 2) return '前天'
  if (days > 2) return `${days}天前`
  if (days === -1) return '明天'
  return `还有 ${Math.abs(days)} 天`
}

// 针对 nextDate 的显示：今天 / 明天 / 还有 N 天 / 已过去 N 天。
export function formatNextDate(dateString, today = getTodayString()) {
  const days = differenceInCalendarDays(dateString, today)
  if (days === 0) return '今天'
  if (days === -1) return '明天'
  if (days < -1) return `还有 ${Math.abs(days)} 天`
  return `已过去 ${days} 天`
}
