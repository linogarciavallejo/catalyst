import { describe, it, expect, beforeEach, vi } from 'vitest';
import { connectionManager } from '@/services/signalr/connectionManager';

interface MockBuilder {
  withUrl: ReturnType<typeof vi.fn>;
  withAutomaticReconnect: ReturnType<typeof vi.fn>;
  withHubProtocol: ReturnType<typeof vi.fn>;
  build: ReturnType<typeof vi.fn>;
  __connection: any;
  __handlers: Record<string, (...args: any[]) => void>;
}

const builders: MockBuilder[] = [];
let nextStartError: Error | null = null;

vi.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: vi.fn(() => {
    const handlers: Record<string, (...args: any[]) => void> = {};
    const connection = {
      state: 'Disconnected',
      start: vi.fn(async () => {
        if (nextStartError) {
          const error = nextStartError;
          nextStartError = null;
          throw error;
        }
        connection.state = 'Connected';
      }),
      stop: vi.fn(async () => {
        connection.state = 'Disconnected';
      }),
      on: vi.fn((event: string, handler: (...args: any[]) => void) => {
        handlers[event] = handler;
      }),
      onreconnecting: vi.fn((handler: () => void) => {
        handlers.reconnecting = handler;
      }),
      onreconnected: vi.fn((handler: () => void) => {
        handlers.reconnected = handler;
      }),
      onclose: vi.fn((handler: () => void) => {
        handlers.close = handler;
      }),
    };

    const builder: MockBuilder = {
      withUrl: vi.fn().mockReturnThis(),
      withAutomaticReconnect: vi.fn().mockReturnThis(),
      withHubProtocol: vi.fn().mockReturnThis(),
      build: vi.fn(() => connection),
      __connection: connection,
      __handlers: handlers,
    };

    builders.push(builder);
    return builder;
  }),
  HubConnectionState: { Connected: 'Connected', Disconnected: 'Disconnected' },
  JsonHubProtocol: vi.fn(),
}));

describe('SignalR connection manager', () => {
  const resetConnections = () => {
    Reflect.set(connectionManager as unknown as Record<string, unknown>, 'connections', {});
  };

  beforeEach(() => {
    builders.length = 0;
    nextStartError = null;
    vi.clearAllMocks();
    resetConnections();
  });

  it('connects to hubs, caches the connection, and wires lifecycle handlers', async () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

    const connection = await connectionManager.connect('ChatHub', 'chat', 'token');
    expect(builders).toHaveLength(1);
    const builder = builders[0];

    expect(builder.withUrl).toHaveBeenCalledWith(
      expect.stringContaining('/signalr/chat'),
      expect.objectContaining({ accessTokenFactory: expect.any(Function) })
    );
    expect(builder.build).toHaveBeenCalled();
    expect(connection.start).toHaveBeenCalled();
    expect(connectionManager.getConnection('ChatHub')).toBe(connection);
    expect(connectionManager.isConnected('ChatHub')).toBe(true);

    builder.__handlers.reconnecting?.();
    builder.__handlers.reconnected?.();
    expect(consoleLog).toHaveBeenCalledWith('[ChatHub] Reconnecting...');
    expect(consoleLog).toHaveBeenCalledWith('[ChatHub] Reconnected');

    builder.__handlers.close?.();
    expect(connectionManager.getConnection('ChatHub')).toBeUndefined();

    consoleLog.mockRestore();
  });

  it('returns existing connections without rebuilding', async () => {
    await connectionManager.connect('IdeasHub', 'ideas');
    await connectionManager.connect('IdeasHub', 'ideas');
    expect(builders).toHaveLength(1);
  });

  it('propagates connection failures without caching the instance', async () => {
    nextStartError = new Error('fail');
    await expect(connectionManager.connect('FailHub', 'fail')).rejects.toThrow('fail');
    expect(connectionManager.getConnection('FailHub')).toBeUndefined();
  });

  it('disconnects specific hubs and all hubs gracefully', async () => {
    await connectionManager.connect('ActivityHub', 'activity');
    await connectionManager.connect('NotificationsHub', 'notifications');

    const [activityBuilder, notificationsBuilder] = builders;

    await connectionManager.disconnect('ActivityHub');
    expect(activityBuilder.__connection.stop).toHaveBeenCalled();
    expect(connectionManager.getConnection('ActivityHub')).toBeUndefined();

    await connectionManager.disconnectAll();
    expect(notificationsBuilder.__connection.stop).toHaveBeenCalled();
    expect(connectionManager.getConnection('NotificationsHub')).toBeUndefined();
  });
});
