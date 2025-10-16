using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using Catalyst.Domain.ValueObjects;

namespace Catalyst.Infrastructure.MongoDB.Serializers;

public class IdeaTitleSerializer : IBsonSerializer<IdeaTitle>
{
    public Type ValueType => typeof(IdeaTitle);

    public void Serialize(BsonSerializationContext context, BsonSerializationArgs args, IdeaTitle value)
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
        Serialize(context, args, (IdeaTitle)value);
    }

    public IdeaTitle Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        var bsonType = context.Reader.GetCurrentBsonType();
        
        if (bsonType == BsonType.Null)
        {
            context.Reader.ReadNull();
            return null;
        }

        if (bsonType == BsonType.String)
        {
            return IdeaTitle.Create(context.Reader.ReadString());
        }

        throw new BsonSerializationException($"Cannot deserialize a '{bsonType}' to an IdeaTitle.");
    }

    object IBsonSerializer.Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        return Deserialize(context, args);
    }
}
