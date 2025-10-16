using Catalyst.Application.Interfaces;
using Catalyst.Domain.Entities;
using Catalyst.Domain.ValueObjects;

namespace Catalyst.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepository;

    public NotificationService(INotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    public async Task<Notification> CreateNotificationAsync(Notification notification)
    {
        if (notification.UserId == null)
            throw new ArgumentException("UserId is required");

        if (string.IsNullOrWhiteSpace(notification.Title))
            throw new ArgumentException("Title is required");

        if (string.IsNullOrWhiteSpace(notification.Message))
            throw new ArgumentException("Message is required");

        return await _notificationRepository.AddAsync(notification);
    }

    public async Task<IEnumerable<Notification>> GetUnreadNotificationsAsync(string userId)
    {
        return await _notificationRepository.GetUnreadNotificationsByUserAsync(userId);
    }

    public async Task<int> GetUnreadCountAsync(string userId)
    {
        return await _notificationRepository.GetUnreadCountAsync(userId);
    }

    public async Task<bool> MarkAsReadAsync(string notificationId)
    {
        return await _notificationRepository.MarkAsReadAsync(notificationId);
    }

    public async Task<bool> MarkAllAsReadAsync(string userId)
    {
        return await _notificationRepository.MarkAllAsReadAsync(userId);
    }
}
