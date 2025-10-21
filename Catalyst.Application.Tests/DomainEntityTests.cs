using System;
using System.Linq;
using Catalyst.Domain.Entities;
using Catalyst.Domain.Enums;
using Catalyst.Domain.ValueObjects;
using FluentAssertions;

namespace Catalyst.Application.Tests.Entities;

/// <summary>
/// Tests for Idea entity
/// </summary>
public class IdeaEntityTests
{
    private static Idea CreateIdea()
        => Idea.Create(
            IdeaTitle.Create("Test Idea"),
            IdeaDescription.Create("This is a test idea"),
            Category.Technology,
            Tags.Create(new[] { "innovation" }),
            UserId.Create("507f1f77bcf86cd799439011"),
            "Test User");

    [Fact]
    public void Factory_InitializesWithDefaults()
    {
        // Act
        var idea = CreateIdea();

        // Assert
        idea.Id.Should().BeNull();
        idea.Status.Should().Be(IdeaStatus.Submitted);
        idea.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        idea.UpdatedAt.Should().BeCloseTo(idea.CreatedAt, TimeSpan.FromSeconds(1));
        idea.Upvotes.Should().Be(0);
        idea.Downvotes.Should().Be(0);
        idea.CommentCount.Should().Be(0);
        idea.Followers.Should().BeEmpty();
        idea.Attachments.Should().BeEmpty();
    }

    [Fact]
    public void Properties_CanBeUpdated()
    {
        // Arrange
        var idea = CreateIdea();
        var newTitle = IdeaTitle.Create("Updated Idea");
        var newDescription = IdeaDescription.Create("Updated description");
        var newCategory = Category.Innovation;
        var newTags = Tags.Create(new[] { "updated" });

        // Act
        idea.Title = newTitle;
        idea.Description = newDescription;
        idea.Category = newCategory;
        idea.Tags = newTags;
        idea.Upvotes = 5;
        idea.Downvotes = 1;
        idea.CommentCount = 2;

        // Assert
        idea.Title.Should().Be(newTitle);
        idea.Description.Should().Be(newDescription);
        idea.Category.Should().Be(newCategory);
        idea.Tags.Should().Be(newTags);
        idea.Upvotes.Should().Be(5);
        idea.Downvotes.Should().Be(1);
        idea.CommentCount.Should().Be(2);
    }

    [Fact]
    public void Followers_CanBeManaged()
    {
        // Arrange
        var idea = CreateIdea();
        var follower = UserId.Create("507f1f77bcf86cd799439099");

        // Act
        idea.Followers.Add(follower);
        idea.Followers.Remove(follower);

        // Assert
        idea.Followers.Should().BeEmpty();
    }

    [Fact]
    public void Attachments_CanBeManaged()
    {
        // Arrange
        var idea = CreateIdea();
        var attachment = Attachment.Create("document.pdf", "https://example.com/document.pdf", 1024, DateTime.UtcNow);

        // Act
        idea.Attachments.Add(attachment);

        // Assert
        idea.Attachments.Should().ContainSingle();
        idea.Attachments.First().FileName.Should().Be("document.pdf");
    }

    [Fact]
    public void AssignId_SetsIdentifier()
    {
        // Arrange
        var idea = CreateIdea();
        var id = IdeaId.Create("507f1f77bcf86cd799439012");

        // Act
        idea.AssignId(id);

        // Assert
        idea.Id.Should().Be(id);
    }
}

/// <summary>
/// Tests for Comment entity
/// </summary>
public class CommentEntityTests
{
    private static Comment CreateComment(CommentId? parentCommentId = null)
        => Comment.Create(
            IdeaId.Create("507f1f77bcf86cd799439012"),
            UserId.Create("507f1f77bcf86cd799439011"),
            "TestUser",
            "This is a comment",
            parentCommentId);

