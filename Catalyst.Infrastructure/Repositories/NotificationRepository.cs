using System;
using Catalyst.Application.Interfaces;
using Catalyst.Domain.Entities;
using Catalyst.Domain.ValueObjects;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Catalyst.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly IMongoCollection<Notification> _collection;
    private const string CollectionName = "Notifications";

    public NotificationRepository(MongoDbContext context)
    {
        _collection = context.GetCollection<Notification>(CollectionName);
        EnsureIndexesAsync().GetAwaiter().GetResult();
    }

    public async Task<Notification> AddAsync(Notification entity)
    {
        if (string.IsNullOrWhiteSpace(entity.Id))
        {
            entity.AssignId(ObjectId.GenerateNewId().ToString());
        }

        if (entity.CreatedAt == default)
        {
            entity.CreatedAt = DateTime.UtcNow;
        }

        await _collection.InsertOneAsync(entity);
        return entity;
    }

    public async Task<Notification> GetByIdAsync(string id)
    {
        return await _collection.Find(n => n.Id == id).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Notification>> GetAllAsync()
    {
        return await _collection.Find(_ => true).ToListAsync();
    }

    public async Task<Notification> UpdateAsync(Notification entity)
    {
        await _collection.ReplaceOneAsync(n => n.Id == entity.Id, entity);
        return entity;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _collection.DeleteOneAsync(n => n.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<IEnumerable<Notification>> GetUnreadNotificationsByUserAsync(string userId)
    {
        var usrId = UserId.Create(userId);
        return await _collection
            .Find(n => n.UserId == usrId && !n.IsRead)
            .SortByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(string userId)
    {
        var usrId = UserId.Create(userId);
        return (int)await _collection.CountDocumentsAsync(n =>
            n.UserId == usrId && !n.IsRead);
    }

    public async Task<bool> MarkAsReadAsync(string notificationId)
    {
        var update = Builders<Notification>.Update.Set(n => n.IsRead, true);
        var result = await _collection.UpdateOneAsync(
            n => n.Id == notificationId,
            update
        );
        return result.ModifiedCount > 0;
    }

    public async Task<bool> MarkAllAsReadAsync(string userId)
    {
        var usrId = UserId.Create(userId);
        var update = Builders<Notification>.Update.Set(n => n.IsRead, true);
        var result = await _collection.UpdateManyAsync(
            n => n.UserId == usrId && !n.IsRead,
            update
        );
        return result.ModifiedCount > 0;
    }

    /// <summary>
    /// Ensures MongoDB indexes are created for optimal query performance
    /// </summary>
    private async Task EnsureIndexesAsync()
    {
        // Index on UserId for finding user's notifications
        var userIdIndexModel = new CreateIndexModel<Notification>(
            Builders<Notification>.IndexKeys.Ascending(n => n.UserId)
        );

        // Index on IsRead for filtering unread notifications
        var isReadIndexModel = new CreateIndexModel<Notification>(
            Builders<Notification>.IndexKeys.Ascending(n => n.IsRead)
        );

        // Compound index on UserId + IsRead for unread notifications query
        var userUnreadIndexModel = new CreateIndexModel<Notification>(
            Builders<Notification>.IndexKeys
                .Ascending(n => n.UserId)
                .Ascending(n => n.IsRead)
        );

        // Index on RelatedIdeaId for finding notifications related to an idea
        var ideaIdIndexModel = new CreateIndexModel<Notification>(
            Builders<Notification>.IndexKeys.Ascending(n => n.RelatedIdeaId)
        );

        // Index on CreatedAt for sorting by recency
        var createdAtIndexModel = new CreateIndexModel<Notification>(
            Builders<Notification>.IndexKeys.Descending(n => n.CreatedAt)
        );

        try
        {
            await _collection.Indexes.CreateManyAsync(new[]
            {
                userIdIndexModel,
                isReadIndexModel,
                userUnreadIndexModel,
                ideaIdIndexModel,
                createdAtIndexModel
            });
        }
        catch (MongoCommandException ex) when (ex.Code == 85)
        {
            // Index already exists, safe to ignore
        }
    }
}
