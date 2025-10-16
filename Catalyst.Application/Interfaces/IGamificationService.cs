using Catalyst.Domain.Entities;

namespace Catalyst.Application.Interfaces;

public interface IGamificationService
{
    Task<int> AwardPointsAsync(string userId, int points);
    Task<int> DeductPointsAsync(string userId, int points);
    Task<int> GetUserPointsAsync(string userId);
    Task<IEnumerable<User>> GetLeaderboardAsync(int limit = 10);
}
