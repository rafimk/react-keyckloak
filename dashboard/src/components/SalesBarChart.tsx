import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SalesRow } from '../api/types'

export default function SalesBarChart({ data }: { data: SalesRow[] }) {
  return (
    // Fills its parent (.chart-fill), so the chart grows with the card.
    <ResponsiveContainer width="100%" height="100%">
      {/* layout="vertical" makes the bars horizontal: categories on Y, values on X */}
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--grid)" />
        <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="label"
          width={90}
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'var(--muted)', fontSize: 12 }}
        />
        <Tooltip cursor={{ fill: 'var(--hover)' }} />
        <Legend />
        <Bar dataKey="sales" name="Sales" fill="var(--c1)" radius={[0, 4, 4, 0]} />
        <Bar dataKey="target" name="Target" fill="var(--c2)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
