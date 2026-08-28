const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const DAY_IN_MILLISECONDS = 86_400_000

export function toLocalDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseLocalDate(value) {
  const match = DATE_PATTERN.exec(value)
  if (!match) return null

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  if (toLocalDateString(date) !== value) return null
  return date
}

export function calendarDayDifference(laterDate, earlierDate) {
  const later = typeof laterDate === 'string' ? parseLocalDate(laterDate) : laterDate
  const earlier = typeof earlierDate === 'string' ? parseLocalDate(earlierDate) : earlierDate
  if (!later || !earlier) return 0

  const laterUtc = Date.UTC(later.getFullYear(), later.getMonth(), later.getDate())
  const earlierUtc = Date.UTC(earlier.getFullYear(), earlier.getMonth(), earlier.getDate())
  return Math.round((laterUtc - earlierUtc) / DAY_IN_MILLISECONDS)
}

export function daysSince(date, today = toLocalDateString()) {
  return calendarDayDifference(today, date)
}

export function daysUntil(date, today = toLocalDateString()) {
  return calendarDayDifference(date, today)
}

export function formatPastDays(date, today = toLocalDateString()) {
  const days = daysSince(date, today)
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  return `${days} 天前`
}

export function formatCountdownDays(date, today = toLocalDateString()) {
  const days = daysUntil(date, today)
  if (days === 0) return '就是今天'
  if (days > 0) return `还有 ${days} 天`
  return `已过去 ${Math.abs(days)} 天`
}

export function formatDisplayDate(value) {
  const date = parseLocalDate(value)
  if (!date) return value
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
