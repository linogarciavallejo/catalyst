namespace Catalyst.WebApi.Dtos;

/// <summary>
/// Request DTO for creating a new idea
/// </summary>
public class CreateIdeaRequest
{
    public string Title { get; set; }
    public string Description { get; set; }
    public string Category { get; set; }
    public List<string> Tags { get; set; } = new();
    public string CreatedBy { get; set; }
    public string CreatedByName { get; set; }
}

/// <summary>
/// Response DTO for idea details
/// </summary>
public class IdeaDto
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Category { get; set; }
    public List<string> Tags { get; set; }
    public string CreatedBy { get; set; }
    public string CreatedByName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string Status { get; set; }
    public int Upvotes { get; set; }
    public int Downvotes { get; set; }
    public int CommentCount { get; set; }
    public List<string> Followers { get; set; }
}

/// <summary>
/// Request DTO for updating an idea
/// </summary>
public class UpdateIdeaRequest
{
    public string Title { get; set; }
    public string Description { get; set; }
    public string Category { get; set; }
    public string Status { get; set; }
    public List<string> Tags { get; set; }
}
