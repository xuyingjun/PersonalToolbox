import { Link } from 'react-router-dom'
import { Plus } from './ui/AppIcon.jsx'

export default function Fab({ to = '/items/new', label = '新增事项' }) {
  return (
    <Link className="floating-action" to={to} aria-label={label}>
      <Plus aria-hidden="true" size={26} strokeWidth={2.2} />
    </Link>
  )
}
