'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PepoBee } from '@/components/PepoBee';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/apiClient';
import { toast } from '@/components/Toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorDisplay } from '@/components/ErrorDisplay';

export default function MessagesPage({ params }: { params: { giveawayId: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { isConnected, messages, sendMessage, error: socketError } = useSocket(params.giveawayId);
  const [giveaway, setGiveaway] = useState<{ id: string; [key: string]: unknown } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch giveaway details
  useEffect(() => {
    const fetchGiveaway = async () => {
      try {
        const response = await apiClient.getGiveaway(params.giveawayId);
        setGiveaway(response.giveaway);
      } catch (error: unknown) {
        toast.error('Failed to load giveaway');
      } finally {
        setLoading(false);
      }
    };

    fetchGiveaway();
  }, [params.giveawayId]);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        await apiClient.getMessages(params.giveawayId);
        // Messages will be added via WebSocket
      } catch (error: unknown) {
        // Silently fail if messages can't be fetched
      }
    };

    if (params.giveawayId) {
      fetchMessages();
    }
  }, [params.giveawayId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || sending) return;

    const content = messageInput.trim();
    setMessageInput('');
    setSending(true);

    try {
      await sendMessage(content);
      // Message will be added via WebSocket
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to send message';\n      toast.error(errorMsg);
      setMessageInput(content); // Restore message
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading messages..." />;
  }

  if (!giveaway) {
    return (
      <ErrorDisplay
        error="Giveaway not found"
        onRetry={() => router.push('/browse')}
      />
    );
  }

  const otherUser = giveaway.creator?.id === user?.id 
    ? giveaway.winners?.[0] 
    : giveaway.creator;

  return (
    <div className="min-h-screen bg-background-default flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {giveaway.title}
                </h1>
                <p className="text-sm text-gray-600">
                  Chatting with {otherUser?.name || 'User'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <span className="flex items-center text-sm text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Online
                </span>
              ) : (
                <span className="flex items-center text-sm text-gray-500">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  Connecting...
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto container mx-auto px-4 py-6 max-w-4xl">
        {socketError && (
          <div className="mb-4 p-4 bg-red-50 rounded-lg text-red-700 text-sm">
            {socketError}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <PepoBee emotion="idle" size={150} />
            <p className="text-gray-600 mt-4">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.senderId === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-primary-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t sticky bottom-0">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              disabled={!isConnected || sending}
              className="input flex-1"
            />
            <button
              type="submit"
              disabled={!isConnected || sending || !messageInput.trim()}
              className="btn btn-primary"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}



