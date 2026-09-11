import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmptyState from '../components/ui/EmptyState.jsx'
import DataState from '../components/ui/DataState.jsx'
import Fab from '../components/Fab.jsx'
import ItemCard from '../components/ItemCard.jsx'
import SearchBar from '../components/SearchBar.jsx'
import { History } from '../components/ui/AppIcon.jsx'
import { useItemViewModels } from '../hooks/useItemViewModels.js'
import { recordToday } from '../services/eventService.js'
import { sortItemViewModels } from '../services/viewModelService.js'

// 首页定位：打开 App 第一眼就知道哪些事情需要关注。
export default function HomePage() {
  const navigate = useNavigate()
  const { viewModels, today, loading, error } = useItemViewModels()
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')

  // 首页搜索框输入即跳转到“全部”页搜索（单一搜索状态源）
  function handleSearch(value) {
    setQuery(value)
    const keyword = value.trim()
    navigate(keyword ? `/items?q=${encodeURIComponent(keyword)}` : '/items', { replace: true })
  }

  async function handleRecord(itemId) {
    try {
      await recordToday(itemId)
    } catch (recordError) {
      setMessage(recordError.message || '操作失败，请重试。')
    }
  }

  if (loading || !viewModels) return <div className="page"><DataState loading /></div>
  if (error) return <div className="page"><DataState error /></div>

  const isEmpty = viewModels.length === 0
  const attentionItems = sortItemViewModels(
    viewModels.filter((item) => item.attentionLevel !== null),
    'attention',
  )
  const recentItems = sortItemViewModels(
    viewModels.filter((item) => item.latestEvent),
    'recent',
  ).slice(0, 5)

  return (
    <div className="page home-page">
      <header className="home-header">
        <span className="brand-mark" aria-hidden="true">
          <History size={24} strokeWidth={1.8} />
        </span>
        <div>
          <h1>上次</h1>
          <span>记录生活中那些“最后一次”的时刻。</span>
        </div>
      </header>

      <SearchBar value={query} onChange={handleSearch} placeholder="搜索名称、分类或备注" />

      {message && <p className="page-message" role="status">{message}</p>}

      {isEmpty ? (
        <div className="empty-block">
          <EmptyState
            icon={History}
            title="还没有记录"
            description="记录一件事情最后一次发生的时间，上次会帮你记住下一次。"
          />
          <button className="primary-button" type="button" onClick={() => navigate('/items/new')}>
            添加第一件事
          </button>
        </div>
      ) : (
        <>
          <section className="page-section">
            <div className="section-heading">
              <h2>需要关注</h2>
              <span>{attentionItems.length} 件</span>
            </div>
            {attentionItems.length > 0 ? (
              <div className="item-list">
                {attentionItems.map((item) => (
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
              <p className="empty-inline">没有需要关注的事项。</p>
            )}
          </section>

          {recentItems.length > 0 && (
            <section className="page-section">
              <div className="section-heading">
                <h2>最近记录</h2>
              </div>
              <div className="item-list">
                {recentItems.map((item) => (
                  <ItemCard key={item.id} item={item} today={today} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <Fab />
    </div>
  )
}
