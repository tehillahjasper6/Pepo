import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from '../messages/messages.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.WEB_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    private messagesService: MessagesService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake auth or query
      const token = client.handshake.auth?.token || client.handshake.query?.token;

      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token as string);
      client.userId = payload.sub;

      // Store connection
      this.connectedUsers.set(client.userId, client.id);

      // Join user's personal room
      client.join(`user:${client.userId}`);

      console.log(`User ${client.userId} connected (socket: ${client.id})`);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      console.log(`User ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('join-giveaway')
  handleJoinGiveaway(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { giveawayId: string },
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    // Join giveaway-specific room
    client.join(`giveaway:${data.giveawayId}`);
    return { success: true, giveawayId: data.giveawayId };
  }

  @SubscribeMessage('leave-giveaway')
  handleLeaveGiveaway(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { giveawayId: string },
  ) {
    client.leave(`giveaway:${data.giveawayId}`);
    return { success: true };
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { giveawayId: string; content: string },
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    try {
      // Create message via service
      const message = await this.messagesService.sendMessage(
        data.giveawayId,
        client.userId,
        data.content,
      );

      // Emit to giveaway room
      this.server.to(`giveaway:${data.giveawayId}`).emit('new-message', message);

      // Also notify receiver directly
      if (message.receiverId) {
        this.server.to(`user:${message.receiverId}`).emit('new-message', message);
      }

      return { success: true, message };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  /**
   * Send message notification to specific user
   */
  sendMessageToUser(userId: string, message: any) {
    this.server.to(`user:${userId}`).emit('new-message', message);
  }

  /**
   * Send message to giveaway room
   */
  sendMessageToGiveaway(giveawayId: string, message: any) {
    this.server.to(`giveaway:${giveawayId}`).emit('new-message', message);
  }
}




