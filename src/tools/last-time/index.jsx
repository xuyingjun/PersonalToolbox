import { Check, History, Plus, Search, SlidersHorizontal, Trash2 } from 'lucide-react'
import { useState } from 'react'
import ToolPage from '../../components/layout/ToolPage.jsx'
import DataState from '../../components/ui/DataState.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { useLiveData } from '../../hooks/useLiveData.js'
import { useToday } from '../../hooks/useToday.js'
import { formatDisplayDate, formatPastDays, toLocalDateString } from '../../utils/date.js'
import {
  deleteLastTimeRecord,
  listLastTimeRecords,
  markLastTimeToday,
  saveLastTimeRecord,
} from './service.js'

const EMPTY_FORM = { name: '', lastDate: toLocalDateString(), note: '' }

export default function LastTimeTool() {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('oldest')
  const [editing, setEditing] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const today = useToday()
  const { data: records, error, loading } = useLiveData(() => listLastTimeRecords(sort), sort)
  const selected = records.find((record) => record.id === selectedId)
  const visibleRecords = records.filter((record) =>
    record.name.toLocaleLowerCase('zh-CN').includes(query.trim().toLocaleLowerCase('zh-CN')),
  )

  async function handleDelete(record) {
    if (!window.confirm(`确定删除“${record.name}”吗？此操作无法撤销。`)) return
    await deleteLastTimeRecord(record.id)
    setSelectedId(null)
  }

  return (
    <ToolPage name="最后一次" icon={History}>
      <div className="tool-controls">
        <label className="compact-search">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">搜索事项</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索事项" />
        </label>
        <label className="select-control">
          <SlidersHorizontal size={17} aria-hidden="true" />
          <span className="sr-only">排序方式</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="oldest">最久未发生</option>
            <option value="newest">最近发生</option>
            <option value="updated">最近更新</option>
          </select>
        </label>
      </div>

      <DataState loading={loading} error={error} empty={!loading && records.length === 0} emptyText="还没有事项，点击右下角添加。" />
      {!loading && !error && records.length > 0 && visibleRecords.length === 0 && <DataState empty emptyText="没有匹配的事项。" />}
      <div className="record-list">
        {visibleRecords.map((record) => (
          <button className="record-row" type="button" key={record.id} onClick={() => setSelectedId(record.id)}>
            <span><strong>{record.name}</strong><small>{formatDisplayDate(record.lastDate)}</small></span>
            <b>{formatPastDays(record.lastDate, today)}</b>
          </button>
        ))}
      </div>

      <button className="floating-action" type="button" onClick={() => setEditing(EMPTY_FORM)} aria-label="新增事项"><Plus size={25} /></button>

      {editing && (
        <RecordForm
          initialValue={editing}
          onClose={() => setEditing(null)}
          onSave={async (value) => {
            await saveLastTimeRecord(value, editing.id)
            setEditing(null)
          }}
        />
      )}

      {selected && (
        <Modal title={selected.name} onClose={() => setSelectedId(null)}>
          <dl className="detail-list">
            <div><dt>上一次时间</dt><dd>{formatDisplayDate(selected.lastDate)}</dd></div>
            <div><dt>已经过去</dt><dd className="detail-emphasis">{formatPastDays(selected.lastDate, today)}</dd></div>
            <div><dt>备注</dt><dd>{selected.note || '无'}</dd></div>
          </dl>
          <div className="action-stack">
            <button className="primary-button" type="button" onClick={() => markLastTimeToday(selected.id)}><Check size={19} />今天做了</button>
            <button className="secondary-button" type="button" onClick={() => { setEditing(selected); setSelectedId(null) }}>编辑</button>
            <button className="danger-button" type="button" onClick={() => handleDelete(selected)}><Trash2 size={18} />删除</button>
          </div>
        </Modal>
      )}
    </ToolPage>
  )
}

function RecordForm({ initialValue, onClose, onSave }) {
  const [form, setForm] = useState(initialValue)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      await onSave(form)
    } catch (error) {
      setFormError(error.message)
      setSaving(false)
    }
  }

  return (
    <Modal title={initialValue.id ? '编辑事项' : '新增事项'} onClose={onClose}>
      <form className="tool-form" onSubmit={handleSubmit}>
        <label>事项名称<input autoFocus maxLength="80" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="例如：洗车" /></label>
        <label>上一次日期<input type="date" max={toLocalDateString()} value={form.lastDate} onChange={(event) => setForm({ ...form, lastDate: event.target.value })} /></label>
        <label>备注<textarea maxLength="500" rows="3" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="可选" /></label>
        {formError && <p className="form-error">{formError}</p>}
        <button className="primary-button" type="submit" disabled={saving}>{saving ? '保存中…' : '保存'}</button>
      </form>
    </Modal>
  )
}
