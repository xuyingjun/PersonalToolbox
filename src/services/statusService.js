// 核心状态计算系统。Status 只存在于内存（ViewModel），禁止落库。
import { addCycle, differenceInCalendarDays, getTodayString } from '../utils/date.js'

export const STATUS = {
  NO_RECORD: 'NO_RECORD',
  NO_CYCLE: 'NO_CYCLE',
  NORMAL: 'NORMAL',
  UPCOMING: 'UPCOMING',
  DUE_TODAY: 'DUE_TODAY',
  OVERDUE: 'OVERDUE',
}

export const DEFAULT_UPCOMING_THRESHOLD = 7

export function calculateNextDate(item, latestEvent) {
  if (!latestEvent) return null
  return addCycle(latestEvent.eventDate, item.cycleType, item.cycleValue)
}

export function calculateElapsedDays(latestEvent, today = getTodayString()) {
  if (!latestEvent) return null
  return differenceInCalendarDays(latestEvent.eventDate, today)
}

export function calculateStatus(item, latestEvent, { today = getTodayString(), upcomingThreshold = DEFAULT_UPCOMING_THRESHOLD } = {}) {
  if (!latestEvent) return STATUS.NO_RECORD
  if (!item.cycleType || item.cycleType === 'none') return STATUS.NO_CYCLE

  const nextDate = calculateNextDate(item, latestEvent)
  if (!nextDate) return STATUS.NO_CYCLE // 非法 custom 等无法推导 nextDate 的情况

  // daysUntil：距下次还剩多少天（正数=未来，0=今天，负数=已过期）
  const daysUntil = differenceInCalendarDays(today, nextDate)
  if (daysUntil === 0) return STATUS.DUE_TODAY
  if (daysUntil < 0) return STATUS.OVERDUE
  if (daysUntil <= upcomingThreshold) return STATUS.UPCOMING
  return STATUS.NORMAL
}

// “需要关注”排序权重：数字越小越需要关注。
// 没有周期 / 没有记录的 Item 不进入“需要关注”，返回 null。
export function calculateAttentionLevel(status) {
  switch (status) {
    case STATUS.OVERDUE: return 0
    case STATUS.DUE_TODAY: return 1
    case STATUS.UPCOMING: return 2
    default: return null
  }
}
