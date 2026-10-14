import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  subtitle?: string
  className?: string
  children: ReactNode
}

export default function ChartCard({ title, subtitle, className, children }: ChartCardProps) {
  return (
    <section className={'card ' + (className ?? '')}>
      <div className="card-head">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="card-body">{children}</div>
    </section>
  )
}
