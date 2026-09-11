import { RefreshCw, SearchCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import { APP_VERSION } from '../../db/schema.js'

function formatBytes(value) {
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`
  if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${value} B`
}

export default function AboutSettingsPage() {
  const [installed, setInstalled] = useState(false)
  const [storage, setStorage] = useState(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setInstalled(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true)
    navigator.storage?.estimate?.().then((estimate) => {
      setStorage({ usage: estimate.usage ?? 0, quota: estimate.quota ?? 0 })
    }).catch(() => {})
  }, [])

  async function checkUpdate() {
    if (!('serviceWorker' in navigator)) {
      setMessage('当前环境不支持应用更新。')
      return
    }
    setBusy(true)
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((registration) => registration.update()))
      setMessage('已检查更新；如有新版本，将提示刷新。')
    } catch {
      setMessage('检查更新失败，请确认网络后重试。')
    } finally {
      setBusy(false)
    }
  }

  async function refreshResources() {
    if (!('serviceWorker' in navigator) || !('caches' in window)) {
      setMessage('当前环境不支持资源刷新。')
      return
    }
    setBusy(true)
    try {
      const keys = await caches.keys()
      await Promise.all(keys.filter((key) => key.toLowerCase().includes('lasttime')).map((key) => caches.delete(key)))
      const appPath = new URL(import.meta.env.BASE_URL, window.location.origin).pathname.toLowerCase()
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations
        .filter((registration) => new URL(registration.scope).pathname.toLowerCase().startsWith(appPath))
        .map((registration) => registration.unregister()))
      window.location.reload()
    } catch {
      setMessage('资源刷新失败，请稍后重试。')
      setBusy(false)
    }
  }

  return (
    <div className="settings-subpage">
      <PageHeader title="关于" />
      <main className="settings-subpage-content settings-card-stack">
        <section className="about-app-card">
          <img src={`${import.meta.env.BASE_URL}pwa-192x192.png`} alt="上次应用图标" />
          <h2>上次</h2>
          <p>个人周期性事务记录 · 数据仅存于本设备</p>
        </section>

        <dl className="about-info settings-list-card">
          <div><dt>安装状态</dt><dd className={installed ? 'is-success' : ''}>{installed ? '已安装到主屏幕' : '浏览器中使用'}</dd></div>
          <div><dt>存储占用</dt><dd>{storage ? `${formatBytes(storage.usage)} / ${formatBytes(storage.quota)}` : '计算中…'}</dd></div>
          <div><dt>应用版本</dt><dd>v{APP_VERSION}</dd></div>
        </dl>

        <section className="settings-detail-card">
          <div className="about-actions">
            <button className="secondary-button" type="button" disabled={busy} onClick={checkUpdate}><SearchCheck size={18} />检测更新</button>
            <button className="secondary-button" type="button" disabled={busy} onClick={refreshResources}><RefreshCw className={busy ? 'spin' : ''} size={18} />刷新资源</button>
          </div>
          <p>刷新应用资源不会删除事项与历史记录，但需要联网重新加载应用。</p>
          {message && <p className="settings-message" role="status">{message}</p>}
        </section>

        {!installed && (
          <section className="install-tip">
            <strong>添加到主屏幕</strong>
            <p>iPhone / iPad：使用 Safari 打开，点击“分享”，再选择“添加到主屏幕”。</p>
            <p>电脑：使用 Chrome 或 Edge 地址栏中的安装按钮。</p>
          </section>
        )}
      </main>
    </div>
  )
}