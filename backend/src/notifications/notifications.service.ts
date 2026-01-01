import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PushNotificationService } from './push-notification.service';
import { RedisService } from '../redis/redis.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private pushService: PushNotificationService,
    private redis: RedisService,
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

  /**
   * Enqueue NGO post notification for followers
   * Async queue-based processing for scalability
   * @param ngoId The NGO that posted
   * @param itemId The giveaway/item ID
   * @param title Notification title
   * @param message Notification message
   * @param link Deep link to item
   */
  async enqueueNGOPostNotification(
    ngoId: string,
    itemId: string,
    title: string,
    message: string,
    link: string,
  ): Promise<void> {
    const queue = `notifications:ngo_post:${ngoId}:${itemId}`;
    const task = {
      ngoId,
      itemId,
      title,
      message,
      link,
      createdAt: new Date().toISOString(),
    };

    await this.redis.set(queue, task, 3600); // 1 hour TTL
  }

  /**
   * Process NGO post notification (called by background worker)
   * Fetches followers, checks preferences, then creates notifications
   */
  async processNGOPostNotification(
    ngoId: string,
    itemId: string,
    title: string,
    message: string,
    link: string,
    batchSize = 100,
  ): Promise<number> {
    let processedCount = 0;

    // Get all followers of this NGO
    const followers = await this.prisma.follow.findMany({
      where: { ngoId },
      select: { userId: true },
    });

    if (followers.length === 0) {
      return 0;
    }

    // Process followers in batches to avoid memory issues
    for (let i = 0; i < followers.length; i += batchSize) {
      const batch = followers.slice(i, i + batchSize);
      const userIds = batch.map((f) => f.userId);

      // Create notifications for each user (filtered by preferences in next step)
      const notifications = await Promise.all(
        userIds.map(async (userId) => {
          // Check if user wants NGO post notifications
          const enabled = await this.isNotificationEnabled(userId, 'NGO_NEW_POST', ngoId);
          if (!enabled) {
            return null;
          }

          return this.prisma.notification.create({
            data: {
              userId,
              type: 'NGO_NEW_POST',
              title,
              message,
              referenceId: itemId,
              link,
            },
          });
        }),
      );

      processedCount += notifications.filter((n) => n !== null).length;

      // Send push notifications asynchronously (don't await)
      notifications.forEach((notif) => {
        if (notif) {
          this.pushService
            .sendPushNotification(notif.userId, title, message, { itemId, link })
            .catch((err) => console.error('Push notification error:', err));
        }
      });
    }

    return processedCount;
  }

  /**
   * Check if user allows notifications of given type
   * Global setting overrides per-NGO settings
   */
  async isNotificationEnabled(
    userId: string,
    type: NotificationType,
    ngoId?: string,
  ): Promise<boolean> {
    // Check global preference first
    const globalPref = await this.prisma.notificationPreference.findFirst({
      where: { userId, ngoId: null, type },
    });

    if (globalPref && !globalPref.isEnabled) {
      return false; // Global disable overrides everything
    }

    // Check per-NGO preference if ngoId provided
    if (ngoId) {
      const ngoPref = await this.prisma.notificationPreference.findFirst({
        where: { userId, ngoId, type },
      });

      if (ngoPref && !ngoPref.isEnabled) {
        return false; // Per-NGO disable
      }
    }

    return true; // Default allow
  }

  /**
   * Set notification preference for user
   */
  async setPreference(userId: string, type: NotificationType, isEnabled: boolean, ngoId?: string) {
    return this.prisma.notificationPreference.upsert({
      where: {
        userId_ngoId_type: { userId, ngoId: ngoId || null, type },
      } as any,
      create: { userId, ngoId, type, isEnabled },
      update: { isEnabled },
    });
  }

  /**
   * Get user's notification preferences
   */
  async getPreferences(userId: string) {
    return this.prisma.notificationPreference.findMany({
      where: { userId },
    });
  }
}
