import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { EnvironmentalImpactService } from '../trust/environmental-impact.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/impact')
@UseGuards(JwtAuthGuard)
export class EnvironmentalImpactController {
  constructor(private environmentalImpactService: EnvironmentalImpactService) {}

  /**
   * GET /api/impact/user/:userId - Get environmental impact for user
   */
  @Get('user/:userId')
  async getUserImpact(@Param('userId') userId: string) {
    return this.environmentalImpactService.getUserImpact(userId);
  }

  /**
   * GET /api/impact/leaderboard - Get environmental impact leaderboard
   */
  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit: string = '10') {
    return this.environmentalImpactService.getLeaderboard(parseInt(limit));
  }

  /**
   * GET /api/impact/platform - Get platform-wide environmental impact
   */
  @Get('platform')
  async getPlatformImpact() {
    return this.environmentalImpactService.getPlatformImpact();
  }

  /**
   * GET /api/impact/category/:category - Get impact by category
   */
  @Get('category/:category')
  async getImpactByCategory(@Param('category') category: string) {
    return this.environmentalImpactService.getImpactByCategory(category);
  }

  /**
   * GET /api/impact/report/:year/:month - Get monthly impact report
   */
  @Get('report/:year/:month')
  async getMonthlyReport(
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.environmentalImpactService.getMonthlyReport(
      parseInt(year),
      parseInt(month),
    );
  }
}
