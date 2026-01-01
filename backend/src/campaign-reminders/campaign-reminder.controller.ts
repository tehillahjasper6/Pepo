import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CampaignReminderService } from './campaign-reminder.service';
import { ReminderType } from '@prisma/client';

@ApiTags('Campaign Reminders')
@Controller('api/campaigns/:campaignId/reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class CampaignReminderController {
  constructor(private campaignReminderService: CampaignReminderService) {}

  /**
   * Get reminder settings for a campaign (NGO/Admin only)
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.NGO, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get campaign reminder settings' })
  @ApiResponse({ status: 200, description: 'Reminder settings' })
  async getReminderSettings(@Param('campaignId') campaignId: string) {
    return this.campaignReminderService.getCampaignReminderSettings(campaignId);
  }

  /**
   * Update reminder setting for a campaign
   */
  @Put(':reminderType')
  @UseGuards(RolesGuard)
  @Roles(UserRole.NGO, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update campaign reminder setting' })
  @ApiResponse({ status: 200, description: 'Reminder setting updated' })
  async updateReminderSetting(
    @Param('campaignId') campaignId: string,
    @Param('reminderType') reminderType: string,
    @Body() body: { isEnabled: boolean },
  ) {
    return this.campaignReminderService.updateCampaignReminderSetting(
      campaignId,
      reminderType as ReminderType,
      body.isEnabled,
    );
  }

  /**
   * Disable all reminders for a campaign
   */
  @Delete()
  @UseGuards(RolesGuard)
  @Roles(UserRole.NGO, UserRole.ADMIN)
  @ApiOperation({ summary: 'Disable all campaign reminders' })
  @ApiResponse({ status: 200, description: 'All reminders disabled' })
  async disableAllReminders(@Param('campaignId') campaignId: string) {
    return this.campaignReminderService.disableCampaignReminders(campaignId);
  }

  /**
   * Get reminder logs (audit trail)
   */
  @Get('logs')
  @UseGuards(RolesGuard)
  @Roles(UserRole.NGO, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get reminder logs' })
  @ApiResponse({ status: 200, description: 'Reminder logs' })
  async getReminderLogs(@Param('campaignId') campaignId: string) {
    return this.campaignReminderService.getCampaignReminderLogs(campaignId);
  }
}
