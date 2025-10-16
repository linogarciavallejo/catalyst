using Catalyst.Domain.Entities;
using Catalyst.Domain.Enums;
using Catalyst.Domain.ValueObjects;
using FluentAssertions;
using MongoDB.Bson;

namespace Catalyst.Application.Tests.Entities;

/// <summary>
/// Tests for Idea entity
/// </summary>
public class IdeaEntityTests
{
    [Fact]
    public void Constructor_InitializesWithDefaults()
    {
        // Act
        var idea = new Idea();

        // Assert
        idea.Id.Should().NotBeNull();
        idea.Status.Should().Be(IdeaStatus.Submitted);
        idea.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        idea.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        idea.Upvotes.Should().Be(0);
        idea.Downvotes.Should().Be(0);
        idea.CommentCount.Should().Be(0);
        idea.Followers.Should().BeEmpty();
        idea.Attachments.Should().BeEmpty();
    }

    [Fact]
    public void SetProperties_UpdatesValues()
    {
        // Arrange
        var idea = new Idea();
        var title = IdeaTitle.Create("Test Idea");
        var description = IdeaDescription.Create("This is a test idea");
        var category = Category.Technology;
        var userId = UserId.Create("507f1f77bcf86cd799439011");

        // Act
        idea.Title = title;
        idea.Description = description;
        idea.Category = category;
        idea.CreatedBy = userId;

        // Assert
        idea.Title.Should().Be(title);
        idea.Description.Should().Be(description);
        idea.Category.Should().Be(category);
        idea.CreatedBy.Should().Be(userId);
    }

    [Fact]
    public void IncrementUpvotes_UpdatesCount()
    {
        // Arrange
        var idea = new Idea();
        idea.Upvotes = 5;

        // Act
        idea.Upvotes++;

        // Assert
        idea.Upvotes.Should().Be(6);
    }

    [Fact]
    public void IncrementDownvotes_UpdatesCount()
    {
        // Arrange
        var idea = new Idea();
        idea.Downvotes = 3;

        // Act
        idea.Downvotes++;

        // Assert
        idea.Downvotes.Should().Be(4);
    }

    [Fact]
    public void AddFollower_AddsUserToFollowers()
    {
        // Arrange
        var idea = new Idea();
        var userId = UserId.Create("507f1f77bcf86cd799439011");

        // Act
        idea.Followers.Add(userId);

        // Assert
        idea.Followers.Should().Contain(userId);
        idea.Followers.Should().HaveCount(1);
    }

    [Fact]
    public void AddMultipleFollowers_AllAdded()
    {
        // Arrange
        var idea = new Idea();
        var userId1 = UserId.Create("507f1f77bcf86cd799439011");
        var userId2 = UserId.Create("507f1f77bcf86cd799439012");
        var userId3 = UserId.Create("507f1f77bcf86cd799439013");

        // Act
        idea.Followers.Add(userId1);
        idea.Followers.Add(userId2);
        idea.Followers.Add(userId3);

        // Assert
        idea.Followers.Should().HaveCount(3);
        idea.Followers.Should().Contain(new[] { userId1, userId2, userId3 });
    }

    [Fact]
    public void RemoveFollower_RemovesUserFromFollowers()
    {
        // Arrange
        var idea = new Idea();
        var userId = UserId.Create("507f1f77bcf86cd799439011");
        idea.Followers.Add(userId);

        // Act
        idea.Followers.Remove(userId);

        // Assert
        idea.Followers.Should().NotContain(userId);
        idea.Followers.Should().BeEmpty();
    }

    [Fact]
    public void AddAttachment_AddsToList()
    {
        // Arrange
        var idea = new Idea();
        var attachment = new Attachment
        {
            FileName = "document.pdf",
            FileUrl = "https://example.com/document.pdf",
            FileSize = 1024000,
            UploadedAt = DateTime.UtcNow
        };

        // Act
        idea.Attachments.Add(attachment);

        // Assert
        idea.Attachments.Should().HaveCount(1);
        idea.Attachments.First().FileName.Should().Be("document.pdf");
    }

