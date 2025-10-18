using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Catalyst.Domain.ValueObjects;

namespace Catalyst.Domain.Entities;

public class Comment
{
    [BsonId]
    public CommentId Id { get; set; }

    [BsonElement("ideaId")]
    public IdeaId IdeaId { get; set; }

    [BsonElement("userId")]
    public UserId UserId { get; set; }

    [BsonElement("userName")]
    public string UserName { get; set; }

    [BsonElement("content")]
    public string Content { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [BsonElement("parentCommentId")]
    public CommentId ParentCommentId { get; set; }

    public Comment()
    {
        Id = CommentId.Create(ObjectId.GenerateNewId().ToString());
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}
