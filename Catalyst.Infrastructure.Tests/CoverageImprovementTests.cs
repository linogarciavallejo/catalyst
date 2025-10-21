using System;
using Catalyst.Domain.Entities;
using Catalyst.Domain.Enums;
using Catalyst.Domain.ValueObjects;
using FluentAssertions;

namespace Catalyst.Infrastructure.Tests.Data;

/// <summary>
/// MongoDB settings configuration tests
/// Verifies configuration objects work correctly
/// </summary>
public class MongoDbSettingsTests
{
    [Fact]
    public void MongoDbSettings_WithValidConnectionString_IsConfigured()
    {
        // Arrange
        var connectionString = "mongodb://localhost:27017";
        var databaseName = "CatalystTest";

        // Act
        var settings = new MongoDbSettings
        {
            ConnectionString = connectionString,
            DatabaseName = databaseName
        };

        // Assert
        settings.ConnectionString.Should().Be(connectionString);
        settings.DatabaseName.Should().Be(databaseName);
    }

    [Fact]
    public void MongoDbSettings_WithNullConnectionString_Allowed()
    {
        // Arrange & Act
        var settings = new MongoDbSettings { ConnectionString = null };

        // Assert
        settings.ConnectionString.Should().BeNull();
    }

    [Fact]
    public void MongoDbSettings_SupportsAtlasConnectionStrings()
    {
        // Arrange
        var atlasConnection = "mongodb+srv://user:pass@cluster.mongodb.net";

        // Act
        var settings = new MongoDbSettings { ConnectionString = atlasConnection };

        // Assert
        settings.ConnectionString.Should().Contain("mongodb+srv");
    }

    [Fact]
    public void MongoDbSettings_WithReplicaSetConnection()
    {
        // Arrange
        var replicaConnection = "mongodb://localhost:27017,localhost:27018,localhost:27019";

        // Act
        var settings = new MongoDbSettings { ConnectionString = replicaConnection };

        // Assert
        settings.ConnectionString.Should().Contain("localhost");
    }

    [Fact]
    public void MongoDbSettings_DatabaseNameCanBeUpdated()
    {
        // Arrange
        var settings = new MongoDbSettings { DatabaseName = "Original" };

        // Act
        settings.DatabaseName = "Updated";

        // Assert
        settings.DatabaseName.Should().Be("Updated");
    }

    [Fact]
    public void MongoDbSettings_WithCustomTimeout()
    {
        // Arrange & Act
        var settings = new MongoDbSettings
        {
            ConnectionString = "mongodb://localhost:27017/?connectTimeoutMS=5000"
        };

        // Assert
        settings.ConnectionString.Should().Contain("connectTimeoutMS");
    }
}

/// <summary>
/// Domain entity constraint tests
/// Verifies entities behave correctly at boundaries
/// </summary>
public class DomainEntityConstraintTests
{
    private static Idea CreateIdea()
        => Idea.Create(
            IdeaTitle.Create("Test"),
            IdeaDescription.Create("Description"),
            Category.Technology,
            Tags.Create(new[] { "tag" }),
            UserId.Create("507f1f77bcf86cd799439011"),
            "Tester");

    private static Vote CreateVote()
        => Vote.Create(
            IdeaId.Create("507f1f77bcf86cd799439012"),
            UserId.Create("507f1f77bcf86cd799439011"),
            VoteType.Upvote);

    [Fact]
    public void Idea_WithMaxCommentCount_Handled()
    {
        // Arrange & Act
        var idea = CreateIdea();
        idea.CommentCount = int.MaxValue;

        // Assert
        idea.CommentCount.Should().Be(int.MaxValue);
    }

    [Fact]
    public void Idea_WithZeroComments_Valid()
    {
        // Arrange & Act
        var idea = CreateIdea();
        idea.CommentCount = 0;

        // Assert
        idea.CommentCount.Should().Be(0);
    }

    [Fact]
    public void Idea_WithLargeVoteCount_Handled()
    {
        // Arrange & Act
        var idea = CreateIdea();
        idea.Upvotes = 1000000;
        idea.Downvotes = 500000;

        // Assert
        idea.Upvotes.Should().Be(1000000);
        idea.Downvotes.Should().Be(500000);
    }