    [Fact]
    public void MultipleAttachments_AllAdded()
    {
        // Arrange
        var idea = new Idea();
        var attachment1 = new Attachment { FileName = "file1.pdf" };
        var attachment2 = new Attachment { FileName = "file2.docx" };
        var attachment3 = new Attachment { FileName = "file3.xlsx" };

        // Act
        idea.Attachments.Add(attachment1);
        idea.Attachments.Add(attachment2);
        idea.Attachments.Add(attachment3);

        // Assert
        idea.Attachments.Should().HaveCount(3);
    }

    [Fact]
    public void ChangeStatus_UpdatesStatus()
    {
        // Arrange
        var idea = new Idea();
        var newStatus = IdeaStatus.Approved;

        // Act
        idea.Status = newStatus;

        // Assert
        idea.Status.Should().Be(IdeaStatus.Approved);
    }

    [Fact]
    public void SetChampionId_AssignsChampion()
    {
        // Arrange
        var idea = new Idea();
        var championId = UserId.Create("507f1f77bcf86cd799439099");

        // Act
        idea.ChampionId = championId;

        // Assert
        idea.ChampionId.Should().Be(championId);
    }

    [Fact]
    public void IncrementCommentCount_UpdatesCount()
    {
        // Arrange
        var idea = new Idea();
        idea.CommentCount = 5;

        // Act
        idea.CommentCount++;

        // Assert
        idea.CommentCount.Should().Be(6);
    }

    [Fact]
    public void TwoIdeas_WithDifferentIds_AreNotEqual()
    {
        // Arrange
        var idea1 = new Idea();
        var idea2 = new Idea();

        // Act & Assert
        idea1.Id.Should().NotBe(idea2.Id);
    }
}

