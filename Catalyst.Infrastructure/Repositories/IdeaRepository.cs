using System;
using System.Collections.Generic;
using Catalyst.Application.Interfaces;
using Catalyst.Domain.Entities;
using Catalyst.Domain.Enums;
using Catalyst.Domain.ValueObjects;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Catalyst.Infrastructure.Repositories;

public class IdeaRepository : IIdeaRepository
{
    private readonly IMongoCollection<Idea> _collection;
    private const string CollectionName = "Ideas";

    public IdeaRepository(MongoDbContext context)
    {
        _collection = context.GetCollection<Idea>(CollectionName);
        EnsureIndexesAsync().GetAwaiter().GetResult();
    }

    public async Task<Idea> AddAsync(Idea entity)
    {
        if (entity.Id == null || string.IsNullOrWhiteSpace(entity.Id.Value))
        {
            entity.AssignId(IdeaId.Create(ObjectId.GenerateNewId().ToString()));
        }

        if (entity.CreatedAt == default)
        {
            entity.CreatedAt = DateTime.UtcNow;
        }

        if (entity.UpdatedAt == default)
        {
            entity.UpdatedAt = entity.CreatedAt;
        }

        entity.Followers ??= new List<UserId>();
        entity.Attachments ??= new List<Attachment>();

        await _collection.InsertOneAsync(entity);
        return entity;
    }

    public async Task<Idea> GetByIdAsync(string id)
    {
        var ideaId = IdeaId.Create(id);
        return await _collection.Find(i => i.Id == ideaId).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Idea>> GetAllAsync()
    {
        return await _collection.Find(_ => true).ToListAsync();
    }

    public async Task<Idea> UpdateAsync(Idea entity)
    {
        await _collection.ReplaceOneAsync(i => i.Id == entity.Id, entity);
        return entity;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var ideaId = IdeaId.Create(id);
        var result = await _collection.DeleteOneAsync(i => i.Id == ideaId);
        return result.DeletedCount > 0;
    }

    public async Task<IEnumerable<Idea>> SearchByTitleAsync(string searchTerm)
    {
        var filter = Builders<Idea>.Filter.Regex(i => i.Title, searchTerm);
        return await _collection.Find(filter).ToListAsync();
    }

    public async Task<IEnumerable<Idea>> GetByCategoryAsync(string category)
    {
        var cat = Category.Create(category);
        return await _collection.Find(i => i.Category == cat).ToListAsync();
    }

    public async Task<IEnumerable<Idea>> GetByStatusAsync(IdeaStatus status)
    {
        return await _collection.Find(i => i.Status == status).ToListAsync();
    }

    public async Task<IEnumerable<Idea>> GetByCreatorAsync(string creatorId)
    {
        var userId = UserId.Create(creatorId);
        return await _collection.Find(i => i.CreatedBy == userId).SortByDescending(i => i.CreatedAt).ToListAsync();
    }

    public async Task<IEnumerable<Idea>> GetTopIdeasByVotesAsync(int limit = 10)
    {
        return await _collection
            .Find(_ => true)
            .SortByDescending(i => i.Upvotes)
            .Limit(limit)
            .ToListAsync();
    }

    public async Task<int> GetIdeaCountAsync()
    {
        return (int)await _collection.CountDocumentsAsync(_ => true);
    }

    /// <summary>
    /// Ensures MongoDB indexes are created for optimal query performance
    /// </summary>
    private async Task EnsureIndexesAsync()
    {
        // Index on Title for text search
        var titleIndexModel = new CreateIndexModel<Idea>(
            Builders<Idea>.IndexKeys.Text(i => i.Title)
        );

        // Index on Category for filtering
        var categoryIndexModel = new CreateIndexModel<Idea>(
            Builders<Idea>.IndexKeys.Ascending(i => i.Category)
        );

        // Index on CreatedBy for user's ideas
        var createdByIndexModel = new CreateIndexModel<Idea>(
            Builders<Idea>.IndexKeys.Ascending(i => i.CreatedBy)
        );

        // Index on Status for status filtering
        var statusIndexModel = new CreateIndexModel<Idea>(
            Builders<Idea>.IndexKeys.Ascending(i => i.Status)
        );

        // Compound index for created by + created at
        var compoundIndexModel = new CreateIndexModel<Idea>(
            Builders<Idea>.IndexKeys
                .Ascending(i => i.CreatedBy)
                .Descending(i => i.CreatedAt)
        );

        try
        {
            await _collection.Indexes.CreateManyAsync(new[]
            {
                titleIndexModel,
                categoryIndexModel,
                createdByIndexModel,
                statusIndexModel,
                compoundIndexModel
            });
        }
        catch (MongoCommandException ex) when (ex.Code == 85)
        {
            // Index already exists, safe to ignore
        }
    }
}
