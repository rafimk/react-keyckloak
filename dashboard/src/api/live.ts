import { createContext, useContext } from 'react'

export type LiveStatus = 'connecting' | 'live' | 'reconnecting' | 'offline'

export interface LiveContextValue {
  status: LiveStatus
  /** Listen for a hub event; returns a function that stops listening. */
  subscribe: (event: string, handler: (data: unknown) => void) => () => void
}

export const LiveContext = createContext<LiveContextValue | null>(null)

export function useLive() {
  const ctx = useContext(LiveContext)
  if (!ctx) throw new Error('useLive must be used inside <LiveProvider>')
  return ctx
}
