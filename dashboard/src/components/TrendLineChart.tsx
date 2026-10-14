import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TrafficPoint } from '../api/types'

export default function TrendLineChart({ data, height = 300 }: { data: TrafficPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: -8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--grid)" />
        <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
        <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
        <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="visitors" name="Visitors" stroke="var(--c1)" strokeWidth={2} dot={false} />
        <Line yAxisId="right" type="monotone" dataKey="signups" name="Sign-ups" stroke="var(--c3)" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
