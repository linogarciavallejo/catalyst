using Microsoft.AspNetCore.SignalR;
using Catalyst.Application.Security;

namespace Catalyst.WebApi.Hubs;

/// <summary>
/// SignalR Hub for real-time messaging between users
/// Supports direct messages, group chats, and idea discussion channels
/// </summary>
public class ChatHub : Hub
{
    private readonly IClaimsService _claimsService;

    public ChatHub(IClaimsService claimsService)
    {
        _claimsService = claimsService ?? throw new ArgumentNullException(nameof(claimsService));
    }

    /// <summary>
    /// Called when a client connects to the hub
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        var userId = _claimsService.GetUserId();
        if (!string.IsNullOrEmpty(userId))
        {
            // Add user to their personal chat group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_chat_{userId}");
        }

        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Send a direct message to another user
    /// </summary>
    public async Task SendDirectMessage(string recipientUserId, string message)
    {
        if (string.IsNullOrEmpty(recipientUserId) || string.IsNullOrEmpty(message))
            throw new ArgumentException("Recipient user ID and message cannot be empty");

        var senderUserId = _claimsService.GetUserId();
        if (string.IsNullOrEmpty(senderUserId))
            throw new UnauthorizedAccessException("User must be authenticated");

        var messageData = new
        {
            id = Guid.NewGuid(),
            senderId = senderUserId,
            senderName = _claimsService.GetDisplayName() ?? "Unknown User",
            content = message,
            timestamp = DateTime.UtcNow,
            isRead = false
        };

        // Send to recipient
        await Clients.Group($"user_chat_{recipientUserId}").SendAsync("ReceiveDirectMessage", messageData);

        // Echo back to sender
        await Clients.Caller.SendAsync("DirectMessageSent", messageData);
    }

    /// <summary>
    /// Join an idea discussion channel
    /// </summary>
    public async Task JoinIdeaChat(string ideaId)
    {
        if (string.IsNullOrEmpty(ideaId))
            throw new ArgumentException("Idea ID cannot be empty");

        var userId = _claimsService.GetUserId();
        var userName = _claimsService.GetDisplayName() ?? "Unknown User";

        await Groups.AddToGroupAsync(Context.ConnectionId, $"idea_chat_{ideaId}");
        
        // Notify others that user joined
        await Clients.Group($"idea_chat_{ideaId}").SendAsync("UserJoinedChat", new
        {
            userId = userId,
            userName = userName,
            ideaId = ideaId,
            timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Leave an idea discussion channel
    /// </summary>
    public async Task LeaveIdeaChat(string ideaId)
    {
        if (string.IsNullOrEmpty(ideaId))
            throw new ArgumentException("Idea ID cannot be empty");

        var userId = _claimsService.GetUserId();
        var userName = _claimsService.GetDisplayName() ?? "Unknown User";

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"idea_chat_{ideaId}");
        
        // Notify others that user left
        await Clients.Group($"idea_chat_{ideaId}").SendAsync("UserLeftChat", new
        {
            userId = userId,
            userName = userName,
            ideaId = ideaId
        });
    }

    /// <summary>
    /// Send a message to an idea discussion channel
    /// </summary>
    public async Task SendIdeaMessage(string ideaId, string message)
    {
        if (string.IsNullOrEmpty(ideaId) || string.IsNullOrEmpty(message))
            throw new ArgumentException("Idea ID and message cannot be empty");

        var userId = _claimsService.GetUserId();
        var userName = _claimsService.GetDisplayName() ?? "Unknown User";

        var chatMessage = new
        {
            id = Guid.NewGuid(),
            ideaId = ideaId,
            userId = userId,
            userName = userName,
            content = message,
            timestamp = DateTime.UtcNow
        };

        // Broadcast to all users in the idea chat channel
        await Clients.Group($"idea_chat_{ideaId}").SendAsync("ReceiveIdeaMessage", chatMessage);
    }

    /// <summary>
    /// Send a typing indicator to other users in an idea discussion
    /// </summary>
    public async Task SendTypingIndicator(string ideaId)
    {
        if (string.IsNullOrEmpty(ideaId))
            throw new ArgumentException("Idea ID cannot be empty");

        var userId = _claimsService.GetUserId();
        var userName = _claimsService.GetDisplayName() ?? "Unknown User";

        await Clients.OthersInGroup($"idea_chat_{ideaId}").SendAsync("UserTyping", new
        {
            userId = userId,
            userName = userName,
            ideaId = ideaId
        });
    }

    /// <summary>
    /// Clear typing indicator when user stops typing
    /// </summary>
    public async Task ClearTypingIndicator(string ideaId)
    {
        if (string.IsNullOrEmpty(ideaId))
            throw new ArgumentException("Idea ID cannot be empty");

        var userId = _claimsService.GetUserId();

        await Clients.OthersInGroup($"idea_chat_{ideaId}").SendAsync("UserStoppedTyping", new
        {
            userId = userId,
            ideaId = ideaId
        });
    }

    /// <summary>
    /// Set user online status
    /// </summary>
    public async Task SetUserOnlineStatus(bool isOnline)
    {
        var userId = _claimsService.GetUserId();
        var userName = _claimsService.GetDisplayName() ?? "Unknown User";

        if (!string.IsNullOrEmpty(userId))
        {
            await Clients.All.SendAsync("UserStatusChanged", new
            {
                userId = userId,
                userName = userName,
                isOnline = isOnline,
                timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Called when a client disconnects
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = _claimsService.GetUserId();
        if (!string.IsNullOrEmpty(userId))
        {
            // Notify all users that this user is offline
            await Clients.All.SendAsync("UserStatusChanged", new
            {
                userId = userId,
                isOnline = false,
                timestamp = DateTime.UtcNow
            });

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_chat_{userId}");
        }

        await base.OnDisconnectedAsync(exception);
    }
}
