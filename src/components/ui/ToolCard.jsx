import { ArrowUpRight, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ToolCard({ tool, favorite = false, onToggleFavorite }) {
  const Icon = tool.icon

  return (
    <article className="tool-card">
      <Link className="tool-card-link" to={tool.path} aria-label={`打开${tool.name}`}>
        <span className={`tool-icon tool-icon-${tool.id}`} aria-hidden="true">
          <Icon size={23} strokeWidth={1.9} />
        </span>
        <span className="tool-copy">
          <strong>{tool.name}</strong>
          <small>{tool.description}</small>
        </span>
        <ArrowUpRight className="tool-arrow" aria-hidden="true" size={19} />
      </Link>
      <button
        className={`favorite-button${favorite ? ' is-favorite' : ''}`}
        type="button"
        aria-label={favorite ? `取消收藏${tool.name}` : `收藏${tool.name}`}
        aria-pressed={favorite}
        onClick={() => onToggleFavorite?.(tool.id)}
      >
        <Star size={19} fill={favorite ? 'currentColor' : 'none'} />
      </button>
    </article>
  )
}
