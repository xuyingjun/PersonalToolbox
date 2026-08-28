import test from 'node:test'
import assert from 'node:assert/strict'
import {
  calendarDayDifference,
  formatCountdownDays,
  formatPastDays,
  parseLocalDate,
  toLocalDateString,
} from '../src/utils/date.js'

test('parses valid local dates and rejects impossible dates', () => {
  assert.equal(toLocalDateString(parseLocalDate('2024-02-29')), '2024-02-29')
  assert.equal(parseLocalDate('2023-02-29'), null)
  assert.equal(parseLocalDate('2024/02/29'), null)
})

test('calculates calendar days across month and year boundaries', () => {
  assert.equal(calendarDayDifference('2026-01-01', '2025-12-31'), 1)
  assert.equal(calendarDayDifference('2024-03-01', '2024-02-28'), 2)
})

test('formats last-time relative days', () => {
  assert.equal(formatPastDays('2026-08-29', '2026-08-29'), '今天')
  assert.equal(formatPastDays('2026-08-28', '2026-08-29'), '昨天')
  assert.equal(formatPastDays('2026-08-20', '2026-08-29'), '9 天前')
})

test('formats future, today, and overdue countdowns', () => {
  assert.equal(formatCountdownDays('2026-08-30', '2026-08-29'), '还有 1 天')
  assert.equal(formatCountdownDays('2026-08-29', '2026-08-29'), '就是今天')
  assert.equal(formatCountdownDays('2026-08-27', '2026-08-29'), '已过去 2 天')
})