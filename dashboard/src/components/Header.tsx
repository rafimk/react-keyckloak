import { useAuth } from '../auth/useAuth'
import { useLive } from '../api/live'

const statusText = { connecting: 'Connecting…', live: 'Live', reconnecting: 'Reconnecting…', offline: 'Offline' }

export default function Header() {
  const { user, logout } = useAuth()
  const { status } = useLive()

  return (
    <header className="header">
      <h1>Sales Dashboard</h1>
      <div className="header-user">
        <span className={'live-status ' + status} title="Live data connection">
          <span className="live-dot" />
          {statusText[status]}
        </span>
        <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
        <div className="user-info">
          <span className="user-name">{user.name}</span>
          {user.email && <span className="user-email">{user.email}</span>}
        </div>
        <button className="btn" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  )
}
