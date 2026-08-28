import { liveQuery } from 'dexie'
import { useEffect, useRef, useState } from 'react'

export function useLiveData(querier, dependencyKey = null, initialValue = []) {
  const [state, setState] = useState({ data: initialValue, error: null, loading: true })
  const querierRef = useRef(querier)
  const initialValueRef = useRef(initialValue)

  useEffect(() => {
    querierRef.current = querier
    initialValueRef.current = initialValue
  }, [querier, initialValue])

  useEffect(() => {
    const subscription = liveQuery(() => querierRef.current()).subscribe({
      next: (data) => setState({ data, error: null, loading: false }),
      error: (error) => setState({ data: initialValueRef.current, error, loading: false }),
    })

    return () => subscription.unsubscribe()
  }, [dependencyKey])

  return state
}
