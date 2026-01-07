import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FCMService {
  private readonly logger = new Logger(FCMService.name);
  private messaging: admin.messaging.Messaging;

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const credentialsPath = this.configService.get<string>('FIREBASE_CREDENTIALS_PATH');
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');

      if (!projectId && !credentialsPath) {
        this.logger.warn('Firebase not configured. FCM notifications will be mocked.');
        return;
      }

      if (!admin.apps.length) {
        if (credentialsPath) {
          const credentials = require(credentialsPath);
          admin.initializeApp({
            credential: admin.credential.cert(credentials),
            projectId,
          });
        } else {
          admin.initializeApp({
            projectId,
          });
        }
      }

      this.messaging = admin.messaging();
      this.logger.log('Firebase Cloud Messaging initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase:', error);
    }
  }

  /**
   * Send push notification to a single device
   */
  async sendToDevice(
    deviceToken: string,
    notification: {
      title: string;
      body: string;
      imageUrl?: string;
    },
    data?: Record<string, string>
  ): Promise<string | null> {
    try {
      if (!this.messaging) {
        this.logger.warn(`[MOCK] FCM notification sent to ${deviceToken}: ${notification.title}`);
        return null;
      }

      const message: admin.messaging.Message = {
        notification,
        data,
        token: deviceToken,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'pepo-notifications',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              alert: notification,
            },
          },
        },
      };

      const response = await this.messaging.send(message);
      this.logger.log(`FCM notification sent: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to send FCM notification to ${deviceToken}:`, error);
      return null;
    }
  }

  /**
   * Send push notification to multiple devices
   */
  async sendToDevices(
    deviceTokens: string[],
    notification: {
      title: string;
      body: string;
      imageUrl?: string;
    },
    data?: Record<string, string>
  ): Promise<admin.messaging.BatchResponse | null> {
    try {
      if (!this.messaging || deviceTokens.length === 0) {
        this.logger.warn(
          `[MOCK] FCM multicast sent to ${deviceTokens.length} devices: ${notification.title}`
        );
        return null;
      }

      const message: admin.messaging.MulticastMessage = {
        notification,
        data,
        tokens: deviceTokens,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'pepo-notifications',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              alert: notification,
            },
          },
        },
      };

      const response = await this.messaging.sendMulticast(message);
      this.logger.log(
        `FCM multicast sent: ${response.successCount} succeeded, ${response.failureCount} failed`
      );
      return response;
    } catch (error) {
      this.logger.error('Failed to send FCM multicast:', error);
      return null;
    }
  }

  /**
   * Send push notification to topic
   */
  async sendToTopic(
    topic: string,
    notification: {
      title: string;
      body: string;
      imageUrl?: string;
    },
    data?: Record<string, string>
  ): Promise<string | null> {
    try {
      if (!this.messaging) {
        this.logger.warn(`[MOCK] FCM topic notification sent to ${topic}: ${notification.title}`);
        return null;
      }

      const message: admin.messaging.Message = {
        notification,
        data,
        topic,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'pepo-notifications',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              alert: notification,
            },
          },
        },
      };

      const response = await this.messaging.send(message);
      this.logger.log(`FCM topic notification sent to ${topic}: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to send FCM topic notification to ${topic}:`, error);
      return null;
    }
  }

  /**
   * Subscribe device to topic
   */
  async subscribeToTopic(deviceTokens: string[], topic: string): Promise<boolean> {
    try {
      if (!this.messaging || deviceTokens.length === 0) {
        this.logger.warn(`[MOCK] Subscribed ${deviceTokens.length} devices to ${topic}`);
        return true;
      }

      await this.messaging.subscribeToTopic(deviceTokens, topic);
      this.logger.log(`Subscribed ${deviceTokens.length} devices to topic: ${topic}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic ${topic}:`, error);
      return false;
    }
  }

  /**
   * Unsubscribe device from topic
   */
  async unsubscribeFromTopic(deviceTokens: string[], topic: string): Promise<boolean> {
    try {
      if (!this.messaging || deviceTokens.length === 0) {
        this.logger.warn(`[MOCK] Unsubscribed ${deviceTokens.length} devices from ${topic}`);
        return true;
      }

      await this.messaging.unsubscribeFromTopic(deviceTokens, topic);
      this.logger.log(`Unsubscribed ${deviceTokens.length} devices from topic: ${topic}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from topic ${topic}:`, error);
      return false;
    }
  }

  /**
   * Check if device token is valid
   */
  async validateToken(deviceToken: string): Promise<boolean> {
    try {
      if (!this.messaging) {
        return true; // Accept all in mock mode
      }

      // Send a test message to validate
      const message: admin.messaging.Message = {
        data: { test: 'true' },
        token: deviceToken,
      };

      await this.messaging.send(message, true); // dryRun=true
      return true;
    } catch (error) {
      this.logger.warn(`Invalid device token: ${deviceToken}`);
      return false;
    }
  }
}
