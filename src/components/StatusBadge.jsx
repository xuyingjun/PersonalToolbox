import { STATUS } from '../services/statusService.js'

const LABELS = {
  [STATUS.NO_RECORD]: '无记录',
  [STATUS.NO_CYCLE]: '未设置周期',
  [STATUS.NORMAL]: '正常',
  [STATUS.UPCOMING]: '即将到期',
  [STATUS.DUE_TODAY]: '今天到期',
  [STATUS.OVERDUE]: '已过期',
}

const CLASSES = {
  [STATUS.NO_RECORD]: 'is-muted',
  [STATUS.NO_CYCLE]: 'is-muted',
  [STATUS.NORMAL]: 'is-normal',
  [STATUS.UPCOMING]: 'is-upcoming',
  [STATUS.DUE_TODAY]: 'is-due-today',
  [STATUS.OVERDUE]: 'is-overdue',
}

// 文字 + 颜色双重表达，不依赖颜色作为唯一含义。
export default function StatusBadge({ status }) {
  return <span className={`status-badge ${CLASSES[status] ?? 'is-muted'}`}>{LABELS[status] ?? '未知'}</span>
}
