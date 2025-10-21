using System.Collections.Generic;
using System.Linq;
using Catalyst.Domain.Enums;
using Catalyst.Domain.ValueObjects;

namespace Catalyst.Domain.Entities;

public class Idea
{
    public IdeaId Id { get; set; }

    public IdeaTitle Title { get; set; }

    public IdeaDescription Description { get; set; }

    public Category Category { get; set; }

    public Tags Tags { get; set; }

    public UserId CreatedBy { get; set; }

    public string CreatedByName { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public IdeaStatus Status { get; set; }

    public int Upvotes { get; set; }

    public int Downvotes { get; set; }

    public int CommentCount { get; set; }

    public List<UserId> Followers { get; set; } = new();

    public List<Attachment> Attachments { get; set; } = new();

    public UserId ChampionId { get; set; }

    public Idea()
    {
        // Parameterless constructor required for serialization and materialization
    }

    private Idea(
        IdeaTitle title,
        IdeaDescription description,
        Category category,
        Tags tags,
        UserId createdBy,
        string createdByName,
        DateTime createdAt,
        DateTime updatedAt,
        IdeaStatus status,
        int upvotes,
        int downvotes,
        int commentCount,
        IEnumerable<UserId>? followers,
        IEnumerable<Attachment>? attachments,
        UserId championId)
    {
        Title = title;
        Description = description;
        Category = category;
        Tags = tags;
        CreatedBy = createdBy;
        CreatedByName = createdByName;
        CreatedAt = createdAt;
        UpdatedAt = updatedAt;
        Status = status;
        Upvotes = upvotes;
        Downvotes = downvotes;
        CommentCount = commentCount;
        Followers = followers?.ToList() ?? new List<UserId>();
        Attachments = attachments?.ToList() ?? new List<Attachment>();
        ChampionId = championId;
    }

    public static Idea Create(
        IdeaTitle title,
        IdeaDescription description,
        Category category,
        Tags tags,
        UserId createdBy,
        string createdByName)
    {
        var now = DateTime.UtcNow;

        return new Idea(
            title,
            description,
            category,
            tags,
            createdBy,
            createdByName,
            now,
            now,
            IdeaStatus.Submitted,
            0,
            0,
            0,
            Enumerable.Empty<UserId>(),
            Enumerable.Empty<Attachment>(),
            null);
    }

    public static Idea Rehydrate(
        IdeaId id,
        IdeaTitle title,
        IdeaDescription description,
        Category category,
        Tags tags,
        UserId createdBy,
        string createdByName,
        DateTime createdAt,
        DateTime updatedAt,
        IdeaStatus status,
        int upvotes,
        int downvotes,
        int commentCount,
        IEnumerable<UserId>? followers,
        IEnumerable<Attachment>? attachments,
        UserId championId)
    {
        var idea = new Idea(
            title,
            description,
            category,
            tags,
            createdBy,
            createdByName,
            createdAt,
            updatedAt,
            status,
            upvotes,
            downvotes,
            commentCount,
            followers,
            attachments,
            championId)
        {
            Id = id
        };

        return idea;
    }

    public void AssignId(IdeaId id)
    {
        Id = id;
    }
}

public class Attachment
{
    public string FileName { get; set; }

    public string FileUrl { get; set; }

    public long FileSize { get; set; }

    public DateTime UploadedAt { get; set; }

    public Attachment()
    {
        // Parameterless constructor required for serialization and materialization
    }

    private Attachment(string fileName, string fileUrl, long fileSize, DateTime uploadedAt)
    {
        FileName = fileName;
        FileUrl = fileUrl;
        FileSize = fileSize;
        UploadedAt = uploadedAt;
    }

    public static Attachment Create(string fileName, string fileUrl, long fileSize, DateTime uploadedAt)
        => new(fileName, fileUrl, fileSize, uploadedAt);

    public static Attachment Rehydrate(string fileName, string fileUrl, long fileSize, DateTime uploadedAt)
        => new(fileName, fileUrl, fileSize, uploadedAt);
}
