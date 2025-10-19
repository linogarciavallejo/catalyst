using Catalyst.Application.Interfaces;
using Catalyst.Infrastructure.Authentication;
using Catalyst.WebApi.Dtos;

namespace Catalyst.WebApi.Endpoints;

public static class VoteEndpoints
{
    public static void MapVoteEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/votes")
            .WithName("Votes")
            .WithOpenApi();

        group.MapPost("/", Vote)
            .WithName("Vote")
            .WithDescription("Vote on an idea (upvote or downvote)")
            .RequireAuthorization();

        group.MapDelete("/{userId}/{ideaId}", RemoveVote)
            .WithName("RemoveVote")
            .WithDescription("Remove a vote from an idea")
            .RequireAuthorization();

        group.MapGet("/idea/{ideaId}/upvotes", GetUpvotes)
            .WithName("GetUpvotes")
            .WithDescription("Get upvote count for an idea");

        group.MapGet("/idea/{ideaId}/downvotes", GetDownvotes)
            .WithName("GetDownvotes")
            .WithDescription("Get downvote count for an idea");
    }

    private static async Task<IResult> Vote(
        VoteRequest request,
        IVotingService votingService,
        IClaimsService claimsService)
    {
        try
        {
            var userId = claimsService.GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Results.Unauthorized();

            var vote = await votingService.VoteAsync(userId, request.IdeaId, request.IsUpvote);
            var dto = MapToDto(vote);
            return Results.Created($"/api/votes/{vote.Id}", dto);
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }

    private static async Task<IResult> RemoveVote(
        string ideaId,
        IVotingService votingService,
        IClaimsService claimsService)
    {
        var userId = claimsService.GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Results.Unauthorized();

        var result = await votingService.RemoveVoteAsync(userId, ideaId);
        if (!result)
            return Results.NotFound();

        return Results.NoContent();
    }

    private static async Task<IResult> GetUpvotes(
        string ideaId,
        IVotingService votingService)
    {
        var count = await votingService.GetUpvoteCountAsync(ideaId);
        return Results.Ok(new { upvotes = count });
    }

    private static async Task<IResult> GetDownvotes(
        string ideaId,
        IVotingService votingService)
    {
        var count = await votingService.GetDownvoteCountAsync(ideaId);
        return Results.Ok(new { downvotes = count });
    }

    private static VoteDto MapToDto(Domain.Entities.Vote vote)
    {
        return new VoteDto
        {
            Id = vote.Id,
            IdeaId = vote.IdeaId.Value,
            UserId = vote.UserId.Value,
            VoteType = vote.VoteType.ToString(),
            CreatedAt = vote.CreatedAt
        };
    }
}
