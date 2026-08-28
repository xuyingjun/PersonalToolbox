import { CalendarClock, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import ToolPage from '../../components/layout/ToolPage.jsx'
import DataState from '../../components/ui/DataState.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { useLiveData } from '../../hooks/useLiveData.js'
import { useToday } from '../../hooks/useToday.js'
import { formatCountdownDays, formatDisplayDate, toLocalDateString } from '../../utils/date.js'
import { deleteCountdown, listCountdowns, saveCountdown } from './service.js'

const EMPTY_FORM = { name: '', targetDate: toLocalDateString(), note: '' }

export default function CountdownTool() {
  const [editing, setEditing] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const today = useToday()
  const { data: records, error, loading } = useLiveData(listCountdowns)
  const selected = records.find((record) => record.id === selectedId)

  async function handleDelete(record) {
    if (!window.confirm(`确定删除“${record.name}”吗？此操作无法撤销。`)) return
    await deleteCountdown(record.id)
    setSelectedId(null)
  }

  return (
    <ToolPage name="倒计时" icon={CalendarClock}>
      <DataState loading={loading} error={error} empty={!loading && records.length === 0} emptyText="还没有倒计时，点击右下角添加。" />
      <div className="record-list countdown-list">
        {records.map((record) => (
          <button className="record-row" type="button" key={record.id} onClick={() => setSelectedId(record.id)}>
            <span><strong>{record.name}</strong><small>{formatDisplayDate(record.targetDate)}</small></span>
            <b className={record.targetDate < today ? 'is-overdue' : ''}>{formatCountdownDays(record.targetDate, today)}</b>
          </button>
        ))}
      </div>
      <button className="floating-action" type="button" onClick={() => setEditing(EMPTY_FORM)} aria-label="新增倒计时"><Plus size={25} /></button>

      {editing && (
        <CountdownForm
          initialValue={editing}
          onClose={() => setEditing(null)}
          onSave={async (value) => {
            await saveCountdown(value, editing.id)
            setEditing(null)
          }}
        />
      )}

      {selected && (
        <Modal title={selected.name} onClose={() => setSelectedId(null)}>
          <dl className="detail-list">
            <div><dt>目标日期</dt><dd>{formatDisplayDate(selected.targetDate)}</dd></div>
            <div><dt>时间状态</dt><dd className="detail-emphasis">{formatCountdownDays(selected.targetDate, today)}</dd></div>
            <div><dt>备注</dt><dd>{selected.note || '无'}</dd></div>
          </dl>
          <div className="action-stack">
            <button className="primary-button" type="button" onClick={() => { setEditing(selected); setSelectedId(null) }}>编辑</button>
            <button className="danger-button" type="button" onClick={() => handleDelete(selected)}><Trash2 size={18} />删除</button>
          </div>
        </Modal>
      )}
    </ToolPage>
  )
}

function CountdownForm({ initialValue, onClose, onSave }) {
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
    <Modal title={initialValue.id ? '编辑倒计时' : '新增倒计时'} onClose={onClose}>
      <form className="tool-form" onSubmit={handleSubmit}>
        <label>名称<input autoFocus maxLength="80" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="例如：孩子生日" /></label>
        <label>目标日期<input type="date" min={initialValue.id ? undefined : toLocalDateString()} value={form.targetDate} onChange={(event) => setForm({ ...form, targetDate: event.target.value })} /></label>
        <label>备注<textarea maxLength="500" rows="3" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="可选" /></label>
        {formError && <p className="form-error">{formError}</p>}
        <button className="primary-button" type="submit" disabled={saving}>{saving ? '保存中…' : '保存'}</button>
      </form>
    </Modal>
  )
}
