import { createContext, useContext } from 'react'

export interface AuthUser {
  username: string
  name: string
  email?: string
}

export interface AuthContextValue {
  user: AuthUser
  /** Current access token, for `Authorization: Bearer <token>` on API calls. */
  getToken: () => Promise<string>
  logout: () => void
  /** Show the Keycloak login form again, even if a Keycloak session exists, so another user can sign in. */
  switchAccount: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
