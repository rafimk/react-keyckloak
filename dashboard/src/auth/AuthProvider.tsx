import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import keycloak from './keycloak'
import { AuthContext } from './useAuth'
import type { AuthContextValue, AuthUser } from './useAuth'

// Module-level so their identity is stable across renders (safe to use as effect dependencies).
async function getToken() {
  await keycloak.updateToken(30)
  return keycloak.token!
}

function logout() {
  keycloak.logout({ redirectUri: window.location.origin + '/' })
}

function switchAccount() {
  keycloak.login({ prompt: 'login' })
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).catch(() => keycloak.login())
    }

    keycloak
      .init({
        onLoad: 'login-required',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      })
      .then((authenticated) => {
        if (authenticated) setStatus('ready')
        else keycloak.login()
      })
      .catch((err) => {
        console.error('Keycloak init failed', err)
        setError('Could not reach the Keycloak server. Is it running at ' + import.meta.env.VITE_KEYCLOAK_URL + '?')
        setStatus('error')
      })
  }, [])

  if (status === 'loading') {
    return <div className="center-screen">Signing in…</div>
  }
  if (status === 'error') {
    return <div className="center-screen error">{error}</div>
  }

  const claims = keycloak.tokenParsed ?? {}
  const user: AuthUser = {
    username: claims.preferred_username ?? '',
    name: claims.name ?? claims.preferred_username ?? 'User',
    email: claims.email,
  }

  const value: AuthContextValue = { user, getToken, logout, switchAccount }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
