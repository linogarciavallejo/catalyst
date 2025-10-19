using Microsoft.AspNetCore.SignalR;
using NSubstitute;
using Catalyst.WebApi.Hubs;
using Catalyst.Infrastructure.Authentication;

namespace Catalyst.WebApi.Tests.Hubs;

/// <summary>
/// Integration tests for IdeasHub SignalR hub
/// Tests real-time idea updates, subscriptions, and broadcasts
/// </summary>
public class IdeasHubTests
{
    private readonly IdeasHub _hub;
    private readonly IClaimsService _mockClaimsService;
    private readonly IHubCallerClients _mockClients;
    private readonly IGroupManager _mockGroups;
    private readonly HubCallerContext _mockContext;

    public IdeasHubTests()
    {
        _mockClaimsService = Substitute.For<IClaimsService>();
        _mockClients = Substitute.For<IHubCallerClients>();
        _mockGroups = Substitute.For<IGroupManager>();
        
        _mockContext = Substitute.For<HubCallerContext>();
        _mockContext.ConnectionId.Returns("connection-ideas-test");

        _hub = new IdeasHub(_mockClaimsService)
        {
            Clients = _mockClients,
            Groups = _mockGroups,
            Context = _mockContext
        };
    }

    [Fact]
    public async Task OnConnectedAsync_AddsUserToIdeasGroup()
    {
        // Arrange
        var userId = "user-ideas";
        _mockClaimsService.GetUserId().Returns(userId);

        // Act
        await _hub.OnConnectedAsync();

        // Assert
        await _mockGroups.Received(1).AddToGroupAsync(
            _mockContext.ConnectionId,
            $"user_ideas_{userId}",
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task OnConnectedAsync_AddsToAllIdeasGroup()
    {
        // Arrange
        _mockClaimsService.GetUserId().Returns("user-123");

        // Act
        await _hub.OnConnectedAsync();

        // Assert
        await _mockGroups.Received(1).AddToGroupAsync(
            _mockContext.ConnectionId,
            "all_ideas",
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task SubscribeToIdea_AddsToIdeaGroup()
    {
        // Arrange
        var ideaId = "idea-123";

        // Act
        await _hub.SubscribeToIdea(ideaId);

        // Assert
        await _mockGroups.Received(1).AddToGroupAsync(
            _mockContext.ConnectionId,
            $"idea_{ideaId}",
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task UnsubscribeFromIdea_RemovesFromIdeaGroup()
    {
        // Arrange
        var ideaId = "idea-456";

        // Act
        await _hub.UnsubscribeFromIdea(ideaId);

        // Assert
        await _mockGroups.Received(1).RemoveFromGroupAsync(
            _mockContext.ConnectionId,
            $"idea_{ideaId}",
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task BroadcastNewIdea_ExecutesWithoutException()
    {
        // Arrange
        dynamic ideaData = new System.Dynamic.ExpandoObject();
        ideaData.id = "idea-new";
        ideaData.title = "New Idea";
        ideaData.description = "Description";
        ideaData.category = "Tech";
        ideaData.createdBy = "User";
        
        var mockClientProxy = Substitute.For<IClientProxy>();
        _mockClients.Group("all_ideas").Returns(mockClientProxy);

        // Act & Assert - Should not throw
        await _hub.BroadcastNewIdea(ideaData);
    }

    [Fact]
    public async Task BroadcastNewVote_ExecutesWithoutException()
    {
        // Arrange
        var ideaId = "idea-vote";
        var mockClientProxy = Substitute.For<IClientProxy>();
        _mockClients.Group($"idea_{ideaId}").Returns(mockClientProxy);

        // Act & Assert - Should not throw
        await _hub.BroadcastNewVote(ideaId, 10, "Voter", true);
    }

    [Fact]
    public async Task BroadcastNewComment_ExecutesWithoutException()
    {
        // Arrange
        var ideaId = "idea-comment";
        dynamic commentData = new System.Dynamic.ExpandoObject();
        commentData.id = "comment-123";
        commentData.authorId = "author-1";
        commentData.authorName = "Author";
        commentData.content = "Comment";
        
        var mockClientProxy = Substitute.For<IClientProxy>();
        _mockClients.Group($"idea_{ideaId}").Returns(mockClientProxy);

        // Act & Assert - Should not throw
        await _hub.BroadcastNewComment(ideaId, commentData);
    }

    [Fact]
    public async Task BroadcastIdeaStatusChange_ExecutesWithoutException()
    {
        // Arrange
        var ideaId = "idea-status";
        var mockClientProxy = Substitute.For<IClientProxy>();
        _mockClients.Group($"idea_{ideaId}").Returns(mockClientProxy);

        // Act & Assert - Should not throw
        await _hub.BroadcastIdeaStatusChange(ideaId, "approved", "admin");
    }

    [Fact]
    public async Task NotifyIdeaUpdate_ExecutesWithoutException()
    {
        // Arrange
        var userId = "user-123";
        var ideaId = "idea-123";
        var mockClientProxy = Substitute.For<IClientProxy>();
        _mockClients.Group($"user_ideas_{userId}").Returns(mockClientProxy);

        // Act & Assert - Should not throw
        await _hub.NotifyIdeaUpdate(userId, ideaId, "comment", "New comment on your idea");
    }

    [Fact]
    public async Task SendIdeaStats_ExecutesWithoutException()
    {
        // Arrange
        var ideaId = "idea-stats";
        var mockClientProxy = Substitute.For<IClientProxy>();
        _mockClients.Group($"idea_{ideaId}").Returns(mockClientProxy);

        // Act & Assert - Should not throw
        await _hub.SendIdeaStats(ideaId, 5, 3, 2);
    }
}

/// <summary>
/// Error handling tests for IdeasHub
/// Tests exception scenarios and edge cases
/// </summary>
public class IdeasHubErrorTests
{
    private readonly IdeasHub _hub;
    private readonly IClaimsService _mockClaimsService;
    private readonly IHubCallerClients _mockClients;
    private readonly IGroupManager _mockGroups;
    private readonly HubCallerContext _mockContext;

    public IdeasHubErrorTests()
    {
        _mockClaimsService = Substitute.For<IClaimsService>();
        _mockClients = Substitute.For<IHubCallerClients>();
        _mockGroups = Substitute.For<IGroupManager>();
        
        _mockContext = Substitute.For<HubCallerContext>();
        _mockContext.ConnectionId.Returns("connection-error-test");

        _hub = new IdeasHub(_mockClaimsService)
        {
            Clients = _mockClients,
            Groups = _mockGroups,
            Context = _mockContext
        };
    }

    [Fact]
    public async Task SubscribeToIdea_WithNullIdeaId_Throws()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => _hub.SubscribeToIdea(null!));
    }

    [Fact]
    public async Task UnsubscribeFromIdea_WithEmptyIdeaId_Throws()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => _hub.UnsubscribeFromIdea(""));
    }

    [Fact]
    public async Task OnDisconnectedAsync_RemovesFromUserGroup()
    {
        // Arrange
        var userId = "user-disconnect";
        _mockClaimsService.GetUserId().Returns(userId);

        // Act
        await _hub.OnDisconnectedAsync(null);

        // Assert
        await _mockGroups.Received(1).RemoveFromGroupAsync(
            _mockContext.ConnectionId,
            $"user_ideas_{userId}",
            Arg.Any<CancellationToken>()
        );
    }
}
