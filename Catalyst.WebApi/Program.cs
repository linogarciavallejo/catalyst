using Catalyst.CompositionRoot;
using Catalyst.WebApi.Endpoints;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddOpenApi();
builder.Services.AddCatalystServices(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Add authentication middleware
app.UseAuthentication();
app.UseAuthorization();

// Map Catalyst API endpoints
app.MapAuthEndpoints();
app.MapIdeaEndpoints();
app.MapVoteEndpoints();
app.MapNotificationEndpoints();

app.Run();
