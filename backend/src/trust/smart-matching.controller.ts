import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { SmartMatchingService } from '../trust/smart-matching.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/matching')
@UseGuards(JwtAuthGuard)
export class SmartMatchingController {
  constructor(private smartMatchingService: SmartMatchingService) {}

  /**
   * GET /api/matching/recommendations/:userId - Get personalized recommendations
   */
  @Get('recommendations/:userId')
  async getRecommendations(
    @Param('userId') userId: string,
    @Query('limit') limit: string = '10',
  ) {
    return this.smartMatchingService.getRecommendations(userId, parseInt(limit));
  }

  /**
   * GET /api/matching/score/:userId/:giveawayId - Get match score for specific pair
   */
  @Get('score/:userId/:giveawayId')
  async getMatchScore(
    @Param('userId') userId: string,
    @Param('giveawayId') giveawayId: string,
  ) {
    return this.smartMatchingService.calculateMatchScore(userId, giveawayId);
  }

  /**
   * GET /api/matching/trending - Get trending giveaways
   */
  @Get('trending')
  async getTrendingGiveaways(@Query('limit') limit: string = '5') {
    return this.smartMatchingService.getTrendingGiveaways(parseInt(limit));
  }
}
