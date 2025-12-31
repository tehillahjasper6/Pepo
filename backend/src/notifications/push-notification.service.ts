import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as webpush from 'web-push';

@Injectable()
export class PushNotificationService {
  private vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || '',
  };

  constructor(private prisma: PrismaService) {
    // Set VAPID keys for web push
    if (this.vapidKeys.publicKey && this.vapidKeys.privateKey) {
      webpush.setVapidDetails(
        'mailto:notifications@pepo.app',
        this.vapidKeys.publicKey,
        this.vapidKeys.privateKey,
      );
    }
  }

  /**
   * Register device for push notifications
   */
  async registerDevice(userId: string, subscription: any) {
    const subscriptionJson = JSON.stringify(subscription);

    // Check if subscription already exists
    const existing = await this.prisma.deviceToken.findFirst({
      where: {
        userId,
        token: subscriptionJson,
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.deviceToken.create({
      data: {
        userId,
        token: subscriptionJson,
        platform: 'web',
        deviceId: subscription.endpoint || 'unknown',
      },
    });
  }

  /**
   * Unregister device
   */
  async unregisterDevice(userId: string, subscription: any) {
    const subscriptionJson = JSON.stringify(subscription);

    return this.prisma.deviceToken.deleteMany({
      where: {
        userId,
        token: subscriptionJson,
      },
    });
  }

  /**
   * Get user device tokens
   */
  async getUserDeviceTokens(userId: string) {
    const devices = await this.prisma.deviceToken.findMany({
      where: { userId },
    });

    return devices.map((device) => JSON.parse(device.token));
  }

  /**
   * Send push notification to user
   */
  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any,
  ) {
    const subscriptions = await this.getUserDeviceTokens(userId);

    if (subscriptions.length === 0) {
      return { sent: 0, failed: 0 };
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/brand-assets/logos/pepo-bee-mascot.svg',
      badge: '/brand-assets/logos/pepo-hive-icon.svg',
      data,
    });

    const results = await Promise.allSettled(
      subscriptions.map((subscription) =>
        webpush.sendNotification(subscription, payload),
      ),
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    // Remove invalid subscriptions
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        // Subscription is invalid, remove it
        this.unregisterDevice(userId, subscriptions[index]).catch(console.error);
      }
    });

    return { sent, failed };
  }

  /**
   * Send push notification to multiple users
   */
  async sendPushNotificationToUsers(
    userIds: string[],
    title: string,
    body: string,
    data?: any,
  ) {
    const results = await Promise.all(
      userIds.map((userId) =>
        this.sendPushNotification(userId, title, body, data),
      ),
    );

    return {
      totalSent: results.reduce((sum, r) => sum + r.sent, 0),
      totalFailed: results.reduce((sum, r) => sum + r.failed, 0),
    };
  }

  /**
   * Get VAPID public key (for frontend)
   */
  getVapidPublicKey(): string {
    return this.vapidKeys.publicKey;
  }
}



