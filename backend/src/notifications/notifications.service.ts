import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PushNotificationService } from './push-notification.service';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private pushService: PushNotificationService,
  ) {}

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, limit: number = 50) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Mark as read
   */
  async markAsRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { isRead: true },
    });
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Send push notification
   */
  async sendPushNotification(userId: string, title: string, body: string, data?: any) {
    // Store in-app notification
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: 'SYSTEM_ALERT',
        title,
        message: body,
        data,
      },
    });

    // Send push notification
    try {
      await this.pushService.sendPushNotification(userId, title, body, data);
    } catch (error) {
      console.error('Failed to send push notification:', error);
      // Don't throw - in-app notification was created
    }

    return notification;
  }
}