    [Fact]
    public void Factory_InitializesWithDefaults()
    {
        // Act
        var comment = CreateComment();

        // Assert
        comment.Id.Should().BeNull();
        comment.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        comment.UpdatedAt.Should().BeCloseTo(comment.CreatedAt, TimeSpan.FromSeconds(1));
        comment.ParentCommentId.Should().BeNull();
    }

    [Fact]
    public void Properties_CanBeUpdated()
    {
        // Arrange
        var comment = CreateComment();
        var newUserName = "AnotherUser";
        var newContent = "Updated content";

        // Act
        comment.UserName = newUserName;
        comment.Content = newContent;
        comment.UpdatedAt = DateTime.UtcNow.AddMinutes(1);

        // Assert
        comment.UserName.Should().Be(newUserName);
        comment.Content.Should().Be(newContent);
        comment.UpdatedAt.Should().BeAfter(comment.CreatedAt);
    }

    [Fact]
    public void AssignId_SetsIdentifier()
    {
        // Arrange
        var comment = CreateComment();
        var id = CommentId.Create("507f1f77bcf86cd799439013");

        // Act
        comment.AssignId(id);

        // Assert
        comment.Id.Should().Be(id);
    }

    [Fact]
    public void ParentCommentId_CanBeAssigned()
    {
        // Arrange
        var parentId = CommentId.Create("507f1f77bcf86cd799439014");

        // Act
        var comment = CreateComment(parentId);

        // Assert
        comment.ParentCommentId.Should().Be(parentId);
    }
}

/// <summary>
/// Tests for Vote entity
/// </summary>
public class VoteEntityTests
{
    private static Vote CreateVote(VoteType voteType = VoteType.Upvote)
        => Vote.Create(
            IdeaId.Create("507f1f77bcf86cd799439012"),
            UserId.Create("507f1f77bcf86cd799439011"),
            voteType);

    [Fact]
    public void Factory_InitializesWithDefaults()
    {
        // Act
        var vote = CreateVote();

        // Assert
        vote.Id.Should().BeNullOrEmpty();
        vote.VoteType.Should().Be(VoteType.Upvote);
        vote.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void AssignId_SetsIdentifier()
    {
        // Arrange
        var vote = CreateVote();
        var id = ObjectId();

        // Act
        vote.AssignId(id);

        // Assert
        vote.Id.Should().Be(id);
    }

    [Fact]
    public void VoteType_CanBeChanged()
    {
        // Arrange
        var vote = CreateVote();

        // Act
        vote.VoteType = VoteType.Downvote;

        // Assert
        vote.VoteType.Should().Be(VoteType.Downvote);
    }

    private static string ObjectId() => Guid.NewGuid().ToString("N");
}

/// <summary>
/// Tests for Notification entity
/// </summary>
public class NotificationEntityTests
{
    private static Notification CreateNotification()
        => Notification.Create(
            UserId.Create("507f1f77bcf86cd799439011"),
            NotificationType.NewComment,
            "New Comment",
            "Someone commented on your idea",
            IdeaId.Create("507f1f77bcf86cd799439012"));

    [Fact]
    public void Factory_InitializesWithDefaults()
    {
        // Act
        var notification = CreateNotification();

        // Assert
        notification.Id.Should().BeNullOrEmpty();
        notification.IsRead.Should().BeFalse();
        notification.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void AssignId_SetsIdentifier()
    {
        // Arrange
        var notification = CreateNotification();
        var id = Guid.NewGuid().ToString("N");

        // Act
        notification.AssignId(id);

        // Assert
        notification.Id.Should().Be(id);
    }

    [Fact]
    public void Properties_CanBeUpdated()
    {
        // Arrange
        var notification = CreateNotification();
        var newMessage = "Updated message";

        // Act
        notification.Title = "Updated";
        notification.Message = newMessage;
        notification.IsRead = true;
        notification.RelatedIdeaId = null;

        // Assert
        notification.Title.Should().Be("Updated");
        notification.Message.Should().Be(newMessage);
        notification.IsRead.Should().BeTrue();
        notification.RelatedIdeaId.Should().BeNull();
    }
}
