import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrivacyFirstAnalyticsService } from './privacy-first-analytics.service';

@Module({
  imports: [PrismaModule],
  providers: [PrivacyFirstAnalyticsService],
  exports: [PrivacyFirstAnalyticsService],
})
export class AnalyticsModule {}
