using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using Catalyst.Application.Interfaces;
using Catalyst.Domain.ValueObjects;
using Catalyst.Infrastructure.MongoDB.Serializers;

namespace Catalyst.Infrastructure;

/// <summary>
/// Register all value object serializers with MongoDB
/// </summary>
internal static class BsonSerializerRegistration
{
    internal static void RegisterValueObjectSerializers()
    {
        // Register ID serializers
        BsonSerializer.RegisterSerializer(new UserIdSerializer());
        BsonSerializer.RegisterSerializer(new IdeaIdSerializer());
        BsonSerializer.RegisterSerializer(new CommentIdSerializer());

        // Register value object serializers
        BsonSerializer.RegisterSerializer(new EmailSerializer());
        BsonSerializer.RegisterSerializer(new EipPointsSerializer());
        BsonSerializer.RegisterSerializer(new IdeaTitleSerializer());
        BsonSerializer.RegisterSerializer(new IdeaDescriptionSerializer());
        BsonSerializer.RegisterSerializer(new CategorySerializer());
        BsonSerializer.RegisterSerializer(new TagsSerializer());
    }
}

public class MongoDbContext
{
    private readonly IMongoClient _client;
    private readonly IMongoDatabase _database;

    static MongoDbContext()
    {
        BsonSerializerRegistration.RegisterValueObjectSerializers();
    }

    public MongoDbContext(IMongoDbSettings settings)
    {
        var mongoClientSettings = MongoClientSettings.FromConnectionString(settings.ConnectionString);
        _client = new MongoClient(mongoClientSettings);
        _database = _client.GetDatabase(settings.DatabaseName);
    }

    /// <summary>
    /// Gets a MongoDB collection for the specified entity type
    /// </summary>
    public IMongoCollection<T> GetCollection<T>(string collectionName) where T : class
    {
        return _database.GetCollection<T>(collectionName);
    }

    /// <summary>
    /// Gets the underlying MongoDB database instance
    /// </summary>
    public IMongoDatabase Database => _database;
}
