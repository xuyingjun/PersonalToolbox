import { Link, useLocation } from 'react-router-dom'
import { Home, LayoutList, UserRound } from '../ui/AppIcon.jsx'

const navigation = [
  { label: '首页', path: '/', icon: Home },
  { label: '全部', path: '/items', icon: LayoutList },
  { label: '我的', path: '/settings', icon: UserRound },
]

// 高亮规则：“全部”覆盖事项的详情/编辑等深入页，但排除“新增事项”（/items/new），
// 避免点击 + 进入新增页时底部导航仍高亮“全部”，让人误以为跳到了全部界面。
function isTabActive(pathname, path) {
  if (path === '/items') return pathname.startsWith('/items') && !pathname.endsWith('/new')
  return pathname === path
}

export default function BottomNavigation() {
  const { pathname } = useLocation()
  return (
    <nav className="bottom-nav" aria-label="主要导航">
      {navigation.map(({ label, path, icon: Icon }) => {
        const active = isTabActive(pathname, path)
        return (
          <Link
            className={`nav-item${active ? ' nav-item-active' : ''}`}
            aria-current={active ? 'page' : undefined}
            key={path}
            to={path}
          >
            <Icon aria-hidden="true" size={21} strokeWidth={2} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
