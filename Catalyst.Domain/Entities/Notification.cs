using System;
using Catalyst.Domain.ValueObjects;

namespace Catalyst.Domain.Entities;

public class Notification
{
    public string Id { get; set; }

    public UserId UserId { get; set; }

    public NotificationType Type { get; set; }

    public string Title { get; set; }

    public string Message { get; set; }

    public IdeaId? RelatedIdeaId { get; set; }

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; }

    public Notification()
    {
        // Parameterless constructor required for serialization and materialization
    }

    private Notification(
        UserId userId,
        NotificationType type,
        string title,
        string message,
        IdeaId? relatedIdeaId,
        bool isRead,
        DateTime createdAt)
    {
        UserId = userId;
        Type = type;
        Title = title;
        Message = message;
        RelatedIdeaId = relatedIdeaId;
        IsRead = isRead;
        CreatedAt = createdAt;
    }

    public static Notification Create(
        UserId userId,
        NotificationType type,
        string title,
        string message,
        IdeaId? relatedIdeaId = null)
    {
        return new Notification(
            userId,
            type,
            title,
            message,
            relatedIdeaId,
            false,
            DateTime.UtcNow);
    }

    public static Notification Rehydrate(
        string id,
        UserId userId,
        NotificationType type,
        string title,
        string message,
        IdeaId? relatedIdeaId,
        bool isRead,
        DateTime createdAt)
    {
        var notification = new Notification(
            userId,
            type,
            title,
            message,
            relatedIdeaId,
            isRead,
            createdAt)
        {
            Id = id
        };

        return notification;
    }

    public void AssignId(string id)
    {
        Id = id;
    }
}

public enum NotificationType
{
    NewComment,
    NewVote,
    IdeaStatusChanged,
    UserMentioned,
    IdeaFollowUpdate
}
