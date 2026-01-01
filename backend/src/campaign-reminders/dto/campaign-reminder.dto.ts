import { IsEnum, IsBoolean, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ReminderType } from '@prisma/client';

/**
 * DTO for campaign reminder settings
 * Validates all reminder-related constraints from JSON schema
 */
export class UpdateCampaignReminderDto {
  /**
   * Enable or disable specific reminder type
   * JSON reference: campaign_reminders.reminder_types
   */
  @IsBoolean()
  isEnabled: boolean;
}

/**
 * DTO for reminder type enumeration
 * JSON reference: reminder_intervals
 * Supported types:
 * - CAMPAIGN_LAUNCH_7DAYS: 7 days before launch
 * - CAMPAIGN_LAUNCH_24HOURS: 24 hours before launch
 * - CAMPAIGN_LAUNCH_SAME_DAY: Day of launch
 * - CAMPAIGN_ENDING: 24 hours before end
 * - CAMPAIGN_LAUNCH_SOON: 30 days before launch
 */
export class CampaignReminderTypeDto {
  @IsEnum(ReminderType, {
    message: `reminderType must be one of: ${Object.values(ReminderType).join(', ')}`,
  })
  reminderType: ReminderType;
}

/**
 * Response DTO for reminder settings
 */
export class CampaignReminderSettingResponseDto {
  id: string;
  campaignId: string;
  reminderType: ReminderType;
  isEnabled: boolean;
  sentAt?: Date;
  nextReminderAt?: Date;
  cooldownMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Response DTO for reminder logs (audit trail)
 */
export class CampaignReminderLogDto {
  id: string;
  userId: string;
  campaignId: string;
  reminderType: ReminderType;
  sentAt: Date;
}

/**
 * Batch response DTO for reminder operations
 */
export class ReminderBatchResponseDto {
  success: boolean;
  message: string;
  count?: number;
  timestamp: Date;
}
