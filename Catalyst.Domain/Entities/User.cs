using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Catalyst.Domain.Enums;
using Catalyst.Domain.ValueObjects;

namespace Catalyst.Domain.Entities;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public UserId Id { get; set; }

    [BsonElement("email")]
    public Email Email { get; set; }

    [BsonElement("name")]
    public string Name { get; set; }

    [BsonElement("passwordHash")]
    public string PasswordHash { get; set; }

    [BsonElement("displayName")]
    public string DisplayName { get; set; }

    [BsonElement("role")]
    public UserRole Role { get; set; }

    [BsonElement("eipPoints")]
    public EipPoints EipPoints { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; }

    [BsonElement("profilePicture")]
    public string ProfilePicture { get; set; }

    public User()
    {
        Id = UserId.Create(ObjectId.GenerateNewId().ToString());
        EipPoints = EipPoints.Create(0);
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}