/// <summary>
/// Tests for Comment entity
/// </summary>
public class CommentEntityTests
{
    [Fact]
    public void Constructor_InitializesWithDefaults()
    {
        // Act
        var comment = new Comment();

        // Assert
        comment.Id.Should().NotBeNull();
        comment.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        comment.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void SetProperties_UpdatesValues()
    {
        // Arrange
        var comment = new Comment();
        var ideaId = IdeaId.Create(ObjectId.GenerateNewId().ToString());
        var userId = UserId.Create("507f1f77bcf86cd799439011");

        // Act
        comment.IdeaId = ideaId;
        comment.UserId = userId;
        comment.UserName = "TestUser";
        comment.Content = "This is a comment";

        // Assert
        comment.IdeaId.Should().Be(ideaId);
        comment.UserId.Should().Be(userId);
        comment.UserName.Should().Be("TestUser");
        comment.Content.Should().Be("This is a comment");
    }

    [Fact]
    public void SetParentCommentId_CreatesReplyChain()
    {
        // Arrange
        var comment = new Comment();
        var parentCommentId = CommentId.Create(ObjectId.GenerateNewId().ToString());

        // Act
        comment.ParentCommentId = parentCommentId;

        // Assert
        comment.ParentCommentId.Should().Be(parentCommentId);
    }

    [Fact]
    public void UpdateContent_ChangesContent()
    {
        // Arrange
        var comment = new Comment();
        comment.Content = "Original content";
        var originalUpdatedAt = comment.UpdatedAt;

        // Act
        comment.Content = "Updated content";
        comment.UpdatedAt = DateTime.UtcNow;

        // Assert
        comment.Content.Should().Be("Updated content");
        comment.UpdatedAt.Should().BeOnOrAfter(originalUpdatedAt);
    }

    [Fact]
    public void TwoComments_WithDifferentIds_AreNotEqual()
    {
        // Arrange
        var comment1 = new Comment();
        var comment2 = new Comment();

        // Act & Assert
        comment1.Id.Should().NotBe(comment2.Id);
    }

    [Fact]
    public void IsReply_WhenParentCommentIdIsSet()
    {
        // Arrange
        var comment = new Comment();
        var parentId = CommentId.Create(ObjectId.GenerateNewId().ToString());
        
        // Act
        comment.ParentCommentId = parentId;
        
        // Assert
        comment.ParentCommentId.Should().NotBeNull();
        comment.ParentCommentId.Value.Should().NotBeEmpty();
    }
}

/// <summary>
/// Tests for Vote entity
/// </summary>
public class VoteEntityTests
{
    [Fact]
    public void Constructor_InitializesWithDefaults()
    {
        // Act
        var vote = new Vote();

        // Assert
        vote.Id.Should().NotBeNullOrEmpty();
        vote.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void CreateUpvote_SetsVoteType()
    {
        // Arrange
        var vote = new Vote();
        var ideaId = IdeaId.Create(ObjectId.GenerateNewId().ToString());
        var userId = UserId.Create("507f1f77bcf86cd799439011");

        // Act
        vote.IdeaId = ideaId;
        vote.UserId = userId;
        vote.VoteType = VoteType.Upvote;

        // Assert
        vote.VoteType.Should().Be(VoteType.Upvote);
        vote.IdeaId.Should().Be(ideaId);
        vote.UserId.Should().Be(userId);
    }

    [Fact]
    public void CreateDownvote_SetsVoteType()
    {
        // Arrange
        var vote = new Vote();

        // Act
        vote.VoteType = VoteType.Downvote;

        // Assert
        vote.VoteType.Should().Be(VoteType.Downvote);
    }

    [Fact]
    public void ChangeVoteType_UpdatesVote()
    {
        // Arrange
        var vote = new Vote();
        vote.VoteType = VoteType.Upvote;

        // Act
        vote.VoteType = VoteType.Downvote;

        // Assert
        vote.VoteType.Should().Be(VoteType.Downvote);
    }

    [Fact]
    public void TwoVotes_WithDifferentIds_AreNotEqual()
    {
        // Arrange
        var vote1 = new Vote();
        var vote2 = new Vote();

        // Act & Assert
        vote1.Id.Should().NotBe(vote2.Id);
    }
}

/// <summary>
/// Tests for Notification entity
/// </summary>
public class NotificationEntityTests
{
    [Fact]
    public void Constructor_InitializesWithDefaults()
    {
        // Act
        var notification = new Notification();

        // Assert
        notification.Id.Should().NotBeNullOrEmpty();
        notification.IsRead.Should().BeFalse();
        notification.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void SetProperties_UpdatesValues()
    {
        // Arrange
        var notification = new Notification();
        var userId = UserId.Create("507f1f77bcf86cd799439011");
        var ideaId = IdeaId.Create(ObjectId.GenerateNewId().ToString());

        // Act
        notification.UserId = userId;
        notification.Type = NotificationType.NewComment;
        notification.Title = "New Comment";
        notification.Message = "Someone commented on your idea";
        notification.RelatedIdeaId = ideaId;

        // Assert
        notification.UserId.Should().Be(userId);
        notification.Type.Should().Be(NotificationType.NewComment);
        notification.Title.Should().Be("New Comment");
        notification.Message.Should().Be("Someone commented on your idea");
        notification.RelatedIdeaId.Should().Be(ideaId);
    }

    [Theory]
    [InlineData(NotificationType.NewComment)]
    [InlineData(NotificationType.NewVote)]
    [InlineData(NotificationType.IdeaStatusChanged)]
    [InlineData(NotificationType.UserMentioned)]
    [InlineData(NotificationType.IdeaFollowUpdate)]
    public void CreateNotification_WithDifferentTypes(NotificationType type)
    {
        // Arrange
        var notification = new Notification();

        // Act
        notification.Type = type;

        // Assert
        notification.Type.Should().Be(type);
    }

    [Fact]
    public void MarkAsRead_UpdatesIsRead()
    {
        // Arrange
        var notification = new Notification();
        notification.IsRead.Should().BeFalse();

        // Act
        notification.IsRead = true;

        // Assert
        notification.IsRead.Should().BeTrue();
    }

    [Fact]
    public void NewNotification_StartsUnread()
    {
        // Arrange & Act
        var notification = new Notification();

        // Assert
        notification.IsRead.Should().BeFalse();
    }

    [Fact]
    public void TwoNotifications_WithDifferentIds_AreNotEqual()
    {
        // Arrange
        var notification1 = new Notification();
        var notification2 = new Notification();

        // Act & Assert
        notification1.Id.Should().NotBe(notification2.Id);
    }
}
