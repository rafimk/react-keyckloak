import type { ReactNode } from 'react'
import type { Kpi } from '../api/types'

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

// Large illustrative icons for the right side of each card.
const icons: Record<string, ReactNode> = {
  planned: (
    <svg viewBox="0 0 64 64" {...stroke}>
      <rect x="8" y="12" width="48" height="44" rx="6" />
      <path d="M8 24h48M20 6v12M44 6v12" />
      <path d="M18 34h6M30 34h6M42 34h4M18 44h6M30 44h6" />
    </svg>
  ),
  completed: (
    <svg viewBox="0 0 64 64" {...stroke}>
      <circle cx="32" cy="32" r="24" />
      <path d="M21 33l8 8 15-17" />
    </svg>
  ),
  cancelled: (
    <svg viewBox="0 0 64 64" {...stroke}>
      <circle cx="32" cy="32" r="24" />
      <path d="M23 23l18 18M41 23L23 41" />
    </svg>
  ),
}

export default function KpiCards({ items }: { items: Kpi[] }) {
  return (
    <div className="kpis">
      {items.map((kpi) => (
        <div key={kpi.id} className={'kpi ' + kpi.id}>
          {/* Decorative contour lines, as in the reference design */}
          <svg className="kpi-waves" viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-10 70 C 40 20, 90 110, 150 50 S 260 10, 310 40" />
            <path d="M-10 85 C 45 35, 95 125, 155 65 S 265 25, 310 55" />
            <path d="M-10 100 C 50 50, 100 140, 160 80 S 270 40, 310 70" />
          </svg>
          <div className="kpi-text">
            <span className="kpi-label">{kpi.label}</span>
            <span className="kpi-value">{kpi.value.toLocaleString()}</span>
            <span className="kpi-change">{kpi.change}</span>
          </div>
          <div className="kpi-icon">{icons[kpi.id]}</div>
        </div>
      ))}
    </div>
  )
}
