import { useEffect } from 'react'
import { markToolUsed } from '../../services/toolUsageService.js'

export default function ToolRoute({ toolId, children }) {
  useEffect(() => {
    markToolUsed(toolId).catch(() => {})
  }, [toolId])

  return children
}