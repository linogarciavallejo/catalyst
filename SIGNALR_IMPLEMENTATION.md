# SignalR Real-time Features Implementation

## Overview

This document describes the real-time features implemented using ASP.NET Core SignalR hubs. SignalR enables real-time, bidirectional communication between the server and connected clients.

## Architecture

### Three SignalR Hubs

#### 1. **NotificationsHub** (`/hubs/notifications`)
Handles real-time notification delivery to users.

**Features:**
- Personal notification groups per user
- Broadcast notifications to all users
- Idea follower notifications
- Comment and vote notifications
- Mention notifications
- Unread notification count updates

**Client Methods (called by server):**
- `ReceiveNotification(notification)` - Sends a notification to the client
- `UnreadNotificationCount(count)` - Updates unread notification count

**Server Methods (called by client):**
- None (one-way, server-initiated)

---

#### 2. **IdeasHub** (`/hubs/ideas`)
Handles real-time updates for ideas, votes, and comments.

**Features:**
- Subscribe to specific idea updates
- Real-time vote updates
- Comment notifications
- Status change notifications
- Idea statistics updates
- New idea broadcasts

**Client Methods (called by server):**
- `NewIdeaCreated(idea)` - Broadcasts new idea to all clients
- `VoteUpdated(voteData)` - Updates vote count for subscribed ideas
- `CommentAdded(comment)` - Notifies of new comments
- `IdeaStatusChanged(statusUpdate)` - Notifies of status changes
- `IdeaStatsUpdated(stats)` - Updates idea stats (votes, comments, followers)
- `YourIdeaUpdated(update)` - Notifies creator of updates to their idea
- `UserJoinedIdea(data)` - Notifies when a user joins idea subscription
- `UserLeftIdea(data)` - Notifies when a user leaves idea subscription

**Server Methods (called by client):**
- `SubscribeToIdea(ideaId)` - Client subscribes to updates for a specific idea
- `UnsubscribeFromIdea(ideaId)` - Client unsubscribes from an idea

---

#### 3. **ChatHub** (`/hubs/chat`)
Handles real-time messaging between users and in idea discussion channels.

**Features:**
- Direct messaging between users
- Idea discussion channels
- Typing indicators
- User online status
- Message persistence (via database)

**Client Methods (called by server):**
- `ReceiveDirectMessage(message)` - Sends direct message to recipient
- `DirectMessageSent(message)` - Echoes sent message back to sender
- `UserJoinedChat(data)` - Notifies when user joins idea chat
- `UserLeftChat(data)` - Notifies when user leaves idea chat
- `ReceiveIdeaMessage(message)` - Broadcasts message in idea channel
- `UserTyping(data)` - Shows typing indicator
- `UserStoppedTyping(data)` - Hides typing indicator
- `UserStatusChanged(data)` - Updates user online status

**Server Methods (called by client):**
- `SendDirectMessage(recipientUserId, message)` - Send DM to another user
- `JoinIdeaChat(ideaId)` - Join an idea discussion
- `LeaveIdeaChat(ideaId)` - Leave an idea discussion
- `SendIdeaMessage(ideaId, message)` - Send message to idea channel
- `SendTypingIndicator(ideaId)` - Broadcast typing indicator
- `ClearTypingIndicator(ideaId)` - Clear typing indicator
- `SetUserOnlineStatus(isOnline)` - Update user online status

---

## Group Structure

### NotificationsHub Groups
- `notifications` - All connected users (for broadcasts)
- `user_{userId}` - Specific user's notifications

### IdeasHub Groups
- `all_ideas` - All connected users (for new idea broadcasts)
- `user_ideas_{userId}` - Updates about a user's ideas
- `idea_{ideaId}` - Updates for a specific idea

### ChatHub Groups
- `user_chat_{userId}` - User's direct messages
- `idea_chat_{ideaId}` - Idea discussion channel

---

## Client-Side Implementation Example (React/TypeScript)

```typescript
import * as SignalR from "@microsoft/signalr";

// Create connections
const notificationsConnection = new SignalR.HubConnectionBuilder()
  .withUrl("/hubs/notifications", { accessTokenFactory: () => getToken() })
  .withAutomaticReconnect()
  .build();

const ideasConnection = new SignalR.HubConnectionBuilder()
  .withUrl("/hubs/ideas", { accessTokenFactory: () => getToken() })
  .withAutomaticReconnect()
  .build();

const chatConnection = new SignalR.HubConnectionBuilder()
  .withUrl("/hubs/chat", { accessTokenFactory: () => getToken() })
  .withAutomaticReconnect()
  .build();

// Start connections
await notificationsConnection.start();
await ideasConnection.start();
await chatConnection.start();

// Listen for notifications
notificationsConnection.on("ReceiveNotification", (notification) => {
  console.log("New notification:", notification);
  // Update UI with notification
});

// Subscribe to idea updates
ideasConnection.invoke("SubscribeToIdea", ideaId)
  .catch(err => console.error(err));

// Listen for idea updates
ideasConnection.on("VoteUpdated", (voteData) => {
  console.log("Vote updated:", voteData);
});

// Send direct message
chatConnection.invoke("SendDirectMessage", recipientUserId, message)
  .catch(err => console.error(err));

// Listen for direct messages
chatConnection.on("ReceiveDirectMessage", (message) => {
  console.log("New message:", message);
});

// Join idea chat
chatConnection.invoke("JoinIdeaChat", ideaId)
  .catch(err => console.error(err));

// Send idea message
chatConnection.invoke("SendIdeaMessage", ideaId, message)
  .catch(err => console.error(err));

// Listen for idea messages
chatConnection.on("ReceiveIdeaMessage", (message) => {
  console.log("New message in idea:", message);
});
```