    [Fact]
    public void Idea_StatusCanTransition_Submitted_To_UnderReview()
    {
        // Arrange
        var idea = CreateIdea();
        idea.Status = IdeaStatus.Submitted;

        // Act
        idea.Status = IdeaStatus.UnderReview;

        // Assert
        idea.Status.Should().Be(IdeaStatus.UnderReview);
    }

    [Fact]
    public void Idea_StatusCanTransition_UnderReview_To_Approved()
    {
        // Arrange
        var idea = CreateIdea();
        idea.Status = IdeaStatus.UnderReview;

        // Act
        idea.Status = IdeaStatus.Approved;

        // Assert
        idea.Status.Should().Be(IdeaStatus.Approved);
    }

    [Fact]
    public void Idea_StatusCanTransition_Approved_To_InProgress()
    {
        // Arrange
        var idea = CreateIdea();
        idea.Status = IdeaStatus.Approved;

        // Act
        idea.Status = IdeaStatus.InProgress;

        // Assert
        idea.Status.Should().Be(IdeaStatus.InProgress);
    }

    [Fact]
    public void Idea_StatusCanTransition_InProgress_To_Completed()
    {
        // Arrange
        var idea = CreateIdea();
        idea.Status = IdeaStatus.InProgress;

        // Act
        idea.Status = IdeaStatus.Completed;

        // Assert
        idea.Status.Should().Be(IdeaStatus.Completed);
    }

    [Fact]
    public void Idea_StatusCanTransition_To_OnHold()
    {
        // Arrange
        var idea = CreateIdea();
        idea.Status = IdeaStatus.InProgress;

        // Act
        idea.Status = IdeaStatus.OnHold;

        // Assert
        idea.Status.Should().Be(IdeaStatus.OnHold);
    }

    [Fact]
    public void Idea_StatusCanTransition_To_Rejected()
    {
        // Arrange
        var idea = CreateIdea();
        idea.Status = IdeaStatus.UnderReview;

        // Act
        idea.Status = IdeaStatus.Rejected;

        // Assert
        idea.Status.Should().Be(IdeaStatus.Rejected);
    }

    [Fact]
    public void Vote_CreatedAtSetByDefault()
    {
        // Act
        var vote = CreateVote();

        // Assert
        vote.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Vote_AssignId_SetsIdentifier()
    {
        // Act
        var vote = CreateVote();
        vote.AssignId("vote-123");

        // Assert
        vote.Id.Should().Be("vote-123");
    }

    [Fact]
    public void Vote_UpvoteType_Recognized()
    {
        // Arrange & Act
        var vote = Vote.Create(
            IdeaId.Create("idea-1"),
            UserId.Create("user-1"),
            VoteType.Upvote);

        // Assert
        vote.VoteType.Should().Be(VoteType.Upvote);
    }

    [Fact]
    public void Vote_DownvoteType_Recognized()
    {
        // Arrange & Act
        var vote = Vote.Create(
            IdeaId.Create("idea-2"),
            UserId.Create("user-2"),
            VoteType.Downvote);

        // Assert
        vote.VoteType.Should().Be(VoteType.Downvote);
    }

    [Fact]
    public void Comment_CreatedAtSet()
    {
        // Act
        var comment = Comment.Create(
            IdeaId.Create("idea-3"),
            UserId.Create("user-3"),
            "Commenter",
            "Content");
        comment.CreatedAt = DateTime.UtcNow;

        // Assert
        comment.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void User_RolesRecognized()
    {
        // Arrange & Act
        var userAdmin = User.Create(Email.Create("admin@example.com"), "Admin", "pass", "Admin", UserRole.Admin);
        var userCreator = User.Create(Email.Create("creator@example.com"), "Creator", "pass", "Creator", UserRole.Creator);
        var userContributor = User.Create(Email.Create("contributor@example.com"), "Contributor", "pass", "Contributor", UserRole.Contributor);

        // Assert
        userAdmin.Role.Should().Be(UserRole.Admin);
        userCreator.Role.Should().Be(UserRole.Creator);
        userContributor.Role.Should().Be(UserRole.Contributor);
    }
}
