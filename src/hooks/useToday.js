import { useEffect, useState } from 'react'
import { formatLocalDate } from '../utils/date.js'

export function useToday() {
  const [today, setToday] = useState(() => formatLocalDate())

  useEffect(() => {
    const refresh = () => setToday(formatLocalDate())
    const interval = window.setInterval(refresh, 60_000)
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  return today
}