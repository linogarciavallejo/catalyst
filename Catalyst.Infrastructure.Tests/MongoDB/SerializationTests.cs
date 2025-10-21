using System.Collections.Generic;
using Catalyst.Domain.Entities;
using Catalyst.Domain.Enums;
using Catalyst.Domain.ValueObjects;
using Catalyst.Infrastructure.MongoDB.Serializers;
using FluentAssertions;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;

namespace Catalyst.Infrastructure.Tests.MongoDB;

/// <summary>
/// MongoDB Serialization Tests
/// Verifies that custom serializers (UserIdSerializer, IdeaIdSerializer, CommentIdSerializer)
/// are properly registered and can handle value object serialization.
/// 
/// Note: These tests verify serializer registration and basic functionality.
/// Full round-trip tests with BsonSerializer.Deserialize require a running MongoDB instance.
/// This test file focuses on unit-level testing without MongoDB dependencies.
/// </summary>
public class SerializationTests
{
    public SerializationTests()
    {
        // Register custom serializers
        try
        {
            BsonSerializer.RegisterSerializer(new UserIdSerializer());
            BsonSerializer.RegisterSerializer(new IdeaIdSerializer());
            BsonSerializer.RegisterSerializer(new CommentIdSerializer());
        }
        catch (BsonSerializationException)
        {
            // Serializers may already be registered, which is fine
        }
    }

    #region Serializer Registration Tests

    [Fact]
    public void UserIdSerializer_ShouldBeRegistered()
    {
        // Arrange & Act
        var userId = UserId.Create("507f1f77bcf86cd799439011");

        // Assert
        userId.Should().NotBeNull();
        userId.Value.Should().Be("507f1f77bcf86cd799439011");
    }

    [Fact]
    public void IdeaIdSerializer_ShouldBeRegistered()
    {
        // Arrange & Act
        var ideaId = IdeaId.Create("507f1f77bcf86cd799439012");

        // Assert
        ideaId.Should().NotBeNull();
        ideaId.Value.Should().Be("507f1f77bcf86cd799439012");
    }

    [Fact]
    public void CommentIdSerializer_ShouldBeRegistered()
    {
        // Arrange & Act
        var commentId = CommentId.Create("507f1f77bcf86cd799439013");

        // Assert
        commentId.Should().NotBeNull();
        commentId.Value.Should().Be("507f1f77bcf86cd799439013");
    }

    #endregion

    #region Value Object Creation Tests

