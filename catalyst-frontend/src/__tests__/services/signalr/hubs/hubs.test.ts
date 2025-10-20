import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActivityHub } from '@/services/signalr/hubs/activityHub';
import { ChatHub } from '@/services/signalr/hubs/chatHub';
import { CommentsHub } from '@/services/signalr/hubs/commentsHub';
import { IdeasHub } from '@/services/signalr/hubs/ideasHub';
import { NotificationsHub } from '@/services/signalr/hubs/notificationsHub';
import { VotesHub } from '@/services/signalr/hubs/votesHub';

const connectionManagerMocks = vi.hoisted(() => ({
  connect: vi.fn(),
  disconnect: vi.fn(),
  isConnected: vi.fn(),
  getConnection: vi.fn(),
}));

vi.mock('@/services/signalr/connectionManager', () => ({
  connectionManager: {
    connect: connectionManagerMocks.connect,
    disconnect: connectionManagerMocks.disconnect,
    isConnected: connectionManagerMocks.isConnected,
    getConnection: connectionManagerMocks.getConnection,
  },
}));

vi.mock('@microsoft/signalr', () => ({
  HubConnectionState: { Connected: 'Connected', Disconnected: 'Disconnected' },
}));

type MockConnection = {
  state: 'Connected' | 'Disconnected';
  invoke: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
};

const createConnection = (state: MockConnection['state'] = 'Connected'): MockConnection => ({
  state,
  invoke: vi.fn().mockResolvedValue(undefined),
  on: vi.fn(),
  off: vi.fn(),
});

beforeEach(() => {
  connectionManagerMocks.connect.mockReset();
  connectionManagerMocks.connect.mockResolvedValue(undefined);
  connectionManagerMocks.disconnect.mockReset();
  connectionManagerMocks.disconnect.mockResolvedValue(undefined);
  connectionManagerMocks.isConnected.mockReset();
  connectionManagerMocks.getConnection.mockReset();
});

