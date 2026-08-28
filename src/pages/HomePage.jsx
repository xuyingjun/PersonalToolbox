import { Search, Wrench, X } from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import { enabledTools, toolCategories } from '../app/toolRegistry.js'
import ToolCard from '../components/ui/ToolCard.jsx'
import { useLiveData } from '../hooks/useLiveData.js'
import { getFavorites, toggleFavorite } from '../services/favoritesService.js'
import { getRecentToolUsage } from '../services/toolUsageService.js'

function matchesSearch(tool, query) {
  const searchableText = [tool.name, tool.description, tool.category, ...(tool.keywords ?? [])].join(' ')
  return searchableText.toLocaleLowerCase('zh-CN').includes(query.toLocaleLowerCase('zh-CN'))
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query.trim())
  const { data: favorites } = useLiveData(getFavorites)
  const { data: recentUsage } = useLiveData(() => getRecentToolUsage(4))
  const favoriteIds = new Set(favorites.map((favorite) => favorite.toolId))
  const recentTools = recentUsage
    .map((usage) => enabledTools.find((tool) => tool.id === usage.toolId))
    .filter(Boolean)
  const visibleTools = deferredQuery
    ? enabledTools.filter((tool) => matchesSearch(tool, deferredQuery))
    : enabledTools

  return (
    <div className="page home-page">
      <header className="home-header">
        <span className="brand-mark" aria-hidden="true">
          <Wrench size={24} strokeWidth={1.8} />
        </span>
        <div>
          <p>Personal Toolbox</p>
          <h1>我的工具箱</h1>
          <span>我的个人效率中心</span>
        </div>
      </header>

      <label className="search-box">
        <Search aria-hidden="true" size={20} />
        <span className="sr-only">搜索工具</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索名称、描述或分类"
        />
        {query && (
          <button type="button" aria-label="清除搜索" onClick={() => setQuery('')}>
            <X size={18} />
          </button>
        )}
      </label>

      {!deferredQuery && recentTools.length > 0 && (
        <section className="tool-section recent-section">
          <div className="section-heading"><h2>最近使用</h2><span>最多 4 个</span></div>
          <div className="tool-list">
            {recentTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} favorite={favoriteIds.has(tool.id)} onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        </section>
      )}

      {visibleTools.length > 0 ? (
        <div className="category-list">
          {toolCategories.map((category) => {
            const categoryTools = visibleTools.filter((tool) => tool.category === category)
            if (categoryTools.length === 0) return null

            return (
              <section className="tool-section" key={category}>
                <div className="section-heading">
                  <h2>{category}</h2>
                  <span>{categoryTools.length} 个工具</span>
                </div>
                <div className="tool-list">
                  {categoryTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} favorite={favoriteIds.has(tool.id)} onToggleFavorite={toggleFavorite} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="no-results">
          <Search aria-hidden="true" size={24} />
          <h2>没有找到相关工具</h2>
          <p>换一个名称、描述或分类试试。</p>
          <button type="button" onClick={() => setQuery('')}>清除搜索</button>
        </div>
      )}
    </div>
  )
}
