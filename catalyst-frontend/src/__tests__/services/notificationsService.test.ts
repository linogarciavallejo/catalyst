import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as SignalR from '@microsoft/signalr';
import { NotificationsService } from '@/services/notificationsService';

const createBuilder = () => {
  const eventHandlers: Record<string, (payload?: unknown) => void> = {};
  const connection = {
    state: 'Disconnected',
    start: vi.fn(async () => {
      connection.state = 'Connected';
    }),
    stop: vi.fn(async () => {
      connection.state = 'Disconnected';
    }),
    invoke: vi.fn(async () => {}),
    on: vi.fn((event: string, handler: (payload?: unknown) => void) => {
      eventHandlers[event] = handler;
    }),
    onreconnecting: vi.fn((handler: () => void) => {
      eventHandlers['reconnecting'] = handler;
    }),
    onreconnected: vi.fn((handler: () => void) => {
      eventHandlers['reconnected'] = handler;
    }),
    onclose: vi.fn((handler: () => void) => {
      eventHandlers['close'] = handler;
    }),
  };

  const builder = {
    withUrl: vi.fn().mockReturnThis(),
    withAutomaticReconnect: vi.fn().mockReturnThis(),
    withHubProtocol: vi.fn().mockReturnThis(),
    build: vi.fn(() => connection),
    __eventHandlers: eventHandlers,
    __connection: connection,
  };

  return builder;
};

const builders: ReturnType<typeof createBuilder>[] = [];

vi.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: vi.fn(() => {
    const builder = createBuilder();
    builders.push(builder);
    return builder;
  }),
  HubConnectionState: { Connected: 'Connected', Disconnected: 'Disconnected' },
  JsonHubProtocol: vi.fn(),
}));

const serviceMocks = vi.hoisted(() => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  handle: vi.fn((error: unknown) => ({ status: 500, message: String(error) })),
}));

vi.mock('@/services/api', () => ({
  ApiClient: {
    getInstance: () => serviceMocks.api,
  },
  ApiErrorHandler: {
    handle: serviceMocks.handle,
  },
  SIGNALR_URL: 'https://example.test',
}));

