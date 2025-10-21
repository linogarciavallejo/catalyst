using Microsoft.AspNetCore.SignalR;
using Catalyst.Application.Security;

namespace Catalyst.WebApi.Hubs;

/// <summary>
/// SignalR Hub for real-time idea updates
/// Handles live updates for idea creation, voting, comments, and status changes
/// Clients can subscribe to specific idea channels for real-time updates
/// </summary>
public class IdeasHub : Hub
{
    private readonly IClaimsService _claimsService;

    public IdeasHub(IClaimsService claimsService)
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
            // Add user to their personal ideas group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_ideas_{userId}");
        }

        // Add to general ideas group for broadcasts
        await Groups.AddToGroupAsync(Context.ConnectionId, "all_ideas");
        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Client subscribes to updates for a specific idea
    /// </summary>
    public async Task SubscribeToIdea(string ideaId)
    {
        if (string.IsNullOrEmpty(ideaId))
            throw new ArgumentException("Idea ID cannot be empty");

        await Groups.AddToGroupAsync(Context.ConnectionId, $"idea_{ideaId}");
        await Clients.Group($"idea_{ideaId}").SendAsync("UserJoinedIdea", new { ideaId, connectionId = Context.ConnectionId });
    }

    /// <summary>
    /// Client unsubscribes from updates for a specific idea
    /// </summary>
    public async Task UnsubscribeFromIdea(string ideaId)
    {
        if (string.IsNullOrEmpty(ideaId))
            throw new ArgumentException("Idea ID cannot be empty");

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"idea_{ideaId}");
        await Clients.Group($"idea_{ideaId}").SendAsync("UserLeftIdea", new { ideaId });
    }

    /// <summary>
    /// Called when a new idea is created
    /// Broadcasts to all connected clients
    /// </summary>
    public async Task BroadcastNewIdea(dynamic ideaData)
    {
        var idea = new
        {
            id = ideaData.id,
            title = ideaData.title,
            description = ideaData.description,
            category = ideaData.category,
            createdBy = ideaData.createdBy,
            createdAt = DateTime.UtcNow,
            votesCount = 0,
            commentsCount = 0
        };

        await Clients.Group("all_ideas").SendAsync("NewIdeaCreated", idea);
    }

    /// <summary>
    /// Broadcasts a new vote to idea subscribers
    /// </summary>
    public async Task BroadcastNewVote(string ideaId, int totalVotes, string voterName, bool isUpvote)
    {
        var voteData = new
        {
            ideaId = ideaId,
            totalVotes = totalVotes,
            voterName = voterName,
            isUpvote = isUpvote,
            timestamp = DateTime.UtcNow
        };

        await Clients.Group($"idea_{ideaId}").SendAsync("VoteUpdated", voteData);
    }

    /// <summary>
    /// Broadcasts a new comment to idea subscribers
    /// </summary>
    public async Task BroadcastNewComment(string ideaId, dynamic commentData)
    {
        var comment = new
        {
            id = commentData.id,
            ideaId = ideaId,
            authorId = commentData.authorId,
            authorName = commentData.authorName,
            content = commentData.content,
            createdAt = DateTime.UtcNow,
            repliesCount = 0
        };

        await Clients.Group($"idea_{ideaId}").SendAsync("CommentAdded", comment);
        
        // Also notify the creator of the idea
        await Clients.Group($"user_ideas_{commentData.authorId}").SendAsync("CommentOnYourIdea", new { ideaId, comment });
    }

    /// <summary>
    /// Broadcasts an idea status change to subscribers
    /// </summary>
    public async Task BroadcastIdeaStatusChange(string ideaId, string newStatus, string changedBy)
    {
        var statusUpdate = new
        {
            ideaId = ideaId,
            newStatus = newStatus,
            changedBy = changedBy,
            timestamp = DateTime.UtcNow
        };

        await Clients.Group($"idea_{ideaId}").SendAsync("IdeaStatusChanged", statusUpdate);
    }

    /// <summary>
    /// Notifies users that their idea has been updated
    /// </summary>
    public async Task NotifyIdeaUpdate(string userId, string ideaId, string updateType, string message)
    {
        var update = new
        {
            ideaId = ideaId,
            updateType = updateType,
            message = message,
            timestamp = DateTime.UtcNow
        };

        await Clients.Group($"user_ideas_{userId}").SendAsync("YourIdeaUpdated", update);
    }

    /// <summary>
    /// Sends real-time idea stats (votes, comments, followers count)
    /// </summary>
    public async Task SendIdeaStats(string ideaId, int votesCount, int commentsCount, int followersCount)
    {
        var stats = new
        {
            ideaId = ideaId,
            votesCount = votesCount,
            commentsCount = commentsCount,
            followersCount = followersCount,
            timestamp = DateTime.UtcNow
        };

        await Clients.Group($"idea_{ideaId}").SendAsync("IdeaStatsUpdated", stats);
    }

    /// <summary>
    /// Called when a client disconnects
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = _claimsService.GetUserId();
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_ideas_{userId}");
        }

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "all_ideas");
        await base.OnDisconnectedAsync(exception);
    }
}
