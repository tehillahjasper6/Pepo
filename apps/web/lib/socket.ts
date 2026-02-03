/**
 * WebSocket Client for Real-Time Messaging
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

class SocketClient {
  private socket: Socket | null = null;
  private token: string | null = null;

  /**
   * Connect to WebSocket server
   */
  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.token = token;

    this.socket = io(`${SOCKET_URL}/messages`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Join a giveaway room
   */
  joinGiveaway(giveawayId: string, callback?: (response: { [key: string]: unknown }) => void) {
    if (!this.socket) return;
    this.socket.emit('join-giveaway', { giveawayId }, callback);
  }

  /**
   * Leave a giveaway room
   */
  leaveGiveaway(giveawayId: string, callback?: (response: { [key: string]: unknown }) => void) {
    if (!this.socket) return;
    this.socket.emit('leave-giveaway', { giveawayId }, callback);
  }

  /**
   * Send a message
   */
  sendMessage(giveawayId: string, content: string, callback?: (response: { [key: string]: unknown }) => void) {
    if (!this.socket) return;
    this.socket.emit('send-message', { giveawayId, content }, callback);
  }

  /**
   * Listen for new messages
   */
  onMessage(callback: (message: { [key: string]: unknown }) => void) {
    if (!this.socket) return;
    this.socket.on('new-message', callback);
  }

  /**
   * Remove message listener
   */
  offMessage(callback?: (message: { [key: string]: unknown }) => void) {
    if (!this.socket) return;
    if (callback) {
      this.socket.off('new-message', callback);
    } else {
      this.socket.off('new-message');
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const socketClient = new SocketClient();

// Export class for testing
export default SocketClient;




