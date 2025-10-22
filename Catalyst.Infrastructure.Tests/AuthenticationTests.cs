using System.IdentityModel.Tokens.Jwt;
using System.Reflection;
using System.Security.Claims;
using System.Text;
using Catalyst.Application.Interfaces;
using Catalyst.Application.Security;
using Catalyst.Domain.Entities;
using Catalyst.Domain.Enums;
using Catalyst.Domain.ValueObjects;
using Catalyst.Infrastructure.Authentication;
using Catalyst.Infrastructure.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NSubstitute;

namespace Catalyst.Infrastructure.Tests;

/// <summary>
/// Tests for JWT Token Service
/// </summary>
public class TokenServiceTests
{
    private const string SecretKey = "SuperSecretKeyThatIsAtLeast32CharactersLong!";
    private const string Issuer = "Catalyst";
    private const string Audience = "CatalystUsers";

    private readonly IOptions<JwtSettings> _jwtOptions;
    private readonly TokenService _tokenService;

    public TokenServiceTests()
    {
        var jwtSettings = new JwtSettings
        {
            SecretKey = SecretKey,
            Issuer = Issuer,
            Audience = Audience,
            ExpirationMinutes = 60
        };

        _jwtOptions = Options.Create(jwtSettings);
        _tokenService = new TokenService(_jwtOptions);
    }

    [Fact]
    public void GenerateToken_WithValidData_ReturnsValidToken()
    {
        // Arrange
        var userId = "507f1f77bcf86cd799439011";
        var email = "test@example.com";
        var displayName = "Test User";

        // Act
        var token = _tokenService.GenerateToken(userId, email, displayName);

        // Assert
        token.Should().NotBeNullOrEmpty();
        token.Split('.').Should().HaveCount(3); // JWT has 3 parts
    }

    [Fact]
    public void GenerateToken_WithDifferentUsers_GeneratesDifferentTokens()
    {
        // Arrange
        var userId1 = "507f1f77bcf86cd799439011";
        var userId2 = "507f1f77bcf86cd799439012";
        var email = "test@example.com";
        var displayName = "Test User";

        // Act
        var token1 = _tokenService.GenerateToken(userId1, email, displayName);
        var token2 = _tokenService.GenerateToken(userId2, email, displayName);

        // Assert
        token1.Should().NotBe(token2);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void GenerateToken_WithInvalidUserId_ThrowsException(string? userId)
    {
        // Act
        var action = () => _tokenService.GenerateToken(userId ?? "", "test@example.com", "Test");

        // Assert
        action.Should().Throw<ArgumentException>();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void GenerateToken_WithInvalidEmail_ThrowsException(string? email)
    {
        // Act
        var action = () => _tokenService.GenerateToken("507f1f77bcf86cd799439011", email ?? "", "Test");

        // Assert
        action.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void ValidateToken_WithValidToken_ReturnsClaimsPrincipal()
    {
        // Arrange
        var userId = "507f1f77bcf86cd799439011";
        var email = "test@example.com";
        var displayName = "Test User";
        var token = _tokenService.GenerateToken(userId, email, displayName);

        // Act
        var principal = _tokenService.ValidateToken(token);

        // Assert
        principal.Should().NotBeNull();
        principal!.FindFirst("oid")!.Value.Should().Be(userId);
        principal.FindFirst(ClaimTypes.Email)!.Value.Should().Be(email);
        principal.FindFirst(ClaimTypes.Name)!.Value.Should().Be(displayName);
    }

    [Fact]
    public void ValidateToken_WithInvalidToken_ReturnsNull()
    {
        // Arrange
        var token = _tokenService.GenerateToken("507f1f77bcf86cd799439011", "test@example.com", "Test User");

        // Act
        var principal = _tokenService.ValidateToken(token + "corrupted");

        // Assert
        principal.Should().BeNull();
    }

    [Fact]
    public void ValidateToken_WithEmptyToken_ReturnsNull()
    {
        // Act
        var principal = _tokenService.ValidateToken(string.Empty);

        // Assert
        principal.Should().BeNull();
    }

    [Fact]
    public void ValidateToken_WithExpiredToken_ReturnsNull()
    {
        // Arrange
        var tokenService = new TokenService(_jwtOptions);

        var handler = new JwtSecurityTokenHandler { MapInboundClaims = false };
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretKey));
        var expiredToken = handler.CreateToken(new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim("oid", "507f1f77bcf86cd799439011"),
                new Claim(ClaimTypes.Email, "test@example.com"),
                new Claim(ClaimTypes.Name, "Expired User"),
                new Claim("email", "test@example.com")
            }),
            Expires = DateTime.UtcNow.AddMinutes(-5),
            Issuer = Issuer,
            Audience = Audience,
            SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256)
        });
        var token = handler.WriteToken(expiredToken);

        // Act
        var principal = tokenService.ValidateToken(token);

        // Assert
        principal.Should().BeNull();
    }
}

