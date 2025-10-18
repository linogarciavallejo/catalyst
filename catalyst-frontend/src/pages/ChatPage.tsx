import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Header, Footer } from '@/components/Layout';
import { useChat, useAuth, useActivity } from '../hooks';
import TypingIndicator from '@/components/TypingIndicator';
import ActiveUsersList from '@/components/ActiveUsersList';
import type { ChatMessage } from '@/types';

/**
 * ChatPage Component
 * Real-time chat interface for community discussions.
 * Features:
 * - Real-time message display with user info
 * - Real-time message sending via SignalR
 * - Room selection and management
 * - Connection status indicator
 * - Auto-connect on mount
 */
const ChatPage: React.FC = () => {
  const { messages, sendMessage, joinRoom, leaveRoom, connect, disconnect } = useChat();
  const { user } = useAuth();
  const { typingUsers, activeUsers, startTyping, stopTyping, setViewingIdea } = useActivity();
  
  const [selectedRoom, setSelectedRoom] = useState<string>('general');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const rooms = [
    { id: 'general', name: 'General' },
    { id: 'announcements', name: 'Announcements' },
    { id: 'feedback', name: 'Feedback' },
    { id: 'introductions', name: 'Introductions' },
  ];

  // Track viewing room activity
  useEffect(() => {
    if (selectedRoom) {
      setViewingIdea(selectedRoom);
    }
  }, [selectedRoom, setViewingIdea]);

  // Connect to chat on mount
  useEffect(() => {
    const initializeChat = async () => {
      try {
        await connect();
        // Join default room
        await joinRoom('general');
      } catch (err) {
        console.error('Failed to initialize chat:', err);
      }
    };

    initializeChat();

    return () => {
      disconnect();
    };
  }, [connect, disconnect, joinRoom]);

  // Handle room change
  const handleRoomChange = async (roomId: string) => {
    try {
      await leaveRoom(selectedRoom);
      setSelectedRoom(roomId);
      await joinRoom(roomId);
    } catch (err) {
      console.error('Failed to change room:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    try {
      setLoading(true);
      await sendMessage(selectedRoom, newMessage);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter((m: ChatMessage) => m.room === selectedRoom);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header
        logo="💡"
        title="Catalyst"
        actions={
          <Link to="/">
            <Button variant="outline" size="sm">
              Home
            </Button>
          </Link>
        }
      />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Community Chat
          </h1>
          <p className="text-gray-600">
            Connect and discuss ideas with the community in real-time
          </p>
        </div>

        {/* Chat Layout */}
        <div className="grid grid-cols-4 gap-6 h-[600px]">
          {/* Room List */}
          <div className="col-span-1 bg-white rounded-lg p-4 shadow-sm overflow-y-auto">
            <h2 className="font-semibold text-gray-900 mb-4">Rooms</h2>
            <div className="space-y-2">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => handleRoomChange(room.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedRoom === room.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  # {room.name}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-span-3 bg-white rounded-lg shadow-sm flex flex-col">
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-gray-900">
                  #{rooms.find((r) => r.id === selectedRoom)?.name}
                </h2>
              </div>
              <div className="mb-3">
                <ActiveUsersList
                  users={activeUsers}
                  maxDisplay={5}
                />
              </div>
              <p className="text-sm text-gray-600">
                {filteredMessages.length} messages
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredMessages.map((msg: ChatMessage) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.userId === user?.id ? 'justify-end' : ''
                  }`}
                >
                  <div
                    className={`max-w-md p-3 rounded-lg ${
                      msg.userId === user?.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {msg.userId !== user?.id && (
                      <p className="text-sm font-semibold mb-1">
                        {msg.user?.displayName || 'Anonymous'}
                      </p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.currentTarget.value);
                    if (selectedRoom && e.currentTarget.value.trim()) {
                      startTyping(selectedRoom);
                    }
                  }}
                  onBlur={() => {
                    if (selectedRoom) {
                      stopTyping(selectedRoom);
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="chat-message-input"
                />
                <Button variant="primary" size="sm" type="submit" data-testid="send-message">
                  Send
                </Button>
              </form>
              {/* Typing Indicator */}
              <div className="mt-2">
                <TypingIndicator
                  users={selectedRoom ? typingUsers[selectedRoom] : []}
                  showLabel={true}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer
        columns={[
          {
            title: 'Product',
            links: [
              { label: 'Features', href: '#' },
              { label: 'Pricing', href: '#' },
              { label: 'Security', href: '#' },
            ],
          },
          {
            title: 'Company',
            links: [
              { label: 'About', href: '#' },
              { label: 'Blog', href: '#' },
              { label: 'Contact', href: '#' },
            ],
          },
          {
            title: 'Legal',
            links: [
              { label: 'Privacy', href: '#' },
              { label: 'Terms', href: '#' },
              { label: 'License', href: '#' },
            ],
          },
        ]}
        copyright="© 2025 Catalyst. All rights reserved."
      />
    </div>
  );
};

ChatPage.displayName = 'ChatPage';

export default ChatPage;
