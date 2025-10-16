namespace Catalyst.WebApi.Dtos;

/// <summary>
/// Request DTO for creating a comment
/// </summary>
public class CreateCommentRequest
{
    public string IdeaId { get; set; }
    public string UserId { get; set; }
    public string UserName { get; set; }
    public string Content { get; set; }
    public string ParentCommentId { get; set; }
}

/// <summary>
/// Response DTO for comment details
/// </summary>
public class CommentDto
{
    public string Id { get; set; }
    public string IdeaId { get; set; }
    public string UserId { get; set; }
    public string UserName { get; set; }
    public string Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string ParentCommentId { get; set; }
}