---

## Server-Side Integration Points

### 1. **When creating an idea** (IdeaService)
```csharp
var hubContext = HttpContext.RequestServices.GetRequiredService<IHubContext<IdeasHub>>();
await hubContext.Clients.Group("all_ideas").SendAsync("NewIdeaCreated", ideaDto);
```

### 2. **When voting on an idea** (VotingService)
```csharp
var hubContext = HttpContext.RequestServices.GetRequiredService<IHubContext<IdeasHub>>();
await hubContext.Clients.Group($"idea_{ideaId}").SendAsync("VoteUpdated", voteData);
```

### 3. **When commenting on an idea** (IdeaService)
```csharp
var hubContext = HttpContext.RequestServices.GetRequiredService<IHubContext<IdeasHub>>();
await hubContext.Clients.Group($"idea_{ideaId}").SendAsync("CommentAdded", commentData);
```

### 4. **When sending notifications** (NotificationService)
```csharp
var hubContext = HttpContext.RequestServices.GetRequiredService<IHubContext<NotificationsHub>>();
await hubContext.Clients.Group($"user_{userId}").SendAsync("ReceiveNotification", notification);
```

---

## Configuration

### Program.cs
```csharp
builder.Services.AddSignalR();

// ... in app configuration
app.MapHub<NotificationsHub>("/hubs/notifications");
app.MapHub<IdeasHub>("/hubs/ideas");
app.MapHub<ChatHub>("/hubs/chat");
```

### JWT Authentication with SignalR
SignalR connections use JWT tokens passed via query string:
```csharp
// Client-side
new HubConnectionBuilder()
  .withUrl("/hubs/notifications", { 
    accessTokenFactory: () => localStorage.getItem('token') 
  })
  .build();
```

---

## Error Handling

All hub methods include validation and error handling:
- Null/empty string validation
- Authentication checks
- Proper exception messages

Example:
```csharp
public async Task SendDirectMessage(string recipientUserId, string message)
{
    if (string.IsNullOrEmpty(recipientUserId) || string.IsNullOrEmpty(message))
        throw new ArgumentException("Fields cannot be empty");

    var senderUserId = _claimsService.GetUserId();
    if (string.IsNullOrEmpty(senderUserId))
        throw new UnauthorizedAccessException("User must be authenticated");

    // Process message...
}
```

---

## Scaling Considerations (Future)

For production with multiple servers:
1. Use a backplane (e.g., Redis, Azure SignalR Service)
2. Configure sticky sessions if using load balancing
3. Handle connection lifecycle properly
4. Monitor SignalR hub connections

**Example Redis backplane:**
```csharp
builder.Services.AddSignalR()
    .AddRedis(configuration["SignalR:Redis"]);
```

---

## Testing

### Unit Tests
Test hub methods by mocking IHubContext and IClientProxy:
```csharp
[Test]
public async Task SendUserNotification_ShouldSendToCorrectGroup()
{
    var mockClients = new Mock<IHubClients>();
    var mockClientProxy = new Mock<IClientProxy>();
    mockClients.Setup(x => x.Group($"user_{userId}"))
        .Returns(mockClientProxy.Object);

    var hub = new NotificationsHub(mockClaimsService.Object)
    {
        Clients = mockClients.Object
    };

    await hub.SendUserNotification(userId, "Test", "Message", "info");

    mockClientProxy.Verify(x => x.SendAsync(...), Times.Once);
}
```

### Integration Tests
Test with actual SignalR client connections using WebApplicationFactory.

---

## Next Steps

1. **Implement message persistence** - Store chat messages and notifications in MongoDB
2. **Add typing indicators debouncing** - Prevent excessive typing notifications
3. **Implement read receipts** - Track when messages/notifications are read
4. **Add presence detection** - Show which users are currently viewing an idea
5. **Implement message reactions** - Allow emoji reactions to messages
6. **Setup backplane** - For multi-server deployments

---

## References

- [SignalR Documentation](https://learn.microsoft.com/en-us/aspnet/core/signalr)
- [SignalR Hub Groups](https://learn.microsoft.com/en-us/aspnet/core/signalr/groups)
- [SignalR Authentication & Authorization](https://learn.microsoft.com/en-us/aspnet/core/signalr/authn-and-authz)
