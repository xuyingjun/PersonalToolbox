import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import ThemeController from './components/layout/ThemeController.jsx'
import ToolRoute from './components/layout/ToolRoute.jsx'
import ReloadPrompt from './components/ui/ReloadPrompt.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import HomePage from './pages/HomePage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import CountdownTool from './tools/countdown/index.jsx'
import InspirationTool from './tools/inspiration/index.jsx'
import LastTimeTool from './tools/last-time/index.jsx'

export default function App() {
  return (
    <><ThemeController /><ReloadPrompt /><Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="tools/last-time" element={<ToolRoute toolId="last-time"><LastTimeTool /></ToolRoute>} />
      <Route path="tools/countdown" element={<ToolRoute toolId="countdown"><CountdownTool /></ToolRoute>} />
      <Route path="tools/inspiration" element={<ToolRoute toolId="inspiration"><InspirationTool /></ToolRoute>} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes></>
  )
}
