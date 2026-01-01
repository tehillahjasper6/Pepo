import { DigestModule } from '../digests/digest.module';
import { CampaignReminderModule } from '../campaign-reminders/campaign-reminder.module';
import { FollowSuggestionModule } from '../follow-suggestions/follow-suggestion.module';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationWorkerService } from './notification-worker.service';
import { AdvancedFeaturesScheduler } from './advanced-features-scheduler';
import { NotificationsModule } from '../notifications/notifications.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    NotificationsModule,
    RedisModule,
      DigestModule,
      CampaignReminderModule,
      FollowSuggestionModule,
  ],
  providers: [NotificationWorkerService, AdvancedFeaturesScheduler],
  exports: [NotificationWorkerService, AdvancedFeaturesScheduler],
})
export class WorkersModule {}
