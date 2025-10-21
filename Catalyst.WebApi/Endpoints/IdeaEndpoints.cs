using System.Collections.Generic;
using Catalyst.Application.Interfaces;
using Catalyst.Application.Security;
using Catalyst.Domain.Entities;
using Catalyst.Domain.Enums;
using Catalyst.Domain.ValueObjects;
using Catalyst.WebApi.Dtos;

namespace Catalyst.WebApi.Endpoints;

public static class IdeaEndpoints
{
    public static void MapIdeaEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/ideas")
            .WithName("Ideas")
            .WithOpenApi();

        group.MapPost("/", CreateIdea)
            .WithName("CreateIdea")
            .WithDescription("Create a new idea")
            .RequireAuthorization();

        group.MapGet("/{id}", GetIdea)
            .WithName("GetIdea")
            .WithDescription("Get idea by ID");

        group.MapGet("/", GetAllIdeas)
            .WithName("GetAllIdeas")
            .WithDescription("Get all ideas");

        group.MapGet("/search/{searchTerm}", SearchIdeas)
            .WithName("SearchIdeas")
            .WithDescription("Search ideas by title");

        group.MapGet("/category/{category}", GetIdeasByCategory)
            .WithName("GetIdeasByCategory")
            .WithDescription("Get ideas by category");

        group.MapGet("/top/{limit}", GetTopIdeas)
            .WithName("GetTopIdeas")
            .WithDescription("Get top ideas by votes");

        group.MapPut("/{id}", UpdateIdea)
            .WithName("UpdateIdea")
            .WithDescription("Update an idea")
            .RequireAuthorization();

        group.MapDelete("/{id}", DeleteIdea)
            .WithName("DeleteIdea")
            .WithDescription("Delete an idea")
            .RequireAuthorization();
    }

    private static async Task<IResult> CreateIdea(
        CreateIdeaRequest request,
        IIdeaService ideaService,
        IClaimsService claimsService)
    {
        try
        {
            var userId = claimsService.GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Results.Unauthorized();

            var idea = Idea.Create(
                IdeaTitle.Create(request.Title),
                IdeaDescription.Create(request.Description),
                Category.Create(request.Category),
                Tags.Create(request.Tags ?? new List<string>()),
                UserId.Create(userId),
                claimsService.GetDisplayName() ?? "Anonymous");

            var createdIdea = await ideaService.CreateIdeaAsync(idea);
            var dto = MapToDto(createdIdea);

            return Results.Created($"/api/ideas/{createdIdea.Id.Value}", dto);
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }

    private static async Task<IResult> GetIdea(
        string id,
        IIdeaService ideaService)
    {
        var idea = await ideaService.GetIdeaByIdAsync(id);
        if (idea == null)
            return Results.NotFound();

        var dto = MapToDto(idea);
        return Results.Ok(dto);
    }

    private static async Task<IResult> GetAllIdeas(
        IIdeaService ideaService)
    {
        var ideas = await ideaService.SearchIdeasAsync("");
        var dtos = ideas.Select(MapToDto).ToList();
        return Results.Ok(dtos);
    }

    private static async Task<IResult> SearchIdeas(
        string searchTerm,
        IIdeaService ideaService)
    {
        var ideas = await ideaService.SearchIdeasAsync(searchTerm);
        var dtos = ideas.Select(MapToDto).ToList();
        return Results.Ok(dtos);
    }

    private static async Task<IResult> GetIdeasByCategory(
        string category,
        IIdeaService ideaService)
    {
        var ideas = await ideaService.GetIdeasByCategoryAsync(category);
        var dtos = ideas.Select(MapToDto).ToList();
        return Results.Ok(dtos);
    }

    private static async Task<IResult> GetTopIdeas(
        int limit,
        IIdeaService ideaService)
    {
        var ideas = await ideaService.GetTopIdeasAsync(limit);
        var dtos = ideas.Select(MapToDto).ToList();
        return Results.Ok(dtos);
    }

    private static async Task<IResult> UpdateIdea(
        string id,
        UpdateIdeaRequest request,
        IIdeaService ideaService)
    {
        var idea = await ideaService.GetIdeaByIdAsync(id);
        if (idea == null)
            return Results.NotFound();

        if (!string.IsNullOrWhiteSpace(request.Title))
            idea.Title = IdeaTitle.Create(request.Title);
        if (!string.IsNullOrWhiteSpace(request.Description))
            idea.Description = IdeaDescription.Create(request.Description);
        if (!string.IsNullOrWhiteSpace(request.Category))
            idea.Category = Category.Create(request.Category);
        if (request.Tags?.Count > 0)
            idea.Tags = Tags.Create(request.Tags);
        if (Enum.TryParse<IdeaStatus>(request.Status, out var status))
            idea.Status = status;
        idea.UpdatedAt = DateTime.UtcNow;

        var updated = await ideaService.UpdateIdeaAsync(idea);
        var dto = MapToDto(updated);

        return Results.Ok(dto);
    }

    private static async Task<IResult> DeleteIdea(
        string id,
        IIdeaService ideaService)
    {
        var result = await ideaService.DeleteIdeaAsync(id);
        if (!result)
            return Results.NotFound();

        return Results.NoContent();
    }

    private static IdeaDto MapToDto(Idea idea)
    {
        return new IdeaDto
        {
            Id = idea.Id.Value,
            Title = idea.Title.Value,
            Description = idea.Description.Value,
            Category = idea.Category.Value,
            Tags = idea.Tags.Value.ToList(),
            CreatedBy = idea.CreatedBy.Value,
            CreatedByName = idea.CreatedByName,
            CreatedAt = idea.CreatedAt,
            UpdatedAt = idea.UpdatedAt,
            Status = idea.Status.ToString(),
            Upvotes = idea.Upvotes,
            Downvotes = idea.Downvotes,
            CommentCount = idea.CommentCount,
            Followers = idea.Followers.Select(f => f.Value).ToList()
        };
    }
}
