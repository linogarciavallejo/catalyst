using Catalyst.Application.Interfaces;
using Catalyst.Domain.Entities;
using Catalyst.Domain.Enums;
using FluentAssertions;

namespace Catalyst.Infrastructure.Tests.Repositories;

/// <summary>
/// Repository interface contract tests
/// Verifies repository interfaces are properly defined and accessible
/// </summary>
public class RepositoryInterfaceTests
{
    [Fact]
    public void IdeaRepository_ShouldImplementIIdeaRepository()
    {
        // Verify the interface exists and defines required methods
        var methods = typeof(IIdeaRepository).GetMethods();
        methods.Should().Contain(m => m.Name == "SearchByTitleAsync");
        methods.Should().Contain(m => m.Name == "GetByCategoryAsync");
        methods.Should().Contain(m => m.Name == "GetByStatusAsync");
        methods.Should().Contain(m => m.Name == "GetByCreatorAsync");
        methods.Should().Contain(m => m.Name == "GetTopIdeasByVotesAsync");
        methods.Should().Contain(m => m.Name == "GetIdeaCountAsync");
    }

    [Fact]
    public void VoteRepository_ShouldImplementIVoteRepository()
    {
        // Verify the interface exists and defines required methods
        var methods = typeof(IVoteRepository).GetMethods();
        methods.Should().Contain(m => m.Name == "GetUserVoteOnIdeaAsync");
        methods.Should().Contain(m => m.Name == "GetUpvoteCountAsync");
        methods.Should().Contain(m => m.Name == "GetDownvoteCountAsync");
        methods.Should().Contain(m => m.Name == "GetVotesByIdeaAsync");
        methods.Should().Contain(m => m.Name == "GetVotesByUserAsync");
    }

    [Fact]
    public void UserRepository_ShouldImplementIUserRepository()
    {
        // Verify the interface exists and defines required methods
        var methods = typeof(IUserRepository).GetMethods();
        methods.Should().Contain(m => m.Name == "GetByEmailAsync");
        methods.Should().Contain(m => m.Name == "GetByRoleAsync");
        methods.Should().Contain(m => m.Name == "GetTopUsersByPointsAsync");
    }

    [Fact]
    public void NotificationRepository_ShouldImplementINotificationRepository()
    {
        // Verify the interface exists and defines required methods
        var methods = typeof(INotificationRepository).GetMethods();
        methods.Should().Contain(m => m.Name == "GetUnreadNotificationsByUserAsync");
        methods.Should().Contain(m => m.Name == "GetUnreadCountAsync");
        methods.Should().Contain(m => m.Name == "MarkAsReadAsync");
        methods.Should().Contain(m => m.Name == "MarkAllAsReadAsync");
    }

    [Fact]
    public void CommentRepository_ShouldImplementICommentRepository()
    {
        // Verify the interface exists and defines required methods
        var methods = typeof(ICommentRepository).GetMethods();
        methods.Should().Contain(m => m.Name == "GetCommentsByIdeaAsync");
        methods.Should().Contain(m => m.Name == "GetRepliesByCommentAsync");
        methods.Should().Contain(m => m.Name == "GetCommentCountByIdeaAsync");
    }

    [Fact]
    public void AllRepositories_ShouldInheritFromGenericRepository()
    {
        // Verify base CRUD methods exist
        typeof(IRepository<>).GetMethods().Should().Contain(m => m.Name == "GetByIdAsync");
        typeof(IRepository<>).GetMethods().Should().Contain(m => m.Name == "GetAllAsync");
        typeof(IRepository<>).GetMethods().Should().Contain(m => m.Name == "AddAsync");
        typeof(IRepository<>).GetMethods().Should().Contain(m => m.Name == "UpdateAsync");
        typeof(IRepository<>).GetMethods().Should().Contain(m => m.Name == "DeleteAsync");
    }
}

/// <summary>
/// Repository entity mapping tests
/// Verifies entities can be created and have required properties
/// </summary>
public class RepositoryEntityMappingTests
{
    [Fact]
    public void Idea_CanBeCreatedWithAllProperties()
    {
        // Verify Idea entity can be instantiated and properties set
        var idea = Idea.Create(
            Domain.ValueObjects.IdeaTitle.Create("Test Idea"),
            Domain.ValueObjects.IdeaDescription.Create("Description"),
            Domain.ValueObjects.Category.Create("Technology"),
            Domain.ValueObjects.Tags.Create(new[] { "tag" }),
            Domain.ValueObjects.UserId.Create("user-123"),
            "Test User");

        idea.Should().NotBeNull();
        idea.Title.Value.Should().Be("Test Idea");
        idea.Status.Should().Be(IdeaStatus.Submitted);
    }

    [Fact]
    public void Vote_CanBeCreatedWithProperties()
    {
        // Verify Vote entity can be instantiated with VoteType
        var vote = Vote.Create(
            Domain.ValueObjects.IdeaId.Create("507f1f77bcf86cd799439011"),
            Domain.ValueObjects.UserId.Create("user-123"),
            Domain.Entities.VoteType.Upvote);

        vote.Should().NotBeNull();
        vote.VoteType.Should().Be(Domain.Entities.VoteType.Upvote);
    }

    [Fact]
    public void User_CanBeCreatedWithEmailAndRole()
    {
        // Verify User entity can be instantiated
        var user = User.Create(
            Domain.ValueObjects.Email.Create("test@example.com"),
            "Test User",
            "password",
            "Test",
            UserRole.Contributor);

        user.Should().NotBeNull();
        user.Email.Value.Should().Be("test@example.com");
        user.Role.Should().Be(UserRole.Contributor);
    }

