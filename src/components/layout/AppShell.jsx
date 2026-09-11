import { Outlet } from 'react-router-dom'
import BottomNavigation from './BottomNavigation.jsx'

export default function AppShell() {
  return (
    <div className="app-frame">
      <main className="app-content">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  )
}
