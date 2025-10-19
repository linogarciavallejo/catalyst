using Microsoft.AspNetCore.SignalR;
using NSubstitute;
using Catalyst.WebApi.Hubs;
using Catalyst.Infrastructure.Authentication;

namespace Catalyst.WebApi.Tests.Hubs;

/// <summary>
/// Integration tests for ChatHub SignalR hub
/// Tests real-time messaging between users
/// </summary>
public class ChatHubTests
{
    private readonly ChatHub _hub;
    private readonly IClaimsService _mockClaimsService;
    private readonly IHubCallerClients _mockClients;
    private readonly IGroupManager _mockGroups;
    private readonly HubCallerContext _mockContext;

    public ChatHubTests()
    {
        _mockClaimsService = Substitute.For<IClaimsService>();
        _mockClients = Substitute.For<IHubCallerClients>();
        _mockGroups = Substitute.For<IGroupManager>();
        
        _mockContext = Substitute.For<HubCallerContext>();
        _mockContext.ConnectionId.Returns("connection-chat-test");

        _hub = new ChatHub(_mockClaimsService)
        {
            Clients = _mockClients,
            Groups = _mockGroups,
            Context = _mockContext
        };
    }

    [Fact]
    public async Task OnConnectedAsync_AddsUserToPersonalChatGroup()
    {
        // Arrange
        var userId = "user-chat";
        _mockClaimsService.GetUserId().Returns(userId);

        // Act
        await _hub.OnConnectedAsync();

        // Assert
        await _mockGroups.Received(1).AddToGroupAsync(
            _mockContext.ConnectionId,
            $"user_chat_{userId}",
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task SendDirectMessage_ExecutesWithoutException()
    {
        // Arrange
        var senderUserId = "user-sender";
        var recipientUserId = "user-recipient";
        _mockClaimsService.GetUserId().Returns(senderUserId);
        _mockClaimsService.GetDisplayName().Returns("Sender");
        
        var mockClientProxy = Substitute.For<IClientProxy>();
        _mockClients.Group($"user_chat_{recipientUserId}").Returns(mockClientProxy);

        // Act & Assert
        await _hub.SendDirectMessage(recipientUserId, "Test message");
    }

    [Fact]
    public async Task SendDirectMessage_WithEmptyMessage_Throws()
    {
        // Arrange
        var senderUserId = "user-sender";
        var recipientUserId = "user-recipient";
        _mockClaimsService.GetUserId().Returns(senderUserId);

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => 
            _hub.SendDirectMessage(recipientUserId, ""));
    }

    [Fact]
    public async Task SendDirectMessage_WithNullRecipient_Throws()
    {
        // Arrange
        _mockClaimsService.GetUserId().Returns("user-sender");

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => 
            _hub.SendDirectMessage(null!, "message"));
    }

    [Fact]
    public async Task JoinIdeaChat_ExecutesWithoutException()
    {
        // Arrange
        var ideaId = "idea-chat";
        var userId = "user-123";
        _mockClaimsService.GetUserId().Returns(userId);
        _mockClaimsService.GetDisplayName().Returns("User Name");
        
        var mockClientProxy = Substitute.For<IClientProxy>();
        _mockClients.Group($"idea_chat_{ideaId}").Returns(mockClientProxy);

        // Act & Assert
        await _hub.JoinIdeaChat(ideaId);
    }

    [Fact]
    public async Task JoinIdeaChat_WithEmptyIdeaId_Throws()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => 
            _hub.JoinIdeaChat(""));
    }

    [Fact]
    public async Task LeaveIdeaChat_ExecutesWithoutException()
    {
        // Arrange
        var ideaId = "idea-chat";
        var userId = "user-123";
        _mockClaimsService.GetUserId().Returns(userId);
        _mockClaimsService.GetDisplayName().Returns("User Name");
        
        var mockClientProxy = Substitute.For<IClientProxy>();
        _mockClients.Group($"idea_chat_{ideaId}").Returns(mockClientProxy);

        // Act & Assert
        await _hub.LeaveIdeaChat(ideaId);
    }

    [Fact]
    public async Task LeaveIdeaChat_WithNullIdeaId_Throws()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => 
            _hub.LeaveIdeaChat(null!));
    }

    [Fact]
    public async Task SendDirectMessage_WithUnauthenticatedUser_Throws()
    {
        // Arrange
        _mockClaimsService.GetUserId().Returns("");

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => 
            _hub.SendDirectMessage("user-2", "message"));
    }

    [Fact]
    public async Task OnConnectedAsync_WithNullUserId_DoesNotAddToGroup()
    {
        // Arrange
        _mockClaimsService.GetUserId().Returns((string)null!);

        // Act
        await _hub.OnConnectedAsync();

        // Assert
        await _mockGroups.DidNotReceive().AddToGroupAsync(
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<CancellationToken>()
        );
    }
}

/// <summary>
/// Error and edge case tests for ChatHub
/// </summary>
public class ChatHubErrorTests
{
    private readonly ChatHub _hub;
    private readonly IClaimsService _mockClaimsService;
    private readonly IHubCallerClients _mockClients;
    private readonly IGroupManager _mockGroups;
    private readonly HubCallerContext _mockContext;

    public ChatHubErrorTests()
    {
        _mockClaimsService = Substitute.For<IClaimsService>();
        _mockClients = Substitute.For<IHubCallerClients>();
        _mockGroups = Substitute.For<IGroupManager>();
        
        _mockContext = Substitute.For<HubCallerContext>();
        _mockContext.ConnectionId.Returns("connection-error-test");

        _hub = new ChatHub(_mockClaimsService)
        {
            Clients = _mockClients,
            Groups = _mockGroups,
            Context = _mockContext
        };
    }

    [Fact]
    public async Task SendDirectMessage_WithVeryLongMessage_Sends()
    {
        // Arrange
        var senderUserId = "user-sender";
        var recipientUserId = "user-recipient";
        var longMessage = new string('x', 10000);
        
        _mockClaimsService.GetUserId().Returns(senderUserId);
        _mockClaimsService.GetDisplayName().Returns("Sender");
        
        var mockClientProxy = Substitute.For<IClientProxy>();
        _mockClients.Group($"user_chat_{recipientUserId}").Returns(mockClientProxy);

        // Act & Assert
        await _hub.SendDirectMessage(recipientUserId, longMessage);
    }
}
