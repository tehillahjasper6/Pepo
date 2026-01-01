import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TrustScoreService } from '../trust/trust-score.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/trust')
@UseGuards(JwtAuthGuard)
export class TrustController {
  constructor(private trustScoreService: TrustScoreService) {}

  /**
   * GET /api/trust/:userId - Get trust score for user
   */
  @Get(':userId')
  async getTrustScore(@Param('userId') userId: string) {
    const score = await this.trustScoreService.getTrustScore(userId);
    if (!score) {
      return {
        userId,
        totalScore: 0,
        trustLevel: 'NEW',
        givingScore: 0,
        receivingScore: 0,
        feedbackScore: 0,
        completionRate: 0,
        responseTime: 0,
      };
    }
    return score;
  }

  /**
   * GET /api/trust/distribution - Get distribution of trust levels (admin)
   */
  @Get('admin/distribution')
  async getTrustDistribution() {
    return this.trustScoreService.getTrustDistribution();
  }

  /**
   * GET /api/trust/level/:level - Get users by trust level
   */
  @Get('level/:level')
  async getUsersByTrustLevel(
    @Param('level') level: 'NEW' | 'EMERGING' | 'TRUSTED' | 'HIGHLY_TRUSTED',
  ) {
    return this.trustScoreService.getUsersByTrustLevel(level);
  }
}
