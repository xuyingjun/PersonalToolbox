import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AddEventSheet from '../components/AddEventSheet.jsx'
import DeleteConfirmDialog from '../components/DeleteConfirmDialog.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { ArrowLeft, CalendarPlus, Check, Pencil, Trash2 } from '../components/ui/AppIcon.jsx'
import DataState from '../components/ui/DataState.jsx'
import Modal from '../components/ui/Modal.jsx'
import { getCategoryIcon } from '../constants/categoryIcons.js'
import { useLiveData } from '../hooks/useLiveData.js'
import { useToday } from '../hooks/useToday.js'
import { deleteEvent, getEventsByItemId, recordToday } from '../services/eventService.js'
import { deleteItem } from '../services/itemService.js'
import { getItemViewModel } from '../services/viewModelService.js'
import { formatDate, formatNextDate, formatRelativeDays } from '../utils/date.js'

function formatInterval(days) {
  if (days == null) return null
  const rounded = Number(days.toFixed(1))
  return `${rounded} 天`
}

// 偏差展示：正数晚于周期（+N 天），负数早于周期（−N 天）
function formatSignedDays(days) {
  if (days == null) return '—'
  const rounded = Math.round(days)
  return rounded > 0 ? `+${rounded} 天` : `${rounded} 天`
}

