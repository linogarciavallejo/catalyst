using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using Catalyst.Domain.ValueObjects;

namespace Catalyst.Infrastructure.MongoDB.Serializers;

public class IdeaDescriptionSerializer : IBsonSerializer<IdeaDescription>
{
    public Type ValueType => typeof(IdeaDescription);

    public void Serialize(BsonSerializationContext context, BsonSerializationArgs args, IdeaDescription value)
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
        Serialize(context, args, (IdeaDescription)value);
    }

    public IdeaDescription Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        var bsonType = context.Reader.GetCurrentBsonType();
        
        if (bsonType == BsonType.Null)
        {
            context.Reader.ReadNull();
            return null;
        }

        if (bsonType == BsonType.String)
        {
            return IdeaDescription.Create(context.Reader.ReadString());
        }

        throw new BsonSerializationException($"Cannot deserialize a '{bsonType}' to an IdeaDescription.");
    }

    object IBsonSerializer.Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        return Deserialize(context, args);
    }
}
