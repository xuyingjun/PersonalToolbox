import { Star } from 'lucide-react'
import { enabledTools } from '../app/toolRegistry.js'
import EmptyState from '../components/ui/EmptyState.jsx'
import ToolCard from '../components/ui/ToolCard.jsx'
import { useLiveData } from '../hooks/useLiveData.js'
import { getFavorites, toggleFavorite } from '../services/favoritesService.js'

export default function FavoritesPage() {
  const { data: favorites } = useLiveData(getFavorites)
  const tools = favorites
    .map((favorite) => enabledTools.find((tool) => tool.id === favorite.toolId))
    .filter(Boolean)

  return (
    <div className="page simple-page">
      <header className="page-header">
        <p>随手可达</p>
        <h1>我的收藏</h1>
      </header>
      {tools.length === 0 ? (
        <EmptyState icon={Star} title="还没有收藏" description="在首页点击工具旁的星标，即可放到这里。" />
      ) : (
        <div className="tool-list favorites-list">
          {tools.map((tool) => <ToolCard key={tool.id} tool={tool} favorite onToggleFavorite={toggleFavorite} />)}
        </div>
      )}
    </div>
  )
}
