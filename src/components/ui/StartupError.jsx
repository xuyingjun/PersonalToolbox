import { AlertCircle, RefreshCw } from './AppIcon.jsx'

export default function StartupError() {
  return (
    <main className="startup-error" role="alert">
      <AlertCircle size={32} />
      <h1>无法打开本机数据</h1>
      <p>数据库初始化失败。请先重新打开应用；如果仍然失败，请不要清理网站数据。</p>
      <button className="primary-button" type="button" onClick={() => window.location.reload()}>
        <RefreshCw size={18} />重新尝试
      </button>
    </main>
  )
}
