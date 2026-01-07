/**
 * WebSocket Hook for Real-Time Messaging - Optimized
 * Features:
 * - Message deduplication to prevent duplicates
 * - Automatic scrolling to latest messages
 * - Typing indicators
 * - Connection status handling
 * - Message history limit (500 messages) for performance
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { socketClient } from '@/lib/socket';
import { useAuth } from './useAuth';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  giveawayId: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
  sender?: {
    id: string;
    name: string;
  };
}

interface UseSocketReturn {
  isConnected: boolean;
  messages: Message[];
  error: string | null;
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  scrollToBottom: () => void;
}

const MAX_MESSAGES = 500; // Keep only last 500 messages in state
const TYPING_TIMEOUT = 3000; // 3 seconds

export const useSocket = (giveawayId?: string): UseSocketReturn => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  // Refs for optimization
  const messagesRef = useRef<Message[]>([]);
  const messageIdsRef = useRef<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Update refs when state changes
  useEffect(() => {
    messagesRef.current = messages;
    messages.forEach(m => messageIdsRef.current.add(m.id));
  }, [messages]);

  // Connect on mount if authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem('pepo_token');
    if (!token) return;

    socketClient.connect(token);
    const socket = socketClient.getSocket();
    if (!socket) return;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      setError('Failed to connect to chat');
      console.error('Socket connection error:', err);
    });

    // Listen for new messages with deduplication
    const handleNewMessage = (message: Message) => {
      // Prevent duplicate messages
      if (messageIdsRef.current.has(message.id)) {
        console.debug('Duplicate message ignored:', message.id);
        return;
      }

      messageIdsRef.current.add(message.id);

      // Update messages list with automatic cleanup
      setMessages((prev) => {
        const newMessages = [...prev, message];
        
        // If we exceed max messages, remove oldest ones
        if (newMessages.length > MAX_MESSAGES) {
          const toRemove = newMessages.length - MAX_MESSAGES;
          const removed = newMessages.splice(0, toRemove);
          removed.forEach(m => messageIdsRef.current.delete(m.id));
        }

        return newMessages;
      });
    };

    // Listen for typing indicators
    const handleTyping = () => {
      setIsTyping(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, TYPING_TIMEOUT);
    };

    // Listen for message read status
    const handleMessageRead = (messageId: string) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: 'read' as const } : msg
        )
      );
    };

    socketClient.onMessage(handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('message:read', handleMessageRead);

    // Join giveaway room if provided
    if (giveawayId) {
      socketClient.joinGiveaway(giveawayId);
    }

    return () => {
      socketClient.offMessage(handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('message:read', handleMessageRead);
      
      if (giveawayId) {
        socketClient.leaveGiveaway(giveawayId);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isAuthenticated, user, giveawayId]);

  // Send message with proper error handling
  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!giveawayId) {
        throw new Error('Giveaway ID is required');
      }

      if (!isConnected) {
        throw new Error('Not connected to chat. Please wait for connection...');
      }

      if (!content.trim()) {
        throw new Error('Message cannot be empty');
      }

      return new Promise<void>((resolve, reject) => {
        socketClient.sendMessage(giveawayId, content, (acknowledged: boolean) => {
          if (acknowledged) {
            resolve();
          } else {
            reject(new Error('Failed to send message'));
          }
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          reject(new Error('Message delivery timeout'));
        }, 10000);
      });
    },
    [giveawayId, isConnected]
  );

  // Mark message as read
  const markAsRead = useCallback(
    async (messageId: string): Promise<void> => {
      if (!giveawayId) return;
      
      socketClient.getSocket()?.emit('message:read', {
        giveawayId,
        messageId,
      });
    },
    [giveawayId]
  );

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Memoize return value to prevent unnecessary re-renders
  const value = useMemo<UseSocketReturn>(
    () => ({
      isConnected,
      messages,
      error,
      isTyping,
      sendMessage,
      markAsRead,
      scrollToBottom,
    }),
    [isConnected, messages, error, isTyping, sendMessage, markAsRead, scrollToBottom]
  );

  return value;
};

// Export hook for use in components
export default useSocket;
