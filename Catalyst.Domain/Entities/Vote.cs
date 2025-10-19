using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Catalyst.Domain.ValueObjects;

namespace Catalyst.Domain.Entities;

public class Vote
{
    [BsonId]
    public string Id { get; set; }

    [BsonElement("ideaId")]
    public IdeaId IdeaId { get; set; }

    [BsonElement("userId")]
    public UserId UserId { get; set; }

    [BsonElement("voteType")]
    public VoteType VoteType { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; }

    public Vote()
    {
        Id = ObjectId.GenerateNewId().ToString();
        CreatedAt = DateTime.UtcNow;
    }
}

public enum VoteType
{
    Upvote,
    Downvote
}
