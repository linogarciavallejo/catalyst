using Catalyst.Application.Interfaces;

namespace Catalyst.Infrastructure;

public class MongoDbSettings : IMongoDbSettings
{
    public string ConnectionString { get; set; }
    public string DatabaseName { get; set; }
}
