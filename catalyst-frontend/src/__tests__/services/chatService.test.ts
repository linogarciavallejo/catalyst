import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatService } from '@/services/chatService';

let nextStartError: Error | null = null;

const createBuilder = () => {
  const eventHandlers: Record<string, (payload?: unknown) => void> = {};
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

vi.mock('@microsoft/signalr', () => {
  return {
    HubConnectionBuilder: vi.fn(() => {
      const builder = createBuilder();
      builders.push(builder);
      return builder;
    }),
    HubConnectionState: { Connected: 'Connected', Disconnected: 'Disconnected' },
    JsonHubProtocol: vi.fn(),
  };
});

describe('ChatService', () => {
  beforeEach(() => {
    builders.length = 0;
    vi.clearAllMocks();
    Reflect.set(ChatService as unknown as Record<string, unknown>, 'connection', null);
    Reflect.set(ChatService as unknown as Record<string, unknown>, 'listeners', new Map());
  });

  it('connects once, joins chat, and emits events to listeners', async () => {
    const messageHandler = vi.fn();
    const connectedHandler = vi.fn();
    const joinedHandler = vi.fn();
    const leftHandler = vi.fn();
    const reconnectingHandler = vi.fn();
    const reconnectedHandler = vi.fn();
    const disconnectedHandler = vi.fn();
    ChatService.on('messageReceived', messageHandler);
    ChatService.on('connected', connectedHandler);
    ChatService.on('userJoined', joinedHandler);
    ChatService.on('userLeft', leftHandler);
    ChatService.on('connecting', reconnectingHandler);
    ChatService.on('reconnected', reconnectedHandler);
    ChatService.on('disconnected', disconnectedHandler);

    await ChatService.connect('user-1', 'token-abc');

    expect(builders).toHaveLength(1);
    const builder = builders[0];
    const connection = builder.__connection;
    const events = builder.__eventHandlers;

    expect(builder.withUrl).toHaveBeenCalledWith(expect.stringContaining('/hubs/chat'), {
      accessTokenFactory: expect.any(Function),
    });
    expect(builder.withAutomaticReconnect).toHaveBeenCalled();
    expect(connection.start).toHaveBeenCalled();
    expect(connection.invoke).toHaveBeenCalledWith('JoinChat', 'user-1');
    expect(connectedHandler).toHaveBeenCalled();
    expect(ChatService.isConnected()).toBe(true);

    events['ReceiveMessage']?.({ id: 'm1' });
    expect(messageHandler).toHaveBeenCalledWith({ id: 'm1' });

    events['UserJoined']?.({ id: 'join-1' });
    expect(joinedHandler).toHaveBeenCalledWith({ id: 'join-1' });

    events['UserLeft']?.('left-1');
    expect(leftHandler).toHaveBeenCalledWith('left-1');

    events['reconnecting']?.();
    expect(reconnectingHandler).toHaveBeenCalled();

    events['reconnected']?.();
    expect(reconnectedHandler).toHaveBeenCalled();

    events['close']?.();
    expect(disconnectedHandler).toHaveBeenCalled();

    ChatService.off('messageReceived', messageHandler);
    events['ReceiveMessage']?.({ id: 'm2' });
    expect(messageHandler).toHaveBeenCalledTimes(1);
    ChatService.off('userJoined', joinedHandler);
    ChatService.off('userLeft', leftHandler);
    ChatService.off('connecting', reconnectingHandler);
    ChatService.off('reconnected', reconnectedHandler);
    ChatService.off('disconnected', disconnectedHandler);
  });

  it('avoids reconnecting when already connected and supports graceful disconnect', async () => {
    await ChatService.connect('user-1', 'token-abc');
    const [{ __connection: connection }] = builders;

    expect(builders).toHaveLength(1);

    await ChatService.connect('user-1', 'token-abc');
    expect(builders).toHaveLength(1);

    await ChatService.disconnect();
    expect(connection.stop).toHaveBeenCalled();
    expect(ChatService.isConnected()).toBe(false);
  });

  it('logs disconnect errors while still clearing the cached connection', async () => {
    await ChatService.connect('user-1', 'token-abc');
    const [{ __connection: connection }] = builders;
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    connection.stop.mockRejectedValueOnce(new Error('disconnect boom'));

    await ChatService.disconnect();

    expect(consoleSpy).toHaveBeenCalledWith('Error disconnecting from chat:', expect.any(Error));
    expect(ChatService.isConnected()).toBe(false);

    consoleSpy.mockRestore();
  });

  it('throws when performing actions while disconnected and surfaces transport errors', async () => {
    await expect(ChatService.sendMessage('general', 'hello')).rejects.toThrow(
      'Chat not connected',
    );
    await expect(ChatService.joinRoom('general')).rejects.toThrow('Chat not connected');
    await expect(ChatService.leaveRoom('general')).rejects.toThrow('Chat not connected');

    await ChatService.connect('user-1', 'token-abc');
    const [{ __connection: connection }] = builders;
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    connection.invoke.mockRejectedValueOnce(new Error('send failed'));
    await expect(ChatService.sendMessage('general', 'hello')).rejects.toThrow('send failed');
    expect(consoleSpy).toHaveBeenCalledWith('Error sending message:', expect.any(Error));

    connection.invoke.mockRejectedValueOnce(new Error('join failed'));
    await expect(ChatService.joinRoom('general')).rejects.toThrow('join failed');
    expect(consoleSpy).toHaveBeenCalledWith('Error joining room:', expect.any(Error));

    connection.invoke.mockRejectedValueOnce(new Error('leave failed'));
    await expect(ChatService.leaveRoom('general')).rejects.toThrow('leave failed');
    expect(consoleSpy).toHaveBeenCalledWith('Error leaving room:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('invokes room actions successfully when connected', async () => {
    await ChatService.connect('user-1', 'token-abc');
    const [{ __connection: connection }] = builders;

    connection.invoke.mockClear();
    await ChatService.joinRoom('ideas');
    expect(connection.invoke).toHaveBeenCalledWith('JoinRoom', 'ideas');

    connection.invoke.mockClear();
    await ChatService.leaveRoom('ideas');
    expect(connection.invoke).toHaveBeenCalledWith('LeaveRoom', 'ideas');

    connection.invoke.mockClear();
    await ChatService.sendMessage('ideas', 'hello world');
    expect(connection.invoke).toHaveBeenCalledWith('SendMessage', 'ideas', 'hello world');
  });

  it('logs and rethrows errors when the chat connection fails to start', async () => {
    nextStartError = new Error('start failed');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(ChatService.connect('user-2', 'bad-token')).rejects.toThrow('start failed');

    expect(consoleSpy).toHaveBeenCalledWith('Chat connection failed:', expect.any(Error));
    consoleSpy.mockRestore();
  });
});
