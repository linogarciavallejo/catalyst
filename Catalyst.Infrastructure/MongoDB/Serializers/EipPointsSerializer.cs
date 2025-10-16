using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using Catalyst.Domain.ValueObjects;

namespace Catalyst.Infrastructure.MongoDB.Serializers;

public class EipPointsSerializer : IBsonSerializer<EipPoints>
{
    public Type ValueType => typeof(EipPoints);

    public void Serialize(BsonSerializationContext context, BsonSerializationArgs args, EipPoints value)
    {
        if (value == null)
        {
            context.Writer.WriteNull();
        }
        else
        {
            context.Writer.WriteInt32(value.Value);
        }
    }

    void IBsonSerializer.Serialize(BsonSerializationContext context, BsonSerializationArgs args, object value)
    {
        Serialize(context, args, (EipPoints)value);
    }

    public EipPoints Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        var bsonType = context.Reader.GetCurrentBsonType();
        
        if (bsonType == BsonType.Null)
        {
            context.Reader.ReadNull();
            return null;
        }

        return bsonType switch
        {
            BsonType.Int32 => EipPoints.Create(context.Reader.ReadInt32()),
            BsonType.Int64 => EipPoints.Create((int)context.Reader.ReadInt64()),
            BsonType.Double => EipPoints.Create((int)context.Reader.ReadDouble()),
            _ => throw new BsonSerializationException($"Cannot deserialize a '{bsonType}' to EipPoints.")
        };
    }

    object IBsonSerializer.Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        return Deserialize(context, args);
    }
}
