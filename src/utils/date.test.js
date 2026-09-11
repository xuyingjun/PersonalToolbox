import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  addCycle,
  addDays,
  differenceInCalendarDays,
  formatLocalDate,
  formatNextDate,
  formatRelativeDays,
  getElapsedDays,
  isFuture,
  isPast,
  isToday,
  parseLocalDate,
} from './date.js'

const TODAY = '2026-09-11'

describe('parseLocalDate', () => {
  it('解析合法日期并返回本地零点 Date', () => {
    const date = parseLocalDate('2026-09-11')
    assert.ok(date)
    assert.equal(date.getFullYear(), 2026)
    assert.equal(date.getMonth(), 8)
    assert.equal(date.getDate(), 11)
  })

  it('拒绝不存在的日期（闰年陷阱）', () => {
    assert.equal(parseLocalDate('2023-02-29'), null)
    assert.equal(parseLocalDate('2026-13-01'), null)
    assert.equal(parseLocalDate('2026-00-10'), null)
    assert.equal(parseLocalDate('2026-09-31'), null)
  })

  it('拒绝格式非法的输入', () => {
    assert.equal(parseLocalDate('2026/09/11'), null)
    assert.equal(parseLocalDate('26-09-11'), null)
    assert.equal(parseLocalDate(''), null)
    assert.equal(parseLocalDate(null), null)
    assert.equal(parseLocalDate(undefined), null)
  })

  it('formatLocalDate 输出补零的 YYYY-MM-DD', () => {
    assert.equal(formatLocalDate(new Date(2026, 0, 5)), '2026-01-05')
  })
})

describe('differenceInCalendarDays', () => {
  it('今天 = 0 天，昨天 = 1 天，明天 = -1 天', () => {
    assert.equal(differenceInCalendarDays(TODAY, TODAY), 0)
    assert.equal(differenceInCalendarDays('2026-09-10', TODAY), 1)
    assert.equal(differenceInCalendarDays('2026-09-12', TODAY), -1)
  })

  it('跨月', () => {
    assert.equal(differenceInCalendarDays('2026-08-31', '2026-09-01'), 1)
    assert.equal(differenceInCalendarDays('2026-09-30', '2026-10-01'), 1)
  })

  it('跨年', () => {
    assert.equal(differenceInCalendarDays('2025-12-31', '2026-01-01'), 1)
    assert.equal(differenceInCalendarDays('2025-12-31', '2026-12-31'), 365)
  })

  it('闰年', () => {
    assert.equal(differenceInCalendarDays('2024-02-28', '2024-03-01'), 2)
    assert.equal(differenceInCalendarDays('2023-02-28', '2023-03-01'), 1)
  })

  it('非法输入返回 0', () => {
    assert.equal(differenceInCalendarDays('bad-date', TODAY), 0)
  })

  it('getElapsedDays：过去为正数、未来为负数', () => {
    assert.equal(getElapsedDays(TODAY, TODAY), 0)
    assert.equal(getElapsedDays('2026-09-01', TODAY), 10)
    assert.equal(getElapsedDays('2026-09-20', TODAY), -9)
  })
})

describe('addDays', () => {
  it('跨月/跨年/闰年按本地日历推进', () => {
    assert.equal(addDays('2026-08-31', 1), '2026-09-01')
    assert.equal(addDays('2026-12-31', 1), '2027-01-01')
    assert.equal(addDays('2024-02-28', 1), '2024-02-29')
    assert.equal(addDays('2023-02-28', 1), '2023-03-01')
    assert.equal(addDays('2026-01-01', -1), '2025-12-31')
  })

  it('非法日期返回 null', () => {
    assert.equal(addDays('2026-02-30', 1), null)
  })
})

