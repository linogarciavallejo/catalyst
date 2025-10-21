using System.Security.Claims;
using Catalyst.Application.Security;
using Microsoft.AspNetCore.Http;

namespace Catalyst.Infrastructure.Authentication;

/// <summary>
/// Implementation of claims extraction from JWT tokens
/// Integrates with ASP.NET Core HttpContext to read authenticated user claims
/// </summary>
public class ClaimsService : IClaimsService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ClaimsService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
    }

    /// <summary>
    /// Gets the user ID from ObjectId or oid claim
    /// Maps: "oid" (Azure AD object ID) → UserId
    /// Falls back to NameIdentifier if oid not present
    /// </summary>
    public string? GetUserId()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        if (user == null)
            return null;

        // Primary: Azure AD object ID
        var oid = user.FindFirst("oid")?.Value;
        if (!string.IsNullOrEmpty(oid))
            return oid;

        // Fallback: .NET Core standard
        return user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }

    /// <summary>
    /// Gets the user email from email claim
    /// </summary>
    public string? GetUserEmail()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        if (user == null)
            return null;

        return user.FindFirst(ClaimTypes.Email)?.Value
            ?? user.FindFirst("email")?.Value;
    }

    /// <summary>
    /// Gets the user's display name (preferred_username or Name)
    /// </summary>
    public string? GetDisplayName()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        if (user == null)
            return null;

        return user.FindFirst("preferred_username")?.Value
            ?? user.FindFirst(ClaimTypes.Name)?.Value
            ?? user.FindFirst("name")?.Value;
    }

    /// <summary>
    /// Generic claim extraction by type
    /// </summary>
    public string? GetClaimValue(string claimType)
    {
        var user = _httpContextAccessor.HttpContext?.User;
        if (user == null || string.IsNullOrEmpty(claimType))
            return null;

        return user.FindFirst(claimType)?.Value;
    }

    /// <summary>
    /// Checks if user is authenticated and has an identity
    /// </summary>
    public bool IsAuthenticated()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        return user?.Identity?.IsAuthenticated ?? false;
    }
}
