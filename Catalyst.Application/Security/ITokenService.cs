using System.Security.Claims;

namespace Catalyst.Application.Security;

/// <summary>
/// Service for generating and validating JWT tokens
/// Decoupled from authentication mechanism (can use Exchange, DB, LDAP, or Workday)
/// </summary>
public interface ITokenService
{
    /// <summary>
    /// Generates a JWT token for the given user
    /// </summary>
    string GenerateToken(string userId, string email, string displayName);

    /// <summary>
    /// Validates and extracts claims from a JWT token
    /// </summary>
    ClaimsPrincipal? ValidateToken(string token);
}
