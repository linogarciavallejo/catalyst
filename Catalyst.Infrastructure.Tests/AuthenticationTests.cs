using NSubstitute;
using Catalyst.Infrastructure.Authentication;
using Catalyst.Infrastructure.Services;
using Catalyst.Application.Interfaces;
using Catalyst.Domain.Entities;
using Catalyst.Domain.ValueObjects;
using Catalyst.Domain.Enums;
using FluentAssertions;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Http;

namespace Catalyst.Infrastructure.Tests;

/// <summary>
/// Tests for JWT Token Service
/// </summary>
public class TokenServiceTests
{
    private readonly IOptions<JwtSettings> _jwtOptions;
    private readonly TokenService _tokenService;

    public TokenServiceTests()
    {
        var jwtSettings = new JwtSettings
        {
            SecretKey = "SuperSecretKeyThatIsAtLeast32CharactersLong!",
            Issuer = "Catalyst",
            Audience = "CatalystUsers",
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
}

/// <summary>
/// Tests for Database Authentication Service
/// </summary>
public class DatabaseAuthenticationServiceTests
{
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
