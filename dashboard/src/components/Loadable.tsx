import type { ReactNode } from 'react'

interface LoadableProps<T> {
  state: { data: T | null; error: string | null; loading: boolean }
  /** Keeps the card from collapsing while data loads. */
  minHeight?: number
  children: (data: T) => ReactNode
}

/** Shows a loading or error placeholder until `state.data` is available. */
export default function Loadable<T>({ state, minHeight = 0, children }: LoadableProps<T>) {
  if (state.data !== null) return <>{children(state.data)}</>
  return (
    <div className={'placeholder' + (state.error ? ' error' : '')} style={{ minHeight }}>
      {state.error ? `Couldn't load data: ${state.error}` : 'Loading…'}
    </div>
  )
}
