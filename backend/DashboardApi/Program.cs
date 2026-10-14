using System.Security.Claims;
using DashboardApi.Authorization;
using DashboardApi.Data;
using DashboardApi.Hubs;
using DashboardApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

var keycloak = builder.Configuration.GetSection("Keycloak");

// Validate Keycloak access tokens: signature (keys fetched from the realm's JWKS endpoint),
// issuer, audience and lifetime.
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = keycloak["Authority"];
        options.Audience = keycloak["Audience"];
        // Keycloak runs on plain http locally; require https everywhere else.
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        options.MapInboundClaims = false;
        options.TokenValidationParameters.NameClaimType = "preferred_username";

        // Browsers can't set an Authorization header on WebSockets, so the SignalR client sends
        // the token as ?access_token=. Accept it from the query string only for hub requests.
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var token = context.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(token) && context.HttpContext.Request.Path.StartsWithSegments("/hubs"))
                {
                    context.Token = token;
                }
                return Task.CompletedTask;
            },
        };
    });
// Authorization: a valid Keycloak token is not enough, the user must also be in PermittedUsers.
// That policy is the default (plain RequireAuthorization() / [Authorize]) and the fallback (any
// endpoint without explicit metadata), so new endpoints are locked down unless opted out.
builder.Services.Configure<AccessOptions>(builder.Configuration);
builder.Services.AddSingleton<IAuthorizationHandler, PermittedUserHandler>();
var permittedUserPolicy = new AuthorizationPolicyBuilder()
    .RequireAuthenticatedUser()
    .AddRequirements(new PermittedUserRequirement())
    .Build();
builder.Services.AddAuthorizationBuilder()
    .AddPolicy(Policies.Authenticated, p => p.RequireAuthenticatedUser())
    .AddPolicy(Policies.PermittedUser, permittedUserPolicy)
    .SetDefaultPolicy(permittedUserPolicy)
    .SetFallbackPolicy(permittedUserPolicy);

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy => policy
        .WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [])
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials())); // needed by the SignalR negotiate request

builder.Services.AddSignalR();
builder.Services.AddSingleton<DashboardStore>();
builder.Services.AddHostedService<LiveDataSimulator>();

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi().AllowAnonymous();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Open to any signed-in user so the frontend can tell "not permitted" apart from other errors
// and show its Unauthorized page. Every other endpoint answers non-permitted users with 403.
app.MapGet("/api/me", async (ClaimsPrincipal user, IAuthorizationService auth) => new
{
    username = user.Identity?.Name,
    name = user.FindFirstValue("name"),
    email = user.FindFirstValue("email"),
    isPermitted = (await auth.AuthorizeAsync(user, Policies.PermittedUser)).Succeeded,
}).RequireAuthorization(Policies.Authenticated);

var dashboard = app.MapGroup("/api/dashboard").RequireAuthorization(Policies.PermittedUser);

dashboard.MapGet("/kpis", (DashboardStore store) => store.Kpis);
dashboard.MapGet("/sales", (DashboardStore store) => store.SalesTabs);
dashboard.MapGet("/goal", (DashboardStore store) => store.QuarterlyGoal);
dashboard.MapGet("/traffic", (DashboardStore store) => store.WeeklyTraffic);
dashboard.MapGet("/performance", (DashboardStore store) => store.SalesPerformance);
dashboard.MapGet("/attendance", (DashboardStore store) => store.Attendance);

// Live updates. SignalR only checks the token when the connection opens, so close the
// connection when the token expires; the client reconnects with a freshly refreshed token.
app.MapHub<DashboardHub>("/hubs/dashboard", o => o.CloseOnAuthenticationExpiration = true);

app.Run();
