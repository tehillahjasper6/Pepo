import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { DigestFrequency, DigestChannel } from '@prisma/client';
import { addDays, addWeeks, format, isBefore } from 'date-fns';

/**
 * Digest Notification Service
 * Manages daily and weekly digest notifications for users who follow NGOs.
 *
 * Configuration source: JSON schema (digest_frequencies, digest_channels, digest_content_scope)
 */
@Injectable()
export class DigestService {
  private readonly logger = new Logger(DigestService.name);

  // JSON-driven configuration - can be loaded from config service
  private readonly DIGEST_CONFIG = {
    frequencies: ['DAILY', 'WEEKLY'] as const,
    channels: ['IN_APP', 'EMAIL', 'PUSH'] as const,
    contentScope: {
      newPosts: true,
      campaigns: true,
      completed: false,
    },
    retentionDays: 30, // Keep digest preference records for 30 days
  };

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Get or create user digest preferences
   * @param userId User ID
   * @returns User digest preference
   */
  async getOrCreateDigestPreference(userId: string) {
    let pref = await this.prisma.userDigestPreference.findUnique({
      where: { userId },
    });

    if (!pref) {
      pref = await this.prisma.userDigestPreference.create({
        data: {
          userId,
          frequency: DigestFrequency.DAILY,
          isEnabled: true,
          channels: [DigestChannel.IN_APP],
          includeNewPosts: this.DIGEST_CONFIG.contentScope.newPosts,
          includeCampaigns: this.DIGEST_CONFIG.contentScope.campaigns,
          includeCompleted: this.DIGEST_CONFIG.contentScope.completed,
        },
      });
    }

    return pref;
  }

  /**
   * Update user digest preferences
   * @param userId User ID
   * @param updates Preference updates
   */
  async updateDigestPreference(
    userId: string,
    updates: {
      frequency?: DigestFrequency;
      isEnabled?: boolean;
      channels?: DigestChannel[];
      includeNewPosts?: boolean;
      includeCampaigns?: boolean;
      includeCompleted?: boolean;
    },
  ) {
    return this.prisma.userDigestPreference.update({
      where: { userId },
      data: updates,
    });
  }

