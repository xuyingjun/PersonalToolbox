import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  STATUS,
  calculateAttentionLevel,
  calculateElapsedDays,
  calculateNextDate,
  calculateStatus,
} from '../src/services/statusService.js'

const TODAY = '2026-09-11'

function item(cycleType = 'daily', cycleValue = null) {
  return { id: 'item-1', name: '测试事项', categoryId: 'c-1', cycleType, cycleValue, note: '' }
}

describe('calculateNextDate', () => {
  it('无记录返回 null', () => {
    assert.equal(calculateNextDate(item(), null), null)
  })

  it('按周期从 latestEvent 推导', () => {
    assert.equal(calculateNextDate(item('weekly'), { eventDate: '2026-09-04' }), '2026-09-11')
    assert.equal(calculateNextDate(item('custom', 30), { eventDate: '2026-09-04' }), '2026-10-04')
  })

  it('无周期返回 null', () => {
    assert.equal(calculateNextDate(item('none'), { eventDate: '2026-09-04' }), null)
  })
})

describe('calculateElapsedDays', () => {
  it('过去为正数，今天为 0', () => {
    assert.equal(calculateElapsedDays({ eventDate: '2026-09-01' }, TODAY), 10)
    assert.equal(calculateElapsedDays({ eventDate: TODAY }, TODAY), 0)
    assert.equal(calculateElapsedDays(null, TODAY), null)
  })
})

describe('calculateStatus', () => {
  it('无记录 → NO_RECORD', () => {
    assert.equal(calculateStatus(item(), null, { today: TODAY }), STATUS.NO_RECORD)
  })

  it('有记录但无周期 → NO_CYCLE', () => {
    assert.equal(calculateStatus(item('none'), { eventDate: '2026-09-01' }, { today: TODAY }), STATUS.NO_CYCLE)
  })

  it('今天到期 → DUE_TODAY', () => {
    // 每天 + 昨天发生 = 今天到期
    assert.equal(calculateStatus(item('daily'), { eventDate: '2026-09-10' }, { today: TODAY }), STATUS.DUE_TODAY)
  })

  it('已过期 → OVERDUE', () => {
    assert.equal(calculateStatus(item('daily'), { eventDate: '2026-09-01' }, { today: TODAY }), STATUS.OVERDUE)
  })

  it('7 天内 → UPCOMING（含边界）', () => {
    assert.equal(calculateStatus(item('weekly'), { eventDate: '2026-09-04' }, { today: TODAY }), STATUS.DUE_TODAY)
    // 距下次 1 天
    assert.equal(calculateStatus(item('weekly'), { eventDate: '2026-09-05' }, { today: TODAY }), STATUS.UPCOMING)
    // 距下次正好 7 天
    assert.equal(calculateStatus(item('custom', 7), { eventDate: '2026-09-11' }, { today: TODAY }), STATUS.UPCOMING)
  })

  it('超过阈值 → NORMAL', () => {
    assert.equal(calculateStatus(item('custom', 8), { eventDate: '2026-09-11' }, { today: TODAY }), STATUS.NORMAL)
  })

  it('自定义阈值生效', () => {
    assert.equal(calculateStatus(item('custom', 8), { eventDate: '2026-09-11' }, { today: TODAY, upcomingThreshold: 10 }), STATUS.UPCOMING)
  })

  it('非法 custom 无法推导 nextDate → NO_CYCLE（防御）', () => {
    assert.equal(calculateStatus(item('custom', 0), { eventDate: '2026-09-11' }, { today: TODAY }), STATUS.NO_CYCLE)
  })
})

describe('calculateAttentionLevel', () => {
  it('OVERDUE < DUE_TODAY < UPCOMING，其余不进入关注', () => {
    assert.equal(calculateAttentionLevel(STATUS.OVERDUE), 0)
    assert.equal(calculateAttentionLevel(STATUS.DUE_TODAY), 1)
    assert.equal(calculateAttentionLevel(STATUS.UPCOMING), 2)
    assert.equal(calculateAttentionLevel(STATUS.NORMAL), null)
    assert.equal(calculateAttentionLevel(STATUS.NO_CYCLE), null)
    assert.equal(calculateAttentionLevel(STATUS.NO_RECORD), null)
  })
})
