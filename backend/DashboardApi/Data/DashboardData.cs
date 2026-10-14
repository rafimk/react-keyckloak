namespace DashboardApi.Data;

public record Kpi(string Id, string Label, int Value, string Change);
public record SalesRow(string Label, int Sales, int Target);
public record SalesTab(string Id, string Title, IReadOnlyList<SalesRow> Data);
public record Goal(int Achieved, string Label);
public record TrafficPoint(string Week, int Visitors, int Signups);
public record Performance(int Value, int Max, string Label);
public record AttendanceCount(string Id, string Label, int Count);

/// <summary>Initial sample data that seeds <see cref="DashboardStore"/>. Replace with a database or service later.</summary>
public static class DashboardData
{
    public static readonly IReadOnlyList<Kpi> Kpis =
    [
        new("planned", "Planned", 128, "+12 this week"),
        new("completed", "Completed", 342, "+28 this week"),
        new("cancelled", "Cancelled", 17, "-3 this week"),
    ];

    public static readonly IReadOnlyList<SalesTab> SalesTabs =
    [
        new("month", "By month",
        [
            new("Jan", 4200, 4000), new("Feb", 3800, 4000), new("Mar", 5100, 4500), new("Apr", 4700, 4500),
            new("May", 6200, 5000), new("Jun", 5800, 5000), new("Jul", 6900, 5500), new("Aug", 6400, 5500),
        ]),
        new("region", "By region",
        [
            new("North", 11200, 10000), new("South", 8600, 9500), new("East", 9900, 9000), new("West", 13400, 12000),
        ]),
        new("product", "By product",
        [
            new("Laptops", 14800, 13000), new("Phones", 12100, 12500), new("Tablets", 6300, 7000),
            new("Accessories", 5400, 5000), new("Services", 4500, 4000),
        ]),
        new("channel", "By channel",
        [
            new("Online", 19800, 18000), new("Retail", 12600, 14000), new("Partners", 7400, 7000), new("Direct", 3300, 3500),
        ]),
        new("rep", "By sales rep",
        [
            new("A. Khan", 9200, 8500), new("B. Lopez", 8100, 8500), new("C. Chen", 10400, 9000),
            new("D. Smith", 7300, 8000), new("E. Novak", 8100, 7500),
        ]),
    ];

    public static readonly Goal QuarterlyGoal = new(72, "Q3 revenue goal");

    public static readonly IReadOnlyList<TrafficPoint> WeeklyTraffic =
    [
        new("W1", 1200, 140), new("W2", 1450, 165), new("W3", 1380, 150), new("W4", 1720, 210),
        new("W5", 1650, 198), new("W6", 1980, 245), new("W7", 2240, 270), new("W8", 2100, 262),
    ];

    /// <summary>Actual sales as a percentage of target.</summary>
    public static readonly Performance SalesPerformance = new(112, 150, "Sales vs. target");

    public static readonly IReadOnlyList<AttendanceCount> Attendance =
    [
        new("present", "Present", 42),
        new("absent", "Absent", 3),
        new("leave", "On leave", 5),
        new("remote", "Remote", 12),
    ];
}
