using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using Catalyst.Domain.ValueObjects;

namespace Catalyst.Infrastructure.MongoDB.Serializers;

public class UserIdSerializer : IBsonSerializer<UserId>
{
    public Type ValueType => typeof(UserId);

    public void Serialize(BsonSerializationContext context, BsonSerializationArgs args, UserId value)
    {
        if (value == null)
        {
            context.Writer.WriteNull();
        }
        else
        {
            context.Writer.WriteString(value.Value);
        }
    }

    void IBsonSerializer.Serialize(BsonSerializationContext context, BsonSerializationArgs args, object value)
    {
        Serialize(context, args, (UserId)value);
    }

    public UserId Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        var bsonType = context.Reader.GetCurrentBsonType();
        
        if (bsonType == BsonType.Null)
        {
            context.Reader.ReadNull();
            return null;
        }

        if (bsonType == BsonType.String)
        {
            return UserId.Create(context.Reader.ReadString());
        }

        throw new BsonSerializationException($"Cannot deserialize a '{bsonType}' to a UserId.");
    }

    object IBsonSerializer.Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        return Deserialize(context, args);
    }
}
