import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Enhanced Gamification & Badges Service
 * Manages achievement badges, milestones, and gamification elements
 */
@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Badge Definitions
   */
  private readonly badges = {
    // Trust & Safety
    verified_email: {
      id: 'verified_email',
      name: 'Email Verified',
      description: 'Completed email verification',
      icon: '📧',
      color: 'blue',
      category: 'trust',
      points: 5,
    },
    verified_phone: {
      id: 'verified_phone',
      name: 'Phone Verified',
      description: 'Completed phone verification',
      icon: '📱',
      color: 'purple',
      category: 'trust',
      points: 10,
    },
    verified_id: {
      id: 'verified_id',
      name: 'ID Verified',
      description: 'Completed government ID verification',
      icon: '🪪',
      color: 'green',
      category: 'trust',
      points: 20,
    },
    fully_verified: {
      id: 'fully_verified',
      name: 'Fully Verified',
      description: 'Completed all verification steps',
      icon: '✅',
      color: 'gold',
      category: 'trust',
      points: 50,
    },

    // Giving Milestones
    first_giveaway: {
      id: 'first_giveaway',
      name: 'First Giver',
      description: 'Created your first giveaway',
      icon: '🎁',
      color: 'green',
      category: 'giving',
      points: 10,
    },
    giveaway_10: {
      id: 'giveaway_10',
      name: '10 Giveaways',
      description: 'Created 10 giveaways',
      icon: '🎊',
      color: 'green',
      category: 'giving',
      points: 25,
    },
    giveaway_50: {
      id: 'giveaway_50',
      name: '50 Giveaways',
      description: 'Created 50 giveaways',
      icon: '🌟',
      color: 'gold',
      category: 'giving',
      points: 100,
    },
    prolific_giver: {
      id: 'prolific_giver',
      name: 'Prolific Giver',
      description: 'Created 100 giveaways',
      icon: '⭐',
      color: 'platinum',
      category: 'giving',
      points: 250,
    },

    // Receiving
    first_received: {
      id: 'first_received',
      name: 'First Receiver',
      description: 'Received your first item',
      icon: '📥',
      color: 'blue',
      category: 'receiving',
      points: 10,
    },

    // Feedback & Trust
    trusted_giver: {
      id: 'trusted_giver',
      name: 'Trusted Giver',
      description: 'Received 10 positive feedback ratings',
      icon: '👍',
      color: 'green',
      category: 'trust',
      points: 50,
    },
    trusted_receiver: {
      id: 'trusted_receiver',
      name: 'Trusted Receiver',
      description: 'Received 10 positive feedback from givers',
      icon: '🙏',
      color: 'green',
      category: 'trust',
      points: 50,
    },

    // Environmental Impact
    eco_warrior: {
      id: 'eco_warrior',
      name: 'Eco Warrior',
      description: 'Saved 100kg of CO2 through sharing',
      icon: '🌱',
      color: 'green',
      category: 'environment',
      points: 50,
    },
    eco_champion: {
      id: 'eco_champion',
      name: 'Eco Champion',
      description: 'Saved 500kg of CO2 through sharing',
      icon: '🌍',
      color: 'green',
      category: 'environment',
      points: 150,
    },

    // Community
    community_builder: {
      id: 'community_builder',
      name: 'Community Builder',
      description: 'Started a neighborhood circle',
      icon: '👥',
      color: 'blue',
      category: 'community',
      points: 25,
    },
    active_member: {
      id: 'active_member',
      name: 'Active Member',
      description: 'Participated in 5 neighborhood circles',
      icon: '🤝',
      color: 'blue',
      category: 'community',
      points: 50,
    },
    circle_organizer: {
      id: 'circle_organizer',
      name: 'Circle Organizer',
      description: 'Organized community events in your circle',
      icon: '🎯',
      color: 'gold',
      category: 'community',
      points: 75,
    },

    // Engagement
    responsive: {
      id: 'responsive',
      name: 'Responsive',
      description: 'Replied to 20 messages within 1 hour',
      icon: '⚡',
      color: 'purple',
      category: 'engagement',
      points: 25,
    },
    active_daily: {
      id: 'active_daily',
      name: 'Daily Active',
      description: 'Used Pepo for 7 consecutive days',
      icon: '📅',
      color: 'blue',
      category: 'engagement',
      points: 15,
    },

    // NGO Support
    ngo_supporter: {
      id: 'ngo_supporter',
      name: 'NGO Supporter',
      description: 'Donated to an NGO through Pepo',
      icon: '❤️',
      color: 'red',
      category: 'impact',
      points: 50,
    },
  };

  /**
   * Get all available badges
   */
  async getAllBadges() {
    return Object.values(this.badges);
  }

  /**
   * Get badge by ID
   */
  async getBadgeById(badgeId: string) {
    return this.badges[badgeId as keyof typeof this.badges] || null;
  }

  /**
   * Get user's earned badges
   */
  async getUserBadges(userId: string) {
    // Fetch badge assignments from DB and include badge definition
    const assignments = await this.prisma.badgeAssignment.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { awardedAt: 'desc' },
    });

    return assignments.map((a) => ({
      ...this.badges[a.badgeId as keyof typeof this.badges],
      awardedAt: a.awardedAt,
      progress: this.calculateProgress(a.badgeId, userId),
    }));
  }

  /**
   * Award badge to user (with duplicate check)
   */
  async awardBadge(
    userId: string,
    badgeId: string
  ): Promise<{ awarded: boolean; message: string }> {
    // Check if already earned
    const existing = await this.prisma.badgeAssignment.findFirst({
      where: { userId, badgeId },
    });

    if (existing) {
      return { awarded: false, message: 'Badge already earned' };
    }

    // Award badge
    await this.prisma.badgeAssignment.create({
      data: {
        userId,
        badgeId,
        awardedAt: new Date(),
      },
    });

    // Add points
    const badge = this.badges[badgeId as keyof typeof this.badges];
    if (badge) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          gamificationPoints: {
            increment: badge.points,
          },
        },
      });
    }

    return { awarded: true, message: `You earned the ${badge?.name} badge!` };
  }

  /**
   * Check and award badges based on achievements
   */
  async checkAndAwardBadges(userId: string): Promise<string[]> {
    const awarded: string[] = [];

    // TODO: Implement logic to check various conditions:
    // - Giveaway count milestones
    // - Feedback ratings
    // - Environmental impact
    // - Community participation
    // - Engagement metrics

    return awarded;
  }

  /**
   * Get user's gamification stats
   */
  async getGamificationStats(userId: string) {
    // TODO: Fetch from database
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        gamificationPoints: true,
      },
    });

    const badges = await this.getUserBadges(userId);
    const level = this.calculateLevel(user?.gamificationPoints || 0);
    const nextLevelPoints = (level + 1) * 500;
    const currentLevelProgress =
      ((user?.gamificationPoints || 0) % 500) / 500;

    return {
      totalPoints: user?.gamificationPoints || 0,
      level,
      nextLevelPoints,
      currentLevelProgress,
      badgesEarned: badges.length,
      totalBadgesAvailable: Object.keys(this.badges).length,
      badges,
      streaks: await this.getStreaks(userId),
      achievements: await this.getAchievements(userId),
    };
  }

  /**
   * Get leaderboards (community focused, not competitive)
   */
  async getLeaderboards(
    metric: 'environmental' | 'giving' | 'engagement' | 'trust',
    limit = 10
  ) {
    // TODO: Implement leaderboards
    // Design as non-competitive community recognition:
    // - Environmental impact leaderboard
    // - Most giveaways leaderboard
    // - Community contributions
    // - Trust score rankings

    return [];
  }

  /**
   * Get user's achievements
   */
  private async getAchievements(userId: string) {
    // TODO: Fetch achievement data
    return {
      giveawaysCreated: 0,
      itemsGiven: 0,
      itemsReceived: 0,
      totalCO2Saved: 0,
      circlesJoined: 0,
      feedbackGiven: 0,
      positiveRatings: 0,
    };
  }

  /**
   * Get user's streaks
   */
  private async getStreaks(userId: string) {
    // TODO: Calculate active day streaks
    return {
      currentDayStreak: 0,
      longestDayStreak: 0,
      giveawayStreak: 0,
      feedbackStreak: 0,
    };
  }

  /**
   * Calculate level from points
   */
  private calculateLevel(points: number): number {
    return Math.floor(points / 500) + 1;
  }

  /**
   * Calculate progress towards badge
   */
  private calculateProgress(badgeId: string, userId: string): number {
    // TODO: Implement progress calculation for in-progress badges
    return 100; // Placeholder
  }

  /**
   * Get badge progress details
   */
  async getBadgeProgress(userId: string, badgeId: string) {
    const badge = this.badges[badgeId as keyof typeof this.badges];
    if (!badge) {
      return null;
    }

    // Check if earned
    const earned = await this.prisma.badgeAssignment.findFirst({
      where: { userId, badgeId },
    });

    return {
      badge,
      earned: !!earned,
      earnedAt: earned?.awardedAt,
      progress: await this.getBadgeProgressPercentage(userId, badgeId),
    };
  }

  /**
   * Calculate percentage progress towards badge
   */
  private async getBadgeProgressPercentage(
    userId: string,
    badgeId: string
  ): Promise<number> {
    // TODO: Implement specific progress calculations per badge
    // Example:
    // - giveaway_10: (giveawayCount / 10) * 100
    // - trusted_giver: (positiveRatings / 10) * 100
    // - eco_warrior: (co2Saved / 100) * 100

    return 0;
  }
}
