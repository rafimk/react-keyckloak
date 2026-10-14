import { useEffect, useState } from 'react'
import { useApi } from './useApi'
import { useLive } from './live'

/**
 * Loads `path` over REST, then keeps it current with the hub's `event` pushes.
 * Returns the same shape as `useApi`, so components don't care where the data came from.
 */
export function useLiveApi<T>(path: string, event: string) {
  const rest = useApi<T>(path)
  const { subscribe } = useLive()
  const [live, setLive] = useState<T | null>(null)

  useEffect(() => subscribe(event, (data) => setLive(data as T)), [event, subscribe])

  // A pushed value is always newer than the initial REST response.
  return live !== null ? { data: live, error: null, loading: false } : rest
}
