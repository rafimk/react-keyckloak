import { useAuth } from './useAuth'

/** Shown to users who are signed in to Keycloak but not permitted to use the dashboard. */
export default function Unauthorized() {
  const { user, switchAccount, logout } = useAuth()

  return (
    <main className="denied">
      <div className="denied-blob gold" aria-hidden="true" />
      <div className="denied-blob teal" aria-hidden="true" />

      <section className="denied-card" aria-labelledby="denied-title">
        <div className="denied-illustration" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="56" className="ring" />
            <rect x="34" y="52" width="52" height="40" rx="8" className="body" />
            <path d="M44 52V40a16 16 0 0 1 32 0v12" className="shackle" />
            <circle cx="60" cy="68" r="5" className="hole" />
            <path d="M60 72v8" className="hole-line" />
          </svg>
        </div>

        <span className="denied-code">403 · Access denied</span>
        <h1 id="denied-title">You don't have access to this dashboard</h1>
        <p className="denied-text">
          You're signed in, but your account isn't on the list of permitted users. Sign in with a different
          account, or ask an administrator to grant you access.
        </p>

        <div className="denied-user">
          <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-email">{user.email ?? user.username}</span>
          </div>
        </div>

        <div className="denied-actions">
          <button className="btn btn-primary" onClick={switchAccount}>
            Sign in with another account
          </button>
          <button className="btn" onClick={logout}>
            Sign out
          </button>
        </div>
      </section>
    </main>
  )
}
