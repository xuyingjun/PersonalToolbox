import { CalendarClock, History, Lightbulb } from 'lucide-react'

export const toolCategories = ['生活', '工作', '学习']

export const toolRegistry = [
  {
    id: 'last-time',
    name: '最后一次',
    description: '记录日常事项上一次发生的时间',
    icon: History,
    category: '生活',
    path: '/tools/last-time',
    enabled: true,
    keywords: ['时间', '记录', '生活'],
  },
  {
    id: 'countdown',
    name: '倒计时',
    description: '记住重要日期与剩余天数',
    icon: CalendarClock,
    category: '生活',
    path: '/tools/countdown',
    enabled: true,
    keywords: ['日期', '时间', '截止'],
  },
  {
    id: 'inspiration',
    name: '灵感记录',
    description: '快速收下突然出现的想法',
    icon: Lightbulb,
    category: '学习',
    path: '/tools/inspiration',
    enabled: true,
    keywords: ['想法', '笔记', '记录'],
  },
]

export const enabledTools = toolRegistry.filter((tool) => tool.enabled)
