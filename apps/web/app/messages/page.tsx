'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket.optimized';
import { PepoBee } from '@/components/PepoBee';
import {
  MessageList,
  TypingIndicator,
  ChatBubble,
} from '@/components/MessageList';
import apiClient from '@/lib/api-client';

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName?: string;
  receiverId: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
}

export default function MessagesPage() {
  const { user } = useAuth();
  const {
    messages,
    isConnected,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    typingUsers,
    handleTyping,
  } = useSocket(user?.id);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationsLoadedRef = useRef(false);

  // Load conversations on mount
  useEffect(() => {
    if (user?.id && !conversationsLoadedRef.current) {
      loadConversations();
      conversationsLoadedRef.current = true;
    }
  }, [user?.id]);

  const loadConversations = async () => {
    try {
      const response = await apiClient('/messages/conversations', {
        method: 'GET',
      });
      setConversations(response.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const handleSelectConversation = useCallback(
    (conversation: Conversation) => {
      setSelectedConversation(conversation);

      // Mark all messages as read
      messages.forEach((msg) => {
        if (msg.senderId === conversation.participantId && msg.status !== 'read') {
          markAsRead(msg.id);
        }
      });

      // Update conversation unread count
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversation.id ? { ...c, unreadCount: 0 } : c
        )
      );
    },
    [messages, markAsRead]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMessageText(e.target.value);

      // Send typing indicator
      if (selectedConversation && e.target.value.trim()) {
        handleTyping(selectedConversation.participantId);

        // Clear previous timeout
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }

        // Set new timeout to stop typing after 3 seconds
        const timeout = setTimeout(() => {
          handleTyping(selectedConversation.participantId, false);
        }, 3000);

        setTypingTimeout(timeout);
      }
    },
    [selectedConversation, handleTyping, typingTimeout]
  );

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!messageText.trim() || !selectedConversation || isSending) {
        return;
      }

      setIsSending(true);

      try {
        // Stop typing indicator
        handleTyping(selectedConversation.participantId, false);
        if (typingTimeout) {
          clearTimeout(typingTimeout);
          setTypingTimeout(null);
        }

        // Send message via socket
        sendMessage({
          receiverId: selectedConversation.participantId,
          content: messageText.trim(),
        });

        setMessageText('');
        inputRef.current?.focus();
      } catch (err) {
        console.error('Failed to send message:', err);
      } finally {
        setIsSending(false);
      }
    },
    [
      messageText,
      selectedConversation,
      isSending,
      sendMessage,
      handleTyping,
      typingTimeout,
    ]
  );

  // Filter messages for selected conversation
  const conversationMessages = selectedConversation
    ? messages.filter(
        (msg) =>
          (msg.senderId === selectedConversation.participantId &&
            msg.receiverId === user?.id) ||
          (msg.senderId === user?.id &&
            msg.receiverId === selectedConversation.participantId)
      )
    : [];

  // Check if other user is typing
  const isOtherUserTyping = selectedConversation
    ? typingUsers.has(selectedConversation.participantId)
    : false;

  if (!user) {
    return (
      <div className="min-h-screen bg-background-default flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-default">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

        {conversations.length === 0 ? (
          <div className="card">
            <div className="text-center py-20">
              <PepoBee emotion="idle" size={200} />
              <h2 className="text-2xl font-semibold mt-8 text-gray-900">
                No messages yet
              </h2>
              <p className="text-gray-600 mt-2 max-w-md mx-auto">
                When you express interest in a giveaway or someone expresses
                interest in yours, you&#39;ll be able to chat here.
              </p>
              <a href="/browse" className="btn btn-primary mt-6">
                Browse Giveaways
              </a>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Conversations List */}
            <div className="md:col-span-1 card flex flex-col">
              <h2 className="text-lg font-semibold mb-4">Conversations</h2>
              <div className="flex-1 overflow-y-auto space-y-2">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-primary-100 border border-primary-500'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {conversation.participantName}
                      </h3>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage || 'No messages yet'}
                    </p>
                    {conversation.lastMessageAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(
                          conversation.lastMessageAt
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Thread */}
            <div className="md:col-span-2 card flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Header */}
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {selectedConversation.participantName}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {!isConnected && 'Disconnected'}
                          {isConnected && isOtherUserTyping && 'Typing...'}
                          {isConnected && !isOtherUserTyping && 'Active'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages List */}
                  {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-gray-500">Loading messages...</p>
                    </div>
                  ) : (
                    <MessageList
                      messages={conversationMessages}
                      currentUserId={user.id}
                      isTyping={isOtherUserTyping}
                      typingUserName={selectedConversation.participantName}
                      onMarkAsRead={markAsRead}
                    />
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4">
                      {error}
                    </div>
                  )}

                  {/* Input */}
                  <form onSubmit={handleSendMessage} className="mt-4">
                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={messageText}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        disabled={isSending || !isConnected}
                      />
                      <button
                        type="submit"
                        disabled={
                          isSending ||
                          !messageText.trim() ||
                          !isConnected
                        }
                        className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSending ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {!isConnected && 'Reconnecting...'}
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  <PepoBee emotion="confused" size={120} />
                  <p className="mt-4">Select a conversation to start chatting</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



