namespace Catalyst.WebApi.Dtos;

/// <summary>
/// Response DTO for notification details
/// </summary>
public class NotificationDto
{
    public string Id { get; set; }
    public string UserId { get; set; }
    public string Type { get; set; }
    public string Title { get; set; }
    public string Message { get; set; }
    public string RelatedIdeaId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
