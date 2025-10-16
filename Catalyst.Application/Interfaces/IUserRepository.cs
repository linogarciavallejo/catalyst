using Catalyst.Domain.Entities;
using Catalyst.Domain.Enums;

namespace Catalyst.Application.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User> GetByEmailAsync(string email);
    Task<IEnumerable<User>> GetByRoleAsync(UserRole role);
    Task<IEnumerable<User>> GetTopUsersByPointsAsync(int limit = 10);
}
