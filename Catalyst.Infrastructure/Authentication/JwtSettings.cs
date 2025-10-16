namespace Catalyst.Infrastructure.Authentication;

/// <summary>
/// JWT token configuration settings from appsettings.json
/// </summary>
public class JwtSettings
{
    public string SecretKey { get; set; }
    public int ExpirationMinutes { get; set; }
    public string Issuer { get; set; }
    public string Audience { get; set; }
}
