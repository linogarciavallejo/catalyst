using Catalyst.Application.Interfaces;
using Catalyst.Domain.Entities;

namespace Catalyst.Application.Services;

public class GamificationService : IGamificationService
{
    private readonly IUserRepository _userRepository;

    public GamificationService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<int> AwardPointsAsync(string userId, int points)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException($"User {userId} not found");

        user.EipPoints = user.EipPoints.Add(points);
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        return user.EipPoints.Value;
    }

    public async Task<int> DeductPointsAsync(string userId, int points)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException($"User {userId} not found");

        user.EipPoints = user.EipPoints.Subtract(points);
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        return user.EipPoints.Value;
    }

    public async Task<int> GetUserPointsAsync(string userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new InvalidOperationException($"User {userId} not found");

        return user.EipPoints.Value;
    }

    public async Task<IEnumerable<User>> GetLeaderboardAsync(int limit = 10)
    {
        return await _userRepository.GetTopUsersByPointsAsync(limit);
    }
}