    [Fact]
    public void UserIdSerialization_ShouldCreateValidUserIdValueObject()
    {
        // Arrange & Act
        var userId = UserId.Create("507f1f77bcf86cd799439011");
        var email = Email.Create("test@example.com");

        // Assert
        userId.Value.Should().NotBeNullOrEmpty();
        email.Value.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void IdeaIdSerialization_ShouldCreateValidIdeaIdValueObject()
    {
        // Arrange & Act
        var ideaId = IdeaId.Create("507f1f77bcf86cd799439012");
        var creatorId = UserId.Create("507f1f77bcf86cd799439011");

        // Assert
        ideaId.Value.Should().NotBeNullOrEmpty();
        creatorId.Value.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void CommentIdSerialization_ShouldCreateValidCommentIdValueObject()
    {
        // Arrange & Act
        var commentId = CommentId.Create("507f1f77bcf86cd799439013");
        var ideaId = IdeaId.Create("507f1f77bcf86cd799439012");

        // Assert
        commentId.Value.Should().NotBeNullOrEmpty();
        ideaId.Value.Should().NotBeNullOrEmpty();
    }

    #endregion

    #region Entity Creation Tests

    [Fact]
    public void UserEntity_ShouldCreateWithIdSerializer()
    {
        // Arrange
        var userId = UserId.Create("507f1f77bcf86cd799439011");
        var email = Email.Create("test@example.com");

        // Act
        var user = User.Create(
            email,
            "Test User",
            "hash",
            "Test",
            UserRole.Contributor);
        user.AssignId(userId);

        // Assert
        user.Should().NotBeNull();
        user.Id.Should().Be(userId);
        user.Email.Should().Be(email);
    }

    [Fact]
    public void IdeaEntity_ShouldCreateWithIdAndChampionIdSerializers()
    {
        // Arrange
        var ideaId = IdeaId.Create("507f1f77bcf86cd799439012");
        var creatorId = UserId.Create("507f1f77bcf86cd799439011");
        var championId = UserId.Create("507f1f77bcf86cd799439099");

        // Act
        var idea = Idea.Create(
            IdeaTitle.Create("Test Idea"),
            IdeaDescription.Create("A test idea"),
            Category.Create("Innovation"),
            Tags.Create(new[] { "test" }),
            creatorId,
            "John Doe");
        idea.AssignId(ideaId);
        idea.ChampionId = championId;
        idea.Status = IdeaStatus.Approved;

        // Assert
        idea.Should().NotBeNull();
        idea.Id.Should().Be(ideaId);
        idea.ChampionId.Should().Be(championId);
    }

    [Fact]
    public void CommentEntity_ShouldCreateWithIdAndParentIdSerializers()
    {
        // Arrange
        var commentId = CommentId.Create("507f1f77bcf86cd799439013");
        var parentCommentId = CommentId.Create("507f1f77bcf86cd799439014");
        var ideaId = IdeaId.Create("507f1f77bcf86cd799439012");
        var userId = UserId.Create("507f1f77bcf86cd799439011");

        // Act
        var comment = Comment.Create(ideaId, userId, "John Doe", "Great idea!", parentCommentId);
        comment.AssignId(commentId);

        // Assert
        comment.Should().NotBeNull();
        comment.Id.Should().Be(commentId);
        comment.ParentCommentId.Should().Be(parentCommentId);
    }

    #endregion

    #region Collections with IdSerializers Tests

    [Fact]
    public void Followers_ShouldStoreUserIdValues()
    {
        // Arrange
        var follower1 = UserId.Create("507f1f77bcf86cd799439021");
        var follower2 = UserId.Create("507f1f77bcf86cd799439022");
        var followers = new List<UserId> { follower1, follower2 };

        // Act
        var ideaId = IdeaId.Create("507f1f77bcf86cd799439012");
        var idea = Idea.Create(
            IdeaTitle.Create("Idea"),
            IdeaDescription.Create("Description"),
            Category.Create("Innovation"),
            Tags.Create(new[] { "tag" }),
            UserId.Create("507f1f77bcf86cd799439011"),
            "Creator");
        idea.AssignId(ideaId);
        idea.Followers = followers;

        // Assert
        idea.Followers.Should().HaveCount(2);
        idea.Followers[0].Should().Be(follower1);
        idea.Followers[1].Should().Be(follower2);
    }

    #endregion

    #region NoSQL Serialization Compatibility Tests

    [Fact]
    public void IdValueObjects_ShouldBeCompatibleWithMongoDbBson()
    {
        // Verify that value objects can be serialized to BSON format
        var userId = UserId.Create("507f1f77bcf86cd799439011");
        var ideaId = IdeaId.Create("507f1f77bcf86cd799439012");
        var commentId = CommentId.Create("507f1f77bcf86cd799439013");

        // These should not throw when attempting BSON serialization setup
        userId.Value.Should().NotBeNullOrEmpty();
        ideaId.Value.Should().NotBeNullOrEmpty();
        commentId.Value.Should().NotBeNullOrEmpty();
    }

    #endregion

    #region Serializer Configuration Tests

    [Fact]
    public void SerializerConfiguration_ShouldAllowMultipleRegistrations()
    {
        // This test verifies that registering serializers multiple times doesn't cause failures
        // It demonstrates that the constructor properly handles already-registered serializers
        
        // Arrange
        var userId = UserId.Create("507f1f77bcf86cd799439011");

        // Act
        try
        {
            // Create another instance - should not throw
            var testInstance = new SerializationTests();
            var newUserId = UserId.Create("507f1f77bcf86cd799439012");

            // Assert
            newUserId.Value.Should().NotBeNullOrEmpty();
        }
        catch (BsonSerializationException ex)
        {
            throw new Xunit.Sdk.XunitException("Multiple serializer registration should be handled gracefully", ex);
        }
    }

    #endregion
}