describe('addCycle', () => {
  it('天级周期', () => {
    assert.equal(addCycle('2026-09-11', 'daily'), '2026-09-12')
    assert.equal(addCycle('2026-09-11', 'weekly'), '2026-09-18')
    assert.equal(addCycle('2026-09-11', 'biweekly'), '2026-09-25')
  })

  it('月级周期', () => {
    assert.equal(addCycle('2026-01-11', 'monthly'), '2026-02-11')
    assert.equal(addCycle('2026-01-11', 'quarterly'), '2026-04-11')
    assert.equal(addCycle('2026-01-11', 'halfYear'), '2026-07-11')
    assert.equal(addCycle('2026-01-11', 'yearly'), '2027-01-11')
  })

  it('月末钳制：31 号 + 1 月 = 目标月最后一天', () => {
    assert.equal(addCycle('2026-01-31', 'monthly'), '2026-02-28')
    assert.equal(addCycle('2024-01-31', 'monthly'), '2024-02-29')
    assert.equal(addCycle('2026-01-31', 'quarterly'), '2026-04-30')
  })

  it('闰日不漂移：2-29 + 1 年 = 次年 2-28，+4 年回到 2-29', () => {
    assert.equal(addCycle('2024-02-29', 'yearly'), '2025-02-28')
    assert.equal(addCycle('2024-02-29', 'quarterly'), '2024-05-29')
    assert.equal(addCycle('2025-02-28', 'yearly'), '2026-02-28')
    assert.equal(addCycle('2026-02-28', 'yearly'), '2027-02-28')
    assert.equal(addCycle('2027-02-28', 'yearly'), '2028-02-28')
  })

  it('非月末不粘滞：2-28 + 1 月 = 3-28', () => {
    assert.equal(addCycle('2026-02-28', 'monthly'), '2026-03-28')
  })

  it('custom 按天数推进，非正整数返回 null', () => {
    assert.equal(addCycle('2026-09-11', 'custom', 30), '2026-10-11')
    assert.equal(addCycle('2026-09-11', 'custom', 0), null)
    assert.equal(addCycle('2026-09-11', 'custom', -3), null)
    assert.equal(addCycle('2026-09-11', 'custom', 1.5), null)
    assert.equal(addCycle('2026-09-11', 'custom', null), null)
  })

  it('none / 无周期 / 非法日期返回 null', () => {
    assert.equal(addCycle('2026-09-11', 'none'), null)
    assert.equal(addCycle('2026-09-11', null), null)
    assert.equal(addCycle('2026-09-11', 'unknown'), null)
    assert.equal(addCycle('bad-date', 'monthly'), null)
  })
})

describe('isToday / isFuture / isPast', () => {
  it('今天', () => {
    assert.equal(isToday(TODAY, TODAY), true)
    assert.equal(isToday('2026-09-10', TODAY), false)
  })

  it('未来/过去', () => {
    assert.equal(isFuture('2026-09-12', TODAY), true)
    assert.equal(isFuture('2026-09-11', TODAY), false)
    assert.equal(isPast('2026-09-10', TODAY), true)
    assert.equal(isPast('2026-09-11', TODAY), false)
    assert.equal(isFuture('bad-date', TODAY), false)
  })
})

describe('formatRelativeDays / formatNextDate', () => {
  it('过去', () => {
    assert.equal(formatRelativeDays(TODAY, TODAY), '今天')
    assert.equal(formatRelativeDays('2026-09-10', TODAY), '昨天')
    assert.equal(formatRelativeDays('2026-09-09', TODAY), '前天')
    assert.equal(formatRelativeDays('2026-09-08', TODAY), '3天前')
    assert.equal(formatRelativeDays('2026-09-04', TODAY), '7天前')
  })

  it('未来', () => {
    assert.equal(formatRelativeDays('2026-09-12', TODAY), '明天')
    assert.equal(formatRelativeDays('2026-09-14', TODAY), '还有 3 天')
  })

  it('formatNextDate', () => {
    assert.equal(formatNextDate(TODAY, TODAY), '今天')
    assert.equal(formatNextDate('2026-09-12', TODAY), '明天')
    assert.equal(formatNextDate('2026-09-18', TODAY), '还有 7 天')
    assert.equal(formatNextDate('2026-09-04', TODAY), '已过去 7 天')
  })
})
