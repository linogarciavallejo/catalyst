namespace Catalyst.Application.Interfaces;

public interface IMongoDbSettings
{
    string ConnectionString { get; }
    string DatabaseName { get; }
}
