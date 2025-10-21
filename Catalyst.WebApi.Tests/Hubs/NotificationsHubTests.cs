using Microsoft.AspNetCore.SignalR;
using NSubstitute;
using Catalyst.Application.Security;
using Catalyst.WebApi.Hubs;

namespace Catalyst.WebApi.Tests.Hubs;

/// <summary>
/// Integration tests for NotificationsHub SignalR hub
/// Tests real-time notification delivery
/// </summary>
public class NotificationsHubTests
{
    private readonly NotificationsHub _hub;
    private readonly IClaimsService _mockClaimsService;
    private readonly IHubCallerClients _mockClients;
    private readonly IGroupManager _mockGroups;
    private readonly HubCallerContext _mockContext;

    public NotificationsHubTests()
    {
        _mockClaimsService = Substitute.For<IClaimsService>();
        _mockClients = Substitute.For<IHubCallerClients>();
        _mockGroups = Substitute.For<IGroupManager>();
        
        _mockContext = Substitute.For<HubCallerContext>();
        _mockContext.ConnectionId.Returns("connection-notif-test");

        _hub = new NotificationsHub(_mockClaimsService)
        {
            Clients = _mockClients,
            Groups = _mockGroups,
            Context = _mockContext
        };
    }

    [Fact]
    public async Task OnConnectedAsync_AddsUserToPersonalGroup()
    {
        // Arrange
        var userId = "user-notif";
        _mockClaimsService.GetUserId().Returns(userId);

        // Act
        await _hub.OnConnectedAsync();

        // Assert
        await _mockGroups.Received(1).AddToGroupAsync(
            _mockContext.ConnectionId,
            $"user_{userId}",
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task OnConnectedAsync_AddsToNotificationsGroup()
    {
        // Arrange
        _mockClaimsService.GetUserId().Returns("user-123");

        // Act
        await _hub.OnConnectedAsync();

        // Assert
        await _mockGroups.Received(1).AddToGroupAsync(
            _mockContext.ConnectionId,
            "notifications",
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task SendUserNotification_ExecutesWithoutException()
    {
        // Arrange
        var userId = "user-456";
        var mockClientProxy = Substitute.For<IClientProxy>();
        _mockClients.Group($"user_{userId}").Returns(mockClientProxy);

        // Act & Assert - Should not throw
        await _hub.SendUserNotification(userId, "New Comment", "Someone commented on your idea");
    }

    [Fact]
    public async Task SendUserNotification_WithType_ExecutesWithoutException()
    {
        // Arrange
        var userId = "user-456";
        var mockClientProxy = Substitute.For<IClientProxy>();
        _mockClients.Group($"user_{userId}").Returns(mockClientProxy);

        // Act & Assert
        await _hub.SendUserNotification(userId, "Vote", "Your idea received a vote", "success");
    }

    [Fact]
    public async Task BroadcastNotification_ExecutesWithoutException()
    {
        // Arrange
        var mockClientProxy = Substitute.For<IClientProxy>();
        _mockClients.Group("notifications").Returns(mockClientProxy);

        // Act & Assert
        await _hub.BroadcastNotification("System Maintenance", "Scheduled maintenance in 1 hour");
    }

    [Fact]
    public async Task NotifyIdeaFollowers_ExecutesWithoutException()
    {
        // Arrange
        var ideaId = "idea-123";
        var followerUserIds = new List<string> { "user-1", "user-2", "user-3" };
        var mockClientProxy = Substitute.For<IClientProxy>();
        _mockClients.Group(Arg.Any<string>()).Returns(mockClientProxy);

        // Act & Assert
        await _hub.NotifyIdeaFollowers(ideaId, followerUserIds, "New Activity", "Someone commented on this idea");
    }

    [Fact]
    public async Task OnDisconnectedAsync_RemovesFromPersonalGroup()
    {
        // Arrange
        var userId = "user-disconnect";
        _mockClaimsService.GetUserId().Returns(userId);

        // Act
        await _hub.OnDisconnectedAsync(null);

        // Assert
        await _mockGroups.Received(1).RemoveFromGroupAsync(
            _mockContext.ConnectionId,
            $"user_{userId}",
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task OnDisconnectedAsync_RemovesFromNotificationsGroup()
    {
        // Arrange
        _mockClaimsService.GetUserId().Returns("user-123");

        // Act
        await _hub.OnDisconnectedAsync(null);

        // Assert
        await _mockGroups.Received(1).RemoveFromGroupAsync(
            _mockContext.ConnectionId,
            "notifications",
            Arg.Any<CancellationToken>()
        );
    }
}

/// <summary>
/// Error handling tests for NotificationsHub
/// </summary>
public class NotificationsHubErrorTests
{
    private readonly NotificationsHub _hub;
    private readonly IClaimsService _mockClaimsService;
    private readonly IHubCallerClients _mockClients;
    private readonly IGroupManager _mockGroups;
    private readonly HubCallerContext _mockContext;

    public NotificationsHubErrorTests()
    {
        _mockClaimsService = Substitute.For<IClaimsService>();
        _mockClients = Substitute.For<IHubCallerClients>();
        _mockGroups = Substitute.For<IGroupManager>();
        
        _mockContext = Substitute.For<HubCallerContext>();
        _mockContext.ConnectionId.Returns("connection-error-test");

        _hub = new NotificationsHub(_mockClaimsService)
        {
            Clients = _mockClients,
            Groups = _mockGroups,
            Context = _mockContext
        };
    }

    [Fact]
    public async Task SendUserNotification_WithNullUserId_Sends()
    {
        // Arrange
        var mockClientProxy = Substitute.For<IClientProxy>();
        _mockClients.Group(Arg.Any<string>()).Returns(mockClientProxy);

        // Act & Assert
        await _hub.SendUserNotification(null!, "Title", "Message");
    }

    [Fact]
    public async Task BroadcastNotification_WithEmptyTitle_Sends()
    {
        // Arrange
        var mockClientProxy = Substitute.For<IClientProxy>();
        _mockClients.Group("notifications").Returns(mockClientProxy);

        // Act & Assert
        await _hub.BroadcastNotification("", "Message");
    }

    [Fact]
    public async Task NotifyIdeaFollowers_WithEmptyFollowerList_Completes()
    {
        // Act & Assert
        await _hub.NotifyIdeaFollowers("idea-123", new List<string>(), "Title", "Message");
    }
}
