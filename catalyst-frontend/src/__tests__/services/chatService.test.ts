import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatService } from '@/services/chatService';

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
    ChatService.on('messageReceived', messageHandler);
    ChatService.on('connected', connectedHandler);

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

    ChatService.off('messageReceived', messageHandler);
    events['ReceiveMessage']?.({ id: 'm2' });
    expect(messageHandler).toHaveBeenCalledTimes(1);
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
});