/// <summary>
/// Tests for Database Authentication Service
/// </summary>
public class DatabaseAuthenticationServiceTests
{
    private const string ValidUserId = "507f1f77bcf86cd799439011";
    private const string ValidEmail = "test@example.com";
    private const string ValidPassword = "P@ssword123!";

    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    private readonly DatabaseAuthenticationService _authService;

    public DatabaseAuthenticationServiceTests()
    {
        _userRepository = Substitute.For<IUserRepository>();
        _tokenService = Substitute.For<ITokenService>();
        _authService = new DatabaseAuthenticationService(_userRepository, _tokenService);
    }

    [Fact]
    public async Task AuthenticateAsync_WithEmptyEmail_ReturnsBadRequest()
    {
        // Arrange
        var credentials = new LoginCredentials { Email = "", Password = "password" };

        // Act
        var result = await _authService.AuthenticateAsync(credentials);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("Email and password are required");
    }

    [Fact]
    public async Task AuthenticateAsync_WithEmptyPassword_ReturnsBadRequest()
    {
        // Arrange
        var credentials = new LoginCredentials { Email = "test@example.com", Password = "" };

        // Act
        var result = await _authService.AuthenticateAsync(credentials);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("Email and password are required");
    }

    [Fact]
    public async Task AuthenticateAsync_WithNullCredentials_ReturnsBadRequest()
    {
        // Act
        var result = await _authService.AuthenticateAsync(null!);

        // Assert
        result.IsSuccess.Should().BeFalse();
    }

