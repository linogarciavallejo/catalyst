using Catalyst.Application.Interfaces;
using Catalyst.Domain.Entities;
using Catalyst.Domain.ValueObjects;

namespace Catalyst.Application.Services;

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
        var existingVote = await _voteRepository.GetUserVoteOnIdeaAsync(userId, ideaId);

        if (existingVote != null)
        {
            await _voteRepository.DeleteAsync(existingVote.Id);
        }

        var vote = Vote.Create(
            IdeaId.Create(ideaId),
            UserId.Create(userId),
            isUpvote ? VoteType.Upvote : VoteType.Downvote);

        var createdVote = await _voteRepository.AddAsync(vote);

        await UpdateIdeaVoteCountsAsync(ideaId);

        return createdVote;
    }

    public async Task<bool> RemoveVoteAsync(string userId, string ideaId)
    {
        var vote = await _voteRepository.GetUserVoteOnIdeaAsync(userId, ideaId);

        if (vote == null)
            return false;

        var result = await _voteRepository.DeleteAsync(vote.Id);

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
