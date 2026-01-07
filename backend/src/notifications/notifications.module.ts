import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PushNotificationService } from './push-notification.service';
import { FCMService } from './fcm.service';
import { RedisModule } from '../redis/redis.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [RedisModule, ConfigModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, PushNotificationService, FCMService],
  exports: [NotificationsService, PushNotificationService, FCMService],
})
export class NotificationsModule {}

