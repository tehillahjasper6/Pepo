import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { FraudDetectionService } from '../trust/fraud-detection.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/admin/fraud')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class FraudDetectionController {
  constructor(private fraudDetectionService: FraudDetectionService) {}

  /**
   * GET /api/admin/fraud/pending - Get pending fraud reviews
   */
  @Get('pending')
  async getPendingReviews() {
    return this.fraudDetectionService.getPendingReviews(20);
  }

  /**
   * POST /api/admin/fraud/:flagId/resolve - Resolve fraud flag
   */
  @Post(':flagId/resolve')
  async resolveFraudFlag(
    @Param('flagId') flagId: string,
    @Request() req: any,
    @Body() body: any,
  ) {
    const { resolution, action } = body;
    
    return this.fraudDetectionService.resolveFraudFlag(
      flagId,
      req.user.id, // reviewedBy
      resolution,
      action, // 'none' | 'warning' | 'review' | 'suspend'
    );
  }

  /**
   * GET /api/admin/fraud/stats - Get fraud statistics
   */
  @Get('stats')
  async getFraudStats() {
    return this.fraudDetectionService.getFraudStats();
  }

  /**
   * GET /api/admin/fraud/user/:userId - Check fraud status for specific user
   */
  @Get('user/:userId')
  async checkUserFraudStatus(@Param('userId') userId: string) {
    const flags = await this.fraudDetectionService.detectFraudActivity(userId);
    return { userId, riskScore: flags?.riskScore || 0, flags };
  }
}
