using DashboardApi.Data;
using DashboardApi.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace DashboardApi.Services;

/// <summary>
/// Stand-in for a real data source: every few seconds it nudges the numbers, stores them and
/// pushes them to connected clients. Replace with real change events (database, queue, ...).
/// </summary>
public class LiveDataSimulator(DashboardStore store, IHubContext<DashboardHub> hub, ILogger<LiveDataSimulator> logger)
    : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromSeconds(3);

    private int _tick;

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        using var timer = new PeriodicTimer(Interval);
        while (await timer.WaitForNextTickAsync(ct))
        {
            try
            {
                await TickAsync(ct);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Live data update failed");
            }
        }
    }

    private async Task TickAsync(CancellationToken ct)
    {
        _tick++;
        var clients = hub.Clients.All;

        // Every tick: KPIs, speedometer, attendance, latest traffic point.
        // KPIs: some planned items get completed, some get cancelled, new ones get planned.
        var kpis = store.Kpis.ToDictionary(k => k.Id);
        var done = Random.Shared.Next(0, 3);
        var dropped = Random.Shared.Next(0, 10) == 0 ? 1 : 0;
        var added = Random.Shared.Next(0, 4);
        store.Kpis =
        [
            kpis["planned"] with { Value = Math.Max(0, kpis["planned"].Value - done - dropped + added) },
            kpis["completed"] with { Value = kpis["completed"].Value + done },
            kpis["cancelled"] with { Value = kpis["cancelled"].Value + dropped },
        ];
        await clients.SendAsync(DashboardEvents.Kpis, store.Kpis, ct);

        var perf = store.SalesPerformance;
        store.SalesPerformance = perf with { Value = Math.Clamp(perf.Value + Random.Shared.Next(-6, 7), 60, perf.Max) };
        await clients.SendAsync(DashboardEvents.Performance, store.SalesPerformance, ct);

        store.Attendance = store.Attendance
            .Select(a => a with { Count = Math.Max(0, a.Count + Random.Shared.Next(-1, 2)) })
            .ToList();
        await clients.SendAsync(DashboardEvents.Attendance, store.Attendance, ct);

        var traffic = store.WeeklyTraffic.ToList();
        var last = traffic[^1];
        if (_tick % 10 == 0)
        {
            // Roll the window: drop the oldest week, start a new one.
            var week = int.Parse(last.Week[1..]) + 1;
            traffic.RemoveAt(0);
            traffic.Add(new($"W{week}", last.Visitors, last.Signups));
        }
        else
        {
            traffic[^1] = last with
            {
                Visitors = Math.Max(500, last.Visitors + Random.Shared.Next(-60, 90)),
                Signups = Math.Max(50, last.Signups + Random.Shared.Next(-8, 12)),
            };
        }
        store.WeeklyTraffic = traffic;
        await clients.SendAsync(DashboardEvents.Traffic, store.WeeklyTraffic, ct);

        // Less often: quarterly goal and sales bars.
        if (_tick % 3 == 0)
        {
            var goal = store.QuarterlyGoal;
            store.QuarterlyGoal = goal with { Achieved = Math.Min(100, goal.Achieved + Random.Shared.Next(0, 2)) };
            await clients.SendAsync(DashboardEvents.Goal, store.QuarterlyGoal, ct);

            store.SalesTabs = store.SalesTabs
                .Select(tab => tab with
                {
                    Data = tab.Data.Select(r => r with { Sales = Math.Max(0, r.Sales + Random.Shared.Next(-300, 400)) }).ToList(),
                })
                .ToList();
            await clients.SendAsync(DashboardEvents.Sales, store.SalesTabs, ct);
        }
    }
}
