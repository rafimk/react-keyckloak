import Header from './components/Header'
import KpiCards from './components/KpiCards'
import ChartCard from './components/ChartCard'
import SalesBarChart from './components/SalesBarChart'
import GoalGauge from './components/GoalGauge'
import Speedometer from './components/Speedometer'
import TrendLineChart from './components/TrendLineChart'
import AttendanceCards from './components/AttendanceCards'
import AutoTabs from './components/AutoTabs'
import Loadable from './components/Loadable'
import { useLiveApi } from './api/useLiveApi'
import type { AttendanceCount, Goal, Kpi, Performance, SalesTab, TrafficPoint } from './api/types'

export default function App() {
  const kpis = useLiveApi<Kpi[]>('/api/dashboard/kpis', 'kpis')
  const sales = useLiveApi<SalesTab[]>('/api/dashboard/sales', 'sales')
  const goal = useLiveApi<Goal>('/api/dashboard/goal', 'goal')
  const performance = useLiveApi<Performance>('/api/dashboard/performance', 'performance')
  const traffic = useLiveApi<TrafficPoint[]>('/api/dashboard/traffic', 'traffic')
  const attendance = useLiveApi<AttendanceCount[]>('/api/dashboard/attendance', 'attendance')

  return (
    <div className="app">
      <Header />
      <main className="content">
        <Loadable state={kpis} minHeight={120}>
          {(items) => <KpiCards items={items} />}
        </Loadable>

        {/* Left 60%: sales tabs at full height. Right 40%: 2×2 grid of smaller cards. */}
        <div className="layout">
          <ChartCard title="Sales" subtitle="Sales vs. target, USD" className="sales-card">
            <Loadable state={sales} minHeight={350}>
              {(tabs) => (
                <AutoTabs
                  tabs={tabs.map((tab) => ({
                    id: tab.id,
                    title: tab.title,
                    content: (
                      <div className="chart-fill">
                        <SalesBarChart data={tab.data} />
                      </div>
                    ),
                  }))}
                  interval={5000}
                />
              )}
            </Loadable>
          </ChartCard>

          <div className="side-grid">
            <ChartCard title="Quarterly goal" subtitle="Share of target reached">
              <Loadable state={goal} minHeight={160}>
                {(g) => <GoalGauge goal={g} />}
              </Loadable>
            </ChartCard>
            <ChartCard title="Sales performance" subtitle="Actual vs. target, %">
              <Loadable state={performance} minHeight={160}>
                {(p) => <Speedometer performance={p} />}
              </Loadable>
            </ChartCard>
            <ChartCard title="Traffic trend" subtitle="Weekly visitors and sign-ups">
              <Loadable state={traffic} minHeight={200}>
                {(points) => <TrendLineChart data={points} height={210} />}
              </Loadable>
            </ChartCard>
            <ChartCard title="Attendance today" subtitle="Staff status">
              <Loadable state={attendance} minHeight={200}>
                {(items) => <AttendanceCards items={items} />}
              </Loadable>
            </ChartCard>
          </div>
        </div>
      </main>
    </div>
  )
}
