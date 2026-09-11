import { Check, Database, Download, Info, MonitorSmartphone, Pencil, Plus, RefreshCw, Tags, Trash2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import CategoryIcon from '../components/CategoryIcon.jsx'
import DeleteConfirmDialog from '../components/DeleteConfirmDialog.jsx'
import ImportConfirmDialog from '../components/ImportConfirmDialog.jsx'
import { useLiveData } from '../hooks/useLiveData.js'
import { exportBackup, readBackupFile, restoreBackup } from '../services/backupService.js'
import { createCategory, deleteCategory, getAllCategories, updateCategory } from '../services/categoryService.js'
import { detectLegacyData, runMigration } from '../services/migrationService.js'
import { APP_VERSION } from '../db/schema.js'

export default function SettingsPage() {
  const fileInput = useRef(null)
  const [message, setMessage] = useState('')
  const { data: categories } = useLiveData(() => getAllCategories(), null, [])

  // 备份导入
  const [pendingBackup, setPendingBackup] = useState(null)
  const [busy, setBusy] = useState(false)

  // 旧数据迁移
  const [legacy, setLegacy] = useState(null) // null = 检测中；{found, count} = 检测完成
  const [migrating, setMigrating] = useState(false)

  // 分类管理
  const [newCategory, setNewCategory] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [deletingCategory, setDeletingCategory] = useState(null)

  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

  useEffect(() => {
    let cancelled = false
    detectLegacyData()
      .then((result) => {
        if (!cancelled) setLegacy(result)
      })
      .catch(() => {
        if (!cancelled) setLegacy({ found: false, count: 0 })
      })
    return () => {
      cancelled = true
    }
  }, [])

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
      setMessage(error.message || '导入失败，请重试。')
      setPendingBackup(null)
    } finally {
      setBusy(false)
    }
  }

  async function handleMigration() {
    setMigrating(true)
    try {
      const result = await runMigration()
      if (result.migrated) {
        setMessage(`迁移成功：${result.itemCount} 条事项、${result.eventCount} 条记录。`)
      } else {
        setMessage('没有需要迁移的数据。')
      }
      setLegacy(null) // 隐藏迁移卡片
    } catch (error) {
      setMessage(error.message || '迁移失败，请重试。')
    } finally {
      setMigrating(false)
    }
  }

  async function handleAddCategory() {
    try {
      await createCategory(newCategory)
      setNewCategory('')
      setMessage('分类已添加。')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleSaveCategory(id) {
    try {
      await updateCategory(id, editingName)
      setEditingId(null)
      setMessage('分类已更新。')
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function handleDeleteCategory() {
    try {
      await deleteCategory(deletingCategory.id)
      setDeletingCategory(null)
      setMessage('分类已删除。')
    } catch (error) {
      setMessage(error.message)
      setDeletingCategory(null)
    }
  }

  return (
    <div className="page settings-page">
      <header className="page-header">
        <h1>设置</h1>
      </header>

      <section className="settings-section">
        <div className="settings-title"><Database size={20} /><h2>数据管理</h2></div>
        <div className="settings-actions">
          <button type="button" onClick={() => runAction(exportBackup, '备份已导出。')}><Download size={19} /><span><strong>导出数据</strong><small>保存 JSON 备份</small></span></button>
          <button type="button" onClick={() => fileInput.current?.click()}><Upload size={19} /><span><strong>导入数据</strong><small>校验后覆盖本机数据</small></span></button>
        </div>
        <input ref={fileInput} className="sr-only" type="file" accept="application/json,.json" onChange={handleImportFile} />

        {legacy?.found && (
          <div className="migration-card">
            <div className="migration-copy">
              <RefreshCw size={18} aria-hidden="true" />
              <span>检测到旧版「个人工具箱」数据（{legacy.count} 条记录）</span>
            </div>
            <button className="primary-button" type="button" disabled={migrating} onClick={handleMigration}>
              {migrating ? '迁移中…' : '立即迁移'}
            </button>
            <small>迁移会转换为事项与历史记录，不会删除原数据。</small>
          </div>
        )}

        <p className="storage-note">数据只保存在此设备，iOS 可能在清理存储时删除网站数据。请定期导出备份并妥善保管。</p>
      </section>

      <section className="settings-section">
        <div className="settings-title"><Tags size={20} /><h2>分类管理</h2></div>
        <div className="category-list">
          {categories.map((category) => (
            <div className="category-row" key={category.id}>
              <span className="category-icon"><CategoryIcon name={category.name} /></span>
              {editingId === category.id ? (
                <>
                  <input
                    type="text"
                    value={editingName}
                    maxLength={20}
                    onChange={(changeEvent) => setEditingName(changeEvent.target.value)}
                  />
                  <button className="icon-button" type="button" aria-label="保存分类名" onClick={() => handleSaveCategory(category.id)}>
                    <Check size={17} />
                  </button>
                </>
              ) : (
                <>
                  <span className="category-name">{category.name}</span>
                  <div className="category-actions">
                    <button className="icon-button" type="button" aria-label={`重命名 ${category.name}`} onClick={() => { setEditingId(category.id); setEditingName(category.name) }}>
                      <Pencil size={17} />
                    </button>
                    <button className="icon-button" type="button" aria-label={`删除 ${category.name}`} onClick={() => setDeletingCategory(category)}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="add-category">
          <input
            type="text"
            value={newCategory}
            maxLength={20}
            placeholder="新分类名称"
            onChange={(changeEvent) => setNewCategory(changeEvent.target.value)}
          />
          <button className="secondary-button" type="button" onClick={handleAddCategory}>
            <Plus size={16} aria-hidden="true" />
            添加
          </button>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-title"><MonitorSmartphone size={20} /><h2>应用</h2></div>
        <p className="settings-copy">{standalone ? '已从主屏幕运行。' : '在 iPhone Safari 中点击分享，然后选择“添加到主屏幕”。'}</p>
      </section>

      <section className="settings-section">
        <div className="settings-title"><Info size={20} /><h2>关于</h2></div>
        <p className="settings-copy">上次 · 版本 {APP_VERSION}</p>
        <p className="settings-copy">用 Event 记录事实，用 Cycle 描述习惯，用 ViewModel 推导状态。</p>
      </section>

      {message && <p className="settings-message" role="status">{message}</p>}

      {pendingBackup && (
        <ImportConfirmDialog busy={busy} onConfirm={handleConfirmImport} onClose={() => setPendingBackup(null)} />
      )}

      {deletingCategory && (
        <DeleteConfirmDialog
          title="删除分类"
          message={`确定删除分类“${deletingCategory.name}”吗？`}
          onConfirm={handleDeleteCategory}
          onClose={() => setDeletingCategory(null)}
        />
      )}
    </div>
  )
}
