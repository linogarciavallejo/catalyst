using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Catalyst.Application.Interfaces;
using Catalyst.Infrastructure;
using Catalyst.Infrastructure.Repositories;
using Catalyst.Infrastructure.Services;
using Catalyst.Infrastructure.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Catalyst.CompositionRoot;

/// <summary>
/// Composition Root - Centralizes all dependency injection configuration
/// This follows the Clean Architecture pattern for decoupled service registration
/// 
/// Call this in Program.cs: services.AddCatalystServices(configuration)
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Registers all infrastructure and application services with the dependency injection container
    /// This is the single entry point for all dependency configuration.
    /// </summary>
    public static IServiceCollection AddCatalystServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Register MongoDB settings using the Options pattern
        var mongoDbSettings = configuration.GetSection("MongoDbSettings").Get<MongoDbSettings>();
        services.AddSingleton<IMongoDbSettings>(mongoDbSettings);

        // Register MongoDB context (Singleton - expensive to create)
        services.AddSingleton<MongoDbContext>();

        // Register repositories
        services.AddScoped<IIdeaRepository, IdeaRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IVoteRepository, VoteRepository>();
        services.AddScoped<ICommentRepository, CommentRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();

        // Register services
        services.AddScoped<IIdeaService, IdeaService>();
        services.AddScoped<IVotingService, VotingService>();
        services.AddScoped<IGamificationService, GamificationService>();
        services.AddScoped<INotificationService, NotificationService>();

        // Register CORS
        services.AddCors(options =>
        {
            options.AddPolicy("AllowLocalhost", builder =>
            {
                builder
                    .WithOrigins("http://localhost:5173", "https://localhost:5173")
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
            });
        });

        // Register authentication services
        RegisterAuthenticationServices(services, configuration);

        return services;
    }

    /// <summary>
    /// Registers authentication and JWT services
    /// JWT token generation and validation
    /// Database-backed authentication with hashed passwords
    /// </summary>
    private static void RegisterAuthenticationServices(
        IServiceCollection services,
        IConfiguration configuration)
    {
        // Register JWT settings
        services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));

        // Get JWT settings for token validation
        var jwtSettings = configuration.GetSection("JwtSettings").Get<JwtSettings>();
        if (jwtSettings?.SecretKey == null)
            throw new InvalidOperationException("JwtSettings.SecretKey is not configured in appsettings.json");

        var key = Encoding.ASCII.GetBytes(jwtSettings.SecretKey);

        // Register JWT token service
        services.AddScoped<ITokenService, TokenService>();

        // Register authentication service (database-backed)
        services.AddScoped<IAuthenticationService, DatabaseAuthenticationService>();

        // Register claims service for extracting user info from tokens
        services.AddScoped<IClaimsService, ClaimsService>();

        // Register HTTP context accessor for claims service
        services.AddHttpContextAccessor();

        // Configure JWT Bearer authentication
        services.AddAuthentication(x =>
        {
            x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(x =>
        {
            x.RequireHttpsMetadata = false;  // Change to true in production
            x.SaveToken = true;
            x.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = jwtSettings.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(5)
            };
        });
    }
}
