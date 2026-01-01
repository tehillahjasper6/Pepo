import { Controller, Get, Put, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DigestService } from './digest.service';
import { DigestFrequency, DigestChannel } from '@prisma/client';

@ApiTags('Digests')
@Controller('api/digests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class DigestController {
  constructor(private digestService: DigestService) {}

  /**
   * Get current user's digest preferences
   */
  @Get('preferences')
  @ApiOperation({ summary: 'Get digest preferences' })
  @ApiResponse({ status: 200, description: 'Digest preferences' })
  async getPreferences(@Req() req: any) {
    return this.digestService.getDigestPreferences(req.user.id);
  }

  /**
   * Update digest preferences
   */
  @Put('preferences')
  @ApiOperation({ summary: 'Update digest preferences' })
  @ApiResponse({ status: 200, description: 'Updated preferences' })
  async updatePreferences(
    @Req() req: any,
    @Body()
    body: {
      frequency?: DigestFrequency;
      isEnabled?: boolean;
      channels?: DigestChannel[];
      includeNewPosts?: boolean;
      includeCampaigns?: boolean;
      includeCompleted?: boolean;
    },
  ) {
    return this.digestService.updateDigestPreference(req.user.id, body);
  }

  /**
   * Update frequency (DAILY or WEEKLY)
   */
  @Put('frequency')
  @ApiOperation({ summary: 'Update digest frequency' })
  @ApiResponse({ status: 200, description: 'Frequency updated' })
  async updateFrequency(
    @Req() req: any,
    @Body() body: { frequency: DigestFrequency },
  ) {
    return this.digestService.updateDigestFrequency(req.user.id, body.frequency);
  }

  /**
   * Update notification channels
   */
  @Put('channels')
  @ApiOperation({ summary: 'Update digest channels' })
  @ApiResponse({ status: 200, description: 'Channels updated' })
  async updateChannels(
    @Req() req: any,
    @Body() body: { channels: DigestChannel[] },
  ) {
    return this.digestService.updateDigestChannels(req.user.id, body.channels);
  }

  /**
   * Update content scope (what to include in digest)
   */
  @Put('content-scope')
  @ApiOperation({ summary: 'Update content scope' })
  @ApiResponse({ status: 200, description: 'Content scope updated' })
  async updateContentScope(
    @Req() req: any,
    @Body()
    body: {
      includeNewPosts?: boolean;
      includeCampaigns?: boolean;
      includeCompleted?: boolean;
    },
  ) {
    return this.digestService.updateContentScope(req.user.id, body);
  }

  /**
   * Toggle digest on/off
   */
  @Put('toggle')
  @ApiOperation({ summary: 'Toggle digest enabled/disabled' })
  @ApiResponse({ status: 200, description: 'Digest toggled' })
  async toggle(@Req() req: any, @Body() body: { isEnabled: boolean }) {
    return this.digestService.toggleDigest(req.user.id, body.isEnabled);
  }

  /**
   * Send test digest (development/testing)
   */
  @Post('test')
  @ApiOperation({ summary: 'Send test digest' })
  @ApiResponse({ status: 200, description: 'Test digest sent' })
  async sendTestDigest(@Req() req: any) {
    const pref = await this.digestService.getDigestPreferences(req.user.id);
    // In a real implementation, this would trigger digest generation
    return {
      success: true,
      message: `Test digest scheduled for frequency: ${pref.frequency}`,
    };
  }
}
