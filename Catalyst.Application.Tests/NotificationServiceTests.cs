using Catalyst.Application.Interfaces;
using Catalyst.Application.Services;
using Catalyst.Domain.Entities;
using Catalyst.Domain.ValueObjects;
using FluentAssertions;
using NSubstitute;

namespace Catalyst.Application.Tests;

public class NotificationServiceTests
{
    private readonly INotificationRepository _repository;
    private readonly NotificationService _service;

    public NotificationServiceTests()
    {
        _repository = Substitute.For<INotificationRepository>();
        _service = new NotificationService(_repository);
    }

    [Fact]
    public async Task CreateNotificationAsync_WithNullUserId_ThrowsArgumentException()
    {
        var notification = new Notification
        {
            UserId = null!,
            Title = "Title",
            Message = "Message"
        };

        await _service.Invoking(s => s.CreateNotificationAsync(notification))
            .Should().ThrowAsync<ArgumentException>()
            .WithMessage("*UserId*");

        await _repository.DidNotReceive()
            .AddAsync(Arg.Any<Notification>());
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task CreateNotificationAsync_WithMissingTitle_ThrowsArgumentException(string? title)
    {
        var notification = BuildValidNotification();
        notification.Title = title!;

        await _service.Invoking(s => s.CreateNotificationAsync(notification))
            .Should().ThrowAsync<ArgumentException>()
            .WithMessage("*Title*");

        await _repository.DidNotReceive()
            .AddAsync(Arg.Any<Notification>());
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task CreateNotificationAsync_WithMissingMessage_ThrowsArgumentException(string? message)
    {
        var notification = BuildValidNotification();
        notification.Message = message!;

        await _service.Invoking(s => s.CreateNotificationAsync(notification))
            .Should().ThrowAsync<ArgumentException>()
            .WithMessage("*Message*");

        await _repository.DidNotReceive()
            .AddAsync(Arg.Any<Notification>());
    }

    [Fact]
    public async Task CreateNotificationAsync_WithValidNotification_PersistsEntity()
    {
        var notification = BuildValidNotification();
        _repository.AddAsync(notification).Returns(notification);

        var result = await _service.CreateNotificationAsync(notification);

        result.Should().BeSameAs(notification);
        await _repository.Received(1).AddAsync(notification);
    }

    [Fact]
    public async Task GetUnreadNotificationsAsync_ReturnsRepositoryResult()
    {
        var expected = new List<Notification> { BuildValidNotification() };
        _repository.GetUnreadNotificationsByUserAsync("user-123").Returns(expected);

        var result = await _service.GetUnreadNotificationsAsync("user-123");

        result.Should().BeEquivalentTo(expected);
    }

    [Fact]
    public async Task GetUnreadCountAsync_ReturnsRepositoryValue()
    {
        _repository.GetUnreadCountAsync("user-123").Returns(3);

        var result = await _service.GetUnreadCountAsync("user-123");

        result.Should().Be(3);
    }

    [Fact]
    public async Task MarkAsReadAsync_ReturnsRepositoryValue()
    {
        _repository.MarkAsReadAsync("notification-1").Returns(true);

        var result = await _service.MarkAsReadAsync("notification-1");

        result.Should().BeTrue();
    }

    [Fact]
    public async Task MarkAllAsReadAsync_ReturnsRepositoryValue()
    {
        _repository.MarkAllAsReadAsync("user-123").Returns(true);

        var result = await _service.MarkAllAsReadAsync("user-123");

        result.Should().BeTrue();
    }

    private static Notification BuildValidNotification()
    {
        return Notification.Rehydrate(
            id: "notification-1",
            userId: UserId.Create("user-123"),
            type: NotificationType.NewComment,
            title: "Title",
            message: "Message",
            relatedIdeaId: IdeaId.Create("idea-456"),
            isRead: false,
            createdAt: DateTime.UtcNow
        );
    }
}
