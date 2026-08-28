import { Star } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState.jsx'

export default function FavoritesPage() {
  return (
    <div className="page simple-page">
      <header className="page-header">
        <p>随手可达</p>
        <h1>我的收藏</h1>
      </header>
      <EmptyState
        icon={Star}
        title="还没有收藏"
        description="收藏数据将在 IndexedDB 数据层阶段接入。"
      />
    </div>
  )
}
