import { useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import { useLiveData } from '../../hooks/useLiveData.js'
import {
  DEFAULT_UPCOMING_THRESHOLD,
  getSetting,
  MAX_UPCOMING_THRESHOLD,
  MIN_UPCOMING_THRESHOLD,
  setSetting,
  UPCOMING_THRESHOLD_KEY,
} from '../../services/settingsService.js'

export default function ReminderSettingsPage() {
  const { data: savedValue, error } = useLiveData(
    () => getSetting(UPCOMING_THRESHOLD_KEY, DEFAULT_UPCOMING_THRESHOLD),
    null,
    DEFAULT_UPCOMING_THRESHOLD,
  )
  const [value, setValue] = useState(DEFAULT_UPCOMING_THRESHOLD)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => setValue(savedValue), [savedValue])

  async function handleSave() {
    setBusy(true)
    setMessage('')
    try {
      await setSetting(UPCOMING_THRESHOLD_KEY, value)
      setMessage('关注范围已保存。')
    } catch (saveError) {
      setMessage(saveError.message || '保存失败，请重试。')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="settings-subpage">
      <PageHeader title="关注范围" />
      <main className="settings-subpage-content settings-card-stack">
        <section className="settings-detail-card threshold-card">
          <div className="threshold-value"><strong>{value}</strong><span>天</span></div>
          <p>事项距离下次日期不超过该天数时，会出现在首页“需要关注”中。</p>
          <input
            type="range"
            min={MIN_UPCOMING_THRESHOLD}
            max={MAX_UPCOMING_THRESHOLD}
            value={value}
            aria-label="提前关注天数"
            onChange={(event) => setValue(Number(event.target.value))}
          />
          <div className="threshold-scale"><span>{MIN_UPCOMING_THRESHOLD} 天</span><span>{MAX_UPCOMING_THRESHOLD} 天</span></div>
          <button className="primary-button wide-button" type="button" disabled={busy || value === savedValue} onClick={handleSave}>
            {busy ? '保存中…' : '保存设置'}
          </button>
        </section>
        {error && <p className="settings-message" role="alert">设置读取失败，请重新打开页面。</p>}
        {message && <p className="settings-message" role="status">{message}</p>}
      </main>
    </div>
  )
}
