import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from '../ui/AppIcon.jsx'

export default function PageHeader({ title }) {
  const navigate = useNavigate()

  return (
    <header className="subpage-header">
      <button className="icon-button" type="button" aria-label="返回" onClick={() => navigate(-1)}>
        <ArrowLeft size={22} />
      </button>
      <h1>{title}</h1>
      <span aria-hidden="true" />
    </header>
  )
}