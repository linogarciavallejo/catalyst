using System;
using Catalyst.Application.Interfaces;
using Catalyst.Domain.Entities;
using Catalyst.Domain.ValueObjects;

namespace Catalyst.Infrastructure.Services;

public class VotingService : IVotingService
{
    private readonly IVoteRepository _voteRepository;
    private readonly IIdeaRepository _ideaRepository;

    public VotingService(IVoteRepository voteRepository, IIdeaRepository ideaRepository)
    {
        _voteRepository = voteRepository;
        _ideaRepository = ideaRepository;
    }

    public async Task<Vote> VoteAsync(string userId, string ideaId, bool isUpvote)
    {
        // Check if user already voted on this idea
        var existingVote = await _voteRepository.GetUserVoteOnIdeaAsync(userId, ideaId);

        if (existingVote != null)
        {
            // Remove old vote
            await _voteRepository.DeleteAsync(existingVote.Id);
        }

        // Create new vote
        var vote = Vote.Create(
            IdeaId.Create(ideaId),
            UserId.Create(userId),
            isUpvote ? VoteType.Upvote : VoteType.Downvote);

        var createdVote = await _voteRepository.AddAsync(vote);

        // Update idea vote counts
        await UpdateIdeaVoteCountsAsync(ideaId);

        return createdVote;
    }

    public async Task<bool> RemoveVoteAsync(string userId, string ideaId)
    {
        var vote = await _voteRepository.GetUserVoteOnIdeaAsync(userId, ideaId);

        if (vote == null)
            return false;

        var result = await _voteRepository.DeleteAsync(vote.Id);

        // Update idea vote counts
        if (result)
            await UpdateIdeaVoteCountsAsync(ideaId);

        return result;
    }

    public async Task<int> GetUpvoteCountAsync(string ideaId)
    {
        return await _voteRepository.GetUpvoteCountAsync(ideaId);
    }

    public async Task<int> GetDownvoteCountAsync(string ideaId)
    {
        return await _voteRepository.GetDownvoteCountAsync(ideaId);
    }

    /// <summary>
    /// Updates the upvote and downvote counts on the idea
    /// </summary>
    private async Task UpdateIdeaVoteCountsAsync(string ideaId)
    {
        var idea = await _ideaRepository.GetByIdAsync(ideaId);
        if (idea == null)
            return;

        idea.Upvotes = await _voteRepository.GetUpvoteCountAsync(ideaId);
        idea.Downvotes = await _voteRepository.GetDownvoteCountAsync(ideaId);
        idea.UpdatedAt = DateTime.UtcNow;

        await _ideaRepository.UpdateAsync(idea);
    }
}
