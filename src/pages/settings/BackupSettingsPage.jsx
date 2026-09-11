import { useEffect, useRef, useState } from 'react'
import ImportConfirmDialog from '../../components/ImportConfirmDialog.jsx'
import PageHeader from '../../components/layout/PageHeader.jsx'
import { Download, RefreshCw, Upload } from '../../components/ui/AppIcon.jsx'
import { exportBackup, readBackupFile, restoreBackup } from '../../services/backupService.js'
import { detectLegacyData, runMigration } from '../../services/migrationService.js'

export default function BackupSettingsPage() {
  const fileInput = useRef(null)
  const [pendingBackup, setPendingBackup] = useState(null)
  const [legacy, setLegacy] = useState(null)
  const [busy, setBusy] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    detectLegacyData()
      .then((result) => { if (!cancelled) setLegacy(result) })
      .catch(() => { if (!cancelled) setLegacy({ found: false, count: 0 }) })
    return () => { cancelled = true }
  }, [])

  async function handleExport() {
    setBusy(true)
    try {
      await exportBackup()
      setMessage('备份已导出。')
    } catch (error) {
      setMessage(error.name === 'AbortError' ? '操作已取消。' : error.message || '导出失败，请重试。')
    } finally {
      setBusy(false)
    }
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      setPendingBackup(await readBackupFile(file))
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleConfirmImport() {
    setBusy(true)
    try {
      await restoreBackup(pendingBackup)
      setPendingBackup(null)
      setMessage('数据恢复成功。')
    } catch (error) {
      setPendingBackup(null)
      setMessage(error.message || '导入失败，请重试。')
    } finally {
      setBusy(false)
    }
  }

  async function handleMigration() {
    setMigrating(true)
    try {
      const result = await runMigration()
      setMessage(result.migrated
        ? `迁移成功：${result.itemCount} 条事项、${result.eventCount} 条记录。`
        : '没有需要迁移的数据。')
      setLegacy({ found: false, count: 0 })
    } catch (error) {
      setMessage(error.message || '迁移失败，请重试。')
    } finally {
      setMigrating(false)
    }
  }

  return (
    <div className="settings-subpage">
      <PageHeader title="数据备份与恢复" />
      <main className="settings-subpage-content settings-card-stack">
        <section className="settings-detail-card">
          <h2>导出数据</h2>
          <p>下载完整 JSON 备份。建议定期备份，并保存到 iCloud 或网盘。</p>
          <button className="primary-button wide-button" type="button" disabled={busy} onClick={handleExport}>
            <Download size={18} />{busy ? '处理中…' : '下载备份文件'}
          </button>
        </section>

        <section className="settings-detail-card">
          <h2>恢复数据</h2>
          <p>选择此前导出的 JSON 文件。导入前会严格校验，确认后覆盖当前数据。</p>
          <button className="secondary-button wide-button" type="button" disabled={busy} onClick={() => fileInput.current?.click()}>
            <Upload size={18} />选择备份文件
          </button>
          <input ref={fileInput} className="sr-only" type="file" accept="application/json,.json" onChange={handleImportFile} />
        </section>

        {legacy?.found && (
          <section className="settings-detail-card migration-card">
            <div className="migration-copy"><RefreshCw size={18} /><strong>发现旧版数据</strong></div>
            <p>检测到旧版「个人工具箱」的 {legacy.count} 条记录，可转换为事项与历史记录，原数据不会被删除。</p>
            <button className="secondary-button wide-button" type="button" disabled={migrating} onClick={handleMigration}>
              {migrating ? '迁移中…' : '立即迁移'}
            </button>
          </section>
        )}

        <p className="storage-note">数据只保存在此设备。清理浏览器网站数据或卸载应用可能造成数据丢失。</p>
        {message && <p className="settings-message" role="status">{message}</p>}
      </main>

      {pendingBackup && <ImportConfirmDialog backup={pendingBackup} busy={busy} onConfirm={handleConfirmImport} onExport={handleExport} onClose={() => setPendingBackup(null)} />}
    </div>
  )
}