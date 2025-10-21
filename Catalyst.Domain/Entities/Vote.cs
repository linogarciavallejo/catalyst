using System;
using Catalyst.Domain.ValueObjects;

namespace Catalyst.Domain.Entities;

public class Vote
{
    public string Id { get; set; }

    public IdeaId IdeaId { get; set; }

    public UserId UserId { get; set; }

    public VoteType VoteType { get; set; }

    public DateTime CreatedAt { get; set; }

    public Vote()
    {
        // Parameterless constructor required for serialization and materialization
    }

    private Vote(IdeaId ideaId, UserId userId, VoteType voteType, DateTime createdAt)
    {
        IdeaId = ideaId;
        UserId = userId;
        VoteType = voteType;
        CreatedAt = createdAt;
    }

    public static Vote Create(IdeaId ideaId, UserId userId, VoteType voteType)
    {
        return new Vote(ideaId, userId, voteType, DateTime.UtcNow);
    }

    public static Vote Rehydrate(string id, IdeaId ideaId, UserId userId, VoteType voteType, DateTime createdAt)
    {
        var vote = new Vote(ideaId, userId, voteType, createdAt)
        {
            Id = id
        };

        return vote;
    }

    public void AssignId(string id)
    {
        Id = id;
    }
}

public enum VoteType
{
    Upvote,
    Downvote
}
