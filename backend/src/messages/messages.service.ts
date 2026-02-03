import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Send message - Only allowed after winner selection
   */
  async sendMessage(giveawayId: string, senderId: string, content: string) {
    // Verify giveaway exists and is closed
    const giveaway = await this.prisma.giveaway.findUnique({
      where: { id: giveawayId },
      include: {
        winners: true,
      },
    });

    if (!giveaway) {
      throw new NotFoundException('Giveaway not found');
    }

    if (giveaway.status !== 'CLOSED' && giveaway.status !== 'COMPLETED') {
      throw new ForbiddenException('Messaging is only available after draw is closed');
    }

    // Verify sender is either giver or winner
    const isGiver = giveaway.userId === senderId;
    const isWinner = giveaway.winners.some((w) => w.userId === senderId);

    if (!isGiver && !isWinner) {
      throw new ForbiddenException('Only giver and winners can message');
    }

    // Determine receiver
    let receiverId: string;
    if (isGiver) {
      // Giver is sending to winner (for now, send to first winner)
      // In production, you'd specify which winner
      receiverId = giveaway.winners[0].userId;
    } else {
      // Winner is sending to giver
      receiverId = giveaway.userId;
    }

    const message = await this.prisma.message.create({
      data: {
        giveawayId,
        senderId,
        receiverId,
        content,
        status: 'SENT',
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
        receiver: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Send notification
    await this.prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'NEW_MESSAGE',
        title: 'New message',
        message: `${message.sender.name} sent you a message`,
        data: { giveawayId, messageId: message.id },
      },
    });

    return message;
  }

  /**
   * Get messages for a giveaway
   */
  async getMessages(giveawayId: string, userId: string) {
    // Verify user is authorized
    const giveaway = await this.prisma.giveaway.findUnique({
      where: { id: giveawayId },
      include: { winners: true },
    });

    if (!giveaway) {
      throw new NotFoundException('Giveaway not found');
    }

    const isGiver = giveaway.userId === userId;
    const isWinner = giveaway.winners.some((w) => w.userId === userId);

    if (!isGiver && !isWinner) {
      throw new ForbiddenException('You are not authorized to view these messages');
    }

    const messages = await this.prisma.message.findMany({
      where: {
        giveawayId,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark as read
    await this.prisma.message.updateMany({
      where: {
        giveawayId,
        receiverId: userId,
        readAt: null,
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });

    return messages;
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        giveaway: {
          select: { id: true, title: true, images: true },
        },
        sender: {
          select: { id: true, name: true, avatar: true },
        },
        receiver: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['giveawayId'],
    });

    return messages;
  }
}




