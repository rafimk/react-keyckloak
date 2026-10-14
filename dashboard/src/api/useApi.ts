import { useEffect, useState } from 'react'
import { useAuth } from '../auth/useAuth'

const API_URL = import.meta.env.VITE_API_URL

interface ApiState<T> {
  data: T | null
  error: string | null
  loading: boolean
}

/** GET `path` from the dashboard API with the user's Keycloak access token. */
export function useApi<T>(path: string): ApiState<T> {
  const { getToken } = useAuth()
  const [state, setState] = useState<ApiState<T>>({ data: null, error: null, loading: true })

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const token = await getToken()
        const res = await fetch(API_URL + path, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
        setState({ data: (await res.json()) as T, error: null, loading: false })
      } catch (err) {
        if (controller.signal.aborted) return
        setState({ data: null, error: err instanceof Error ? err.message : String(err), loading: false })
      }
    }

    load()
    return () => controller.abort()
  }, [path, getToken])

  return state
}
