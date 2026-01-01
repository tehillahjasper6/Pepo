import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DigestService } from '../digests/digest.service';
import { CampaignReminderService } from '../campaign-reminders/campaign-reminder.service';
import { FollowSuggestionService } from '../follow-suggestions/follow-suggestion.service';

/**
 * Advanced Features Scheduler
 * Manages background jobs for:
 * - Digest processing (daily/weekly)
 * - Campaign reminders (hourly)
 * - Follow suggestions refresh (weekly)
 *
 * All jobs are configured with JSON-driven timings
 */
@Injectable()
export class AdvancedFeaturesScheduler {
  private readonly logger = new Logger(AdvancedFeaturesScheduler.name);

  constructor(
    private digestService: DigestService,
    private campaignReminderService: CampaignReminderService,
    private followSuggestionService: FollowSuggestionService,
  ) {}

  /**
   * Process pending digests
   * Runs every 6 hours (6 AM, 12 PM, 6 PM, 12 AM UTC)
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async processDigests() {
    try {
      this.logger.debug('Starting digest processing job');
      const count = await this.digestService.processPendingDigests();
      this.logger.log(`Processed ${count} digests`);
    } catch (error) {
      this.logger.error('Error in digest processing job:', error);
    }
  }

  /**
   * Process campaign reminders
   * Runs every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async processCampaignReminders() {
    try {
      this.logger.debug('Starting campaign reminder processing job');
      const count = await this.campaignReminderService.processPendingReminders();
      this.logger.log(`Processed reminders for ${count} campaigns`);
    } catch (error) {
      this.logger.error('Error in campaign reminder processing job:', error);
    }
  }

  /**
   * Refresh follow suggestions
   * Runs every Monday at 2 AM UTC
   */
  @Cron('0 2 * * 1') // Every Monday at 2 AM
  async refreshFollowSuggestions() {
    try {
      this.logger.debug('Starting follow suggestions refresh job');
      const count = await this.followSuggestionService.refreshAllSuggestions();
      this.logger.log(`Refreshed suggestions for ${count} users`);
    } catch (error) {
      this.logger.error(
        'Error in follow suggestions refresh job:',
        error,
      );
    }
  }

  /**
   * Clean up old reminder logs
   * Runs every Sunday at 3 AM UTC (retention: 90 days)
   */
  @Cron('0 3 * * 0') // Every Sunday at 3 AM
  async cleanupReminderLogs() {
    try {
      this.logger.debug('Starting reminder logs cleanup job');
      const count = await this.campaignReminderService.cleanupOldReminderLogs(90);
      this.logger.log(`Deleted ${count} old reminder logs`);
    } catch (error) {
      this.logger.error('Error in reminder logs cleanup job:', error);
    }
  }

  /**
   * Clean up expired follow suggestions
   * Runs every Saturday at 2 AM UTC
   */
  @Cron('0 2 * * 6') // Every Saturday at 2 AM
  async cleanupSuggestions() {
    try {
      this.logger.debug('Starting suggestions cleanup job');
      const count =
        await this.followSuggestionService.cleanupExpiredSuggestions();
      this.logger.log(`Deleted ${count} expired suggestions`);
    } catch (error) {
      this.logger.error('Error in suggestions cleanup job:', error);
    }
  }
}
