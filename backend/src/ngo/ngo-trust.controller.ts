import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NGOTrustService } from './ngo-trust.service';
import { NGOTransparencyService } from './ngo-transparency.service';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('ngo-trust')
@Controller('ngo/trust')
export class NGOTrustController {
  constructor(
    private trustService: NGOTrustService,
    private transparencyService: NGOTransparencyService,
    private prisma: PrismaService
  ) {}

  /**
   * Get public NGO profile (no auth required)
   */
  @Get('profile/:ngoProfileId')
  @ApiOperation({ summary: 'Get public NGO profile' })
  async getPublicProfile(@Param('ngoProfileId') ngoProfileId: string) {
    return this.trustService.getPublicProfile(ngoProfileId);
  }

  /**
   * Calculate confidence score (admin only, for audit)
   */
  @Get('score/:ngoProfileId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calculate confidence score (admin audit)' })
  async calculateScore(
    @Param('ngoProfileId') ngoProfileId: string,
    @Request() req
  ) {
    // Only admins can trigger manual recalculation
    if (req.user.role !== 'ADMIN') {
      throw new Error('Only admins can trigger score calculation');
    }
    return this.trustService.calculateConfidenceScore(ngoProfileId);
  }

  /**
   * Submit transparency report (NGO only)
   */
  @Post('transparency-report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit transparency report' })
  async submitReport(@Request() req, @Body() data: any) {
    // Get NGO profile for user
    const ngoProfile = await this.getNGOProfile(req.user.id);
    return this.transparencyService.submitReport(ngoProfile.id, req.user.id, data);
  }

  /**
   * Get NGO's transparency reports (NGO only)
   */
  @Get('transparency-reports')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my transparency reports' })
  async getMyReports(@Request() req) {
    const ngoProfile = await this.getNGOProfile(req.user.id);
    return this.transparencyService.getNGOReports(ngoProfile.id, req.user.id);
  }

  /**
   * Save report draft (NGO only)
   */
  @Put('transparency-report/:reportId/draft')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save transparency report as draft' })
  async saveDraft(
    @Request() req,
    @Param('reportId') reportId: string,
    @Body() data: any
  ) {
    const ngoProfile = await this.getNGOProfile(req.user.id);
    return this.transparencyService.saveDraft(ngoProfile.id, req.user.id, reportId, data);
  }

  /**
   * Helper to get NGO profile
   */
  private async getNGOProfile(userId: string) {
    const profile = await this.prisma.nGOProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new ForbiddenException('NGO profile not found');
    }
    return profile;
  }
}

