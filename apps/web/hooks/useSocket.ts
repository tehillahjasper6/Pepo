/**
 * WebSocket Hook for Real-Time Messaging
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { socketClient } from '@/lib/socket';
import { useAuth } from './useAuth';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  giveawayId: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
  };
}

export const useSocket = (giveawayId?: string) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<Message[]>([]);

  // Update ref when messages change
  useEffect(() => {
    messagesRef.current = messages;
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

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    socketClient.onMessage(handleNewMessage);

    // Join giveaway room if provided
    if (giveawayId) {
      socketClient.joinGiveaway(giveawayId);
    }

    return () => {
      socketClient.offMessage(handleNewMessage);
      if (giveawayId) {
        socketClient.leaveGiveaway(giveawayId);
      }
    };
  }, [isAuthenticated, user, giveawayId]);

  // Disconnect on unmount
  useEffect(() => {
    return () => {
      if (giveawayId) {
        socketClient.leaveGiveaway(giveawayId);
      }
    };
  }, [giveawayId]);

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!giveawayId) {
        throw new Error('Giveaway ID is required');
      }

      if (!isConnected) {
        throw new Error('Not connected to chat');
      }

      return new Promise<void>((resolve, reject) => {
        socketClient.sendMessage(giveawayId, content, (response: any) => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve();
          }
        });
      });
    },
    [giveawayId, isConnected],
  );

  // Add message to local state (optimistic update)
  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  return {
    isConnected,
    messages,
    sendMessage,
    addMessage,
    error,
  };
};




