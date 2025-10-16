namespace Catalyst.WebApi.Dtos;

/// <summary>
/// Request DTO for voting on an idea
/// </summary>
public class VoteRequest
{
    public string UserId { get; set; }
    public string IdeaId { get; set; }
    public bool IsUpvote { get; set; }
}

/// <summary>
/// Response DTO for vote details
/// </summary>
public class VoteDto
{
    public string Id { get; set; }
    public string IdeaId { get; set; }
    public string UserId { get; set; }
    public string VoteType { get; set; }
    public DateTime CreatedAt { get; set; }
}
