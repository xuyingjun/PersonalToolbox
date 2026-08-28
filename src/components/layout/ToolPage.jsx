import { ArrowLeft, Construction } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ToolPage({ name, description, icon: Icon }) {
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
      </header>
      <main className="tool-page-content">
        <div className="phase-placeholder">
          <Construction aria-hidden="true" size={26} />
          <h2>入口已经准备好</h2>
          <p>{description}</p>
          <span>具体功能将在对应开发阶段接入本地数据层。</span>
        </div>
      </main>
    </div>
  )
}
