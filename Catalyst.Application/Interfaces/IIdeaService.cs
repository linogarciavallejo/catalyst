using Catalyst.Domain.Entities;

namespace Catalyst.Application.Interfaces;

public interface IIdeaService
{
    Task<Idea> CreateIdeaAsync(Idea idea);
    Task<Idea> GetIdeaByIdAsync(string id);
    Task<IEnumerable<Idea>> SearchIdeasAsync(string searchTerm);
    Task<IEnumerable<Idea>> GetIdeasByCategoryAsync(string category);
    Task<Idea> UpdateIdeaAsync(Idea idea);
    Task<bool> DeleteIdeaAsync(string id);
    Task<IEnumerable<Idea>> GetTopIdeasAsync(int limit = 10);
}