    [Fact]
    public async Task AuthenticateAsync_WhenUserIsMissing_ReturnsInvalidCredentials()
    {
        // Arrange
        var credentials = new LoginCredentials { Email = ValidEmail, Password = ValidPassword };
        _userRepository.GetByEmailAsync(ValidEmail).Returns((User?)null);

        // Act
        var result = await _authService.AuthenticateAsync(credentials);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("Invalid email or password");
        _tokenService.DidNotReceive().GenerateToken(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task AuthenticateAsync_WhenPasswordDoesNotMatch_ReturnsInvalidCredentials()
    {
        // Arrange
        var credentials = new LoginCredentials { Email = ValidEmail, Password = ValidPassword };
        var storedHash = HashPasswordForTests("DifferentPassword!");
        var user = CreateUser(ValidUserId, ValidEmail, storedHash);
        _userRepository.GetByEmailAsync(ValidEmail).Returns(user);

        // Act
        var result = await _authService.AuthenticateAsync(credentials);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("Invalid email or password");
        _tokenService.DidNotReceive().GenerateToken(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task AuthenticateAsync_WithValidCredentials_ReturnsToken()
    {
        // Arrange
        var credentials = new LoginCredentials { Email = ValidEmail, Password = ValidPassword };
        var storedHash = HashPasswordForTests(ValidPassword);
        var user = CreateUser(ValidUserId, ValidEmail, storedHash, displayName: "Test User");
        _userRepository.GetByEmailAsync(ValidEmail).Returns(user);
        _tokenService
            .GenerateToken(user.Id.Value, user.Email.Value, user.Name)
            .Returns("jwt-token");

        // Act
        var result = await _authService.AuthenticateAsync(credentials);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.UserId.Should().Be(ValidUserId);
        result.Email.Should().Be(ValidEmail);
        result.DisplayName.Should().Be("Test User");
        result.Token.Should().Be("jwt-token");
        _tokenService.Received(1).GenerateToken(user.Id.Value, user.Email.Value, user.Name);
    }

    [Fact]
    public async Task AuthenticateAsync_WhenRepositoryThrows_ReturnsErrorMessage()
    {
        // Arrange
        var credentials = new LoginCredentials { Email = ValidEmail, Password = ValidPassword };
        _userRepository.GetByEmailAsync(ValidEmail)
            .Returns(Task.FromException<User>(new InvalidOperationException("database offline")));

        // Act
        var result = await _authService.AuthenticateAsync(credentials);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("Authentication error");
        _tokenService.DidNotReceive().GenerateToken(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task RegisterAsync_WhenUserAlreadyExists_ReturnsFailure()
    {
        // Arrange
        var credentials = new LoginCredentials { Email = ValidEmail, Password = ValidPassword };
        var existingUser = CreateUser(ValidUserId, ValidEmail, HashPasswordForTests("ExistingPassword1!"));
        _userRepository.GetByEmailAsync(ValidEmail).Returns(existingUser);

        // Act
        var result = await _authService.RegisterAsync(credentials, "Existing User");

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("already exists");
        _userRepository.DidNotReceive().AddAsync(Arg.Any<User>());
        _tokenService.DidNotReceive().GenerateToken(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>());
    }

    [Fact]
    public async Task RegisterAsync_WithValidCredentials_PersistsUserAndReturnsToken()
    {
        // Arrange
        var credentials = new LoginCredentials { Email = ValidEmail, Password = ValidPassword };
        _userRepository.GetByEmailAsync(ValidEmail).Returns((User?)null);
        User? persistedUser = null;
        _userRepository
            .AddAsync(Arg.Do<User>(user => persistedUser = user))
            .Returns(call => Task.FromResult(call.Arg<User>()));
        _tokenService
            .GenerateToken(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>())
            .Returns("generated-token");

        // Act
        var result = await _authService.RegisterAsync(credentials, "New User");

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Message.Should().Contain("Registration successful");
        result.Token.Should().Be("generated-token");
        persistedUser.Should().NotBeNull();
        persistedUser!.Email.Value.Should().Be(ValidEmail);
        persistedUser.Name.Should().Be("New User");
        persistedUser.PasswordHash.Should().NotBe(ValidPassword);
        Convert.FromBase64String(persistedUser.PasswordHash).Length.Should().Be(36);
        _userRepository.Received(1).AddAsync(Arg.Any<User>());
        _tokenService.Received(1).GenerateToken(persistedUser.Id.Value, persistedUser.Email.Value, persistedUser.Name);
    }

    [Fact]
    public async Task RegisterAsync_WhenRepositoryThrows_ReturnsErrorMessage()
    {
        // Arrange
        var credentials = new LoginCredentials { Email = ValidEmail, Password = ValidPassword };
        _userRepository.GetByEmailAsync(ValidEmail).Returns((User?)null);
        _userRepository
            .AddAsync(Arg.Any<User>())
            .Returns(Task.FromException<User>(new InvalidOperationException("write failed")));

        // Act
        var result = await _authService.RegisterAsync(credentials, "New User");

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Message.Should().Contain("Registration error");
        _tokenService.DidNotReceive().GenerateToken(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>());
    }

    private static User CreateUser(string userId, string email, string passwordHash, string? displayName = null)
    {
        return User.Rehydrate(
            UserId.Create(userId),
            Email.Create(email),
            displayName ?? email,
            passwordHash,
            displayName ?? email,
            UserRole.Contributor,
            EipPoints.Create(0),
            DateTime.UtcNow.AddDays(-1),
            DateTime.UtcNow,
            string.Empty);
    }

    private static string HashPasswordForTests(string password)
    {
        var method = typeof(DatabaseAuthenticationService).GetMethod(
            "HashPassword",
            BindingFlags.NonPublic | BindingFlags.Static)
            ?? throw new InvalidOperationException("Unable to locate HashPassword method for testing.");

        return (string)method.Invoke(null, new object[] { password })!;
    }
}

/// <summary>
/// Tests for Claims Service
/// </summary>
public class ClaimsServiceTests
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ClaimsService _claimsService;

    public ClaimsServiceTests()
    {
        _httpContextAccessor = Substitute.For<IHttpContextAccessor>();
        _claimsService = new ClaimsService(_httpContextAccessor);
    }

    [Fact]
    public void Constructor_WithNullHttpContextAccessor_ThrowsException()
    {
        // Act
        var action = () => new ClaimsService(null!);

        // Assert
        action.Should().Throw<ArgumentNullException>();
    }
}
