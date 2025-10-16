namespace Catalyst.WebApi.Dtos;

/// <summary>
/// Login request with email and password
/// </summary>
public class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
}

/// <summary>
/// Register request with email, password, and optional display name
/// </summary>
public class RegisterRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string DisplayName { get; set; }
}

/// <summary>
/// Login response with JWT token
/// </summary>
public class LoginResponse
{
    public string AccessToken { get; set; }
    public string TokenType { get; set; } = "Bearer";
    public int ExpiresIn { get; set; }
    public string UserId { get; set; }
    public string Email { get; set; }
    public string DisplayName { get; set; }
}

/// <summary>
/// User profile response
/// </summary>
public class UserProfileDto
{
    public string Id { get; set; }
    public string Email { get; set; }
    public string DisplayName { get; set; }
    public DateTime CreatedAt { get; set; }
}
