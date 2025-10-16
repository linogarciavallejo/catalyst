using Catalyst.Domain.Entities;
using Catalyst.Domain.Enums;

namespace Catalyst.Application.Interfaces;

public interface IIdeaRepository : IRepository<Idea>
{
    Task<IEnumerable<Idea>> SearchByTitleAsync(string searchTerm);
    Task<IEnumerable<Idea>> GetByCategoryAsync(string category);
    Task<IEnumerable<Idea>> GetByStatusAsync(IdeaStatus status);
    Task<IEnumerable<Idea>> GetByCreatorAsync(string creatorId);
    Task<IEnumerable<Idea>> GetTopIdeasByVotesAsync(int limit = 10);
    Task<int> GetIdeaCountAsync();
}
