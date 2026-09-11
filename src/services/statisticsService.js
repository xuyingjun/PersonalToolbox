import { db } from '../db/db.js'
import { differenceInCalendarDays } from '../utils/date.js'

// 纯函数：入参为按 eventDate 升序排序的 Event 数组。
// 不足两个 Event 时 interval 一律为 null，避免展示无意义数据。
export function calculateStatisticsFromEvents(sortedEventsAsc) {
  const eventCount = sortedEventsAsc.length
  if (eventCount < 2) {
    return { eventCount, averageInterval: null, minimumInterval: null, maximumInterval: null }
  }

  const intervals = []
  for (let index = 1; index < sortedEventsAsc.length; index += 1) {
    intervals.push(differenceInCalendarDays(sortedEventsAsc[index - 1].eventDate, sortedEventsAsc[index].eventDate))
  }

  const sum = intervals.reduce((total, value) => total + value, 0)
  return {
    eventCount,
    averageInterval: sum / intervals.length,
    minimumInterval: Math.min(...intervals),
    maximumInterval: Math.max(...intervals),
  }
}

// 文档 API：按 itemId 从数据库读取并计算统计。
export async function calculateItemStatistics(itemId) {
  const events = await db.events.where('itemId').equals(itemId).toArray()
  events.sort((first, second) => first.eventDate.localeCompare(second.eventDate))
  return calculateStatisticsFromEvents(events)
}
