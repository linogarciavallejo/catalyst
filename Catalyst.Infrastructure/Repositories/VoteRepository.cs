using Catalyst.Application.Interfaces;
using Catalyst.Domain.Entities;
using Catalyst.Domain.ValueObjects;
using MongoDB.Driver;

namespace Catalyst.Infrastructure.Repositories;

public class VoteRepository : IVoteRepository
{
    private readonly IMongoCollection<Vote> _collection;
    private const string CollectionName = "Votes";

    public VoteRepository(MongoDbContext context)
    {
        _collection = context.GetCollection<Vote>(CollectionName);
        EnsureIndexesAsync().GetAwaiter().GetResult();
    }

    public async Task<Vote> AddAsync(Vote entity)
    {
        await _collection.InsertOneAsync(entity);
        return entity;
    }

    public async Task<Vote> GetByIdAsync(string id)
    {
        return await _collection.Find(v => v.Id == id).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Vote>> GetAllAsync()
    {
        return await _collection.Find(_ => true).ToListAsync();
    }

    public async Task<Vote> UpdateAsync(Vote entity)
    {
        await _collection.ReplaceOneAsync(v => v.Id == entity.Id, entity);
        return entity;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _collection.DeleteOneAsync(v => v.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<Vote> GetUserVoteOnIdeaAsync(string userId, string ideaId)
    {
        var usrId = UserId.Create(userId);
        var idId = IdeaId.Create(ideaId);
        return await _collection
            .Find(v => v.UserId == usrId && v.IdeaId == idId)
            .FirstOrDefaultAsync();
    }

    public async Task<int> GetUpvoteCountAsync(string ideaId)
    {
        var idId = IdeaId.Create(ideaId);
        return (int)await _collection.CountDocumentsAsync(v =>
            v.IdeaId == idId && v.VoteType == VoteType.Upvote);
    }

    public async Task<int> GetDownvoteCountAsync(string ideaId)
    {
        var idId = IdeaId.Create(ideaId);
        return (int)await _collection.CountDocumentsAsync(v =>
            v.IdeaId == idId && v.VoteType == VoteType.Downvote);
    }

    public async Task<IEnumerable<Vote>> GetVotesByIdeaAsync(string ideaId)
    {
        var idId = IdeaId.Create(ideaId);
        return await _collection.Find(v => v.IdeaId == idId).ToListAsync();
    }

    public async Task<IEnumerable<Vote>> GetVotesByUserAsync(string userId)
    {
        var usrId = UserId.Create(userId);
        return await _collection.Find(v => v.UserId == usrId).ToListAsync();
    }

    /// <summary>
    /// Ensures MongoDB indexes are created for optimal query performance
    /// </summary>
    private async Task EnsureIndexesAsync()
    {
        // Index on IdeaId for finding votes on specific ideas
        var ideaIdIndexModel = new CreateIndexModel<Vote>(
            Builders<Vote>.IndexKeys.Ascending(v => v.IdeaId)
        );

        // Index on UserId for finding user's votes
        var userIdIndexModel = new CreateIndexModel<Vote>(
            Builders<Vote>.IndexKeys.Ascending(v => v.UserId)
        );

        // Compound index on UserId + IdeaId for uniqueness check
        var compoundIndexModel = new CreateIndexModel<Vote>(
            Builders<Vote>.IndexKeys
                .Ascending(v => v.UserId)
                .Ascending(v => v.IdeaId),
            new CreateIndexOptions { Unique = true }
        );

        // Index on VoteType for filtering upvotes/downvotes
        var voteTypeIndexModel = new CreateIndexModel<Vote>(
            Builders<Vote>.IndexKeys.Ascending(v => v.VoteType)
        );

        try
        {
            await _collection.Indexes.CreateManyAsync(new[]
            {
                ideaIdIndexModel,
                userIdIndexModel,
                compoundIndexModel,
                voteTypeIndexModel
            });
        }
        catch (MongoCommandException ex) when (ex.Code == 85)
        {
            // Index already exists, safe to ignore
        }
    }
}
