using Catalyst.Domain.Entities;

namespace Catalyst.Application.Interfaces;

public interface IVotingService
{
    Task<Vote> VoteAsync(string userId, string ideaId, bool isUpvote);
    Task<bool> RemoveVoteAsync(string userId, string ideaId);
    Task<int> GetUpvoteCountAsync(string ideaId);
    Task<int> GetDownvoteCountAsync(string ideaId);
}
