using System.Threading.Tasks;

namespace Catalyst.Application.Security;

/// <summary>
/// User login credentials request
/// </summary>
public class LoginCredentials
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

/// <summary>
/// Authentication result after login
/// </summary>
public class AuthenticationResult
{
    public bool IsSuccess { get; set; }
    public string? Message { get; set; }
    public string? UserId { get; set; }
    public string? DisplayName { get; set; }
    public string? Email { get; set; }
    public string? Token { get; set; }
}

/// <summary>
/// Service for authenticating users
/// Abstracted from specific auth mechanism (can be DB, Exchange, LDAP, Workday, etc)
/// </summary>
public interface IAuthenticationService
{
    /// <summary>
    /// Authenticates user with email and password
    /// Can be implemented with:
    /// - Database (hashed password)
    /// - Exchange Server (SMTP)
    /// - LDAP (Active Directory)
    /// - Workday API (future)
    ///
    /// Returns AuthenticationResult with user info and JWT token
    /// </summary>
    Task<AuthenticationResult> AuthenticateAsync(LoginCredentials credentials);

    /// <summary>
    /// Registers a new user (optional - depends on auth mechanism)
    /// </summary>
    Task<AuthenticationResult> RegisterAsync(LoginCredentials credentials, string displayName);
}
