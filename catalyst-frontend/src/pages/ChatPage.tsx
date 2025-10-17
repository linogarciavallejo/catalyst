import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Header, Footer } from '@/components/Layout';

interface Message {
  id: string;
  userId: string;
  displayName: string;
  content: string;
  createdAt: Date;
  room: string;
}

/**
 * ChatPage Component
 * Real-time chat interface for community discussions.
 * Features:
 * - Message display with user avatars
 * - Real-time message sending
 * - Different styling for own vs others' messages
 * - Room selection
 */
const ChatPage: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<string>('general');

  const rooms = [
    { id: 'general', name: 'General' },
    { id: 'announcements', name: 'Announcements' },
    { id: 'feedback', name: 'Feedback' },
    { id: 'introductions', name: 'Introductions' },
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      userId: 'u1',
      displayName: 'John Doe',
      content: 'Welcome to the general chat!',
      createdAt: new Date(Date.now() - 300000),
      room: 'general',
    },
    {
      id: 'm2',
      userId: 'u2',
      displayName: 'Jane Smith',
      content: 'Happy to be here! Looking forward to discussing ideas.',
      createdAt: new Date(Date.now() - 250000),
      room: 'general',
    },
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      const msg: Message = {
        id: `m${Date.now()}`,
        userId: 'current-user',
        displayName: 'You',
        content: newMessage,
        createdAt: new Date(),
        room: selectedRoom,
      };

      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const filteredMessages = messages.filter((m) => m.room === selectedRoom);

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
                  onClick={() => setSelectedRoom(room.id)}
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
              <h2 className="font-semibold text-gray-900">
                #{rooms.find((r) => r.id === selectedRoom)?.name}
              </h2>
              <p className="text-sm text-gray-600">
                {filteredMessages.length} messages
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.userId === 'current-user' ? 'justify-end' : ''
                  }`}
                >
                  <div
                    className={`max-w-md p-3 rounded-lg ${
                      msg.userId === 'current-user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {msg.userId !== 'current-user' && (
                      <p className="text-sm font-semibold mb-1">
                        {msg.displayName}
                      </p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {msg.createdAt.toLocaleTimeString()}
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
                  onChange={(e) => setNewMessage(e.currentTarget.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button variant="primary" size="sm" type="submit">
                  Send
                </Button>
              </form>
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
