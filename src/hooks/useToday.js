import { useEffect, useState } from 'react'
import { toLocalDateString } from '../utils/date.js'

export function useToday() {
  const [today, setToday] = useState(() => toLocalDateString())

  useEffect(() => {
    const refresh = () => setToday(toLocalDateString())
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