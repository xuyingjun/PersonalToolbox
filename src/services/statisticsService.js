import { addCycle, differenceInCalendarDays, parseLocalDate } from '../utils/date.js'
import { CUSTOM_MAX_DAYS } from './itemService.js'

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

// 纯函数：与设定周期的偏差分析（按时率）。
// 每对相邻记录 (A, B)：
//   expected = differenceInCalendarDays(A, addCycle(A, cycleType, cycleValue))
//              —— 逐对按 A 的实际日历推算，addCycle 的月末钳制自然生效
//   actual   = differenceInCalendarDays(A, B)
//   deviation = actual - expected（正数 = 晚于周期，负数 = 早于周期）
// 少于 2 条 / cycleType 为 none / 任一 addCycle 返回 null 时返回 null。
export function calculateCycleDeviation({ eventsAsc, cycleType, cycleValue }) {
  if (!Array.isArray(eventsAsc) || eventsAsc.length < 2) return null
  if (!cycleType || cycleType === 'none') return null

  // 内部再排序，防御乱序入参
  const sorted = [...eventsAsc].sort((first, second) => first.eventDate.localeCompare(second.eventDate))
  const deviations = []
  for (let index = 1; index < sorted.length; index += 1) {
    const expectedDate = addCycle(sorted[index - 1].eventDate, cycleType, cycleValue)
    if (!expectedDate) return null
    const expected = differenceInCalendarDays(sorted[index - 1].eventDate, expectedDate)
    const actual = differenceInCalendarDays(sorted[index - 1].eventDate, sorted[index].eventDate)
    deviations.push(actual - expected)
  }

  const onTimeCount = deviations.filter((value) => value <= 0).length
  return {
    pairCount: deviations.length,
    averageDeviation: deviations.reduce((total, value) => total + value, 0) / deviations.length,
    latestDeviation: deviations.at(-1),
    maxDeviation: Math.max(...deviations),
    onTimeRate: Math.round((onTimeCount / deviations.length) * 100), // 0–100 整数
  }
}

// 纯函数：根据相邻记录间隔的中位数推荐周期。
// 入参：Event 数组或 YYYY-MM-DD 字符串数组（内部升序排序）。
// 少于 2 条 / 非法日期 / 间隔不足 1 天时返回 null。
// 返回 { cycleType, cycleValue, medianInterval, sampleCount }（sampleCount = 记录条数）。
export function recommendCycle(eventsAscOrDates) {
  if (!Array.isArray(eventsAscOrDates) || eventsAscOrDates.length < 2) return null
  const dates = eventsAscOrDates.map((entry) => (typeof entry === 'string' ? entry : entry?.eventDate))
  if (dates.some((date) => !parseLocalDate(date))) return null

  const sorted = [...dates].sort((first, second) => first.localeCompare(second))
  const intervals = []
  for (let index = 1; index < sorted.length; index += 1) {
    const interval = differenceInCalendarDays(sorted[index - 1], sorted[index])
    if (!Number.isFinite(interval) || interval < 1) return null
    intervals.push(interval)
  }

  const ordered = [...intervals].sort((first, second) => first - second)
  const middle = Math.floor(ordered.length / 2)
  const median = ordered.length % 2 === 1 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2
  const result = { medianInterval: median, sampleCount: dates.length }

  // 月度类周期直接按日历区间匹配（含大/小月与闰年的自然浮动）
  if (median >= 28 && median <= 31) return { ...result, cycleType: 'monthly', cycleValue: null }
  if (median >= 90 && median <= 92) return { ...result, cycleType: 'quarterly', cycleValue: null }
  if (median >= 180 && median <= 184) return { ...result, cycleType: 'halfYear', cycleValue: null }
  if (median >= 360 && median <= 366) return { ...result, cycleType: 'yearly', cycleValue: null }

  // 日数类预设就近匹配：|中位数 − 代表天数| ≤ 3 才采纳，否则退回自定义
  // 代表天数：每天 1 / 每周 7 / 每两周 14 / 每月 30；并列时保留先出现的（偏短周期）
  const DAY_PRESETS = [
    { cycleType: 'daily', days: 1 },
    { cycleType: 'weekly', days: 7 },
    { cycleType: 'biweekly', days: 14 },
    { cycleType: 'monthly', days: 30 },
  ]
  let best = null
  for (const preset of DAY_PRESETS) {
    const distance = Math.abs(median - preset.days)
    if (!best || distance < best.distance) best = { ...preset, distance }
  }
  if (best.distance <= 3) return { ...result, cycleType: best.cycleType, cycleValue: null }

  const customDays = Math.min(Math.max(Math.round(median), 1), CUSTOM_MAX_DAYS)
  return { ...result, cycleType: 'custom', cycleValue: customDays }
}
