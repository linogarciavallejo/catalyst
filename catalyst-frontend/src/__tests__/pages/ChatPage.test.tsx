import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ChatPage from '@/pages/ChatPage';
import { useChat, useAuth, useActivity } from '@/hooks';
import type { ChatMessage } from '@/types';
import type { UserActivity } from '@/services/signalr/hubs/activityHub';
import '@testing-library/jest-dom';

vi.mock('@/hooks', () => ({
  useChat: vi.fn(),
  useAuth: vi.fn(),
  useActivity: vi.fn(),
}));

const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

afterAll(() => {
  mockConsoleError.mockRestore();
});

const renderChatPage = () => {
  return render(
    <MemoryRouter>
      <ChatPage />
    </MemoryRouter>
  );
};

describe('ChatPage', () => {
  const connect = vi.fn().mockResolvedValue(undefined);
  const disconnect = vi.fn().mockResolvedValue(undefined);
  const joinRoom = vi.fn().mockResolvedValue(undefined);
  const leaveRoom = vi.fn().mockResolvedValue(undefined);
  const sendMessage = vi.fn().mockResolvedValue(undefined);
  let activityReturn: {
    typingUsers: Record<string, string[]>;
    activeUsers: UserActivity[];
    viewingUsers: Record<string, string[]>;
    startTyping: ReturnType<typeof vi.fn>;
    stopTyping: ReturnType<typeof vi.fn>;
    setViewingIdea: ReturnType<typeof vi.fn>;
    setIdle: ReturnType<typeof vi.fn>;
  };

  const activityUsers: UserActivity[] = [
    {
      userId: 'active-1',
      userName: 'Taylor',
      activityType: 'typing',
      ideaId: 'general',
      timestamp: new Date('2024-01-01T00:00:00Z'),
    },
  ];

  const baseMessages: ChatMessage[] = [
    {
      id: 'm-1',
      content: 'Welcome to general',
      room: 'general',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      userId: 'user-2',
      user: {
        id: 'user-2',
        displayName: 'Jamie',
        email: 'jamie@example.com',
        role: 'Creator',
        eipPoints: 10,
        createdAt: new Date('2023-01-01T00:00:00Z'),
      },
    },
    {
      id: 'm-2',
      content: 'Feedback only',
      room: 'feedback',
      createdAt: new Date('2024-01-02T00:00:00Z'),
      userId: 'user-3',
      user: {
        id: 'user-3',
        displayName: 'Alex',
        email: 'alex@example.com',
        role: 'Contributor',
        eipPoints: 5,
        createdAt: new Date('2023-02-01T00:00:00Z'),
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleError.mockClear();

    (useChat as unknown as vi.Mock).mockReturnValue({
      messages: baseMessages,
      sendMessage,
      joinRoom,
      leaveRoom,
      connect,
      disconnect,
      clearMessages: vi.fn(),
      clearError: vi.fn(),
      isConnected: true,
      isLoading: false,
      error: null,
      activeUsers: [],
      typingUsers: new Set<string>(),
    });

    (useAuth as unknown as vi.Mock).mockReturnValue({
      user: {
        id: 'user-1',
        displayName: 'Casey',
        email: 'casey@example.com',
        role: 'Creator',
        eipPoints: 0,
        createdAt: new Date('2023-03-01T00:00:00Z'),
      },
    });

    activityReturn = {
      typingUsers: {
        general: ['Taylor'],
        feedback: ['Morgan'],
      },
      activeUsers: activityUsers,
      viewingUsers: {},
      startTyping: vi.fn(),
      stopTyping: vi.fn(),
      setViewingIdea: vi.fn(),
      setIdle: vi.fn(),
    };

    (useActivity as unknown as vi.Mock).mockReturnValue(activityReturn);

    connect.mockClear();
    disconnect.mockClear();
    joinRoom.mockClear();
    leaveRoom.mockClear();
    sendMessage.mockClear();
  });

  it('initializes chat connection and shows filtered messages for selected room', async () => {
    const { unmount } = renderChatPage();

    await waitFor(() => {
      expect(connect).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(joinRoom).toHaveBeenCalledWith('general');
    });

    await waitFor(() => {
      expect(activityReturn.setViewingIdea).toHaveBeenCalledWith('general');
    });

    expect(screen.getByText('Community Chat')).toBeInTheDocument();
    expect(screen.getByText('Welcome to general')).toBeInTheDocument();
    expect(screen.queryByText('Feedback only')).not.toBeInTheDocument();

    unmount();
  });

  it('tracks activity when typing and stopping', async () => {
    renderChatPage();

    const messageInput = await screen.findByTestId('chat-message-input');
    const user = userEvent.setup();
    await user.type(messageInput, 'Hello world');
    expect(activityReturn.startTyping).toHaveBeenCalledWith('general');

    messageInput.blur();
    expect(activityReturn.stopTyping).toHaveBeenCalledWith('general');
    expect(screen.getByText('Taylor is typing...')).toBeInTheDocument();
  });

  it('changes rooms and calls leave and join handlers', async () => {
    renderChatPage();

    const feedbackButton = screen.getByRole('button', { name: '# Feedback' });
    const user = userEvent.setup();
    await user.click(feedbackButton);

    await waitFor(() => {
      expect(leaveRoom).toHaveBeenCalledWith('general');
    });
    await waitFor(() => {
      expect(joinRoom).toHaveBeenLastCalledWith('feedback');
    });

    await waitFor(() => {
      expect(activityReturn.setViewingIdea).toHaveBeenLastCalledWith('feedback');
    });

    expect(screen.getByText('#Feedback')).toBeInTheDocument();
  });

  it('keeps selection and logs error when room change fails', async () => {
    leaveRoom.mockRejectedValueOnce(new Error('boom'));
    renderChatPage();

    const announcementsButton = screen.getByRole('button', {
      name: '# Announcements',
    });
    const user = userEvent.setup();
    await user.click(announcementsButton);

    await waitFor(() => {
      expect(leaveRoom).toHaveBeenCalledWith('general');
    });

    expect(joinRoom).not.toHaveBeenCalledWith('announcements');
    expect(screen.getByText('#General')).toBeInTheDocument();
    expect(activityReturn.setViewingIdea).not.toHaveBeenCalledWith('announcements');
    expect(mockConsoleError).toHaveBeenCalledWith(
      'Failed to change room:',
      expect.any(Error)
    );
  });

  it('sends a message and resets the input field', async () => {
    renderChatPage();
    const user = userEvent.setup();

    const messageInput = await screen.findByTestId('chat-message-input');
    await user.type(messageInput, 'New chat message');

    const sendButton = screen.getByTestId('send-message');
    await user.click(sendButton);

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith('general', 'New chat message');
    });

    expect(messageInput).toHaveValue('');
  });

  it('logs an error and keeps draft text when sending fails', async () => {
    sendMessage.mockRejectedValueOnce(new Error('Failed'));
    renderChatPage();

    const messageInput = await screen.findByTestId('chat-message-input');
    const user = userEvent.setup();
    await user.type(messageInput, 'Will fail');

    const sendButton = screen.getByTestId('send-message');
    await user.click(sendButton);

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith('general', 'Will fail');
    });

    expect(messageInput).toHaveValue('Will fail');
    expect(mockConsoleError).toHaveBeenCalledWith(
      'Failed to send message:',
      expect.any(Error)
    );
  });

  it('disconnects on unmount', async () => {
    const { unmount } = renderChatPage();

    await waitFor(() => {
      expect(connect).toHaveBeenCalled();
    });

    unmount();

    await waitFor(() => {
      expect(disconnect).toHaveBeenCalled();
    });
  });
});

