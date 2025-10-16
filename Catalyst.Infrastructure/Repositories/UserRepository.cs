using Catalyst.Application.Interfaces;
using Catalyst.Domain.Entities;
using Catalyst.Domain.Enums;
using Catalyst.Domain.ValueObjects;
using MongoDB.Driver;

namespace Catalyst.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IMongoCollection<User> _collection;
    private const string CollectionName = "Users";

    public UserRepository(MongoDbContext context)
    {
        _collection = context.GetCollection<User>(CollectionName);
        EnsureIndexesAsync().GetAwaiter().GetResult();
    }

    public async Task<User> AddAsync(User entity)
    {
        await _collection.InsertOneAsync(entity);
        return entity;
    }

    public async Task<User> GetByIdAsync(string id)
    {
        var usrId = UserId.Create(id);
        return await _collection.Find(u => u.Id == usrId).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _collection.Find(_ => true).ToListAsync();
    }

    public async Task<User> UpdateAsync(User entity)
    {
        await _collection.ReplaceOneAsync(u => u.Id == entity.Id, entity);
        return entity;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var usrId = UserId.Create(id);
        var result = await _collection.DeleteOneAsync(u => u.Id == usrId);
        return result.DeletedCount > 0;
    }

    public async Task<User> GetByEmailAsync(string email)
    {
        var userEmail = Email.Create(email);
        return await _collection.Find(u => u.Email == userEmail).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<User>> GetByRoleAsync(UserRole role)
    {
        return await _collection.Find(u => u.Role == role).ToListAsync();
    }

    public async Task<IEnumerable<User>> GetTopUsersByPointsAsync(int limit = 10)
    {
        return await _collection
            .Find(_ => true)
            .SortByDescending(u => u.EipPoints.Value)
            .Limit(limit)
            .ToListAsync();
    }

    /// <summary>
    /// Ensures MongoDB indexes are created for optimal query performance
    /// </summary>
    private async Task EnsureIndexesAsync()
    {
        // Unique index on Email
        var emailIndexModel = new CreateIndexModel<User>(
            Builders<User>.IndexKeys.Ascending(u => u.Email),
            new CreateIndexOptions { Unique = true }
        );

        // Index on Role for role-based queries
        var roleIndexModel = new CreateIndexModel<User>(
            Builders<User>.IndexKeys.Ascending(u => u.Role)
        );

        // Index on EipPoints for leaderboard
        var pointsIndexModel = new CreateIndexModel<User>(
            Builders<User>.IndexKeys.Descending(u => u.EipPoints)
        );

        try
        {
            await _collection.Indexes.CreateManyAsync(new[]
            {
                emailIndexModel,
                roleIndexModel,
                pointsIndexModel
            });
        }
        catch (MongoCommandException ex) when (ex.Code == 85)
        {
            // Index already exists, safe to ignore
        }
    }
}
