import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

/**
 * Gamification Controller
 * Handles badge and achievement endpoints
 */
@Controller('api/gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private gamificationService: GamificationService) {}

  /**
   * Get all available badges
   */
  @Get('badges')
  async getAllBadges() {
    const badges = await this.gamificationService.getAllBadges();
    return {
      success: true,
      data: badges,
      meta: { total: badges.length },
    };
  }

  /**
   * Get user's earned badges
   */
  @Get('user/badges')
  async getUserBadges(@CurrentUser() userId: string) {
    const badges = await this.gamificationService.getUserBadges(userId);
    return {
      success: true,
      data: badges,
      meta: { earned: badges.length },
    };
  }

  /**
   * Get specific badge progress
   */
  @Get('badges/:badgeId')
  async getBadgeProgress(
    @CurrentUser() userId: string,
    @Param('badgeId') badgeId: string
  ) {
    const progress = await this.gamificationService.getBadgeProgress(
      userId,
      badgeId
    );
    if (!progress) {
      return {
        success: false,
        error: 'Badge not found',
        statusCode: 404,
      };
    }
    return {
      success: true,
      data: progress,
    };
  }

  /**
   * Get user's gamification stats
   */
  @Get('user/stats')
  async getGamificationStats(@CurrentUser() userId: string) {
    const stats = await this.gamificationService.getGamificationStats(userId);
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Get leaderboards
   */
  @Get('leaderboards/:metric')
  async getLeaderboards(@Param('metric') metric: string) {
    const leaderboard = await this.gamificationService.getLeaderboards(
      metric as any,
      10
    );
    return {
      success: true,
      data: leaderboard,
      meta: {
        metric,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Environmental impact leaderboard
   */
  @Get('leaderboards/environmental/monthly')
  async getEnvironmentalLeaderboard() {
    const leaderboard = await this.gamificationService.getLeaderboards(
      'environmental'
    );
    return {
      success: true,
      data: leaderboard,
      meta: {
        type: 'environmental_impact',
        period: 'monthly',
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Community giving leaderboard
   */
  @Get('leaderboards/giving/monthly')
  async getGivingLeaderboard() {
    const leaderboard = await this.gamificationService.getLeaderboards(
      'giving'
    );
    return {
      success: true,
      data: leaderboard,
      meta: {
        type: 'giving_activity',
        period: 'monthly',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
