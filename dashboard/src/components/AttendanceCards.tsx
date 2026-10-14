import type { AttendanceCount } from '../api/types'

export default function AttendanceCards({ items }: { items: AttendanceCount[] }) {
  const total = items.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="attendance">
      {items.map((item) => (
        <div key={item.id} className={'attendance-cell ' + item.id}>
          <span className="attendance-label">
            <span className="dot" />
            {item.label}
          </span>
          <span className="attendance-count">{item.count}</span>
          <span className="attendance-share">{total ? Math.round((item.count / total) * 100) : 0}% of staff</span>
        </div>
      ))}
    </div>
  )
}
