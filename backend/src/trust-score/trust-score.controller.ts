import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TrustScoreService } from './trust-score.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('trust-score')
@Controller('trust-score')
export class TrustScoreController {
  constructor(private trustScoreService: TrustScoreService) {}

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get trust score for a specific user' })
  async getTrustScore(@Param('userId') userId: string) {
    const score = await this.trustScoreService.getTrustScore(userId);
    return { trustScore: score };
  }

  @Get('profile/:userId')
  @ApiOperation({
    summary:
      'Get detailed trust profile for a user including giveaways and ratings',
  })
  async getUserTrustProfile(@Param('userId') userId: string) {
    const profile = await this.trustScoreService.getUserTrustProfile(userId);
    return profile;
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get top 10 users by trust score' })
  async getLeaderboard() {
    const leaderboard = await this.trustScoreService.getLeaderboard(10);
    return { leaderboard };
  }

  @Get('leaderboard/:limit')
  @ApiOperation({ summary: 'Get top N users by trust score' })
  async getLeaderboardWithLimit(@Param('limit') limit: string) {
    const leaderboard = await this.trustScoreService.getLeaderboard(
      parseInt(limit, 10),
    );
    return { leaderboard };
  }
}
