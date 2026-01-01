import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TrustScoreService } from './trust-score.service';
import { FeedbackService } from './feedback.service';
import { FraudDetectionService } from './fraud-detection.service';
import { SmartMatchingService } from './smart-matching.service';
import { EnvironmentalImpactService } from './environmental-impact.service';
import { TrustController } from './trust.controller';
import { FeedbackController } from './feedback.controller';
import { FraudDetectionController } from './fraud-detection.controller';
import { SmartMatchingController } from './smart-matching.controller';
import { EnvironmentalImpactController } from './environmental-impact.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    TrustScoreService,
    FeedbackService,
    FraudDetectionService,
    SmartMatchingService,
    EnvironmentalImpactService,
  ],
  controllers: [
    TrustController,
    FeedbackController,
    FraudDetectionController,
    SmartMatchingController,
    EnvironmentalImpactController,
  ],
  exports: [
    TrustScoreService,
    FeedbackService,
    FraudDetectionService,
    SmartMatchingService,
    EnvironmentalImpactService,
  ],
})
export class TrustModule {}
