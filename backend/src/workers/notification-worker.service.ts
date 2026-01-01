import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';
import { RedisService } from '../redis/redis.service';

interface NotificationTask {
  ngoId: string;
  itemId: string;
  title: string;
  message: string;
  link: string;
  createdAt?: string;
  retryCount?: number;
}

/**
 * Background worker that processes queued notifications
 * Runs periodically to:
 * - Process NGO post notifications
 * - Handle notification preference updates
 * - Clean up old notification records
 */
@Injectable()
export class NotificationWorkerService {
  private readonly logger = new Logger(NotificationWorkerService.name);

  constructor(
    private notificationsService: NotificationsService,
    private redis: RedisService,
  ) {}

  /**
   * Process NGO post notifications queue
   * Runs every 30 seconds
   */
  @Cron('*/30 * * * * *') // Every 30 seconds
  async processNGOPostNotifications() {
    try {
      const keys = await this.redis.keys('notifications:ngo_post:*');

      for (const key of keys) {
        const task = await this.redis.get<NotificationTask>(key);

        if (task) {
          try {
            const { ngoId, itemId, title, message, link } = task;

            // Process the notification
            const processed = await this.notificationsService.processNGOPostNotification(
              ngoId,
              itemId,
              title,
              message,
              link,
            );

            this.logger.debug(`Processed ${processed} notifications for NGO ${ngoId}`);

            // Remove processed item from queue
            await this.redis.del(key);
          } catch (error) {
            this.logger.error(`Error processing notification task ${key}:`, error);
            // Keep in queue for retry
          }
        }
      }
    } catch (error) {
      this.logger.error('Error in processNGOPostNotifications:', error);
    }
  }

  /**
   * Cleanup old notifications (older than 30 days)
   * Runs daily at 2 AM
   */
  @Cron('0 2 * * *') // 2 AM daily
  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // This would require a new method in NotificationsService
      // For now, just log
      this.logger.log(`Cleanup notifications older than ${thirtyDaysAgo}`);
    } catch (error) {
      this.logger.error('Error in cleanupOldNotifications:', error);
    }
  }

  /**
   * Process failed notifications retry queue
   * Runs every 5 minutes
   */
  @Cron('*/5 * * * *') // Every 5 minutes
  async processFailedNotifications() {
    try {
      const failedKeys = await this.redis.keys('notifications:failed:*');

      this.logger.debug(`Found ${failedKeys.length} failed notification tasks`);

      for (const key of failedKeys) {
        const task = await this.redis.get<NotificationTask>(key);

        if (task) {
          try {
            // Retry processing
            const { ngoId, itemId, title, message, link } = task;
            const retryCount = task.retryCount || 0;

            if (retryCount >= 3) {
              // Give up after 3 retries
              this.logger.warn(`Giving up on notification task ${key} after 3 retries`);
              await this.redis.del(key);
              continue;
            }

            const processed = await this.notificationsService.processNGOPostNotification(
              ngoId,
              itemId,
              title,
              message,
              link,
            );

            this.logger.debug(`Retried and processed ${processed} notifications`);
            await this.redis.del(key);
          } catch (error) {
            this.logger.error(`Error retrying notification task ${key}:`, error);

            // Update retry count
            const task = await this.redis.get<NotificationTask>(key);
            if (task) {
              task.retryCount = (task.retryCount || 0) + 1;
              await this.redis.set(key, task, 3600);
            }
          }
        }
      }
    } catch (error) {
      this.logger.error('Error in processFailedNotifications:', error);
    }
  }
}
