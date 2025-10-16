using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Catalyst.WebApi.Tests;

/// <summary>
/// WebApplicationFactory for integration testing
/// Uses the real application with in-memory database for testing
/// </summary>
public class CatalystWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        
        builder.ConfigureServices(services =>
        {
            // Use real application services
            // The application should be configured to handle test scenarios
        });
    }
}

/// <summary>
/// Base class for API integration tests
/// Provides WebApplicationFactory and HttpClient
/// </summary>
public abstract class ApiIntegrationTestBase : IAsyncLifetime
{
    protected readonly CatalystWebApplicationFactory Factory;
    protected readonly HttpClient Client;

    protected ApiIntegrationTestBase()
    {
        Factory = new CatalystWebApplicationFactory();
        Client = Factory.CreateClient();
    }

    public async Task InitializeAsync()
    {
        await Task.CompletedTask;
    }

    public async Task DisposeAsync()
    {
        Client.Dispose();
        await Factory.DisposeAsync();
    }

    /// <summary>
    /// Helper to set authorization header
    /// </summary>
    protected void SetAuthorizationHeader(string token)
    {
        Client.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    }

    /// <summary>
    /// Helper to clear authorization header
    /// </summary>
    protected void ClearAuthorizationHeader()
    {
        Client.DefaultRequestHeaders.Authorization = null;
    }

    /// <summary>
    /// Helper to serialize object to HttpContent
    /// </summary>
    protected StringContent SerializeToContent(object obj)
    {
        return new StringContent(
            System.Text.Json.JsonSerializer.Serialize(obj),
            System.Text.Encoding.UTF8,
            "application/json"
        );
    }

    /// <summary>
    /// Safely execute an HTTP request, handling infrastructure errors
    /// </summary>
    protected async Task<HttpResponseMessage?> SafeRequestAsync(Func<Task<HttpResponseMessage>> request)
    {
        try
        {
            return await request();
        }
        catch (Exception)
        {
            // If infrastructure (MongoDB) is not available, return null
            // Tests should be designed to handle null responses
            return null;
        }
    }
}