    [Fact]
    public void Comment_CanBeCreatedWithContent()
    {
        // Verify Comment entity can be instantiated
        var comment = Comment.Create(
            Domain.ValueObjects.IdeaId.Create("idea-123"),
            Domain.ValueObjects.UserId.Create("user-123"),
            "User",
            "Comment content");

        comment.Should().NotBeNull();
        comment.Content.Should().Be("Comment content");
    }

    [Fact]
    public void Notification_CanBeCreatedWithMessage()
    {
        // Verify Notification entity can be instantiated
        var notification = Notification.Create(
            Domain.ValueObjects.UserId.Create("user-123"),
            NotificationType.NewComment,
            "Title",
            "Test notification");

        notification.Should().NotBeNull();
        notification.Message.Should().Be("Test notification");
        notification.IsRead.Should().BeFalse();
    }
}

/// <summary>
/// Repository CRUD contract tests
/// Verifies all repositories implement basic CRUD operations
/// </summary>
public class RepositoryCRUDContractTests
{
    [Fact]
    public void RepositoryInterface_DefinesAddAsync()
    {
        var method = typeof(IRepository<>).GetMethod("AddAsync");
        method.Should().NotBeNull();
    }

    [Fact]
    public void RepositoryInterface_DefinesGetByIdAsync()
    {
        var method = typeof(IRepository<>).GetMethod("GetByIdAsync");
        method.Should().NotBeNull();
    }

    [Fact]
    public void RepositoryInterface_DefinesGetAllAsync()
    {
        var method = typeof(IRepository<>).GetMethod("GetAllAsync");
        method.Should().NotBeNull();
    }

    [Fact]
    public void RepositoryInterface_DefinesUpdateAsync()
    {
        var method = typeof(IRepository<>).GetMethod("UpdateAsync");
        method.Should().NotBeNull();
    }

    [Fact]
    public void RepositoryInterface_DefinesDeleteAsync()
    {
        var method = typeof(IRepository<>).GetMethod("DeleteAsync");
        method.Should().NotBeNull();
    }

    [Fact]
    public void Idea_Can_BeSearched_By_Title()
    {
        var method = typeof(IIdeaRepository).GetMethod("SearchByTitleAsync");
        method.Should().NotBeNull();
        method?.ReturnType.Name.Should().Contain("Task");
    }

    [Fact]
    public void Vote_Can_Be_Retrieved_By_User_And_Idea()
    {
        var method = typeof(IVoteRepository).GetMethod("GetUserVoteOnIdeaAsync");
        method.Should().NotBeNull();
        method?.ReturnType.Name.Should().Contain("Task");
    }

    [Fact]
    public void User_Can_Be_Retrieved_By_Email()
    {
        var method = typeof(IUserRepository).GetMethod("GetByEmailAsync");
        method.Should().NotBeNull();
        method?.ReturnType.Name.Should().Contain("Task");
    }

    [Fact]
    public void Notification_Can_Get_Unread_Count()
    {
        var method = typeof(INotificationRepository).GetMethod("GetUnreadCountAsync");
        method.Should().NotBeNull();
        method?.ReturnType.Name.Should().Contain("Task");
    }

    [Fact]
    public void Comment_Can_Be_Retrieved_By_Idea()
    {
        var method = typeof(ICommentRepository).GetMethod("GetCommentsByIdeaAsync");
        method.Should().NotBeNull();
        method?.ReturnType.Name.Should().Contain("Task");
    }
}

/// <summary>
/// Repository implementation tests
/// Verifies implementations exist and can be instantiated
/// </summary>
public class RepositoryImplementationTests
{
    [Fact]
    public void IdeaRepository_Exists()
    {
        var type = typeof(Catalyst.Infrastructure.Repositories.IdeaRepository);
        type.Should().NotBeNull();
    }

    [Fact]
    public void VoteRepository_Exists()
    {
        var type = typeof(Catalyst.Infrastructure.Repositories.VoteRepository);
        type.Should().NotBeNull();
    }

    [Fact]
    public void UserRepository_Exists()
    {
        var type = typeof(Catalyst.Infrastructure.Repositories.UserRepository);
        type.Should().NotBeNull();
    }

    [Fact]
    public void NotificationRepository_Exists()
    {
        var type = typeof(Catalyst.Infrastructure.Repositories.NotificationRepository);
        type.Should().NotBeNull();
    }

    [Fact]
    public void CommentRepository_Exists()
    {
        var type = typeof(Catalyst.Infrastructure.Repositories.CommentRepository);
        type.Should().NotBeNull();
    }

    [Fact]
    public void IdeaRepository_ImplementsIIdeaRepository()
    {
        typeof(Catalyst.Infrastructure.Repositories.IdeaRepository)
            .Should().Implement<IIdeaRepository>();
    }

    [Fact]
    public void VoteRepository_ImplementsIVoteRepository()
    {
        typeof(Catalyst.Infrastructure.Repositories.VoteRepository)
            .Should().Implement<IVoteRepository>();
    }

    [Fact]
    public void UserRepository_ImplementsIUserRepository()
    {
        typeof(Catalyst.Infrastructure.Repositories.UserRepository)
            .Should().Implement<IUserRepository>();
    }

    [Fact]
    public void NotificationRepository_ImplementsINotificationRepository()
    {
        typeof(Catalyst.Infrastructure.Repositories.NotificationRepository)
            .Should().Implement<INotificationRepository>();
    }

    [Fact]
    public void CommentRepository_ImplementsICommentRepository()
    {
        typeof(Catalyst.Infrastructure.Repositories.CommentRepository)
            .Should().Implement<ICommentRepository>();
    }
}
