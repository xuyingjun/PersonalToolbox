// ViewModel 层：一次性读取 items + events + categories，在内存中推导
// latestEvent / elapsedDays / nextDate / status / statistics，禁止 N+1 查询。
// 派生数据（nextDate / status / statistics）只存在于 ViewModel，绝不落库。
import { db } from '../db/db.js'
import { formatCycleLabel } from '../db/schema.js'
import { getTodayString } from '../utils/date.js'
import { calculateStatisticsFromEvents } from './statisticsService.js'
import {
  DEFAULT_UPCOMING_THRESHOLD,
  STATUS,
  calculateAttentionLevel,
  calculateElapsedDays,
  calculateNextDate,
  calculateStatus,
} from './statusService.js'
import { getSetting, UPCOMING_THRESHOLD_KEY } from './settingsService.js'

// “最需要关注”排序权重（含 NORMAL/NO_CYCLE/NO_RECORD 的整体顺序）
const STATUS_RANK = {
  [STATUS.OVERDUE]: 0,
  [STATUS.DUE_TODAY]: 1,
  [STATUS.UPCOMING]: 2,
  [STATUS.NORMAL]: 3,
  [STATUS.NO_CYCLE]: 4,
  [STATUS.NO_RECORD]: 5,
}

function compareNames(first, second) {
  return first.name.localeCompare(second.name, 'zh-CN')
}

// 纯函数：单遍流水线构建全部 ViewModel，便于单元测试。
export function buildItemViewModels({ items, events, categories, today = getTodayString(), upcomingThreshold = DEFAULT_UPCOMING_THRESHOLD }) {
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]))
  const eventsByItem = new Map()
  for (const event of events) {
    if (!eventsByItem.has(event.itemId)) eventsByItem.set(event.itemId, [])
    eventsByItem.get(event.itemId).push(event)
  }

  return items.map((item) => {
    const sortedEvents = (eventsByItem.get(item.id) ?? []).toSorted((first, second) =>
      first.eventDate.localeCompare(second.eventDate),
    )
    const latestEvent = sortedEvents.at(-1) ?? null

    const status = calculateStatus(item, latestEvent, { today, upcomingThreshold })
    return {
      id: item.id,
      name: item.name,
      category: categoryNames.get(item.categoryId) ?? '未分类',
      categoryId: item.categoryId,
      note: item.note ?? '',
      latestEvent,
      elapsedDays: calculateElapsedDays(latestEvent, today),
      cycle: {
        type: item.cycleType ?? 'none',
        value: item.cycleValue ?? null,
        label: formatCycleLabel(item.cycleType, item.cycleValue),
      },
      nextDate: calculateNextDate(item, latestEvent),
      status,
      attentionLevel: calculateAttentionLevel(status),
      recordedToday: sortedEvents.some((event) => event.eventDate === today),
      statistics: calculateStatisticsFromEvents(sortedEvents),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }
  })
}

export async function loadViewModelData() {
  const [items, events, categories, threshold] = await Promise.all([
    db.items.toArray(),
    db.events.toArray(),
    db.categories.toArray(),
    getSetting(UPCOMING_THRESHOLD_KEY, DEFAULT_UPCOMING_THRESHOLD),
  ])
  return { items, events, categories, upcomingThreshold: threshold }
}

export async function getAllItemViewModels() {
  const data = await loadViewModelData()
  return buildItemViewModels(data)
}

export async function getItemViewModel(itemId, today = getTodayString()) {
  const item = await db.items.get(itemId)
  if (!item) return null
  const [events, category, upcomingThreshold] = await Promise.all([
    db.events.where('itemId').equals(itemId).toArray(),
    db.categories.get(item.categoryId),
    getSetting(UPCOMING_THRESHOLD_KEY, DEFAULT_UPCOMING_THRESHOLD),
  ])
  return buildItemViewModels({
    items: [item],
    events,
    categories: category ? [category] : [],
    today,
    upcomingThreshold,
  })[0]
}

// 搜索范围：name / note / category
export function filterItemViewModels(list, keyword) {
  const query = keyword.trim().toLocaleLowerCase('zh-CN')
  if (!query) return list
  return list.filter((item) =>
    [item.name, item.note, item.category].some((text) => text.toLocaleLowerCase('zh-CN').includes(query)),
  )
}

export const ITEM_SORTS = [
  { key: 'attention', label: '最需要关注' },
  { key: 'recent', label: '最近记录' },
  { key: 'oldest', label: '最久没记录' },
  { key: 'updated', label: '最近修改' },
]

export function sortItemViewModels(list, sortKey) {
  const sorted = [...list]

  if (sortKey === 'recent') {
    return sorted.sort((first, second) => {
      if (!first.latestEvent) return 1 // 无记录的排最后
      if (!second.latestEvent) return -1
      const byDate = second.latestEvent.eventDate.localeCompare(first.latestEvent.eventDate)
      return byDate !== 0 ? byDate : compareNames(first, second)
    })
  }

  if (sortKey === 'oldest') {
    return sorted.sort((first, second) => {
      if (!first.latestEvent) return -1 // 从未记录 = 最久
      if (!second.latestEvent) return 1
      const byDate = first.latestEvent.eventDate.localeCompare(second.latestEvent.eventDate)
      return byDate !== 0 ? byDate : compareNames(first, second)
    })
  }

  if (sortKey === 'updated') {
    return sorted.sort((first, second) => {
      const byDate = (second.updatedAt ?? '').localeCompare(first.updatedAt ?? '')
      return byDate !== 0 ? byDate : compareNames(first, second)
    })
  }

  // 默认：最需要关注
  // OVERDUE → DUE_TODAY → UPCOMING → NORMAL → NO_CYCLE → NO_RECORD
  // 组内按 nextDate 升序（过期最久/即将到期最先），再按最近记录、名称
  return sorted.sort((first, second) => {
    const byRank = (STATUS_RANK[first.status] ?? 99) - (STATUS_RANK[second.status] ?? 99)
    if (byRank !== 0) return byRank
    if (first.nextDate && second.nextDate) {
      const byNext = first.nextDate.localeCompare(second.nextDate)
      if (byNext !== 0) return byNext
    }
    const firstDate = first.latestEvent?.eventDate ?? ''
    const secondDate = second.latestEvent?.eventDate ?? ''
    const byLatest = secondDate.localeCompare(firstDate)
    return byLatest !== 0 ? byLatest : compareNames(first, second)
  })
}
