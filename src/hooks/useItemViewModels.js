import { useMemo } from 'react'
import { useLiveData } from './useLiveData.js'
import { useToday } from './useToday.js'
import { buildItemViewModels, loadViewModelData } from '../services/viewModelService.js'

// 页面统一数据入口：一次读取三表 → 内存构建 ViewModel。
// recordToday 等写操作会触发 liveQuery 自动重算，无需手动刷新。
export function useItemViewModels() {
  const today = useToday()
  const { data, error, loading } = useLiveData(() => loadViewModelData(), null, null)

  const viewModels = useMemo(() => {
    if (!data) return null
    return buildItemViewModels({ ...data, today })
  }, [data, today])

  return { viewModels, today, loading, error }
}
