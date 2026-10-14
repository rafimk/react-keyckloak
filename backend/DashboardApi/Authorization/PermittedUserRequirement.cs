using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace DashboardApi.Authorization;

public static class Policies
{
    /// <summary>Valid Keycloak token only. Used by endpoints that must answer non-permitted users too.</summary>
    public const string Authenticated = nameof(Authenticated);

    /// <summary>Valid Keycloak token and listed in <see cref="AccessOptions.PermittedUsers"/>.</summary>
    public const string PermittedUser = nameof(PermittedUser);
}

/// <summary>The signed-in user must be listed in <see cref="AccessOptions.PermittedUsers"/>.</summary>
public class PermittedUserRequirement : IAuthorizationRequirement;

/// <summary>
/// Reads the list through <see cref="IOptionsMonitor{T}"/>, so edits to appsettings.json apply
/// to the next request without restarting the API.
/// </summary>
public class PermittedUserHandler(IOptionsMonitor<AccessOptions> options, ILogger<PermittedUserHandler> logger)
    : AuthorizationHandler<PermittedUserRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PermittedUserRequirement requirement)
    {
        var username = context.User.FindFirst("preferred_username")?.Value;
        var userId = context.User.FindFirst("sub")?.Value;

        if (options.CurrentValue.IsPermitted(username, userId))
        {
            context.Succeed(requirement);
        }
        else if (context.User.Identity?.IsAuthenticated == true)
        {
            logger.LogWarning("User {Username} ({UserId}) is not in PermittedUsers", username, userId);
        }

        return Task.CompletedTask;
    }
}
