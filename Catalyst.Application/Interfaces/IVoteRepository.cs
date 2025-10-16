using Catalyst.Domain.Entities;

namespace Catalyst.Application.Interfaces;

public interface IVoteRepository : IRepository<Vote>
{
    Task<Vote> GetUserVoteOnIdeaAsync(string userId, string ideaId);
    Task<int> GetUpvoteCountAsync(string ideaId);
    Task<int> GetDownvoteCountAsync(string ideaId);
    Task<IEnumerable<Vote>> GetVotesByIdeaAsync(string ideaId);
    Task<IEnumerable<Vote>> GetVotesByUserAsync(string userId);
}
