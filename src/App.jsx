import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import ReloadPrompt from './components/ui/ReloadPrompt.jsx'
import HomePage from './pages/HomePage.jsx'
import ItemDetailPage from './pages/ItemDetailPage.jsx'
import ItemEditPage from './pages/ItemEditPage.jsx'
import ItemListPage from './pages/ItemListPage.jsx'
import AboutSettingsPage from './pages/settings/AboutSettingsPage.jsx'
import BackupSettingsPage from './pages/settings/BackupSettingsPage.jsx'
import CategorySettingsPage from './pages/settings/CategorySettingsPage.jsx'
import SettingsHubPage from './pages/SettingsHubPage.jsx'

export default function App() {
  return (
    <>
      <ReloadPrompt />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="items" element={<ItemListPage />} />
          <Route path="items/new" element={<ItemEditPage />} />
          <Route path="items/:id" element={<ItemDetailPage />} />
          <Route path="items/:id/edit" element={<ItemEditPage />} />
          <Route path="settings" element={<SettingsHubPage />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Route>
        <Route path="settings/categories" element={<CategorySettingsPage />} />
        <Route path="settings/backup" element={<BackupSettingsPage />} />
        <Route path="settings/about" element={<AboutSettingsPage />} />
      </Routes>
    </>
  )
}
