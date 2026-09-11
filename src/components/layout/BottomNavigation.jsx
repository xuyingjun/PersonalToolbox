import { NavLink } from 'react-router-dom'
import { Home, LayoutList, UserRound } from '../ui/AppIcon.jsx'

const navigation = [
  { label: '首页', path: '/', icon: Home, end: true },
  { label: '全部', path: '/items', icon: LayoutList },
  { label: '我的', path: '/settings', icon: UserRound },
]

export default function BottomNavigation() {
  return (
    <nav className="bottom-nav" aria-label="主要导航">
      {navigation.map(({ label, path, icon: Icon, end }) => (
        <NavLink
          className={({ isActive }) => `nav-item${isActive ? ' nav-item-active' : ''}`}
          end={end}
          key={path}
          to={path}
        >
          <Icon aria-hidden="true" size={21} strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
