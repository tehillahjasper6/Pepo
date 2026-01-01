import { Module } from '@nestjs/common';
import { CampaignReminderService } from './campaign-reminder.service';
import { CampaignReminderController } from './campaign-reminder.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [NotificationsModule, PrismaModule],
  controllers: [CampaignReminderController],
  providers: [CampaignReminderService],
  exports: [CampaignReminderService],
})
export class CampaignReminderModule {}
