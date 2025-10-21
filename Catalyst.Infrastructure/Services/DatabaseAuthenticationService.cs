using System.Security.Cryptography;
using System.Text;
using Catalyst.Application.Interfaces;
using Catalyst.Application.Security;
using Catalyst.Domain.ValueObjects;
using MongoDB.Bson;

namespace Catalyst.Infrastructure.Services;

/// <summary>
/// Database-backed authentication using MongoDB
/// Stores email and hashed passwords
/// Can be swapped with Exchange/LDAP/Workday implementation
/// </summary>
public class DatabaseAuthenticationService : IAuthenticationService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public DatabaseAuthenticationService(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
    }

    /// <summary>
    /// Authenticates user by email and password
    /// Validates password hash against stored hash
    /// Returns JWT token on success
    /// </summary>
    public async Task<AuthenticationResult> AuthenticateAsync(LoginCredentials credentials)
    {
        if (string.IsNullOrEmpty(credentials?.Email) || string.IsNullOrEmpty(credentials?.Password))
            return new AuthenticationResult
            {
                IsSuccess = false,
                Message = "Email and password are required"
            };

        try
        {
            // Find user by email
            var user = await _userRepository.GetByEmailAsync(credentials.Email);
            if (user == null)
                return new AuthenticationResult
                {
                    IsSuccess = false,
                    Message = "Invalid email or password"
                };

            // Verify password (stored as BCrypt hash in Domain entity)
            if (!VerifyPassword(credentials.Password, user.PasswordHash ?? ""))
                return new AuthenticationResult
                {
                    IsSuccess = false,
                    Message = "Invalid email or password"
                };

            // Generate JWT token
            var token = _tokenService.GenerateToken(
                user.Id.Value,
                user.Email.Value,
                user.Name ?? user.Email.Value
            );

            return new AuthenticationResult
            {
                IsSuccess = true,
                UserId = user.Id.Value,
                Email = user.Email.Value,
                DisplayName = user.Name ?? user.Email.Value,
                Token = token
            };
        }
        catch (Exception ex)
        {
            return new AuthenticationResult
            {
                IsSuccess = false,
                Message = $"Authentication error: {ex.Message}"
            };
        }
    }

    /// <summary>
    /// Registers a new user
    /// Hashes password and stores in database
    /// </summary>
    public async Task<AuthenticationResult> RegisterAsync(LoginCredentials credentials, string displayName)
    {
        if (string.IsNullOrEmpty(credentials?.Email) || string.IsNullOrEmpty(credentials?.Password))
            return new AuthenticationResult
            {
                IsSuccess = false,
                Message = "Email and password are required"
            };

        try
        {
            // Check if user already exists
            var existingUser = await _userRepository.GetByEmailAsync(credentials.Email);
            if (existingUser != null)
                return new AuthenticationResult
                {
                    IsSuccess = false,
                    Message = "User with this email already exists"
                };

            // Hash password
            var hashedPassword = HashPassword(credentials.Password);

            // Create new user
            var user = new Domain.Entities.User
            {
                Id = UserId.Create(ObjectId.GenerateNewId().ToString()),
                Email = Email.Create(credentials.Email),
                PasswordHash = hashedPassword,
                Name = displayName ?? credentials.Email,
                EipPoints = EipPoints.Create(0),
                CreatedAt = DateTime.UtcNow
            };

            // Save to database
            await _userRepository.AddAsync(user);

            // Generate JWT token
            var token = _tokenService.GenerateToken(user.Id.Value, user.Email.Value, user.Name);

            return new AuthenticationResult
            {
                IsSuccess = true,
                UserId = user.Id.Value,
                Email = user.Email.Value,
                DisplayName = user.Name,
                Token = token,
                Message = "Registration successful"
            };
        }
        catch (Exception ex)
        {
            return new AuthenticationResult
            {
                IsSuccess = false,
                Message = $"Registration error: {ex.Message}"
            };
        }
    }

    /// <summary>
    /// Hashes password using PBKDF2 with SHA256
    /// Simple alternative to BCrypt (BCrypt package not added)
    /// Production: Consider adding BCrypt NuGet package
    /// </summary>
    private static string HashPassword(string password)
    {
        // Generate salt
        var salt = new byte[16];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }

        // Hash password with PBKDF2
        var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256);
        var hash = pbkdf2.GetBytes(20);

        // Combine salt and hash
        var hashWithSalt = new byte[36];
        Buffer.BlockCopy(salt, 0, hashWithSalt, 0, 16);
        Buffer.BlockCopy(hash, 0, hashWithSalt, 16, 20);

        return Convert.ToBase64String(hashWithSalt);
    }

    /// <summary>
    /// Verifies password against stored hash
    /// </summary>
    private static bool VerifyPassword(string password, string storedHash)
    {
        try
        {
            var hashBytes = Convert.FromBase64String(storedHash);
            var salt = new byte[16];
            Buffer.BlockCopy(hashBytes, 0, salt, 0, 16);

            var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256);
            var hash = pbkdf2.GetBytes(20);

            for (int i = 0; i < 20; i++)
            {
                if (hashBytes[i + 16] != hash[i])
                    return false;
            }

            return true;
        }
        catch
        {
            return false;
        }
    }
}
