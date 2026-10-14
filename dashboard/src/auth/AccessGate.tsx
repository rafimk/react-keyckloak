import type { ReactNode } from 'react'
import { useApi } from '../api/useApi'
import type { Me } from '../api/types'
import Unauthorized from './Unauthorized'

/**
 * Being signed in to Keycloak is not enough: the API decides whether this user may use the
 * dashboard (its PermittedUsers setting). Children, including the live connection, only render
 * once the API says yes. The API enforces the same rule on every endpoint, so this gate is for
 * the user experience, not the security boundary.
 */
export default function AccessGate({ children }: { children: ReactNode }) {
  const me = useApi<Me>('/api/me')

  if (me.loading) {
    return <div className="center-screen">Checking access…</div>
  }
  if (me.error || !me.data) {
    return (
      <div className="center-screen error">
        <div>
          <p>Couldn't verify your access: {me.error}</p>
          <button className="btn" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </div>
    )
  }
  if (!me.data.isPermitted) {
    return <Unauthorized />
  }
  return <>{children}</>
}
