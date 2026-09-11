import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CycleSelector from '../components/CycleSelector.jsx'
import { ArrowLeft, ChevronRight, RotateCcw } from '../components/ui/AppIcon.jsx'
import DataState from '../components/ui/DataState.jsx'
import { formatCycleLabel } from '../db/schema.js'
import { useLiveData } from '../hooks/useLiveData.js'
import { useToday } from '../hooks/useToday.js'
import { getAllCategories } from '../services/categoryService.js'
import { createItemWithEvent, getItem, updateItem } from '../services/itemService.js'

const LAST_OPTIONS = [
  { key: 'today', label: '今天' },
  { key: 'pick', label: '选择日期' },
  { key: 'none', label: '暂不记录' },
]

// 新增 / 编辑共用页面。编辑模式不修改“上一次”（改历史走详情页历史记录）。
export default function ItemEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const today = useToday()
  const isEdit = Boolean(id)

  const { data: categories, loading: categoriesLoading } = useLiveData(() => getAllCategories(), null, [])
  const { data: item, loading: itemLoading } = useLiveData(() => (id ? getItem(id) : Promise.resolve(null)), id, null)

  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [cycleType, setCycleType] = useState('none')
  const [cycleValue, setCycleValue] = useState(null)
  const [note, setNote] = useState('')
  const [lastOption, setLastOption] = useState('today')
  const [eventDate, setEventDate] = useState(today)
  const [cycleOpen, setCycleOpen] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // 编辑模式：载入 Item 后填充表单
  useEffect(() => {
    if (!item) return
    setName(item.name)
    setCategoryId(item.categoryId)
    setCycleType(item.cycleType)
    setCycleValue(item.cycleValue)
    setNote(item.note ?? '')
  }, [item])

  // 新增模式：分类默认“生活”
  useEffect(() => {
    if (isEdit || categoriesLoading || categoryId) return
    const defaultCategory = categories.find((category) => category.name === '生活') ?? categories[0]
    if (defaultCategory) setCategoryId(defaultCategory.id)
  }, [categories, categoriesLoading, categoryId, isEdit])

  if (isEdit && itemLoading) return <div className="page"><DataState loading /></div>
  if (isEdit && !itemLoading && !item) return <div className="page"><DataState empty emptyText="事项不存在或已被删除。" /></div>

  function handleCycleSelect({ cycleType: type, cycleValue: value }) {
    setCycleType(type)
    setCycleValue(value)
    setCycleOpen(false)
  }

  async function handleSave(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = { name, categoryId, cycleType, cycleValue, note }
      if (isEdit) {
        await updateItem(id, data)
        navigate(`/items/${id}`)
      } else {
        const eventDateToUse = lastOption === 'none' ? null : eventDate
        await createItemWithEvent(data, eventDateToUse)
        navigate('/items')
      }
    } catch (saveError) {
      setError(saveError.message || '保存失败，请重试。')
      setBusy(false)
    }
  }

  return (
    <div className="page edit-page">
      <header className="detail-header">
        <Link className="icon-button" to={isEdit ? `/items/${id}` : '/items'} aria-label="返回">
          <ArrowLeft size={21} />
        </Link>
        <h1>{isEdit ? '编辑事项' : '新增事项'}</h1>
      </header>

      <form className="form" onSubmit={handleSave}>
        <label>
          名称
          <input
            type="text"
            value={name}
            maxLength={80}
            autoFocus={!isEdit}
            placeholder="例如：洗牙"
            required
            onChange={(changeEvent) => setName(changeEvent.target.value)}
          />
        </label>

        <label>
          分类
          <select value={categoryId} onChange={(changeEvent) => setCategoryId(changeEvent.target.value)}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>

        {isEdit ? (
          <p className="form-hint">如需修改历史记录，请前往详情页的历史记录。</p>
        ) : (
          <fieldset className="last-fieldset">
            <legend>上一次</legend>
            <div className="segmented-control">
              {LAST_OPTIONS.map((option) => (
                <button
                  className={lastOption === option.key ? 'is-selected' : ''}
                  key={option.key}
                  type="button"
                  onClick={() => setLastOption(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {lastOption === 'pick' && (
              <input
                className="last-date-input"
                type="date"
                max={today}
                value={eventDate}
                required
                onChange={(changeEvent) => setEventDate(changeEvent.target.value)}
              />
            )}
          </fieldset>
        )}

        <div className="form-label-row">
          <span className="form-label">周期</span>
          <button className="cycle-trigger" type="button" onClick={() => setCycleOpen(true)}>
            {formatCycleLabel(cycleType, cycleValue)}
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        </div>

        <label>
          备注
          <textarea
            rows={3}
            maxLength={500}
            value={note}
            placeholder="可选"
            onChange={(changeEvent) => setNote(changeEvent.target.value)}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="action-stack">
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? '保存中…' : '保存'}
          </button>
          <button className="secondary-button" type="button" onClick={() => navigate(-1)}>
            <RotateCcw size={16} aria-hidden="true" />
            取消
          </button>
        </div>
      </form>

      {cycleOpen && (
        <CycleSelector
          value={cycleType}
          customValue={cycleValue}
          onSelect={handleCycleSelect}
          onClose={() => setCycleOpen(false)}
        />
      )}
    </div>
  )
}
