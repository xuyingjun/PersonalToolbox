import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { calculateCycleDeviation, recommendCycle } from '../src/services/statisticsService.js'

// 纯函数测试，无需 fake-indexeddb
const events = (...dates) => dates.map((eventDate) => ({ eventDate }))

describe('calculateCycleDeviation', () => {
  it('少于 2 条 / 无周期 / 非法 custom 返回 null', () => {
    assert.equal(calculateCycleDeviation({ eventsAsc: events('2026-01-01'), cycleType: 'weekly', cycleValue: null }), null)
    assert.equal(calculateCycleDeviation({ eventsAsc: events('2026-01-01', '2026-01-08'), cycleType: 'none', cycleValue: null }), null)
    assert.equal(calculateCycleDeviation({ eventsAsc: events('2026-01-01', '2026-01-08'), cycleType: 'custom', cycleValue: null }), null)
    assert.equal(calculateCycleDeviation({ eventsAsc: null, cycleType: 'weekly', cycleValue: null }), null)
  })

  it('精确周期间隔 → 偏差全 0、准时率 100', () => {
    const result = calculateCycleDeviation({
      eventsAsc: events('2026-09-01', '2026-09-08', '2026-09-15'),
      cycleType: 'weekly',
      cycleValue: null,
    })
    assert.deepEqual(result, { pairCount: 2, averageDeviation: 0, latestDeviation: 0, maxDeviation: 0, onTimeRate: 100 })
  })

  it('每天周期但间隔 4 天 → 偏差 +3、准时率 0', () => {
    const result = calculateCycleDeviation({
      eventsAsc: events('2026-01-01', '2026-01-05', '2026-01-09'),
      cycleType: 'daily',
      cycleValue: null,
    })
    assert.deepEqual(result, { pairCount: 2, averageDeviation: 3, latestDeviation: 3, maxDeviation: 3, onTimeRate: 0 })
  })

  it('混合早晚的月度记录 → 平均/最新/准时率正确', () => {
    const result = calculateCycleDeviation({
      eventsAsc: events('2026-01-31', '2026-02-20', '2026-03-25'),
      cycleType: 'monthly',
      cycleValue: null,
    })
    // 01-31 → 02-20：期望 02-28（28 天），实际 20 天，偏差 −8
    // 02-20 → 03-25：期望 03-20（28 天），实际 33 天，偏差 +5
    assert.equal(result.pairCount, 2)
    assert.equal(result.averageDeviation, -1.5)
    assert.equal(result.latestDeviation, 5)
    assert.equal(result.maxDeviation, 5)
    assert.equal(result.onTimeRate, 50)
  })

  it('月末钳制与闰年按 addCycle 语义逐对推算', () => {
    const leap = calculateCycleDeviation({
      eventsAsc: events('2024-01-31', '2024-02-29', '2024-03-31'),
      cycleType: 'monthly',
      cycleValue: null,
    })
    // 01-31 → 02-29：期望 29（闰年），实际 29，偏差 0
    // 02-29 → 03-31：期望 03-29（29 天），实际 31，偏差 +2
    assert.equal(leap.averageDeviation, 1)
    assert.equal(leap.latestDeviation, 2)
    assert.equal(leap.onTimeRate, 50)
  })

  it('custom 周期精确吻合 → 偏差 0', () => {
    const result = calculateCycleDeviation({
      eventsAsc: events('2026-01-01', '2026-01-11', '2026-01-21'),
      cycleType: 'custom',
      cycleValue: 10,
    })
    assert.equal(result.averageDeviation, 0)
    assert.equal(result.onTimeRate, 100)
  })

  it('乱序入参与升序结果一致', () => {
    const sorted = calculateCycleDeviation({
      eventsAsc: events('2026-01-01', '2026-01-05', '2026-01-09'),
      cycleType: 'daily',
      cycleValue: null,
    })
    const unsorted = calculateCycleDeviation({
      eventsAsc: events('2026-01-09', '2026-01-01', '2026-01-05'),
      cycleType: 'daily',
      cycleValue: null,
    })
    assert.deepEqual(unsorted, sorted)
  })
})

describe('recommendCycle', () => {
  it('少于 2 条 / 非法日期 / 间隔不足 1 天返回 null', () => {
    assert.equal(recommendCycle(events('2026-01-01')), null)
    assert.equal(recommendCycle(['bad-date', '2026-01-01']), null)
    assert.equal(recommendCycle(events('2026-01-01', '2026-01-01')), null)
    assert.equal(recommendCycle(null), null)
  })

  it('中位数命中各预设', () => {
    assert.equal(recommendCycle(events('2026-01-01', '2026-01-02')).cycleType, 'daily')
    assert.equal(recommendCycle(events('2026-01-01', '2026-01-08', '2026-01-15')).cycleType, 'weekly')
    assert.equal(recommendCycle(events('2026-01-01', '2026-01-15', '2026-01-29')).cycleType, 'biweekly')
    assert.equal(recommendCycle(events('2026-01-01', '2026-01-31', '2026-03-02')).cycleType, 'monthly')
    assert.equal(recommendCycle(events('2026-01-01', '2026-04-02', '2026-07-02')).cycleType, 'quarterly')
    assert.equal(recommendCycle(events('2026-01-01', '2026-07-01', '2027-01-01')).cycleType, 'halfYear')
    assert.equal(recommendCycle(events('2026-01-01', '2027-01-01', '2028-01-01')).cycleType, 'yearly')
  })

  it('中位数 10 → 每周、11 → 每两周；10.5 超出 3 天门槛退回自定义', () => {
    assert.equal(recommendCycle(events('2026-01-01', '2026-01-11', '2026-01-21')).cycleType, 'weekly')
    assert.equal(recommendCycle(events('2026-01-01', '2026-01-12', '2026-01-23')).cycleType, 'biweekly')
    assert.deepEqual(recommendCycle(events('2026-01-01', '2026-01-11', '2026-01-22')),
      { medianInterval: 10.5, sampleCount: 3, cycleType: 'custom', cycleValue: 11 })
  })

  it('远离预设时退回自定义并钳制上限', () => {
    assert.deepEqual(recommendCycle(events('2026-01-01', '2026-01-21', '2026-02-10')),
      { medianInterval: 20, sampleCount: 3, cycleType: 'custom', cycleValue: 20 })
    assert.deepEqual(recommendCycle(events('2026-01-01', '2027-02-05', '2028-03-11')),
      { medianInterval: 400, sampleCount: 3, cycleType: 'custom', cycleValue: 400 })
    assert.equal(recommendCycle(events('1900-01-01', '1913-10-07', '1927-07-13')).cycleValue, 3650)
  })

  it('接受字符串数组与 Event 对象，降序入参同样正确', () => {
    const fromStrings = recommendCycle(['2026-01-01', '2026-01-08', '2026-01-15'])
    const fromDescObjects = recommendCycle(events('2026-01-15', '2026-01-08', '2026-01-01'))
    assert.equal(fromStrings.cycleType, 'weekly')
    assert.equal(fromStrings.sampleCount, 3)
    assert.deepEqual(fromDescObjects, fromStrings)
  })
})
