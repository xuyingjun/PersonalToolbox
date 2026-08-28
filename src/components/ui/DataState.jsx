import { AlertCircle, LoaderCircle } from 'lucide-react'

export default function DataState({ loading, error, empty, emptyText }) {
  if (loading) {
    return <div className="data-state"><LoaderCircle className="spin" size={22} />正在读取本机数据…</div>
  }
  if (error) {
    return <div className="data-state data-error"><AlertCircle size={22} />数据读取失败，请重新打开页面。</div>
  }
  if (empty) {
    return <div className="data-state">{emptyText}</div>
  }
  return null
}