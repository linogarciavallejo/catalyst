namespace Catalyst.Application.Security;

/// <summary>
/// Service for extracting claims and user information from JWT tokens
/// </summary>
public interface IClaimsService
{
    /// <summary>
    /// Extracts the user ID from the current HTTP context claims
    /// </summary>
    string? GetUserId();

    /// <summary>
    /// Extracts the user email from the current HTTP context claims
    /// </summary>
    string? GetUserEmail();

    /// <summary>
    /// Extracts a specific claim value by type
    /// </summary>
    string? GetClaimValue(string claimType);

    /// <summary>
    /// Gets the user's display name (preferred username or name)
    /// </summary>
    string? GetDisplayName();

    /// <summary>
    /// Checks if the current user is authenticated
    /// </summary>
    bool IsAuthenticated();
}
