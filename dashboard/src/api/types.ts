// Shapes returned by the DashboardApi backend (backend/DashboardApi/Data/DashboardData.cs).

/** GET /api/me */
export interface Me {
  username: string
  name: string | null
  email: string | null
  /** Whether the user is listed in the API's PermittedUsers setting. */
  isPermitted: boolean
}

export interface Kpi {
  id: string // 'planned' | 'completed' | 'cancelled'; selects the card colour and icon
  label: string
  value: number
  change: string
}

export interface SalesRow {
  label: string
  sales: number
  target: number
}

export interface SalesTab {
  id: string
  title: string
  data: SalesRow[]
}

export interface Goal {
  achieved: number
  label: string
}

export interface TrafficPoint {
  week: string
  visitors: number
  signups: number
}

export interface Performance {
  value: number
  max: number
  label: string
}

export interface AttendanceCount {
  id: string
  label: string
  count: number
}
