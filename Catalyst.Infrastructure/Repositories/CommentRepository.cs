using Catalyst.Application.Interfaces;
using Catalyst.Domain.Entities;
using Catalyst.Domain.ValueObjects;
using MongoDB.Driver;

namespace Catalyst.Infrastructure.Repositories;

public class CommentRepository : ICommentRepository
{
    private readonly IMongoCollection<Comment> _collection;
    private const string CollectionName = "Comments";

    public CommentRepository(MongoDbContext context)
    {
        _collection = context.GetCollection<Comment>(CollectionName);
        EnsureIndexesAsync().GetAwaiter().GetResult();
    }

    public async Task<Comment> AddAsync(Comment entity)
    {
        await _collection.InsertOneAsync(entity);
        return entity;
    }

    public async Task<Comment> GetByIdAsync(string id)
    {
        var cmtId = CommentId.Create(id);
        return await _collection.Find(c => c.Id == cmtId).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Comment>> GetAllAsync()
    {
        return await _collection.Find(_ => true).ToListAsync();
    }

    public async Task<Comment> UpdateAsync(Comment entity)
    {
        await _collection.ReplaceOneAsync(c => c.Id == entity.Id, entity);
        return entity;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var cmtId = CommentId.Create(id);
        var result = await _collection.DeleteOneAsync(c => c.Id == cmtId);
        return result.DeletedCount > 0;
    }

    public async Task<IEnumerable<Comment>> GetCommentsByIdeaAsync(string ideaId)
    {
        var idId = IdeaId.Create(ideaId);
        return await _collection
            .Find(c => c.IdeaId == idId && c.ParentCommentId == null)
            .SortByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Comment>> GetRepliesByCommentAsync(string parentCommentId)
    {
        var parentId = CommentId.Create(parentCommentId);
        return await _collection
            .Find(c => c.ParentCommentId == parentId)
            .SortByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<int> GetCommentCountByIdeaAsync(string ideaId)
    {
        var idId = IdeaId.Create(ideaId);
        return (int)await _collection.CountDocumentsAsync(c => c.IdeaId == idId);
    }

    /// <summary>
    /// Ensures MongoDB indexes are created for optimal query performance
    /// </summary>
    private async Task EnsureIndexesAsync()
    {
        // Index on IdeaId for finding comments on ideas
        var ideaIdIndexModel = new CreateIndexModel<Comment>(
            Builders<Comment>.IndexKeys.Ascending(c => c.IdeaId)
        );

        // Index on ParentCommentId for finding threaded replies
        var parentCommentIdIndexModel = new CreateIndexModel<Comment>(
            Builders<Comment>.IndexKeys.Ascending(c => c.ParentCommentId)
        );

        // Index on UserId for finding user's comments
        var userIdIndexModel = new CreateIndexModel<Comment>(
            Builders<Comment>.IndexKeys.Ascending(c => c.UserId)
        );

        // Compound index on IdeaId + CreatedAt for sorting
        var compoundIndexModel = new CreateIndexModel<Comment>(
            Builders<Comment>.IndexKeys
                .Ascending(c => c.IdeaId)
                .Descending(c => c.CreatedAt)
        );

        try
        {
            await _collection.Indexes.CreateManyAsync(new[]
            {
                ideaIdIndexModel,
                parentCommentIdIndexModel,
                userIdIndexModel,
                compoundIndexModel
            });
        }
        catch (MongoCommandException ex) when (ex.Code == 85)
        {
            // Index already exists, safe to ignore
        }
    }
}
