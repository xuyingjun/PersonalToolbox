import { Lightbulb, Search, SlidersHorizontal, Trash2 } from 'lucide-react'
import { useState } from 'react'
import ToolPage from '../../components/layout/ToolPage.jsx'
import DataState from '../../components/ui/DataState.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { useLiveData } from '../../hooks/useLiveData.js'
import { deleteInspiration, listInspirations, saveInspiration } from './service.js'

export default function InspirationTool() {
  const [draft, setDraft] = useState({ content: '', tags: '' })
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('created')
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState('')
  const { data: records, error, loading } = useLiveData(() => listInspirations(sort), sort)
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN')
  const visibleRecords = records.filter((record) =>
    [record.content, ...record.tags].join(' ').toLocaleLowerCase('zh-CN').includes(normalizedQuery),
  )

  async function handleQuickSave(event) {
    event.preventDefault()
    setMessage('')
    try {
      await saveInspiration(draft)
      setDraft({ content: '', tags: '' })
      setMessage('已保存到本机。')
    } catch (saveError) {
      setMessage(saveError.message)
    }
  }

  async function handleDelete(record) {
    if (!window.confirm('确定删除这条灵感吗？此操作无法撤销。')) return
    await deleteInspiration(record.id)
    setEditing(null)
  }

  return (
    <ToolPage name="灵感记录" icon={Lightbulb}>
      <form className="quick-capture" onSubmit={handleQuickSave}>
        <label><span className="sr-only">灵感内容</span><textarea autoFocus rows="3" maxLength="2000" value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} placeholder="今天想到……" /></label>
        <label><span className="sr-only">标签</span><input maxLength="200" value={draft.tags} onChange={(event) => setDraft({ ...draft, tags: event.target.value })} placeholder="#公众号 #机器人 #控制理论" /></label>
        <div><small>{message}</small><button className="primary-button" type="submit">保存</button></div>
      </form>

      <div className="tool-controls inspiration-controls">
        <label className="compact-search"><Search size={18} /><span className="sr-only">搜索灵感</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索内容或标签" /></label>
        <label className="select-control"><SlidersHorizontal size={17} /><span className="sr-only">排序方式</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="created">最新创建</option><option value="updated">最近更新</option></select></label>
      </div>

      <DataState loading={loading} error={error} empty={!loading && records.length === 0} emptyText="保存第一条突然出现的想法。" />
      {!loading && records.length > 0 && visibleRecords.length === 0 && <DataState empty emptyText="没有匹配的灵感。" />}
      <div className="inspiration-list">
        {visibleRecords.map((record) => (
          <button className="inspiration-item" type="button" key={record.id} onClick={() => setEditing(record)}>
            <p>{record.content}</p>
            {record.tags.length > 0 && <span className="tag-list">{record.tags.map((tag) => <small key={tag}>#{tag}</small>)}</span>}
            <time>{new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(record.createdAt))}</time>
          </button>
        ))}
      </div>

      {editing && (
        <EditInspiration
          initialValue={editing}
          onClose={() => setEditing(null)}
          onDelete={() => handleDelete(editing)}
          onSave={async (value) => { await saveInspiration(value, editing.id); setEditing(null) }}
        />
      )}
    </ToolPage>
  )
}

function EditInspiration({ initialValue, onClose, onDelete, onSave }) {
  const [form, setForm] = useState({ ...initialValue, tags: initialValue.tags.join(' ') })
  const [formError, setFormError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')
    try {
      await onSave(form)
    } catch (error) {
      setFormError(error.message)
    }
  }

  return (
    <Modal title="编辑灵感" onClose={onClose}>
      <form className="tool-form" onSubmit={handleSubmit}>
        <label>内容<textarea autoFocus rows="6" maxLength="2000" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} /></label>
        <label>标签<input maxLength="200" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="用空格分隔" /></label>
        {formError && <p className="form-error">{formError}</p>}
        <button className="primary-button" type="submit">保存修改</button>
        <button className="danger-button" type="button" onClick={onDelete}><Trash2 size={18} />删除</button>
      </form>
    </Modal>
  )
}