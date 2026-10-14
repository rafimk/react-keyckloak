using DashboardApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace DashboardApi.Hubs;

/// <summary>
/// Pushes live dashboard updates. Clients only listen; the server sends one event per widget
/// (see <see cref="DashboardEvents"/>) with the same JSON shape as the matching REST endpoint.
/// </summary>
[Authorize(Policy = Policies.PermittedUser)]
public class DashboardHub : Hub;

public static class DashboardEvents
{
    public const string Kpis = "kpis";
    public const string Sales = "sales";
    public const string Goal = "goal";
    public const string Performance = "performance";
    public const string Traffic = "traffic";
    public const string Attendance = "attendance";
}