describe('ActivityHub', () => {
  let connection: MockConnection;
  let hub: ActivityHub;

  beforeEach(() => {
    connection = createConnection();
    connectionManagerMocks.getConnection.mockImplementation(() => connection);
    hub = new ActivityHub();
  });

  it('connects, disconnects, and checks connection state through the manager', async () => {
    await hub.connect('token');
    expect(connectionManagerMocks.connect).toHaveBeenCalledWith(
      'ActivityHub',
      'activity',
      'token',
    );

    await hub.disconnect();
    expect(connectionManagerMocks.disconnect).toHaveBeenCalledWith('ActivityHub');

    connectionManagerMocks.isConnected.mockReturnValueOnce(true);
    expect(hub.isConnected()).toBe(true);
  });

  it('sends activity updates only when connected and logs failures', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    connection.invoke.mockRejectedValueOnce(new Error('typing fail'));

    await hub.sendTypingActivity('idea-1', true);
    expect(connection.invoke).toHaveBeenCalledWith('SendTypingActivity', 'idea-1', true);
    expect(consoleError).toHaveBeenCalledWith('Failed to send typing activity:', expect.any(Error));

    await hub.sendViewingActivity('idea-1');
    expect(connection.invoke).toHaveBeenCalledWith('SendViewingActivity', 'idea-1');

    await hub.sendIdleActivity();
    expect(connection.invoke).toHaveBeenCalledWith('SendIdleActivity');

    connection.invoke.mockClear();
    connection.state = 'Disconnected';
    await hub.sendViewingActivity('idea-1');
    expect(connection.invoke).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('registers and unregisters listeners when a connection is available', () => {
    const typing = vi.fn();
    const stopped = vi.fn();
    const viewing = vi.fn();
    const idle = vi.fn();
    const activeUsers = vi.fn();

    hub.onUserTyping(typing);
    hub.onUserStoppedTyping(stopped);
    hub.onUserViewing(viewing);
    hub.onUserIdle(idle);
    hub.onActiveUsersUpdated(activeUsers);

    expect(connection.on).toHaveBeenCalledWith('OnUserTyping', typing);
    expect(connection.on).toHaveBeenCalledWith('OnUserStoppedTyping', stopped);
    expect(connection.on).toHaveBeenCalledWith('OnUserViewing', viewing);
    expect(connection.on).toHaveBeenCalledWith('OnUserIdle', idle);
    expect(connection.on).toHaveBeenCalledWith('OnActiveUsersUpdated', activeUsers);

    hub.offUserTyping();
    hub.offUserStoppedTyping();
    hub.offUserViewing();
    hub.offUserIdle();
    hub.offActiveUsersUpdated();

    expect(connection.off).toHaveBeenCalledWith('OnUserTyping');
    expect(connection.off).toHaveBeenCalledWith('OnUserStoppedTyping');
    expect(connection.off).toHaveBeenCalledWith('OnUserViewing');
    expect(connection.off).toHaveBeenCalledWith('OnUserIdle');
    expect(connection.off).toHaveBeenCalledWith('OnActiveUsersUpdated');
  });
});

describe('ChatHub', () => {
  let connection: MockConnection;
  let hub: ChatHub;

  beforeEach(() => {
    connection = createConnection();
    connectionManagerMocks.getConnection.mockImplementation(() => connection);
    hub = new ChatHub();
  });

  it('connects and disconnects using the connection manager', async () => {
    await hub.connect();
    expect(connectionManagerMocks.connect).toHaveBeenCalledWith(
      'ChatHub',
      'chat',
      undefined,
    );

    await hub.disconnect();
    expect(connectionManagerMocks.disconnect).toHaveBeenCalledWith('ChatHub');

    connectionManagerMocks.isConnected.mockReturnValueOnce(false);
    expect(hub.isConnected()).toBe(false);
  });

  it('invokes chat actions only when a connection exists', async () => {
    connectionManagerMocks.getConnection.mockReturnValueOnce(undefined);
    await hub.sendMessage('room-1', 'hello');
    expect(connection.invoke).not.toHaveBeenCalled();

    connectionManagerMocks.getConnection.mockImplementation(() => connection);

    await hub.sendMessage('room-1', 'hello');
    expect(connection.invoke).toHaveBeenCalledWith('SendMessage', 'room-1', 'hello');

    await hub.joinRoom('room-1');
    expect(connection.invoke).toHaveBeenCalledWith('JoinRoom', 'room-1');

    await hub.leaveRoom('room-1');
    expect(connection.invoke).toHaveBeenCalledWith('LeaveRoom', 'room-1');
  });

  it('wires and unwires event handlers', () => {
    const message = vi.fn();
    const joined = vi.fn();
    const left = vi.fn();
    const typing = vi.fn();

    hub.onMessageReceived(message);
    hub.onUserJoined(joined);
    hub.onUserLeft(left);
    hub.onUserTyping(typing);

    expect(connection.on).toHaveBeenCalledWith('ReceiveMessage', message);
    expect(connection.on).toHaveBeenCalledWith('UserJoined', joined);
    expect(connection.on).toHaveBeenCalledWith('UserLeft', left);
    expect(connection.on).toHaveBeenCalledWith('UserTyping', typing);

    hub.offMessageReceived();
    hub.offUserJoined();
    hub.offUserLeft();
    hub.offUserTyping();

    expect(connection.off).toHaveBeenCalledWith('ReceiveMessage');
    expect(connection.off).toHaveBeenCalledWith('UserJoined');
    expect(connection.off).toHaveBeenCalledWith('UserLeft');
    expect(connection.off).toHaveBeenCalledWith('UserTyping');
  });
});

describe('CommentsHub', () => {
  let connection: MockConnection;
  let hub: CommentsHub;

  beforeEach(() => {
    connection = createConnection();
    connectionManagerMocks.getConnection.mockImplementation(() => connection);
    hub = new CommentsHub();
  });

  it('delegates lifecycle to the connection manager', async () => {
    await hub.connect();
    expect(connectionManagerMocks.connect).toHaveBeenCalledWith(
      'CommentsHub',
      'comments',
      undefined,
    );

    await hub.disconnect();
    expect(connectionManagerMocks.disconnect).toHaveBeenCalledWith('CommentsHub');
  });

  it('subscribes to comment events and can remove them', () => {
    const added = vi.fn();
    const updated = vi.fn();
    const deleted = vi.fn();

    hub.onCommentAdded(added);
    hub.onCommentUpdated(updated);
    hub.onCommentDeleted(deleted);

    expect(connection.on).toHaveBeenCalledWith('OnCommentAdded', added);
    expect(connection.on).toHaveBeenCalledWith('OnCommentUpdated', updated);
    expect(connection.on).toHaveBeenCalledWith('OnCommentDeleted', deleted);

    hub.offCommentAdded();
    hub.offCommentUpdated();
    hub.offCommentDeleted();

    expect(connection.off).toHaveBeenCalledWith('OnCommentAdded');
    expect(connection.off).toHaveBeenCalledWith('OnCommentUpdated');
    expect(connection.off).toHaveBeenCalledWith('OnCommentDeleted');
  });
});

describe('IdeasHub', () => {
  let connection: MockConnection;
  let hub: IdeasHub;

  beforeEach(() => {
    connection = createConnection();
    connectionManagerMocks.getConnection.mockImplementation(() => connection);
    hub = new IdeasHub();
  });

  it('connects and disconnects to the ideas hub', async () => {
    await hub.connect('token');
    expect(connectionManagerMocks.connect).toHaveBeenCalledWith('IdeasHub', 'ideas', 'token');

    await hub.disconnect();
    expect(connectionManagerMocks.disconnect).toHaveBeenCalledWith('IdeasHub');
  });

  it('registers and unregisters all idea-related handlers', () => {
    const created = vi.fn();
    const updated = vi.fn();
    const deleted = vi.fn();
    const votes = vi.fn();
    const comments = vi.fn();
    const status = vi.fn();

    hub.onIdeaCreated(created);
    hub.onIdeaUpdated(updated);
    hub.onIdeaDeleted(deleted);
    hub.onVoteUpdated(votes);
    hub.onCommentCountUpdated(comments);
    hub.onIdeaStatusUpdated(status);

    expect(connection.on).toHaveBeenCalledWith('OnIdeaCreated', created);
    expect(connection.on).toHaveBeenCalledWith('OnIdeaUpdated', updated);
    expect(connection.on).toHaveBeenCalledWith('OnIdeaDeleted', deleted);
    expect(connection.on).toHaveBeenCalledWith('OnVoteUpdated', votes);
    expect(connection.on).toHaveBeenCalledWith('OnCommentCountUpdated', comments);
    expect(connection.on).toHaveBeenCalledWith('OnIdeaStatusUpdated', status);

    hub.offIdeaCreated();
    hub.offIdeaUpdated();
    hub.offIdeaDeleted();
    hub.offVoteUpdated();
    hub.offCommentCountUpdated();
    hub.offIdeaStatusUpdated();

    expect(connection.off).toHaveBeenCalledWith('OnIdeaCreated');
    expect(connection.off).toHaveBeenCalledWith('OnIdeaUpdated');
    expect(connection.off).toHaveBeenCalledWith('OnIdeaDeleted');
    expect(connection.off).toHaveBeenCalledWith('OnVoteUpdated');
    expect(connection.off).toHaveBeenCalledWith('OnCommentCountUpdated');
    expect(connection.off).toHaveBeenCalledWith('OnIdeaStatusUpdated');
  });
});

describe('NotificationsHub', () => {
  let connection: MockConnection;
  let hub: NotificationsHub;

  beforeEach(() => {
    connection = createConnection();
    connectionManagerMocks.getConnection.mockImplementation(() => connection);
    hub = new NotificationsHub();
  });

  it('connects and disconnects through the connection manager', async () => {
    await hub.connect();
    expect(connectionManagerMocks.connect).toHaveBeenCalledWith(
      'NotificationsHub',
      'notifications',
      undefined,
    );

    await hub.disconnect();
    expect(connectionManagerMocks.disconnect).toHaveBeenCalledWith('NotificationsHub');
  });

  it('handles notification events and mutation commands', async () => {
    const received = vi.fn();
    const voted = vi.fn();
    const commented = vi.fn();
    const updated = vi.fn();

    hub.onNotificationReceived(received);
    hub.onIdeaVoted(voted);
    hub.onIdeaCommented(commented);
    hub.onIdeaUpdated(updated);

    expect(connection.on).toHaveBeenCalledWith('ReceiveNotification', received);
    expect(connection.on).toHaveBeenCalledWith('OnIdeaVoted', voted);
    expect(connection.on).toHaveBeenCalledWith('OnIdeaCommented', commented);
    expect(connection.on).toHaveBeenCalledWith('OnIdeaUpdated', updated);

    await hub.markNotificationAsRead('notif-1');
    expect(connection.invoke).toHaveBeenCalledWith('MarkAsRead', 'notif-1');

    await hub.markAllNotificationsAsRead();
    expect(connection.invoke).toHaveBeenCalledWith('MarkAllAsRead');

    connection.invoke.mockClear();
    connectionManagerMocks.getConnection.mockReturnValueOnce(undefined);
    await hub.markNotificationAsRead('noop');
    expect(connection.invoke).not.toHaveBeenCalled();

    hub.offNotificationReceived();
    hub.offIdeaVoted();
    hub.offIdeaCommented();
    hub.offIdeaUpdated();

    expect(connection.off).toHaveBeenCalledWith('ReceiveNotification');
    expect(connection.off).toHaveBeenCalledWith('OnIdeaVoted');
    expect(connection.off).toHaveBeenCalledWith('OnIdeaCommented');
    expect(connection.off).toHaveBeenCalledWith('OnIdeaUpdated');
  });
});

describe('VotesHub', () => {
  let connection: MockConnection;
  let hub: VotesHub;

  beforeEach(() => {
    connection = createConnection();
    connectionManagerMocks.getConnection.mockImplementation(() => connection);
    hub = new VotesHub();
  });

  it('connects, disconnects, and reports connection status', async () => {
    await hub.connect('token');
    expect(connectionManagerMocks.connect).toHaveBeenCalledWith('VotesHub', 'votes', 'token');

    await hub.disconnect();
    expect(connectionManagerMocks.disconnect).toHaveBeenCalledWith('VotesHub');

    connectionManagerMocks.isConnected.mockReturnValueOnce(true);
    expect(hub.isConnected()).toBe(true);
  });

  it('listens to vote updates and removals', () => {
    const updated = vi.fn();
    const removed = vi.fn();

    hub.onVoteUpdated(updated);
    hub.onVoteRemoved(removed);

    expect(connection.on).toHaveBeenCalledWith('OnVoteUpdated', updated);
    expect(connection.on).toHaveBeenCalledWith('OnVoteRemoved', removed);

    hub.offVoteUpdated();
    hub.offVoteRemoved();

    expect(connection.off).toHaveBeenCalledWith('OnVoteUpdated');
    expect(connection.off).toHaveBeenCalledWith('OnVoteRemoved');
  });
});
