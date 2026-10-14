import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import type { Goal } from '../api/types'

export default function GoalGauge({ goal }: { goal: Goal }) {
  const { achieved, label } = goal
  const data = [
    { name: 'Achieved', value: achieved },
    { name: 'Remaining', value: 100 - achieved },
  ]

  return (
    <div className="gauge">
      {/* 2:1 box; radius % is relative to a quarter of the width, so 190% just fits the half circle */}
      <ResponsiveContainer width="100%" aspect={2}>
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          {/* Half donut: sweep from 180° (left) to 0° (right), centered at the bottom */}
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius="135%"
            outerRadius="190%"
            stroke="none"
            isAnimationActive
          >
            <Cell fill="var(--c1)" />
            <Cell fill="var(--track)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="gauge-label">
        <span className="gauge-value">{achieved}%</span>
        <span className="gauge-caption">{label}</span>
      </div>
    </div>
  )
}