  /**
   * Process pending digests for scheduled users
   * Called by scheduled job (every 6 hours or daily at specific time)
   * @returns Count of digests processed
   */
  async processPendingDigests(): Promise<number> {
    let processedCount = 0;

    try {
      // Find users with enabled digest preferences whose scheduled time has arrived
      const pendingDigests = await this.prisma.userDigestPreference.findMany({
        where: {
          isEnabled: true,
          nextScheduledAt: {
            lte: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      this.logger.log(`Found ${pendingDigests.length} pending digests to process`);

      for (const pref of pendingDigests) {
        try {
          await this.generateAndSendDigest(pref.userId, pref.frequency);
          processedCount++;
        } catch (error) {
          this.logger.error(
            `Failed to process digest for user ${pref.userId}:`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error in processPendingDigests:', error);
    }

    return processedCount;
  }

  /**
   * Generate and send digest for a user
   * @param userId User ID
   * @param frequency Digest frequency (DAILY/WEEKLY)
   */
  private async generateAndSendDigest(
    userId: string,
    frequency: DigestFrequency,
  ): Promise<void> {
    const pref = await this.getOrCreateDigestPreference(userId);

    // Calculate time window based on frequency
    const now = new Date();
    let timeWindowStart: Date;

    if (frequency === DigestFrequency.DAILY) {
      timeWindowStart = addDays(now, -1);
    } else if (frequency === DigestFrequency.WEEKLY) {
      timeWindowStart = addWeeks(now, -1);
    } else {
      throw new Error(`Unknown digest frequency: ${frequency}`);
    }

    // Collect digest content based on user preferences
    const digestContent = await this.buildDigestContent(
      userId,
      timeWindowStart,
      pref,
    );

    if (digestContent.items.length === 0) {
      this.logger.debug(
        `No content for ${frequency} digest for user ${userId}`,
      );
      // Still update scheduled time
      await this.scheduleNextDigest(userId, frequency);
      return;
    }

    // Send digest through enabled channels
    await this.sendDigestThroughChannels(userId, digestContent, pref);

    // Update last sent time and schedule next
    await this.prisma.userDigestPreference.update({
      where: { userId },
      data: {
        lastDigestSentAt: new Date(),
      },
    });

    await this.scheduleNextDigest(userId, frequency);

    this.logger.log(
      `Sent ${frequency} digest to user ${userId} with ${digestContent.items.length} items`,
    );
  }

  /**
   * Build digest content from followed NGOs
   * @param userId User ID
   * @param since Time window start
   * @param pref User preferences
   * @returns Digest content
   */
  private async buildDigestContent(
    userId: string,
    since: Date,
    pref: any,
  ): Promise<{
    items: any[];
    summary: {
      newPosts: number;
      campaigns: number;
      completed: number;
    };
  }> {
    const items: any[] = [];
    const summary = {
      newPosts: 0,
      campaigns: 0,
      completed: 0,
    };

    try {
      // Get NGOs this user follows
      const followedNGOs = await this.prisma.follow.findMany({
        where: { userId },
        select: { ngoId: true },
      });

      const ngoIds = followedNGOs.map((f) => f.ngoId);

      if (ngoIds.length === 0) {
        return { items, summary };
      }

      // If content scope includes new posts, fetch recent giveaways
      if (pref.includeNewPosts) {
        const newGiveaways = await this.prisma.giveaway.findMany({
          where: {
            userId: { in: ngoIds },
            publishedAt: {
              gte: since,
            },
          },
          include: {
            user: {
              include: {
                ngoProfile: true,
              },
            },
          },
          orderBy: { publishedAt: 'desc' },
          take: 20,
        });

        items.push(
          ...newGiveaways.map((g) => ({
            type: 'NEW_GIVEAWAY',
            id: g.id,
            title: g.title,
            ngo: g.user.ngoProfile?.organizationName,
            description: g.description,
            timestamp: g.publishedAt,
            link: `/giveaway/${g.id}`,
          })),
        );

        summary.newPosts = newGiveaways.length;
      }

      // If content scope includes campaigns, fetch active campaigns
      if (pref.includeCampaigns) {
        const activeCampaigns = await this.prisma.campaign.findMany({
          where: {
            ngoProfileId: { in: ngoIds },
            isActive: true,
            createdAt: {
              gte: since,
            },
          },
          include: {
            ngoProfile: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });

        items.push(
          ...activeCampaigns.map((c) => ({
            type: 'NEW_CAMPAIGN',
            id: c.id,
            title: c.title,
            ngo: c.ngoProfile.organizationName,
            description: c.description,
            timestamp: c.createdAt,
            link: `/campaign/${c.slug}`,
          })),
        );

        summary.campaigns = activeCampaigns.length;
      }

      // If content scope includes completed giveaways, fetch completions
      if (pref.includeCompleted) {
        const completedGiveaways = await this.prisma.giveaway.findMany({
          where: {
            userId: { in: ngoIds },
            status: 'COMPLETED',
            updatedAt: {
              gte: since,
            },
          },
          include: {
            user: {
              include: {
                ngoProfile: true,
              },
            },
            winners: true,
          },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        });

        items.push(
          ...completedGiveaways.map((g) => ({
            type: 'COMPLETED_GIVEAWAY',
            id: g.id,
            title: g.title,
            ngo: g.user.ngoProfile?.organizationName,
            winnersCount: g.winners.length,
            timestamp: g.updatedAt,
            link: `/giveaway/${g.id}`,
          })),
        );

        summary.completed = completedGiveaways.length;
      }

      // Sort items by timestamp, newest first
      items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      this.logger.error(`Error building digest content for user ${userId}:`, error);
    }

    return { items, summary };
  }

  /**
   * Send digest through enabled channels
   * @param userId User ID
   * @param digestContent Digest content
   * @param pref User preferences
   */
  private async sendDigestThroughChannels(
    userId: string,
    digestContent: any,
    pref: any,
  ): Promise<void> {
    for (const channel of pref.channels) {
      try {
        if (channel === DigestChannel.IN_APP) {
          await this.sendInAppDigest(userId, digestContent, pref.frequency);
        } else if (channel === DigestChannel.EMAIL) {
          await this.sendEmailDigest(userId, digestContent, pref.frequency);
        } else if (channel === DigestChannel.PUSH) {
          await this.sendPushDigest(userId, digestContent, pref.frequency);
        }
      } catch (error) {
        this.logger.error(
          `Failed to send ${channel} digest to user ${userId}:`,
          error,
        );
      }
    }
  }

  /**
   * Send in-app digest notification
   * @param userId User ID
   * @param digestContent Content
   * @param frequency Frequency
   */
  private async sendInAppDigest(
    userId: string,
    digestContent: any,
    frequency: DigestFrequency,
  ): Promise<void> {
    const summary = this.formatDigestSummary(digestContent.summary, frequency);

    await this.notificationsService.sendPushNotification(
      userId,
      `Your ${frequency.toLowerCase()} digest is ready`,
      summary,
      {
        type: 'DIGEST_SUMMARY',
        frequency,
        itemCount: digestContent.items.length,
        link: '/notifications/digests',
      },
    );
  }

  /**
   * Send email digest (placeholder - integrate with email service)
   * @param userId User ID
   * @param digestContent Content
   * @param frequency Frequency
   */
  private async sendEmailDigest(
    userId: string,
    digestContent: any,
    frequency: DigestFrequency,
  ): Promise<void> {
    // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
    this.logger.debug(`Would send email digest to user ${userId}`);
  }

  /**
   * Send push digest (placeholder - integrate with push service)
   * @param userId User ID
   * @param digestContent Content
   * @param frequency Frequency
   */
  private async sendPushDigest(
    userId: string,
    digestContent: any,
    frequency: DigestFrequency,
  ): Promise<void> {
    // TODO: Integrate with push notification service
    this.logger.debug(`Would send push digest to user ${userId}`);
  }

  /**
   * Schedule next digest for user
   * @param userId User ID
   * @param frequency Frequency
   */
  private async scheduleNextDigest(
    userId: string,
    frequency: DigestFrequency,
  ): Promise<void> {
    const now = new Date();
    let nextScheduledAt: Date;

    if (frequency === DigestFrequency.DAILY) {
      nextScheduledAt = addDays(now, 1);
    } else {
      nextScheduledAt = addWeeks(now, 1);
    }

    await this.prisma.userDigestPreference.update({
      where: { userId },
      data: { nextScheduledAt },
    });
  }

  /**
   * Format digest summary for display
   * @param summary Summary stats
   * @param frequency Frequency
   * @returns Formatted string
   */
  private formatDigestSummary(
    summary: any,
    frequency: DigestFrequency,
  ): string {
    const parts: string[] = [];

    if (summary.newPosts > 0) {
      parts.push(`${summary.newPosts} new items`);
    }
    if (summary.campaigns > 0) {
      parts.push(`${summary.campaigns} campaigns`);
    }
    if (summary.completed > 0) {
      parts.push(`${summary.completed} completions`);
    }

    const summary_text = parts.length > 0 ? parts.join(', ') : 'No new updates';
    return `${frequency.charAt(0).toUpperCase()}${frequency.slice(1).toLowerCase()} summary: ${summary_text}`;
  }

  /**
   * Get digest preferences for a user
   * @param userId User ID
   */
  async getDigestPreferences(userId: string) {
    return this.getOrCreateDigestPreference(userId);
  }

  /**
   * Toggle digest enabled/disabled
   * @param userId User ID
   * @param isEnabled Enable/disable
   */
  async toggleDigest(userId: string, isEnabled: boolean) {
    return this.updateDigestPreference(userId, { isEnabled });
  }

  /**
   * Update digest frequency
   * @param userId User ID
   * @param frequency New frequency
   */
  async updateDigestFrequency(userId: string, frequency: DigestFrequency) {
    return this.updateDigestPreference(userId, { frequency });
  }

  /**
   * Update digest channels
   * @param userId User ID
   * @param channels New channels
   */
  async updateDigestChannels(userId: string, channels: DigestChannel[]) {
    return this.updateDigestPreference(userId, { channels });
  }

  /**
   * Update content scope
   * @param userId User ID
   * @param scope Content scope options
   */
  async updateContentScope(
    userId: string,
    scope: {
      includeNewPosts?: boolean;
      includeCampaigns?: boolean;
      includeCompleted?: boolean;
    },
  ) {
    return this.updateDigestPreference(userId, scope);
  }
}
