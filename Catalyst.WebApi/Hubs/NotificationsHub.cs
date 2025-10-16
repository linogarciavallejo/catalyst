using Microsoft.AspNetCore.SignalR;
using Catalyst.Infrastructure.Authentication;

namespace Catalyst.WebApi.Hubs;

/// <summary>
/// SignalR Hub for real-time notifications
/// Handles live notification delivery to connected clients
/// Supports notifications for: new comments, votes, idea status changes, mentions
/// </summary>
public class NotificationsHub : Hub
{
    private readonly IClaimsService _claimsService;
    private const string NotificationGroup = "notifications";

    public NotificationsHub(IClaimsService claimsService)
    {
        _claimsService = claimsService ?? throw new ArgumentNullException(nameof(claimsService));
    }

    /// <summary>
    /// Called when a client connects to the hub
    /// Joins the user to their personal notification group
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        var userId = _claimsService.GetUserId();
        if (!string.IsNullOrEmpty(userId))
        {
            // Add user to their personal notification group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
        }

        // Add all users to the general notifications group for broadcasts
        await Groups.AddToGroupAsync(Context.ConnectionId, NotificationGroup);
        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Called when a client disconnects from the hub
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = _claimsService.GetUserId();
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
        }

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, NotificationGroup);
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Sends a notification to a specific user
    /// Called by backend services when events occur
    /// </summary>
    public async Task SendUserNotification(string userId, string title, string message, string type = "info")
    {
        var notification = new
        {
            id = Guid.NewGuid(),
            title = title,
            message = message,
            type = type, // "info", "success", "warning", "error"
            timestamp = DateTime.UtcNow,
            read = false
        };

        await Clients.Group($"user_{userId}").SendAsync("ReceiveNotification", notification);
    }

    /// <summary>
    /// Sends a broadcast notification to all connected users
    /// </summary>
    public async Task BroadcastNotification(string title, string message, string type = "info")
    {
        var notification = new
        {
            id = Guid.NewGuid(),
            title = title,
            message = message,
            type = type,
            timestamp = DateTime.UtcNow
        };

        await Clients.Group(NotificationGroup).SendAsync("ReceiveNotification", notification);
    }

    /// <summary>
    /// Notifies users that follow an idea about new activity
    /// </summary>
    public async Task NotifyIdeaFollowers(string ideaId, List<string> followerUserIds, string title, string message)
    {
        var notification = new
        {
            id = Guid.NewGuid(),
            ideaId = ideaId,
            title = title,
            message = message,
            timestamp = DateTime.UtcNow,
            read = false
        };

        foreach (var userId in followerUserIds)
        {
            await Clients.Group($"user_{userId}").SendAsync("ReceiveNotification", notification);
        }
    }

    /// <summary>
    /// Notifies about new comment on an idea
    /// </summary>
    public async Task NotifyNewComment(string ideaId, List<string> followerUserIds, string commentAuthor, string commentPreview)
    {
        await NotifyIdeaFollowers(
            ideaId,
            followerUserIds,
            $"New comment from {commentAuthor}",
            commentPreview
        );
    }

    /// <summary>
    /// Notifies about new vote on an idea
    /// </summary>
    public async Task NotifyNewVote(string ideaId, List<string> followerUserIds, string voterName, int totalVotes)
    {
        await NotifyIdeaFollowers(
            ideaId,
            followerUserIds,
            $"New vote from {voterName}",
            $"This idea now has {totalVotes} total votes!"
        );
    }

    /// <summary>
    /// Notifies about idea status change
    /// </summary>
    public async Task NotifyIdeaStatusChanged(string ideaId, List<string> followerUserIds, string newStatus)
    {
        await NotifyIdeaFollowers(
            ideaId,
            followerUserIds,
            "Idea Status Updated",
            $"The idea status has changed to: {newStatus}"
        );
    }

    /// <summary>
    /// Notifies about user mention in a comment
    /// </summary>
    public async Task NotifyMention(string mentionedUserId, string mentionerName, string commentPreview, string ideaId)
    {
        var notification = new
        {
            id = Guid.NewGuid(),
            title = $"{mentionerName} mentioned you",
            message = commentPreview,
            ideaId = ideaId,
            type = "mention",
            timestamp = DateTime.UtcNow,
            read = false
        };

        await Clients.Group($"user_{mentionedUserId}").SendAsync("ReceiveNotification", notification);
    }

    /// <summary>
    /// Sends unread notification count to a user
    /// </summary>
    public async Task SendUnreadCount(string userId, int unreadCount)
    {
        await Clients.Group($"user_{userId}").SendAsync("UnreadNotificationCount", unreadCount);
    }
}
