using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Catalyst.Domain.ValueObjects;

namespace Catalyst.Domain.Entities;

public class Notification
{
    [BsonId]
    public string Id { get; set; }

    [BsonElement("userId")]
    public UserId UserId { get; set; }

    [BsonElement("type")]
    public NotificationType Type { get; set; }

    [BsonElement("title")]
    public string Title { get; set; }

    [BsonElement("message")]
    public string Message { get; set; }

    [BsonElement("relatedIdeaId")]
    public IdeaId RelatedIdeaId { get; set; }

    [BsonElement("isRead")]
    public bool IsRead { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; }

    public Notification()
    {
        Id = ObjectId.GenerateNewId().ToString();
        IsRead = false;
        CreatedAt = DateTime.UtcNow;
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
