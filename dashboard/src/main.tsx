import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthProvider.tsx'
import { LiveProvider } from './api/LiveProvider.tsx'
import AccessGate from './auth/AccessGate.tsx'

// No StrictMode: it double-invokes effects in dev, and keycloak-js can only be initialized once.
createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <AccessGate>
      <LiveProvider>
        <App />
      </LiveProvider>
    </AccessGate>
  </AuthProvider>,
)
