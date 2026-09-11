import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import ThemeController from './components/layout/ThemeController.jsx'
import ReloadPrompt from './components/ui/ReloadPrompt.jsx'
import HomePage from './pages/HomePage.jsx'
import ItemDetailPage from './pages/ItemDetailPage.jsx'
import ItemEditPage from './pages/ItemEditPage.jsx'
import ItemListPage from './pages/ItemListPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'

export default function App() {
  return (
    <>
      <ThemeController />
      <ReloadPrompt />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="items" element={<ItemListPage />} />
          <Route path="items/new" element={<ItemEditPage />} />
          <Route path="items/:id" element={<ItemDetailPage />} />
          <Route path="items/:id/edit" element={<ItemEditPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Route>
      </Routes>
    </>
  )
}
