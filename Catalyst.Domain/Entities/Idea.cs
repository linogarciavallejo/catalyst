using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Catalyst.Domain.Enums;
using Catalyst.Domain.ValueObjects;

namespace Catalyst.Domain.Entities;

public class Idea
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public IdeaId Id { get; set; }

    [BsonElement("title")]
    public IdeaTitle Title { get; set; }

    [BsonElement("description")]
    public IdeaDescription Description { get; set; }

    [BsonElement("category")]
    public Category Category { get; set; }

    [BsonElement("tags")]
    public Tags Tags { get; set; }

    [BsonElement("createdBy")]
    public UserId CreatedBy { get; set; }

    [BsonElement("createdByName")]
    public string CreatedByName { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [BsonElement("status")]
    public IdeaStatus Status { get; set; }

    [BsonElement("upvotes")]
    public int Upvotes { get; set; }

    [BsonElement("downvotes")]
    public int Downvotes { get; set; }

    [BsonElement("commentCount")]
    public int CommentCount { get; set; }

    [BsonElement("followers")]
    public List<UserId> Followers { get; set; } = new();

    [BsonElement("attachments")]
    public List<Attachment> Attachments { get; set; } = new();

    [BsonElement("championId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public UserId ChampionId { get; set; }

    public Idea()
    {
        Id = IdeaId.Create(ObjectId.GenerateNewId().ToString());
        Status = IdeaStatus.Submitted;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
        Upvotes = 0;
        Downvotes = 0;
        CommentCount = 0;
    }
}

public class Attachment
{
    [BsonElement("fileName")]
    public string FileName { get; set; }

    [BsonElement("fileUrl")]
    public string FileUrl { get; set; }

    [BsonElement("fileSize")]
    public long FileSize { get; set; }

    [BsonElement("uploadedAt")]
    public DateTime UploadedAt { get; set; }
}
