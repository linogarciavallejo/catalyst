using Catalyst.Domain.ValueObjects;
using FluentAssertions;

namespace Catalyst.Application.Tests.ValueObjects;

public class EmailTests
{
    [Fact]
    public void Create_WithValidEmail_ReturnsEmail()
    {
        // Arrange
        var validEmail = "test@example.com";

        // Act
        var email = Email.Create(validEmail);

        // Assert
        email.Value.Should().Be(validEmail);
    }

    [Fact]
    public void Create_WithInvalidEmail_ThrowsException()
    {
        // Arrange
        var invalidEmail = "invalid-email";

        // Act
        var action = () => Email.Create(invalidEmail);

        // Assert
        action.Should().Throw<ArgumentException>();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public void Create_WithNullOrEmpty_ThrowsException(string? email)
    {
        // Act
        var action = () => Email.Create(email ?? "");

        // Assert
        action.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Equality_WithSameEmail_ReturnsTrue()
    {
        // Arrange
        var email1 = Email.Create("test@example.com");
        var email2 = Email.Create("test@example.com");

        // Act & Assert
        email1.Should().Be(email2);
    }

    [Fact]
    public void Equality_WithDifferentEmails_ReturnsFalse()
    {
        // Arrange
        var email1 = Email.Create("test1@example.com");
        var email2 = Email.Create("test2@example.com");

        // Act & Assert
        email1.Should().NotBe(email2);
    }
}

public class EipPointsTests
{
    [Fact]
    public void Create_WithValidPoints_ReturnsEipPoints()
    {
        // Arrange
        var points = 100;

        // Act
        var eipPoints = EipPoints.Create(points);

        // Assert
        eipPoints.Value.Should().Be(points);
    }

    [Fact]
    public void Create_WithNegativePoints_ThrowsException()
    {
        // Arrange
        var negativePoints = -10;

        // Act
        var action = () => EipPoints.Create(negativePoints);

        // Assert
        action.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Add_WithPositivePoints_IncreasesTotal()
    {
        // Arrange
        var eipPoints = EipPoints.Create(100);

        // Act
        var updated = eipPoints.Add(50);

        // Assert
        updated.Value.Should().Be(150);
    }

    [Fact]
    public void Subtract_WithValidAmount_DecreasesTotal()
    {
        // Arrange
        var eipPoints = EipPoints.Create(100);

        // Act
        var updated = eipPoints.Subtract(30);

        // Assert
        updated.Value.Should().Be(70);
    }

    [Fact]
    public void Subtract_WithAmountGreaterThanBalance_ReturnsZero()
    {
        // Arrange
        var eipPoints = EipPoints.Create(50);

        // Act
        var updated = eipPoints.Subtract(100);

        // Assert
        updated.Value.Should().Be(0);
    }
}

public class UserIdTests
{
    [Fact]
    public void Create_WithValidId_ReturnsUserId()
    {
        // Arrange
        var validId = "507f1f77bcf86cd799439011";

        // Act
        var userId = UserId.Create(validId);

        // Assert
        userId.Value.Should().Be(validId);
    }

    [Fact]
    public void Create_WithNullOrEmpty_ThrowsException()
    {
        // Act
        var action = () => UserId.Create("");

        // Assert
        action.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Equality_WithSameId_ReturnsTrue()
    {
        // Arrange
        var userId1 = UserId.Create("507f1f77bcf86cd799439011");
        var userId2 = UserId.Create("507f1f77bcf86cd799439011");

        // Act & Assert
        userId1.Should().Be(userId2);
    }
}
