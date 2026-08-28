import { Home, Settings, Star } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { label: '首页', path: '/', icon: Home, end: true },
  { label: '收藏', path: '/favorites', icon: Star },
  { label: '设置', path: '/settings', icon: Settings },
]

export default function AppShell() {
  return (
    <div className="app-frame">
      <main className="app-content">
        <Outlet />
      </main>
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
    </div>
  )
}
