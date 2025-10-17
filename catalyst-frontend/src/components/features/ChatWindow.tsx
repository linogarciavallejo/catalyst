import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Input, Button, Spinner } from '@/components/ui';

export interface ChatMessage {
  id: string;
  sender: {
    id: string;
    displayName: string;
  };
  content: string;
  timestamp: Date;
  isOwn?: boolean;
}

export interface ChatWindowProps {
  messages: ChatMessage[];
  loading?: boolean;
  onSendMessage?: (content: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  height?: 'sm' | 'md' | 'lg' | 'full';
}

const heightMap = {
  sm: 'h-64',
  md: 'h-96',
  lg: 'h-[500px]',
  full: 'h-full',
};

/**
 * ChatWindow Component
 * Real-time chat interface for messaging.
 * Features:
 * - Message display with sender info
 * - Auto-scroll to latest message
 * - Message input with send functionality
 * - Loading states
 * - Relative timestamps
 * - Different styling for own messages
 * - Customizable height
 */
const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  loading = false,
  onSendMessage,
  placeholder = 'Type a message...',
  className = '',
  height = 'md',
}) => {
  const [messageContent, setMessageContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !onSendMessage) return;

    setIsSubmitting(true);
    try {
      await onSendMessage(messageContent);
      setMessageContent('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden ${heightMap[height]} ${className}`}>
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner size="md" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            <p className="text-sm">No messages yet. Start a conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.isOwn
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  }`}
                >
                  {!message.isOwn && (
                    <p className="text-xs font-semibold mb-1">{message.sender.displayName}</p>
                  )}
                  <p className="text-sm break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.isOwn ? 'text-blue-200' : 'text-gray-500'
                    }`}
                  >
                    {formatDistanceToNow(new Date(message.timestamp))} ago
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      {onSendMessage && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex gap-2">
            <Input
              placeholder={placeholder}
              value={messageContent}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessageContent(e.currentTarget.value)}
              onKeyPress={handleKeyPress}
              disabled={isSubmitting}
              className="flex-1"
            />
            <Button
              variant="primary"
              onClick={handleSendMessage}
              isLoading={isSubmitting}
              disabled={!messageContent.trim() || isSubmitting}
            >
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
