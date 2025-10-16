using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using Catalyst.Domain.ValueObjects;

namespace Catalyst.Infrastructure.MongoDB.Serializers;

public class TagsSerializer : IBsonSerializer<Tags>
{
    public Type ValueType => typeof(Tags);

    public void Serialize(BsonSerializationContext context, BsonSerializationArgs args, Tags value)
    {
        if (value == null)
        {
            context.Writer.WriteNull();
        }
        else
        {
            context.Writer.WriteStartArray();
            foreach (var tag in value.Value)
            {
                context.Writer.WriteString(tag);
            }
            context.Writer.WriteEndArray();
        }
    }

    void IBsonSerializer.Serialize(BsonSerializationContext context, BsonSerializationArgs args, object value)
    {
        Serialize(context, args, (Tags)value);
    }

    public Tags Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        var bsonType = context.Reader.GetCurrentBsonType();
        
        if (bsonType == BsonType.Null)
        {
            context.Reader.ReadNull();
            return null;
        }

        if (bsonType != BsonType.Array)
        {
            throw new BsonSerializationException($"Cannot deserialize a '{bsonType}' to Tags.");
        }

        context.Reader.ReadStartArray();
        var tags = new List<string>();
        
        while (context.Reader.ReadBsonType() != BsonType.EndOfDocument)
        {
            tags.Add(context.Reader.ReadString());
        }
        
        context.Reader.ReadEndArray();

        return Tags.Create(tags);
    }

    object IBsonSerializer.Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        return Deserialize(context, args);
    }
}
