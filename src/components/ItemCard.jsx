import { Link } from 'react-router-dom'
import { getCategoryIcon } from '../constants/categoryIcons.js'
import { formatNextDate, formatRelativeDays } from '../utils/date.js'
import StatusBadge from './StatusBadge.jsx'

// 纯展示组件：所有列表共用。数据库操作一律走 Service。
export default function ItemCard({ item, today, showRecordButton = false, onRecord }) {
  return (
    <div className="item-card">
      <Link className="item-card-main" to={`/items/${item.id}`}>
        <div className="item-card-head">
          <strong className="item-card-name">{item.name}</strong>
          <StatusBadge status={item.status} />
        </div>
        <div className="item-card-meta">
          <span>{getCategoryIcon(item.category, item.categoryIcon)} {item.category}</span>
          <span>
            最后一次：
            {item.latestEvent ? formatRelativeDays(item.latestEvent.eventDate, today) : '还没有记录'}
          </span>
          {item.nextDate && <span>下一次：{formatNextDate(item.nextDate, today)}</span>}
        </div>
      </Link>
      {showRecordButton && (
        <button
          className="item-card-button"
          type="button"
          disabled={item.recordedToday}
          onClick={onRecord}
        >
          {item.recordedToday ? '今天已记录' : '今天做了'}
        </button>
      )}
    </div>
  )
}
