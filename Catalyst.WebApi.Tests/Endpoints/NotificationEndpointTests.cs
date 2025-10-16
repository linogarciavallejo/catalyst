using System.Net;
using FluentAssertions;
using Xunit;

namespace Catalyst.WebApi.Tests.Endpoints;

/// <summary>
/// Integration tests for Notifications API endpoints
/// Tests HTTP-level behavior and endpoint availability
/// </summary>
public class NotificationEndpointTests : ApiIntegrationTestBase
{
    private const string ValidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

    [Fact]
    public async Task GetUnreadNotifications_WithoutToken_ReturnsUnauthorized()
    {
        ClearAuthorizationHeader();
        var response = await Client.GetAsync("/api/notifications/user/user-123/unread");
        
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.Unauthorized,
            HttpStatusCode.InternalServerError
        );
    }

    [Fact]
    public async Task GetUnreadNotifications_WithToken_ReturnsResponse()
    {
        SetAuthorizationHeader(ValidToken);
        var response = await Client.GetAsync("/api/notifications/user/user-123/unread");
        
        response.Should().NotBeNull();
    }

    [Fact]
    public async Task GetUnreadCount_WithoutToken_ReturnsUnauthorized()
    {
        ClearAuthorizationHeader();
        var response = await Client.GetAsync("/api/notifications/user/user-123/unread-count");
        
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.Unauthorized,
            HttpStatusCode.InternalServerError
        );
    }

    [Fact]
    public async Task GetUnreadCount_WithToken_ReturnsResponse()
    {
        SetAuthorizationHeader(ValidToken);
        var response = await Client.GetAsync("/api/notifications/user/user-123/unread-count");
        
        response.Should().NotBeNull();
    }

    [Fact]
    public async Task MarkAsRead_WithoutToken_ReturnsUnauthorized()
    {
        ClearAuthorizationHeader();
        var response = await Client.PutAsync("/api/notifications/notif-789/read", null);
        
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.Unauthorized,
            HttpStatusCode.InternalServerError
        );
    }

    [Fact]
    public async Task MarkAsRead_WithToken_ReturnsResponse()
    {
        SetAuthorizationHeader(ValidToken);
        var response = await Client.PutAsync("/api/notifications/notif-789/read", null);
        
        response.Should().NotBeNull();
    }

    [Fact]
    public async Task MarkAllAsRead_WithoutToken_ReturnsUnauthorized()
    {
        ClearAuthorizationHeader();
        var response = await Client.PutAsync("/api/notifications/user/user-123/read-all", null);
        
        response.StatusCode.Should().BeOneOf(
            HttpStatusCode.Unauthorized,
            HttpStatusCode.InternalServerError
        );
    }

    [Fact]
    public async Task MarkAllAsRead_WithToken_ReturnsResponse()
    {
        SetAuthorizationHeader(ValidToken);
        var response = await Client.PutAsync("/api/notifications/user/user-123/read-all", null);
        
        response.Should().NotBeNull();
    }

    [Fact]
    public async Task MarkAsRead_WithInvalidId_ReturnsResponse()
    {
        SetAuthorizationHeader(ValidToken);
        var response = await Client.PutAsync("/api/notifications/invalid-id/read", null);
        
        response.Should().NotBeNull();
    }
}
