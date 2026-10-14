namespace DashboardApi.Data;

/// <summary>
/// Current dashboard data, shared by the REST endpoints and the live-update simulator.
/// Each property holds an immutable snapshot that is swapped as a whole, so readers never
/// see a half-updated value and no locking is needed.
/// </summary>
public class DashboardStore
{
    public IReadOnlyList<Kpi> Kpis { get; set; } = DashboardData.Kpis;
    public IReadOnlyList<SalesTab> SalesTabs { get; set; } = DashboardData.SalesTabs;
    public Goal QuarterlyGoal { get; set; } = DashboardData.QuarterlyGoal;
    public Performance SalesPerformance { get; set; } = DashboardData.SalesPerformance;
    public IReadOnlyList<TrafficPoint> WeeklyTraffic { get; set; } = DashboardData.WeeklyTraffic;
    public IReadOnlyList<AttendanceCount> Attendance { get; set; } = DashboardData.Attendance;
}
