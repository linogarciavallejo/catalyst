using Microsoft.AspNetCore.Authorization;
using Catalyst.Infrastructure.Authentication;
using Catalyst.WebApi.Dtos;

namespace Catalyst.WebApi.Endpoints;

/// <summary>
/// Authentication endpoints for login and user profile
/// Uses simple email/password authentication
/// Can be swapped with Exchange, LDAP, or Workday authentication
/// </summary>
public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth")
            .WithName("Authentication")
            .WithOpenApi();

        group.MapPost("/login", Login)
            .WithName("Login")
            .WithDescription("Login with email and password")
            .AllowAnonymous();

        group.MapPost("/register", Register)
            .WithName("Register")
            .WithDescription("Register new user with email and password")
            .AllowAnonymous();

        group.MapGet("/profile", GetProfile)
            .WithName("GetProfile")
            .WithDescription("Get current user profile (requires authentication)");

        group.MapPost("/refresh-token", RefreshToken)
            .WithName("RefreshToken")
            .WithDescription("Refresh JWT token");

        group.MapPost("/logout", Logout)
            .WithName("Logout")
            .WithDescription("Logout (token invalidation handled client-side)");
    }

    /// <summary>
    /// Login with email and password
    /// Returns JWT token that must be included in Authorization header for subsequent requests
    /// </summary>
    private static async Task<IResult> Login(
        LoginRequest request,
        IAuthenticationService authService)
    {
        if (string.IsNullOrEmpty(request?.Email) || string.IsNullOrEmpty(request?.Password))
            return Results.BadRequest(new { error = "Email and password are required" });

        var credentials = new LoginCredentials
        {
            Email = request.Email,
            Password = request.Password
        };

        var result = await authService.AuthenticateAsync(credentials);

        if (!result.IsSuccess)
            return Results.BadRequest(new { error = result.Message });

        var response = new LoginResponse
        {
            AccessToken = result.Token,
            TokenType = "Bearer",
            ExpiresIn = 3600,  // 60 minutes
            UserId = result.UserId,
            Email = result.Email,
            DisplayName = result.DisplayName
        };

        return Results.Ok(response);
    }

    /// <summary>
    /// Register new user with email and password
    /// </summary>
    private static async Task<IResult> Register(
        RegisterRequest request,
        IAuthenticationService authService)
    {
        if (string.IsNullOrEmpty(request?.Email) || string.IsNullOrEmpty(request?.Password))
            return Results.BadRequest(new { error = "Email and password are required" });

        var credentials = new LoginCredentials
        {
            Email = request.Email,
            Password = request.Password
        };

        var result = await authService.RegisterAsync(credentials, request.DisplayName);

        if (!result.IsSuccess)
            return Results.BadRequest(new { error = result.Message });

        var response = new LoginResponse
        {
            AccessToken = result.Token,
            TokenType = "Bearer",
            ExpiresIn = 3600,
            UserId = result.UserId,
            Email = result.Email,
            DisplayName = result.DisplayName
        };

        return Results.Ok(response);
    }

    /// <summary>
    /// Get current authenticated user profile
    /// Requires valid JWT token in Authorization header
    /// </summary>
    [Authorize]
    private static async Task<IResult> GetProfile(
        IClaimsService claimsService)
    {
        var userId = claimsService.GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Results.Unauthorized();

        var profile = new UserProfileDto
        {
            Id = userId,
            Email = claimsService.GetUserEmail() ?? "user@example.com",
            DisplayName = claimsService.GetDisplayName() ?? "User",
            CreatedAt = DateTime.UtcNow
        };

        return Results.Ok(profile);
    }

    /// <summary>
    /// Refresh JWT token to extend session
    /// Requires valid JWT token in Authorization header
    /// </summary>
    [Authorize]
    private static async Task<IResult> RefreshToken(
        IClaimsService claimsService,
        ITokenService tokenService)
    {
        var userId = claimsService.GetUserId();
        var email = claimsService.GetUserEmail();
        var displayName = claimsService.GetDisplayName();

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(email))
            return Results.Unauthorized();

        var newToken = tokenService.GenerateToken(userId, email, displayName ?? email);

        var response = new
        {
            accessToken = newToken,
            tokenType = "Bearer",
            expiresIn = 3600
        };

        return Results.Ok(response);
    }

    /// <summary>
    /// Logout endpoint
    /// Note: JWT is stateless, so logout is client-side (delete token)
    /// For token blacklist support, add token revocation list to Redis/MongoDB
    /// </summary>
    [Authorize]
    private static async Task<IResult> Logout(
        IClaimsService claimsService)
    {
        var userId = claimsService.GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Results.Unauthorized();

        // TODO: Add to token blacklist if implementing server-side logout
        return Results.Ok(new { success = true, message = "Logged out successfully. Please discard the token." });
    }
}
