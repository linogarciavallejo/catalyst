namespace Catalyst.Infrastructure;

public interface IMongoDbSettings
{
    string ConnectionString { get; }
    string DatabaseName { get; }
}
