import { useEffect } from 'react'
import { useLiveData } from '../../hooks/useLiveData.js'
import { DEFAULT_THEME, getSetting, THEME_KEY } from '../../services/settingsService.js'

export default function ThemeController() {
  const { data: theme } = useLiveData(() => getSetting(THEME_KEY, DEFAULT_THEME), null, DEFAULT_THEME)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const resolved = theme === 'system' ? (media.matches ? 'dark' : 'light') : theme
      document.documentElement.dataset.theme = resolved
      document.documentElement.style.colorScheme = resolved
    }
    applyTheme()
    media.addEventListener('change', applyTheme)
    return () => media.removeEventListener('change', applyTheme)
  }, [theme])

  return null
}