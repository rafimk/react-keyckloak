import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../auth/useAuth'
import { createDashboardConnection } from './hub'
import { LiveContext } from './live'
import type { LiveContextValue, LiveStatus } from './live'

const RETRY_MS = 5000

/** Owns the single SignalR connection for the app and keeps it open while the user is signed in. */
export function LiveProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth()
  const [connection] = useState(() => createDashboardConnection(getToken))
  const [status, setStatus] = useState<LiveStatus>('connecting')

  useEffect(() => {
    let stopped = false
    let retry: number | undefined

    // One pending retry at most, whichever path (failed start or close) asked for it.
    function retryIn(ms: number) {
      window.clearTimeout(retry)
      retry = window.setTimeout(start, ms)
    }

    async function start() {
      setStatus('connecting')
      try {
        await connection.start()
        setStatus('live')
      } catch {
        // API down at startup, or the token was rejected: keep trying.
        if (!stopped) {
          setStatus('offline')
          retryIn(RETRY_MS)
        }
      }
    }

    connection.onreconnecting(() => setStatus('reconnecting'))
    connection.onreconnected(() => setStatus('live'))
    // Called when automatic reconnect gives up, or when the server closes the connection
    // because the access token expired. Start again; getToken supplies a fresh token.
    connection.onclose(() => {
      if (stopped) return
      setStatus('offline')
      retryIn(1000)
    })

    start()
    return () => {
      stopped = true
      window.clearTimeout(retry)
      connection.stop()
    }
  }, [connection])

  const subscribe = useCallback<LiveContextValue['subscribe']>(
    (event, handler) => {
      connection.on(event, handler)
      return () => connection.off(event, handler)
    },
    [connection],
  )

  const value = useMemo(() => ({ status, subscribe }), [status, subscribe])
  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>
}
