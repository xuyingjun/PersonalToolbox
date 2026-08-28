import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ToolPage({ name, icon: Icon, actions, children }) {
  return (
    <div className="tool-page">
      <header className="tool-header">
        <Link className="icon-button" to="/" aria-label="返回首页">
          <ArrowLeft size={22} />
        </Link>
        <span className="tool-header-icon" aria-hidden="true">
          <Icon size={20} />
        </span>
        <h1>{name}</h1>
        {actions && <div className="tool-header-actions">{actions}</div>}
      </header>
      <main className="tool-page-content">{children}</main>
    </div>
  )
}