describe('NotificationsService', () => {
  beforeEach(() => {
    builders.length = 0;
    vi.clearAllMocks();
    serviceMocks.api.get.mockReset();
    serviceMocks.api.put.mockReset();
    serviceMocks.api.delete.mockReset();
    serviceMocks.handle.mockReset();
    serviceMocks.handle.mockImplementation((error: unknown) => ({ status: 500, message: String(error) }));
    Reflect.set(NotificationsService as unknown as Record<string, unknown>, 'connection', null);
    Reflect.set(NotificationsService as unknown as Record<string, unknown>, 'listeners', new Map());
  });

  it('connects to the hub, emits events, and avoids duplicate connections', async () => {
    const received = vi.fn();
    const connected = vi.fn();
    const read = vi.fn();
    const reconnecting = vi.fn();
    const reconnected = vi.fn();
    const disconnected = vi.fn();
    const removable = vi.fn();
    NotificationsService.on('notificationReceived', received);
    NotificationsService.on('notificationReceived', removable);
    NotificationsService.off('notificationReceived', removable);
    NotificationsService.on('connected', connected);
    NotificationsService.on('notificationRead', read);
    NotificationsService.on('connecting', reconnecting);
    NotificationsService.on('reconnected', reconnected);
    NotificationsService.on('disconnected', disconnected);

    await NotificationsService.connect('user-1', 'token');

    expect(builders).toHaveLength(1);
    const builder = builders[0];
    const { __connection: connection, __eventHandlers: events } = builder;

    expect(builder.withUrl).toHaveBeenCalledWith(expect.stringContaining('/hubs/notifications'), {
      accessTokenFactory: expect.any(Function),
    });
    const accessTokenFactory = builder.withUrl.mock.calls[0][1].accessTokenFactory;
    expect(accessTokenFactory()).toBe('token');
    expect(connection.start).toHaveBeenCalled();
    expect(connected).toHaveBeenCalled();
    expect(NotificationsService.isConnected()).toBe(true);

    events['NotificationReceived']?.({ id: 'n-1' });
    expect(received).toHaveBeenCalledWith({ id: 'n-1' });
    expect(removable).not.toHaveBeenCalled();

    events['NotificationRead']?.('n-1');
    expect(read).toHaveBeenCalledWith('n-1');

    events['reconnecting']?.();
    expect(reconnecting).toHaveBeenCalled();

    events['reconnected']?.();
    expect(reconnected).toHaveBeenCalled();

    events['close']?.();
    expect(disconnected).toHaveBeenCalled();

    await NotificationsService.connect('user-1', 'token');
    expect(builders).toHaveLength(1);
  });

  it('disconnects gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await NotificationsService.connect('user-1', 'token');
    const firstBuilder = builders[0];

    await NotificationsService.disconnect();
    expect(firstBuilder.__connection.stop).toHaveBeenCalled();
    expect(NotificationsService.isConnected()).toBe(false);

    await NotificationsService.connect('user-1', 'token');
    const secondBuilder = builders[builders.length - 1];
    secondBuilder.__connection.stop.mockRejectedValueOnce(new Error('stop-fail'));

    await NotificationsService.disconnect();
    expect(consoleError).toHaveBeenCalledWith(
      'Error disconnecting from notifications:',
      expect.any(Error),
    );

    consoleError.mockRestore();
  });

  it('surfaces connection failures during start', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const hubMock = SignalR.HubConnectionBuilder as unknown as vi.Mock;

    hubMock.mockImplementationOnce(() => {
      const builder = createBuilder();
      builder.__connection.start.mockRejectedValueOnce(new Error('connect-fail'));
      builders.push(builder);
      return builder;
    });

    await expect(NotificationsService.connect('user-2', 'token')).rejects.toThrow('connect-fail');
    expect(consoleError).toHaveBeenCalledWith('Notifications connection failed:', expect.any(Error));
    consoleError.mockRestore();
  });

  it('proxies API calls and propagates handled errors', async () => {
    const notifications = [{ id: 'n-1' }];
    serviceMocks.api.get
      .mockResolvedValueOnce({ data: notifications })
      .mockResolvedValueOnce({ data: { count: 5 } });
    serviceMocks.api.put.mockResolvedValue(undefined);
    serviceMocks.api.delete.mockResolvedValue(undefined);

    await expect(NotificationsService.getNotifications()).resolves.toEqual(notifications);
    expect(serviceMocks.api.get).toHaveBeenCalledWith('/notifications');

    await expect(NotificationsService.getUnreadCount()).resolves.toBe(5);
    expect(serviceMocks.api.get).toHaveBeenCalledWith('/notifications/unread/count');

    await expect(NotificationsService.markAsRead('n-1')).resolves.toBeUndefined();
    expect(serviceMocks.api.put).toHaveBeenCalledWith('/notifications/n-1/read');

    await expect(NotificationsService.markAllAsRead()).resolves.toBeUndefined();
    expect(serviceMocks.api.put).toHaveBeenCalledWith('/notifications/read-all');

    const handledCount = { status: 500, message: 'count fail' };
    serviceMocks.handle.mockReturnValueOnce(handledCount);
    serviceMocks.api.get.mockRejectedValueOnce('count error');
    await expect(NotificationsService.getUnreadCount()).rejects.toBe(handledCount);

    const handledMarkAll = { status: 500, message: 'mark all fail' };
    serviceMocks.handle.mockReturnValueOnce(handledMarkAll);
    serviceMocks.api.put.mockRejectedValueOnce('mark-all error');
    await expect(NotificationsService.markAllAsRead()).rejects.toBe(handledMarkAll);

    await expect(NotificationsService.deleteNotification('n-1')).resolves.toBeUndefined();
    expect(serviceMocks.api.delete).toHaveBeenCalledWith('/notifications/n-1');

    const handled = { status: 500, message: 'handled' };
    serviceMocks.handle.mockReturnValueOnce(handled);
    serviceMocks.api.get.mockRejectedValueOnce('boom');

    await expect(NotificationsService.getNotifications()).rejects.toBe(handled);
    expect(serviceMocks.handle).toHaveBeenCalledWith('boom');

    const handledPut = { status: 500, message: 'put fail' };
    serviceMocks.handle.mockReturnValueOnce(handledPut);
    serviceMocks.api.put.mockRejectedValueOnce('mark-fail');
    await expect(NotificationsService.markAsRead('n-2')).rejects.toBe(handledPut);

    const handledDelete = { status: 500, message: 'delete fail' };
    serviceMocks.handle.mockReturnValueOnce(handledDelete);
    serviceMocks.api.delete.mockRejectedValueOnce('delete-fail');
    await expect(NotificationsService.deleteNotification('n-3')).rejects.toBe(handledDelete);
  });
});
