namespace DashboardApi.Authorization;

/// <summary>Bound from the root of appsettings.json.</summary>
public class AccessOptions
{
    /// <summary>
    /// Comma-separated users allowed to use the dashboard. Each entry is matched against the
    /// token's <c>preferred_username</c> or its <c>sub</c> (the Keycloak user id), ignoring case.
    /// Empty means nobody is permitted.
    /// </summary>
    public string PermittedUsers { get; set; } = "";

    public bool IsPermitted(params string?[] userIds)
    {
        var permitted = PermittedUsers.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        return userIds.Any(id => !string.IsNullOrEmpty(id) && permitted.Contains(id, StringComparer.OrdinalIgnoreCase));
    }
}
