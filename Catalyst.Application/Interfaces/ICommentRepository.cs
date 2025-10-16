using Catalyst.Domain.Entities;

namespace Catalyst.Application.Interfaces;

public interface ICommentRepository : IRepository<Comment>
{
    Task<IEnumerable<Comment>> GetCommentsByIdeaAsync(string ideaId);
    Task<IEnumerable<Comment>> GetRepliesByCommentAsync(string parentCommentId);
    Task<int> GetCommentCountByIdeaAsync(string ideaId);
}
