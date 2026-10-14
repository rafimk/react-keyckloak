import { useEffect, useState } from 'react'
import type { Performance } from '../api/types'

// Geometry in SVG units: a half circle centred at (CX, CY), sweeping from the left (0) to the right (max).
const CX = 100
const CY = 100
const R = 78
const STROKE = 14

/** Point on the arc for a value, where 0 is the far left and `max` the far right. */
function point(value: number, max: number, radius = R) {
  const angle = Math.PI - (value / max) * Math.PI
  return { x: CX + radius * Math.cos(angle), y: CY - radius * Math.sin(angle) }
}

function arc(from: number, to: number, max: number) {
  const a = point(from, max)
  const b = point(to, max)
  return `M ${a.x} ${a.y} A ${R} ${R} 0 0 1 ${b.x} ${b.y}`
}

export default function Speedometer({ performance }: { performance: Performance }) {
  const { value, max, label } = performance
  const clamped = Math.min(Math.max(value, 0), max)

  // Start at 0 and swing to the value after mount so the needle animates in.
  const [shown, setShown] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(clamped))
    return () => cancelAnimationFrame(id)
  }, [clamped])

  // Below 80% of target is poor, 80–100% is close, at or above target is good.
  const zones = [
    { from: 0, to: Math.min(80, max), color: 'var(--danger)' },
    { from: Math.min(80, max), to: Math.min(100, max), color: 'var(--warn)' },
    { from: Math.min(100, max), to: max, color: 'var(--ok)' },
  ].filter((z) => z.to > z.from)
  const ticks = [0, max / 3, (2 * max) / 3, max].map(Math.round)
  const valueColor = value < 80 ? 'var(--danger)' : value < 100 ? 'var(--warn)' : 'var(--ok)'

  return (
    <div className="speedo">
      <svg viewBox="0 0 200 128" role="img" aria-label={`${label}: ${value}%`}>
        {zones.map((z) => (
          <path key={z.from} d={arc(z.from, z.to, max)} stroke={z.color} strokeWidth={STROKE} fill="none" />
        ))}
        {ticks.map((t) => {
          const p = point(t, max, R - STROKE - 6)
          return (
            <text key={t} x={p.x} y={p.y + 3} className="speedo-tick" textAnchor="middle">
              {t}
            </text>
          )
        })}
        {/* Needle drawn pointing at 0, then rotated clockwise by the value's share of 180° */}
        <g
          className="speedo-needle"
          style={{ transform: `rotate(${(shown / max) * 180}deg)`, transformOrigin: `${CX}px ${CY}px` }}
        >
          <path d={`M ${CX - R + 10} ${CY} L ${CX} ${CY - 3.5} L ${CX} ${CY + 3.5} Z`} />
        </g>
        <circle cx={CX} cy={CY} r={7} className="speedo-hub" />
        <text x={CX} y={CY + 26} textAnchor="middle" className="speedo-value" style={{ fill: valueColor }}>
          {value}%
        </text>
      </svg>
      <span className="gauge-caption">{label}</span>
    </div>
  )
}