// 详情页结构固定：名称/分类/最后一次/状态/今天做了/下一次/周期/历史记录/统计/备注/编辑/删除
export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const today = useToday()
  const { data: item, loading, error } = useLiveData(() => getItemViewModel(id, today), `${id}:${today}`, null)
  const { data: events, error: eventsError } = useLiveData(() => getEventsByItemId(id), id, [])

  const [historyOpen, setHistoryOpen] = useState(false)
  const [eventSheetOpen, setEventSheetOpen] = useState(false)
  const [returnToHistory, setReturnToHistory] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [confirmEventDelete, setConfirmEventDelete] = useState(null)
  const [confirmItemDelete, setConfirmItemDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function handleRecord() {
    try {
      await recordToday(id)
    } catch (recordError) {
      setMessage(recordError.message || '操作失败，请重试。')
    }
  }

  async function handleDeleteItem() {
    setBusy(true)
    try {
      await deleteItem(id)
      navigate('/items')
    } catch (deleteError) {
      setMessage(deleteError.message || '删除失败，请重试。')
      setConfirmItemDelete(false)
      setBusy(false)
    }
  }

  async function handleDeleteEvent() {
    setBusy(true)
    try {
      await deleteEvent(confirmEventDelete.id)
      setConfirmEventDelete(null)
      setHistoryOpen(true)
    } catch (deleteError) {
      setMessage(deleteError.message || '删除失败，请重试。')
    } finally {
      setBusy(false)
    }
  }

  // 从历史 Sheet 打开事件 Sheet 时先关历史 Sheet（防堆叠），关闭后自动回到历史
  function openEventSheet(event = null) {
    setEditingEvent(event)
    setReturnToHistory(historyOpen)
    setHistoryOpen(false)
    setEventSheetOpen(true)
  }

  function closeEventSheet() {
    setEventSheetOpen(false)
    if (returnToHistory) setHistoryOpen(true)
  }

  function confirmDeleteEvent(event) {
    setHistoryOpen(false)
    setConfirmEventDelete(event)
  }

  function closeDeleteEventDialog() {
    setConfirmEventDelete(null)
    setHistoryOpen(true)
  }

  if (loading) return <div className="page"><DataState loading /></div>
  if (error) return <div className="page"><DataState error /></div>
  if (!item) return <div className="page"><DataState empty emptyText="事项不存在或已被删除。" /></div>

  const statistics = item.statistics
  const deviation = statistics.deviation
  const hasIntervals = statistics.eventCount >= 2

  return (
    <div className="page detail-page">
      <header className="detail-header">
        <Link className="icon-button" to="/items" aria-label="返回">
          <ArrowLeft size={21} />
        </Link>
        <h1>{item.name}</h1>
        <Link className="icon-button" to={`/items/${item.id}/edit`} aria-label="编辑">
          <Pencil size={19} />
        </Link>
      </header>

      <div className="detail-summary">
        <span className="chip">
          <span aria-hidden="true">{getCategoryIcon(item.category, item.categoryIcon)}</span>
          {item.category}
        </span>
        <StatusBadge status={item.status} />
      </div>

      <button
        className="primary-button record-button"
        type="button"
        disabled={item.recordedToday}
        onClick={handleRecord}
      >
        {item.recordedToday ? (
          <><Check size={18} aria-hidden="true" />今天已记录</>
        ) : (
          '今天做了'
        )}
      </button>

      {message && <p className="page-message" role="status">{message}</p>}
      {eventsError && <p className="page-message" role="alert">历史记录读取失败，请重新打开页面。</p>}

      <dl className="detail-list">
        <div>
          <dt>最后一次</dt>
          <dd>
            {item.latestEvent
              ? `${formatDate(item.latestEvent.eventDate)}（${formatRelativeDays(item.latestEvent.eventDate, today)}）`
              : '还没有记录'}
          </dd>
        </div>
        <div>
          <dt>下一次</dt>
          <dd className="detail-emphasis">{item.nextDate ? formatNextDate(item.nextDate, today) : '不设置'}</dd>
        </div>
        <div>
          <dt>周期</dt>
          <dd>{item.cycle.label}</dd>
        </div>
        <div>
          <dt>备注</dt>
          <dd>{item.note || '无'}</dd>
        </div>
      </dl>

      <section className="detail-section">
        <div className="section-heading">
          <h2>历史记录</h2>
          <span>{statistics.eventCount} 次</span>
        </div>
        <button className="secondary-button wide-button" type="button" onClick={() => setHistoryOpen(true)}>
          <CalendarPlus size={17} aria-hidden="true" />
          查看并管理历史记录
        </button>
      </section>

      <section className="detail-section">
        <div className="section-heading">
          <h2>统计</h2>
        </div>
        {hasIntervals ? (
          <>
            <div className="stats-grid">
              <div className="stats-item"><strong>{statistics.eventCount}</strong><span>记录次数</span></div>
              <div className="stats-item"><strong>{formatInterval(statistics.averageInterval)}</strong><span>平均间隔</span></div>
              <div className="stats-item"><strong>{formatInterval(statistics.maximumInterval)}</strong><span>最长间隔</span></div>
              <div className="stats-item"><strong>{formatInterval(statistics.minimumInterval)}</strong><span>最短间隔</span></div>
              {deviation && (
                <>
                  <div className="stats-item"><strong>{deviation.onTimeRate}%</strong><span>准时率</span></div>
                  <div className="stats-item"><strong>{formatSignedDays(deviation.averageDeviation)}</strong><span>平均偏差</span></div>
                </>
              )}
            </div>
            {deviation && (
              <p className="stats-note">准时率：间隔不超过设定周期的比例；偏差为正表示平均晚于周期，为负表示早于。</p>
            )}
          </>
        ) : (
          <p className="empty-inline">记录两次以上后可查看间隔统计。</p>
        )}
      </section>

      <div className="detail-actions">
        <Link className="secondary-button" to={`/items/${item.id}/edit`}>编辑</Link>
        <button className="danger-button" type="button" onClick={() => setConfirmItemDelete(true)}>删除</button>
      </div>

      {historyOpen && (
        <Modal title="历史记录" onClose={() => setHistoryOpen(false)}>
          {events.length === 0 ? (
            <p className="empty-inline">还没有记录。</p>
          ) : (
            <div className="history-list">
              {events.map((event) => (
                <div className="history-row" key={event.id}>
                  <div className="history-copy">
                    <strong>{formatDate(event.eventDate)}</strong>
                    {event.note && <span>{event.note}</span>}
                  </div>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label="编辑这条记录"
                    onClick={() => openEventSheet(event)}
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label="删除这条记录"
                    onClick={() => confirmDeleteEvent(event)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="action-stack">
            <button className="primary-button" type="button" onClick={() => openEventSheet()}>
              <CalendarPlus size={17} aria-hidden="true" />
              添加记录
            </button>
          </div>
        </Modal>
      )}

      {eventSheetOpen && (
        <AddEventSheet
          itemId={item.id}
          event={editingEvent}
          today={today}
          onClose={closeEventSheet}
        />
      )}

      {confirmEventDelete && (
        <DeleteConfirmDialog
          title="删除记录"
          message={`确定删除 ${formatDate(confirmEventDelete.eventDate)} 这条记录吗？`}
          busy={busy}
          onConfirm={handleDeleteEvent}
          onClose={closeDeleteEventDialog}
        />
      )}

      {confirmItemDelete && (
        <DeleteConfirmDialog
          title="删除事项"
          message="确定删除这个事项吗？删除后，该事项的历史记录也会被删除。"
          busy={busy}
          onConfirm={handleDeleteItem}
          onClose={() => setConfirmItemDelete(false)}
        />
      )}
    </div>
  )
}
