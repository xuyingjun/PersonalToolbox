import { RefreshCw, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="update-toast" role="status">
      <span>新版本已准备好</span>
      <button type="button" onClick={() => updateServiceWorker(true)}><RefreshCw size={17} />更新</button>
      <button className="icon-button" type="button" onClick={() => setNeedRefresh(false)} aria-label="稍后更新"><X size={18} /></button>
    </div>
  )
}