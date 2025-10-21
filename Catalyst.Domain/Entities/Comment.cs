using System;
using Catalyst.Domain.ValueObjects;

namespace Catalyst.Domain.Entities;

public class Comment
{
    public CommentId Id { get; set; }

    public IdeaId IdeaId { get; set; }

    public UserId UserId { get; set; }

    public string UserName { get; set; }

    public string Content { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public CommentId? ParentCommentId { get; set; }

    public Comment()
    {
        // Parameterless constructor required for serialization and materialization
    }

    private Comment(
        IdeaId ideaId,
        UserId userId,
        string userName,
        string content,
        DateTime createdAt,
        DateTime updatedAt,
        CommentId? parentCommentId)
    {
        IdeaId = ideaId;
        UserId = userId;
        UserName = userName;
        Content = content;
        CreatedAt = createdAt;
        UpdatedAt = updatedAt;
        ParentCommentId = parentCommentId;
    }

    public static Comment Create(
        IdeaId ideaId,
        UserId userId,
        string userName,
        string content,
        CommentId? parentCommentId = null)
    {
        var now = DateTime.UtcNow;
        return new Comment(
            ideaId,
            userId,
            userName,
            content,
            now,
            now,
            parentCommentId);
    }

    public static Comment Rehydrate(
        CommentId id,
        IdeaId ideaId,
        UserId userId,
        string userName,
        string content,
        DateTime createdAt,
        DateTime updatedAt,
        CommentId? parentCommentId)
    {
        var comment = new Comment(
            ideaId,
            userId,
            userName,
            content,
            createdAt,
            updatedAt,
            parentCommentId)
        {
            Id = id
        };

        return comment;
    }

    public void AssignId(CommentId id)
    {
        Id = id;
    }
}
