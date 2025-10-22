using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Catalyst.Application.Security;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Catalyst.Infrastructure.Authentication;

/// <summary>
/// JWT token generation and validation
/// Uses symmetric key (HMAC-SHA256) for simplicity
/// Can be upgraded to asymmetric keys (RSA) for production
/// </summary>
public class TokenService : ITokenService
{
    private readonly JwtSettings _jwtSettings;
    private readonly SigningCredentials _signingCredentials;
    private readonly TokenValidationParameters _tokenValidationParameters;

    public TokenService(IOptions<JwtSettings> jwtSettingsOptions)
    {
        _jwtSettings = jwtSettingsOptions.Value ?? throw new ArgumentNullException(nameof(jwtSettingsOptions));

        // Validate configuration
        if (string.IsNullOrEmpty(_jwtSettings.SecretKey))
            throw new InvalidOperationException("JwtSettings.SecretKey is not configured");

        if (_jwtSettings.SecretKey.Length < 32)
            throw new InvalidOperationException("JwtSettings.SecretKey must be at least 32 characters");

        // Create signing key
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
        _signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Setup token validation parameters
        _tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ValidateIssuer = true,
            ValidIssuer = _jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = _jwtSettings.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(5)  // Allow 5-minute clock skew
        };
    }

    /// <summary>
    /// Generates JWT token with user claims
    /// Token includes: UserId, email, display name, expiration
    /// </summary>
    public string GenerateToken(string userId, string email, string displayName)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(email))
            throw new ArgumentException("UserId and email are required");

        var tokenHandler = new JwtSecurityTokenHandler();

        var claims = new List<Claim>
        {
            new Claim("oid", userId),  // Azure AD-like object ID (our UserId)
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Name, displayName ?? email),
            new Claim("email", email)  // Duplicate for compatibility
        };

        var expirationTime = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expirationTime,
            Issuer = _jwtSettings.Issuer,
            Audience = _jwtSettings.Audience,
            SigningCredentials = _signingCredentials
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    /// <summary>
    /// Validates JWT token and returns claims principal
    /// Returns null if token is invalid or expired
    /// </summary>
    public ClaimsPrincipal? ValidateToken(string token)
    {
        if (string.IsNullOrEmpty(token))
            return null;

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler
            {
                // Avoid claim type remapping so callers can access "oid" directly.
                MapInboundClaims = false
            };
            var principal = tokenHandler.ValidateToken(token, _tokenValidationParameters, out SecurityToken validatedToken);
            return principal;
        }
        catch
        {
            // Invalid token
            return null;
        }
    }
}
