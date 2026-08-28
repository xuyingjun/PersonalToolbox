import { Database, Download, Info, MonitorSmartphone, Palette, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useLiveData } from '../hooks/useLiveData.js'
import { clearAllData, exportBackup, readBackupFile, restoreBackup } from '../services/backupService.js'
import { DEFAULT_THEME, getSetting, setSetting, THEME_KEY } from '../services/settingsService.js'

export default function SettingsPage() {
  const fileInput = useRef(null)
  const [message, setMessage] = useState('')
  const { data: theme } = useLiveData(() => getSetting(THEME_KEY, DEFAULT_THEME), null, DEFAULT_THEME)
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

  async function runAction(action, successMessage) {
    setMessage('处理中…')
    try {
      await action()
      setMessage(successMessage)
    } catch (error) {
      if (error.name === 'AbortError') setMessage('操作已取消。')
      else setMessage(error.message || '操作失败，请重试。')
    }
  }

  async function handleImport(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const backup = await readBackupFile(file)
      if (!window.confirm('导入会覆盖当前所有数据。建议先导出备份，是否继续？')) return
      await runAction(() => restoreBackup(backup), '数据恢复成功。')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleClear() {
    if (!window.confirm('确定清空所有工具数据和设置吗？此操作无法撤销。')) return
    await runAction(clearAllData, '所有本机数据已清空。')
  }

  return (
    <div className="page simple-page">
      <header className="page-header">
        <p>本机优先</p>
        <h1>设置</h1>
      </header>
      <section className="settings-section">
        <div className="settings-title"><Palette size={20} /><h2>外观</h2></div>
        <div className="segmented-control" aria-label="外观模式">
          {[['system', '跟随系统'], ['light', '浅色'], ['dark', '深色']].map(([value, label]) => (
            <button className={theme === value ? 'is-selected' : ''} type="button" key={value} onClick={() => setSetting(THEME_KEY, value)}>{label}</button>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-title"><Database size={20} /><h2>数据</h2></div>
        <div className="settings-actions">
          <button type="button" onClick={() => runAction(exportBackup, '备份已导出。')}><Download size={19} /><span><strong>导出数据</strong><small>保存 JSON 备份</small></span></button>
          <button type="button" onClick={() => fileInput.current?.click()}><Upload size={19} /><span><strong>导入数据</strong><small>校验后覆盖本机数据</small></span></button>
          <button className="danger-row" type="button" onClick={handleClear}><Trash2 size={19} /><span><strong>清空所有数据</strong><small>此操作无法撤销</small></span></button>
        </div>
        <input ref={fileInput} className="sr-only" type="file" accept="application/json,.json" onChange={handleImport} />
        <p className="storage-note">数据只保存在此设备，iOS 可能在清理存储时删除网站数据。请定期导出备份并妥善保管。</p>
      </section>

      <section className="settings-section">
        <div className="settings-title"><MonitorSmartphone size={20} /><h2>应用</h2></div>
        <p className="settings-copy">{standalone ? '已从主屏幕运行。' : '在 iPhone Safari 中点击分享，然后选择“添加到主屏幕”。'}</p>
      </section>

      <section className="settings-section">
        <div className="settings-title"><Info size={20} /><h2>关于</h2></div>
        <p className="settings-copy">我的个人工具箱 · 版本 0.1.0</p>
      </section>
      {message && <p className="settings-message" role="status">{message}</p>}
    </div>
  )
}
