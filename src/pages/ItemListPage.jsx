import { ListChecks, Search } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import EmptyState from '../components/ui/EmptyState.jsx'
import DataState from '../components/ui/DataState.jsx'
import Fab from '../components/Fab.jsx'
import ItemCard from '../components/ItemCard.jsx'
import SearchBar from '../components/SearchBar.jsx'
import { useItemViewModels } from '../hooks/useItemViewModels.js'
import { recordToday } from '../services/eventService.js'
import { ITEM_SORTS, filterItemViewModels, sortItemViewModels } from '../services/viewModelService.js'

export default function ItemListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sortKey, setSortKey] = useState('attention')
  const [message, setMessage] = useState('')
  const { viewModels, today, loading, error } = useItemViewModels()

  const query = searchParams.get('q') ?? ''
  const visibleItems = sortItemViewModels(filterItemViewModels(viewModels ?? [], query), sortKey)
  const isEmpty = !loading && viewModels?.length === 0

  async function handleRecord(itemId) {
    try {
      await recordToday(itemId)
    } catch (recordError) {
      setMessage(recordError.message || '操作失败，请重试。')
    }
  }

  return (
    <div className="page list-page">
      <header className="page-header">
        <h1>全部</h1>
      </header>

      <div className="list-toolbar">
        <SearchBar
          value={query}
          onChange={(value) => setSearchParams(value.trim() ? { q: value.trim() } : {}, { replace: true })}
        />
        <label className="select-control">
          <span className="sr-only">排序方式</span>
          <select value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
            {ITEM_SORTS.map((sort) => (
              <option key={sort.key} value={sort.key}>{sort.label}</option>
            ))}
          </select>
        </label>
      </div>

      {message && <p className="page-message" role="status">{message}</p>}

      {loading ? (
        <DataState loading />
      ) : error ? (
        <DataState error />
      ) : isEmpty ? (
        <div className="empty-block">
          <EmptyState
            icon={ListChecks}
            title="还没有事项"
            description="记录一件事情最后一次发生的时间，LastTime 会帮你记住下一次。"
          />
        </div>
      ) : visibleItems.length > 0 ? (
        <div className="item-list">
          {visibleItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              today={today}
              showRecordButton
              onRecord={() => handleRecord(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="no-match">
          <Search aria-hidden="true" size={24} />
          <p>没有匹配的事项，换一个关键词试试。</p>
        </div>
      )}

      <Fab />
    </div>
  )
}
