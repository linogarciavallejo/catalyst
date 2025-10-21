using Catalyst.Application.Interfaces;
using Catalyst.Domain.Entities;

namespace Catalyst.Application.Services;

public class IdeaService : IIdeaService
{
    private readonly IIdeaRepository _ideaRepository;
    private readonly IGamificationService _gamificationService;

    public IdeaService(IIdeaRepository ideaRepository, IGamificationService gamificationService)
    {
        _ideaRepository = ideaRepository;
        _gamificationService = gamificationService;
    }

    public async Task<Idea> CreateIdeaAsync(Idea idea)
    {
        if (idea.Title == null)
            throw new ArgumentException("Idea title is required");

        if (idea.Description == null)
            throw new ArgumentException("Idea description is required");

        var createdIdea = await _ideaRepository.AddAsync(idea);

        await _gamificationService.AwardPointsAsync(idea.CreatedBy.Value, 50);

        return createdIdea;
    }

    public async Task<Idea> GetIdeaByIdAsync(string id)
    {
        return await _ideaRepository.GetByIdAsync(id);
    }

    public async Task<IEnumerable<Idea>> SearchIdeasAsync(string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return await _ideaRepository.GetAllAsync();

        return await _ideaRepository.SearchByTitleAsync(searchTerm);
    }

    public async Task<IEnumerable<Idea>> GetIdeasByCategoryAsync(string category)
    {
        return await _ideaRepository.GetByCategoryAsync(category);
    }

    public async Task<Idea> UpdateIdeaAsync(Idea idea)
    {
        return await _ideaRepository.UpdateAsync(idea);
    }

    public async Task<bool> DeleteIdeaAsync(string id)
    {
        var idea = await _ideaRepository.GetByIdAsync(id);
        if (idea == null)
            return false;

        await _gamificationService.DeductPointsAsync(idea.CreatedBy.Value, 50);

        return await _ideaRepository.DeleteAsync(id);
    }

    public async Task<IEnumerable<Idea>> GetTopIdeasAsync(int limit = 10)
    {
        return await _ideaRepository.GetTopIdeasByVotesAsync(limit);
    }
}
