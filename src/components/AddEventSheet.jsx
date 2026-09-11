import { useState } from 'react'
import { createEvent, updateEvent } from '../services/eventService.js'
import Modal from './ui/Modal.jsx'

// 添加 / 编辑历史记录。发生日期不能晚于今天。
export default function AddEventSheet({ itemId, event = null, today, onClose }) {
  const [eventDate, setEventDate] = useState(event?.eventDate ?? today)
  const [note, setNote] = useState(event?.note ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSave() {
    setBusy(true)
    setError('')
    try {
      if (event) await updateEvent(event.id, { eventDate, note })
      else await createEvent(itemId, eventDate, note)
      onClose()
    } catch (saveError) {
      setError(saveError.message || '保存失败，请重试。')
      setBusy(false)
    }
  }

  return (
    <Modal title={event ? '编辑记录' : '添加记录'} onClose={onClose}>
      <form
        className="form"
        onSubmit={(submitEvent) => {
          submitEvent.preventDefault()
          handleSave()
        }}
      >
        <label>
          发生日期
          <input
            type="date"
            max={today}
            value={eventDate}
            required
            onChange={(changeEvent) => setEventDate(changeEvent.target.value)}
          />
        </label>
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
        </div>
      </form>
    </Modal>
  )
}
