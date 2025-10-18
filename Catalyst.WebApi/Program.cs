using Catalyst.CompositionRoot;
using Catalyst.WebApi.Endpoints;
using Catalyst.WebApi.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add User Secrets in development
if (builder.Environment.IsDevelopment())
{
    builder.Configuration.AddUserSecrets<Program>();
}

// Add services to the container
builder.Services.AddOpenApi();
builder.Services.AddCatalystServices(builder.Configuration);

// Add SignalR
builder.Services.AddSignalR();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Add CORS middleware
app.UseCors("AllowLocalhost");

// Add authentication middleware
app.UseAuthentication();
app.UseAuthorization();

// Map SignalR hubs
app.MapHub<NotificationsHub>("/hubs/notifications");
app.MapHub<IdeasHub>("/hubs/ideas");
app.MapHub<ChatHub>("/hubs/chat");

// Map Catalyst API endpoints
app.MapAuthEndpoints();
app.MapIdeaEndpoints();
app.MapVoteEndpoints();
app.MapNotificationEndpoints();

app.Run();
