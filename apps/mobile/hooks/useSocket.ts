/**
 * WebSocket Client Hook for Mobile
 */

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface UseSocketState {
  isConnected: boolean;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  joinGiveaway: (giveawayId: string) => void;
  leaveGiveaway: (giveawayId: string) => void;
  clearMessages: () => void;
}

let socket: Socket | null = null;

export const useSocket = (giveawayId?: string): UseSocketState => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  // Connect socket on auth
  useEffect(() => {
    if (!user) return;

    if (!socket || !socket.connected) {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
      const socketUrl = apiUrl.replace('/api', '');

      socket = io(`${socketUrl}/messages`, {
        auth: { token: localStorage.getItem('pepo_token') },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      });

      socket.on('message', (message: Message) => {
        setMessages((prev) => [...prev, message]);
      });

      socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
        setError('Failed to connect to messaging server');
      });
    }

    return () => {
      // Keep socket alive for reconnection
    };
  }, [user]);

  // Join giveaway room
  const joinGiveaway = useCallback((room: string) => {
    if (!socket || !socket.connected) return;

    socket.emit('join-giveaway', room);
    setCurrentRoom(room);
  }, []);

  // Leave giveaway room
  const leaveGiveaway = useCallback((room: string) => {
    if (!socket || !socket.connected) return;

    socket.emit('leave-giveaway', room);
    if (currentRoom === room) {
      setCurrentRoom(null);
      setMessages([]);
    }
  }, [currentRoom]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!socket || !socket.connected || !currentRoom) {
      setError('Not connected to messaging server');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      socket.emit('send-message', {
        giveawayId: currentRoom,
        content,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [currentRoom]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    isConnected,
    messages,
    isLoading,
    error,
    sendMessage,
    joinGiveaway,
    leaveGiveaway,
    clearMessages,
  };
};

export const disconnect = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export default useSocket;
