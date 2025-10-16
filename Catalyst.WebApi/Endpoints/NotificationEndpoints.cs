using Catalyst.Application.Interfaces;
using Catalyst.Domain.Entities;
using Catalyst.Domain.ValueObjects;
using Catalyst.Infrastructure.Authentication;
using Catalyst.WebApi.Dtos;
using Microsoft.AspNetCore.Authorization;

namespace Catalyst.WebApi.Endpoints;

public static class NotificationEndpoints
{
    public static void MapNotificationEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/notifications")
            .WithName("Notifications")
            .WithOpenApi();

        group.MapGet("/user/{userId}/unread", GetUnreadNotifications)
            .WithName("GetUnreadNotifications")
            .WithDescription("Get unread notifications for a user")
            .RequireAuthorization();

        group.MapGet("/user/{userId}/unread-count", GetUnreadCount)
            .WithName("GetUnreadCount")
            .WithDescription("Get unread notification count for a user")
            .RequireAuthorization();

        group.MapPut("/{notificationId}/read", MarkAsRead)
            .WithName("MarkAsRead")
            .WithDescription("Mark a notification as read")
            .RequireAuthorization();

        group.MapPut("/user/{userId}/read-all", MarkAllAsRead)
            .WithName("MarkAllAsRead")
            .WithDescription("Mark all notifications as read for a user")
            .RequireAuthorization();
    }

    private static async Task<IResult> GetUnreadNotifications(
        string userId,
        INotificationService notificationService,
        IClaimsService claimsService)
    {
        var currentUserId = claimsService.GetUserId();
        if (string.IsNullOrEmpty(currentUserId))
            return Results.Unauthorized();

        // Only allow users to get their own notifications
        if (userId != currentUserId)
            return Results.Forbid();

        var notifications = await notificationService.GetUnreadNotificationsAsync(userId);
        var dtos = notifications.Select(MapToDto).ToList();
        return Results.Ok(dtos);
    }

    private static async Task<IResult> GetUnreadCount(
        string userId,
        INotificationService notificationService)
    {
        var count = await notificationService.GetUnreadCountAsync(userId);
        return Results.Ok(new { unreadCount = count });
    }

    private static async Task<IResult> MarkAsRead(
        string notificationId,
        INotificationService notificationService)
    {
        var result = await notificationService.MarkAsReadAsync(notificationId);
        if (!result)
            return Results.NotFound();

        return Results.NoContent();
    }

    private static async Task<IResult> MarkAllAsRead(
        string userId,
        INotificationService notificationService)
    {
        var result = await notificationService.MarkAllAsReadAsync(userId);
        return Results.Ok(new { success = result });
    }

    private static NotificationDto MapToDto(Notification notification)
    {
        return new NotificationDto
        {
            Id = notification.Id,
            UserId = notification.UserId.Value,
            Type = notification.Type.ToString(),
            Title = notification.Title,
            Message = notification.Message,
            RelatedIdeaId = notification.RelatedIdeaId.Value,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt
        };
    }
}
