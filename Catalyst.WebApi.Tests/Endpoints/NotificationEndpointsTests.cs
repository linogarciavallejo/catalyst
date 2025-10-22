using System.Linq;
using System.Reflection;
using Catalyst.Application.Interfaces;
using Catalyst.Application.Security;
using Catalyst.Domain.Entities;
using Catalyst.Domain.ValueObjects;
using Catalyst.WebApi.Dtos;
using Catalyst.WebApi.Endpoints;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using NSubstitute;

namespace Catalyst.WebApi.Tests.Endpoints;

public class NotificationEndpointsTests
{
    [Fact]
    public async Task GetUnreadNotifications_WhenUserIdIsMissing_ReturnsUnauthorized()
    {
        var notificationService = Substitute.For<INotificationService>();
        var claimsService = Substitute.For<IClaimsService>();
        claimsService.GetUserId().Returns((string?)null);

        var result = await InvokeGetUnreadNotifications("user-1", notificationService, claimsService);

        result.Should().BeOfType<UnauthorizedHttpResult>();
        await notificationService.DidNotReceive()
            .GetUnreadNotificationsAsync(Arg.Any<string>());
    }

    [Fact]
    public async Task GetUnreadNotifications_WhenUserIdDoesNotMatch_ReturnsForbid()
    {
        var notificationService = Substitute.For<INotificationService>();
        var claimsService = Substitute.For<IClaimsService>();
        claimsService.GetUserId().Returns("user-2");

        var result = await InvokeGetUnreadNotifications("user-1", notificationService, claimsService);

        result.Should().BeOfType<ForbidHttpResult>();
        await notificationService.DidNotReceive()
            .GetUnreadNotificationsAsync(Arg.Any<string>());
    }

    [Fact]
    public async Task GetUnreadNotifications_WhenUserMatches_ReturnsProjectedDtos()
    {
        var notificationService = Substitute.For<INotificationService>();
        var claimsService = Substitute.For<IClaimsService>();
        claimsService.GetUserId().Returns("user-1");

        var notifications = new List<Notification>
        {
            Notification.Rehydrate(
                id: "notif-1",
                userId: UserId.Create("user-1"),
                type: NotificationType.NewComment,
                title: "Comment",
                message: "Someone commented",
                relatedIdeaId: IdeaId.Create("idea-123"),
                isRead: false,
                createdAt: DateTime.UtcNow
            ),
            Notification.Rehydrate(
                id: "notif-2",
                userId: UserId.Create("user-1"),
                type: NotificationType.IdeaStatusChanged,
                title: "Status",
                message: "Idea archived",
                relatedIdeaId: null,
                isRead: true,
                createdAt: DateTime.UtcNow.AddMinutes(-5)
            )
        };

        notificationService.GetUnreadNotificationsAsync("user-1").Returns(notifications);

        var result = await InvokeGetUnreadNotifications("user-1", notificationService, claimsService);

        var okResult = result.Should().BeAssignableTo<IValueHttpResult>().Subject;
        var dtos = okResult.Value.Should().BeAssignableTo<IEnumerable<NotificationDto>>().Subject.ToList();
        dtos.Should().HaveCount(2);
        dtos.Should().ContainEquivalentOf(new NotificationDto
        {
            Id = "notif-1",
            UserId = "user-1",
            Type = NotificationType.NewComment.ToString(),
            Title = "Comment",
            Message = "Someone commented",
            RelatedIdeaId = "idea-123",
            IsRead = false
        }, options => options.Excluding(dto => dto.CreatedAt));

        dtos.Should().ContainEquivalentOf(new NotificationDto
        {
            Id = "notif-2",
            UserId = "user-1",
            Type = NotificationType.IdeaStatusChanged.ToString(),
            Title = "Status",
            Message = "Idea archived",
            RelatedIdeaId = null,
            IsRead = true
        }, options => options.Excluding(dto => dto.CreatedAt));
    }

    [Fact]
    public async Task MarkAsRead_WhenNotificationMissing_ReturnsNotFound()
    {
        var notificationService = Substitute.For<INotificationService>();
        notificationService.MarkAsReadAsync("notif-1").Returns(false);

        var result = await InvokeMarkAsRead("notif-1", notificationService);

        result.Should().BeOfType<NotFound>();
    }

    [Fact]
    public async Task MarkAsRead_WhenNotificationExists_ReturnsNoContent()
    {
        var notificationService = Substitute.For<INotificationService>();
        notificationService.MarkAsReadAsync("notif-1").Returns(true);

        var result = await InvokeMarkAsRead("notif-1", notificationService);

        result.Should().BeOfType<NoContent>();
    }

    [Fact]
    public async Task MarkAllAsRead_ReturnsSuccessPayload()
    {
        var notificationService = Substitute.For<INotificationService>();
        notificationService.MarkAllAsReadAsync("user-1").Returns(true);

        var result = await InvokeMarkAllAsRead("user-1", notificationService);

        var okResult = result.Should().BeAssignableTo<IValueHttpResult>().Subject;
        okResult.Value.Should().BeEquivalentTo(new { success = true });
    }

    private static Task<IResult> InvokeGetUnreadNotifications(
        string userId,
        INotificationService notificationService,
        IClaimsService claimsService)
    {
        return InvokeEndpoint("GetUnreadNotifications", userId, notificationService, claimsService);
    }

    private static Task<IResult> InvokeMarkAsRead(
        string notificationId,
        INotificationService notificationService)
    {
        return InvokeEndpoint("MarkAsRead", notificationId, notificationService);
    }

    private static Task<IResult> InvokeMarkAllAsRead(
        string userId,
        INotificationService notificationService)
    {
        return InvokeEndpoint("MarkAllAsRead", userId, notificationService);
    }

    private static Task<IResult> InvokeEndpoint(string methodName, params object[] arguments)
    {
        var method = typeof(NotificationEndpoints).GetMethod(
            methodName,
            BindingFlags.NonPublic | BindingFlags.Static)
            ?? throw new InvalidOperationException($"Could not find method '{methodName}' on NotificationEndpoints.");

        return (Task<IResult>)(method.Invoke(null, arguments)
            ?? throw new InvalidOperationException($"Method '{methodName}' returned null."));
    }
}
