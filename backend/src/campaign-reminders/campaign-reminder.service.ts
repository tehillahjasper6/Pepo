import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReminderType } from '@prisma/client';
import { addDays, addHours, differenceInDays, differenceInHours } from 'date-fns';

/**
 * Campaign Reminder Service
 * Manages campaign launch and ending reminders for users following NGOs.
 *
 * Configuration source: JSON schema (campaign_reminders, reminder_intervals)
 */
@Injectable()
export class CampaignReminderService {
  private readonly logger = new Logger(CampaignReminderService.name);

  // JSON-driven configuration
  private readonly REMINDER_CONFIG = {
    reminderTypes: [
      'CAMPAIGN_LAUNCH_7DAYS',
      'CAMPAIGN_LAUNCH_24HOURS',
      'CAMPAIGN_LAUNCH_SAME_DAY',
      'CAMPAIGN_ENDING',
      'CAMPAIGN_LAUNCH_SOON',
    ] as const,
    reminderIntervals: {
      CAMPAIGN_LAUNCH_7DAYS: 7 * 24 * 60, // 7 days in minutes
      CAMPAIGN_LAUNCH_24HOURS: 24 * 60, // 24 hours in minutes
      CAMPAIGN_LAUNCH_SAME_DAY: 60, // 1 hour in minutes (sent same day)
      CAMPAIGN_ENDING: 24 * 60, // 24 hours before end
      CAMPAIGN_LAUNCH_SOON: 30 * 24 * 60, // 30 days before launch
    },
    cooldownMinutes: 60, // Prevent duplicate reminders within 1 hour
  };

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Process pending campaign reminders
   * Called by scheduled job (every hour)
   * @returns Count of reminders sent
   */
  async processPendingReminders(): Promise<number> {
    let remindersCount = 0;

    try {
      // Get all campaigns that are within reminder windows
      const campaigns = await this.prisma.campaign.findMany({
        where: {
          isActive: true,
        },
        include: {
          reminderSettings: true,
          ngoProfile: {
            include: {
              followers: true,
            },
          },
        },
      });

      this.logger.log(`Checking ${campaigns.length} campaigns for reminders`);

      for (const campaign of campaigns) {
        try {
          await this.processCampaignReminders(campaign);
          remindersCount++;
        } catch (error) {
          this.logger.error(
            `Failed to process reminders for campaign ${campaign.id}:`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error in processPendingReminders:', error);
    }

    return remindersCount;
  }

  /**
   * Process reminders for a specific campaign
   * @param campaign Campaign with relationships
   */
  private async processCampaignReminders(campaign: any): Promise<void> {
    const now = new Date();

    // Evaluate each reminder type
    for (const reminderType of this.REMINDER_CONFIG.reminderTypes) {
      const shouldSend = this.shouldSendReminder(campaign, reminderType, now);

      if (shouldSend) {
        await this.sendReminder(campaign, reminderType);
      }
    }
  }

  /**
   * Determine if reminder should be sent for a campaign
   * @param campaign Campaign
   * @param reminderType Reminder type
   * @param now Current date
   * @returns Whether to send reminder
   */
  private shouldSendReminder(
    campaign: any,
    reminderType: string,
    now: Date,
  ): boolean {
    const launchDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);

    let shouldSend = false;
    let daysUntilEvent = 0;

    switch (reminderType) {
      case 'CAMPAIGN_LAUNCH_7DAYS':
        daysUntilEvent = differenceInDays(launchDate, now);
        shouldSend = daysUntilEvent === 7;
        break;

      case 'CAMPAIGN_LAUNCH_24HOURS':
        daysUntilEvent = differenceInDays(launchDate, now);
        shouldSend = daysUntilEvent === 1;
        break;

      case 'CAMPAIGN_LAUNCH_SAME_DAY':
        daysUntilEvent = differenceInDays(launchDate, now);
        shouldSend = daysUntilEvent === 0 && launchDate > now;
        break;

      case 'CAMPAIGN_ENDING':
        daysUntilEvent = differenceInDays(endDate, now);
        shouldSend = daysUntilEvent === 1;
        break;

      case 'CAMPAIGN_LAUNCH_SOON':
        daysUntilEvent = differenceInDays(launchDate, now);
        shouldSend = daysUntilEvent === 30;
        break;
    }

    return shouldSend;
  }

  /**
   * Send reminders to all followers of campaign's NGO
   * @param campaign Campaign
   * @param reminderType Reminder type
   */
  private async sendReminder(campaign: any, reminderType: string): Promise<void> {
    try {
      // Get all followers of this NGO
      const followers = await this.prisma.follow.findMany({
        where: { ngoId: campaign.ngoProfileId },
        select: { userId: true },
      });

      this.logger.log(
        `Sending ${reminderType} reminder for campaign ${campaign.id} to ${followers.length} followers`,
      );

      for (const follower of followers) {
        try {
          // Check if reminder has already been sent (idempotency check)
          const existingReminder = await this.hasRecentReminder(
            follower.userId,
            campaign.id,
            reminderType,
          );

          if (existingReminder) {
            continue;
          }

          // Send the reminder
          await this.sendReminderToUser(
            follower.userId,
            campaign,
            reminderType,
          );

          // Log the reminder to prevent duplicates
          await this.logReminderSent(
            follower.userId,
            campaign.id,
            reminderType,
          );
        } catch (error) {
          this.logger.error(
            `Failed to send ${reminderType} reminder to user ${follower.userId}:`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Error sending reminders for campaign ${campaign.id}:`,
        error,
      );
    }
  }

  /**
   * Check if reminder was recently sent (within cooldown window)
   * @param userId User ID
   * @param campaignId Campaign ID
   * @param reminderType Reminder type
   * @returns Whether reminder was recently sent
   */
  private async hasRecentReminder(
    userId: string,
    campaignId: string,
    reminderType: string,
  ): Promise<boolean> {
    const cooldownThreshold = addHours(
      new Date(),
      -this.REMINDER_CONFIG.cooldownMinutes / 60,
    );

    const existingLog = await this.prisma.campaignReminderLog.findFirst({
      where: {
        userId,
        campaignId,
        reminderType: reminderType as ReminderType,
        sentAt: {
          gte: cooldownThreshold,
        },
      },
    });

    return !!existingLog;
  }

  /**
   * Send reminder notification to user
   * @param userId User ID
   * @param campaign Campaign
   * @param reminderType Reminder type
   */
  private async sendReminderToUser(
    userId: string,
    campaign: any,
    reminderType: string,
  ): Promise<void> {
    const title = this.getReminderTitle(campaign, reminderType);
    const body = this.getReminderBody(campaign, reminderType);

    await this.notificationsService.sendPushNotification(
      userId,
      title,
      body,
      {
        type: 'CAMPAIGN_REMINDER',
        campaignId: campaign.id,
        reminderType,
        link: `/campaign/${campaign.slug}`,
      },
    );

    this.logger.debug(`Sent ${reminderType} reminder to user ${userId}`);
  }

  /**
   * Get reminder notification title
   * @param campaign Campaign
   * @param reminderType Reminder type
   * @returns Title
   */
  private getReminderTitle(campaign: any, reminderType: string): string {
    const campaignName = campaign.title;

    switch (reminderType) {
      case 'CAMPAIGN_LAUNCH_7DAYS':
        return `${campaignName} launching in 7 days`;
      case 'CAMPAIGN_LAUNCH_24HOURS':
        return `${campaignName} launches tomorrow!`;
      case 'CAMPAIGN_LAUNCH_SAME_DAY':
        return `${campaignName} is launching today`;
      case 'CAMPAIGN_ENDING':
        return `${campaignName} ends tomorrow`;
      case 'CAMPAIGN_LAUNCH_SOON':
        return `Coming soon: ${campaignName}`;
      default:
        return 'Campaign reminder';
    }
  }

  /**
   * Get reminder notification body
   * @param campaign Campaign
   * @param reminderType Reminder type
   * @returns Body
   */
  private getReminderBody(campaign: any, reminderType: string): string {
    switch (reminderType) {
      case 'CAMPAIGN_LAUNCH_7DAYS':
        return `Get ready to participate in ${campaign.title}. It launches in one week!`;
      case 'CAMPAIGN_LAUNCH_24HOURS':
        return `${campaign.title} launches tomorrow. Prepare your participation!`;
      case 'CAMPAIGN_LAUNCH_SAME_DAY':
        return `${campaign.title} is live now. Don't miss out!`;
      case 'CAMPAIGN_ENDING':
        return `Hurry! ${campaign.title} ends tomorrow. Participate now!`;
      case 'CAMPAIGN_LAUNCH_SOON':
        return `An exciting campaign is coming soon from your favorite NGO.`;
      default:
        return 'Tap to view campaign details';
    }
  }

  /**
   * Log reminder sent (for idempotency)
   * @param userId User ID
   * @param campaignId Campaign ID
   * @param reminderType Reminder type
   */
  private async logReminderSent(
    userId: string,
    campaignId: string,
    reminderType: string,
  ): Promise<void> {
    await this.prisma.campaignReminderLog.create({
      data: {
        userId,
        campaignId,
        reminderType: reminderType as ReminderType,
        sentAt: new Date(),
      },
    });
  }

  /**
   * Get campaign reminder settings
   * @param campaignId Campaign ID
   */
  async getCampaignReminderSettings(campaignId: string) {
    return this.prisma.campaignReminderSetting.findMany({
      where: { campaignId },
    });
  }

  /**
   * Update campaign reminder settings
   * @param campaignId Campaign ID
   * @param reminderType Reminder type
   * @param isEnabled Enable/disable
   */
  async updateCampaignReminderSetting(
    campaignId: string,
    reminderType: ReminderType,
    isEnabled: boolean,
  ) {
    return this.prisma.campaignReminderSetting.upsert({
      where: {
        campaignId_reminderType: {
          campaignId,
          reminderType,
        },
      },
      create: {
        campaignId,
        reminderType,
        isEnabled,
      },
      update: {
        isEnabled,
      },
    });
  }

  /**
   * Disable all reminders for a campaign
   * @param campaignId Campaign ID
   */
  async disableCampaignReminders(campaignId: string) {
    return this.prisma.campaignReminderSetting.updateMany({
      where: { campaignId },
      data: { isEnabled: false },
    });
  }

  /**
   * Get reminder logs for a campaign
   * @param campaignId Campaign ID
   * @returns Reminder logs
   */
  async getCampaignReminderLogs(campaignId: string) {
    return this.prisma.campaignReminderLog.findMany({
      where: { campaignId },
      orderBy: { sentAt: 'desc' },
      take: 100,
    });
  }

  /**
   * Clean up old reminder logs (retention policy)
   * @param retentionDays Days to retain
   * @returns Count deleted
   */
  async cleanupOldReminderLogs(retentionDays: number = 90): Promise<number> {
    const cutoffDate = addDays(new Date(), -retentionDays);

    const result = await this.prisma.campaignReminderLog.deleteMany({
      where: {
        sentAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}
