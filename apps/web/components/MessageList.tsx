/**
 * TypingIndicator Component
 * Shows visual feedback when other user is typing
 */

import React from 'react';

interface TypingIndicatorProps {
  userName?: string;
  isVisible: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  userName = 'User',
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="flex items-center space-x-2 text-gray-500 text-sm py-2 px-4">
      <span>{userName} is typing</span>
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
};

/**
 * MessageStatus Component
 * Shows message delivery status (sent, delivered, read)
 */

interface MessageStatusProps {
  status: 'sent' | 'delivered' | 'read';
}

export const MessageStatus: React.FC<MessageStatusProps> = ({ status }) => {
  const statusIcon = {
    sent: '✓',
    delivered: '✓✓',
    read: '✓✓',
  };

  const statusColor = {
    sent: 'text-gray-400',
    delivered: 'text-gray-400',
    read: 'text-blue-500',
  };

  return (
    <span
      className={`text-xs ${statusColor[status]} ml-1`}
      title={`Message ${status}`}
    >
      {statusIcon[status]}
    </span>
  );
};

/**
 * ChatBubble Component
 * Individual message bubble with proper styling
 */

interface ChatBubbleProps {
  content: string;
  isOwn: boolean;
  senderName?: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  onMarkAsRead?: () => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  content,
  isOwn,
  senderName,
  timestamp,
  status = 'delivered',
  onMarkAsRead,
}) => {
  React.useEffect(() => {
    if (!isOwn && status !== 'read' && onMarkAsRead) {
      const timer = setTimeout(onMarkAsRead, 500);
      return () => clearTimeout(timer);
    }
  }, [isOwn, status, onMarkAsRead]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwn
            ? 'bg-primary-500 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        {!isOwn && senderName && (
          <p className="text-xs font-semibold mb-1 opacity-75">{senderName}</p>
        )}
        <p className="text-sm break-words">{content}</p>
        <div className="flex items-center justify-end mt-1 text-xs opacity-70">
          <span>{formatTime(timestamp)}</span>
          {isOwn && <MessageStatus status={status} />}
        </div>
      </div>
    </div>
  );
};

/**
 * MessageList Component
 * Renders a virtualized list of messages for performance
 */

interface MessageListProps {
  messages: Array<{
    id: string;
    content: string;
    senderId: string;
    senderName?: string;
    createdAt: string;
    status?: 'sent' | 'delivered' | 'read';
  }>;
  currentUserId?: string;
  isTyping?: boolean;
  typingUserName?: string;
  onMarkAsRead?: (messageId: string) => void;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isTyping,
  typingUserName,
  onMarkAsRead,
  onScroll,
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 space-y-2"
      onScroll={onScroll}
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400 text-center">
            No messages yet. Start the conversation!
          </p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              content={message.content}
              isOwn={message.senderId === currentUserId}
              senderName={!message.senderId.startsWith(currentUserId || '') ? message.senderName : undefined}
              timestamp={message.createdAt}
              status={message.status}
              onMarkAsRead={
                message.senderId !== currentUserId
                  ? () => onMarkAsRead?.(message.id)
                  : undefined
              }
            />
          ))}
          {isTyping && (
            <TypingIndicator
              isVisible={isTyping}
              userName={typingUserName}
            />
          )}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
