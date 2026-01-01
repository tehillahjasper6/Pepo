import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addDays, addHours } from 'date-fns';

/**
 * Follow Suggestion Service
 * Generates intelligent NGO follow suggestions based on user behavior and preferences.
 *
 * Uses weighted signals from:
 * - User's participation history
 * - Category interests
 * - Geographic proximity
 * - NGO popularity/trust score
 *
 * Configuration source: JSON schema (suggestion_signals, confidence_weights)
 */
@Injectable()
export class FollowSuggestionService {
  private readonly logger = new Logger(FollowSuggestionService.name);

  // JSON-driven configuration for signal weighting
  private readonly SIGNAL_CONFIG = {
    signals: {
      popularity: { weight: 0.2, description: 'NGO popularity/followers' },
      category_match: { weight: 0.25, description: 'User interests alignment' },
      location_proximity: {
        weight: 0.15,
        description: 'Geographic proximity',
      },
      participation_history: {
        weight: 0.25,
        description: 'Similar participation patterns',
      },
      trust_score: { weight: 0.15, description: 'NGO trust/verification status' },
    },
    confidenceThreshold: 0.5, // Minimum confidence to show suggestion
    maxSuggestionsPerUser: 20, // Max suggestions to generate
    suggestionExpiryDays: 30, // How long suggestion remains valid
    minFollowersForSuggestion: 5, // Min followers before suggesting
  };

  constructor(private prisma: PrismaService) {}

  /**
   * Generate suggestions for a specific user
   * @param userId User ID
   * @returns Generated suggestions
   */
  async generateSuggestionsForUser(userId: string): Promise<any[]> {
    try {
      this.logger.log(`Generating suggestions for user ${userId}`);

      // Get user's current follows
      const userFollows = await this.prisma.follow.findMany({
        where: { userId },
        select: { ngoId: true },
      });

      const followedNgoIds = userFollows.map((f) => f.ngoId);

      // Get all NGOs user doesn't follow
      const allNgos = await this.prisma.nGOProfile.findMany({
        where: {
          id: {
            notIn: followedNgoIds,
          },
          followers: {
            some: {}, // Has at least one follower
          },
        },
        include: {
          _count: {
            select: { followers: true },
          },
        },
        take: 100,
      });

      this.logger.debug(
        `Found ${allNgos.length} potential NGOs to suggest for user ${userId}`,
      );

      const suggestions: any[] = [];

      for (const ngo of allNgos) {
        try {
          const scores = await this.calculateSignalScores(userId, ngo);
          const confidenceScore = this.calculateConfidenceScore(scores);

          if (confidenceScore >= this.SIGNAL_CONFIG.confidenceThreshold) {
            suggestions.push({
              ngo,
              confidenceScore,
              signalWeight: scores,
            });
          }
        } catch (error) {
          this.logger.error(
            `Error calculating scores for NGO ${ngo.id}:`,
            error,
          );
        }
      }

      // Sort by confidence score and take top suggestions
      suggestions.sort((a, b) => b.confidenceScore - a.confidenceScore);
      const topSuggestions = suggestions.slice(
        0,
        this.SIGNAL_CONFIG.maxSuggestionsPerUser,
      );

      // Clear old suggestions and create new ones
      await this.prisma.followSuggestion.deleteMany({
        where: { userId },
      });

      // Save suggestions to database
      for (const suggestion of topSuggestions) {
        try {
          await this.prisma.followSuggestion.create({
            data: {
              userId,
              suggestedNGOId: suggestion.ngo.id,
              confidenceScore: suggestion.confidenceScore,
              reason: this.generateReason(suggestion.signalWeight),
              signalWeight: suggestion.signalWeight,
              expiresAt: addDays(new Date(), this.SIGNAL_CONFIG.suggestionExpiryDays),
            },
          });
        } catch (error) {
          this.logger.error(
            `Error saving suggestion for NGO ${suggestion.ngo.id}:`,
            error,
          );
        }
      }

      this.logger.log(
        `Generated ${topSuggestions.length} suggestions for user ${userId}`,
      );
      return topSuggestions;
    } catch (error) {
      this.logger.error(`Error generating suggestions for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Calculate weighted scores for all signals
   * @param userId User ID
   * @param ngo NGO Profile
   * @returns Signal scores
   */
  private async calculateSignalScores(userId: string, ngo: any): Promise<any> {
    return {
      popularity: await this.calculatePopularityScore(ngo),
      category_match: await this.calculateCategoryMatchScore(userId, ngo),
      location_proximity: await this.calculateLocationProximityScore(userId, ngo),
      participation_history: await this.calculateParticipationHistoryScore(
        userId,
        ngo,
      ),
      trust_score: await this.calculateTrustScore(ngo),
    };
  }

  /**
   * Calculate NGO popularity score (0-1)
   * Based on follower count
   * @param ngo NGO Profile
   * @returns Score 0-1
   */
  private async calculatePopularityScore(ngo: any): Promise<number> {
    try {
      // Get follower count
      const followerCount = ngo._count?.followers || 0;

      // Get average follower count across all NGOs
      const allNgos = await this.prisma.nGOProfile.findMany({
        select: {
          id: true,
          _count: {
            select: { followers: true },
          },
        },
      });

      const totalFollowers = allNgos.reduce(
        (sum, n) => sum + (n._count?.followers || 0),
        0,
      );
      const avgFollowers = totalFollowers / Math.max(allNgos.length, 1);

      // Normalize to 0-1 score
      const score = Math.min(followerCount / Math.max(avgFollowers * 2, 1), 1);
      return Math.round(score * 100) / 100;
    } catch (error) {
      this.logger.error('Error calculating popularity score:', error);
      return 0.5; // Default middle score
    }
  }

  /**
   * Calculate category match score (0-1)
   * Based on user's interests and NGO's focus areas
   * @param userId User ID
   * @param ngo NGO Profile
   * @returns Score 0-1
   */
  private async calculateCategoryMatchScore(
    userId: string,
    ngo: any,
  ): Promise<number> {
    try {
      // Get user's interests from followed NGOs
      const userFollows = await this.prisma.follow.findMany({
        where: { userId },
        include: {
          ngo: true,
        },
      });

      if (userFollows.length === 0) {
        return 0.5; // Neutral score if no follows yet
      }

      // Extract categories from followed NGOs
      const userCategories = userFollows
        .map((f) => f.ngo.focusAreas)
        .filter(Boolean)
        .flat();

      // Check if suggested NGO matches user's categories
      if (ngo.focusAreas && userCategories.some((cat: string) => ngo.focusAreas.includes(cat))) {
        return 0.9; // High match
      }

      // Partial match based on similar NGOs
      const similarNgos = await this.prisma.nGOProfile.findMany({
        where: {
          focusAreas: {
            hasSome: ngo.focusAreas || [],
          },
        },
        take: 1,
      });

      return similarNgos.length > 0 ? 0.7 : 0.4;
    } catch (error) {
      this.logger.error('Error calculating category match score:', error);
      return 0.5;
    }
  }

  /**
   * Calculate location proximity score (0-1)
   * Based on user's location and NGO's operating areas
   * @param userId User ID
   * @param ngo NGO Profile
   * @returns Score 0-1
   */
  private async calculateLocationProximityScore(
    userId: string,
    ngo: any,
  ): Promise<number> {
    try {
      // Get user's location
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { city: true },
      });

      if (!user || !user.city) {
        return 0.5; // Neutral if location unknown
      }

      // Check if NGO operates in user's location
      if (ngo.city === user.city) {
        return 0.8;
      }

      // Different city
      return 0.3;
    } catch (error) {
      this.logger.error('Error calculating location proximity score:', error);
      return 0.5;
    }
  }

  /**
   * Calculate participation history score (0-1)
   * Based on user's giveaway participation patterns
   * @param userId User ID
   * @param ngo NGO Profile
   * @returns Score 0-1
   */
  private async calculateParticipationHistoryScore(
    userId: string,
    ngo: any,
  ): Promise<number> {
    try {
      // Get NGO's giveaways
      const ngoGiveaways = await this.prisma.giveaway.findMany({
        where: {
          userId: ngo.id,
        },
        select: { id: true },
      });

      if (ngoGiveaways.length === 0) {
        return 0.5; // No giveaways yet
      }

      // Check if user has participated in similar giveaways
      const ngoGiveawayIds = ngoGiveaways.map((g) => g.id);

      const userParticipations = await this.prisma.participant.count({
        where: {
          userId,
          giveawayId: {
            in: ngoGiveawayIds,
          },
        },
      });

      // If user already participated, lower score (avoid re-recommending)
      if (userParticipations > 0) {
        return 0.2;
      }

      // Check if user participates in similar giveaways
      const userParticipationCount = await this.prisma.participant.count({
        where: { userId },
      });

      if (userParticipationCount === 0) {
        return 0.5; // No participation history
      }

      // User is active, moderate match
      return 0.7;
    } catch (error) {
      this.logger.error('Error calculating participation history score:', error);
      return 0.5;
    }
  }

  /**
   * Calculate NGO trust score (0-1)
   * Based on verification status, ratings, etc.
   * @param ngo NGO Profile
   * @returns Score 0-1
   */
  private async calculateTrustScore(ngo: any): Promise<number> {
    try {
      let score = 0.5; // Base score

      // Boost for verified NGOs
      if (ngo.isVerified) {
        score += 0.3;
      }

      // Boost for trust badge
      if (ngo.trustScore && ngo.trustScore > 0) {
        score = Math.max(
          score,
          Math.min(ngo.trustScore / 100, 1), // Normalize 0-100 to 0-1
        );
      }

      return Math.min(score, 1);
    } catch (error) {
      this.logger.error('Error calculating trust score:', error);
      return 0.5;
    }
  }

  /**
   * Calculate overall confidence score from signal weights
   * @param scores Signal scores
   * @returns Confidence score 0-1
   */
  private calculateConfidenceScore(scores: any): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const [signal, config] of Object.entries(
      this.SIGNAL_CONFIG.signals,
    )) {
      const weight = (config as any).weight;
      const score = scores[signal] || 0;
      totalScore += score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Generate human-readable reason for suggestion
   * @param scores Signal scores
   * @returns Reason string
   */
  private generateReason(scores: any): string {
    const topSignals = Object.entries(scores)
      .map(([signal, score]) => [
        signal,
        score,
        (this.SIGNAL_CONFIG.signals as any)[signal].description,
      ])
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 2);

    const reasons = topSignals
      .map((s) => (s[2] as string).toLowerCase())
      .join(' and ');

    return `Based on your ${reasons}`;
  }

  /**
   * Get suggestions for a user
   * @param userId User ID
   */
  async getSuggestionsForUser(
    userId: string,
    options: {
      limit?: number;
      includeExpired?: boolean;
    } = {},
  ) {
    return this.prisma.followSuggestion.findMany({
      where: {
        userId,
        ...(options.includeExpired
          ? {}
          : {
              expiresAt: {
                gt: new Date(),
              },
            }),
      },
      include: {
        ngo: true,
      },
      orderBy: { confidenceScore: 'desc' },
      take: options.limit || 10,
    });
  }

  /**
   * Mark suggestion as viewed
   * @param suggestionId Suggestion ID
   */
  async markSuggestionAsViewed(suggestionId: string) {
    return this.prisma.followSuggestion.update({
      where: { id: suggestionId },
      data: { isViewed: true },
    });
  }

  /**
   * Mark suggestion as followed
   * @param suggestionId Suggestion ID
   */
  async markSuggestionAsFollowed(suggestionId: string) {
    return this.prisma.followSuggestion.update({
      where: { id: suggestionId },
      data: { isFollowed: true },
    });
  }

  /**
   * Mark suggestion as ignored
   * @param suggestionId Suggestion ID
   */
  async markSuggestionAsIgnored(suggestionId: string) {
    return this.prisma.followSuggestion.update({
      where: { id: suggestionId },
      data: { isIgnored: true },
    });
  }

  /**
   * Clean up expired suggestions
   * @returns Count deleted
   */
  async cleanupExpiredSuggestions(): Promise<number> {
    const result = await this.prisma.followSuggestion.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  /**
   * Refresh suggestions for all active users
   * Called by scheduled job (weekly)
   * @returns Count of users processed
   */
  async refreshAllSuggestions(): Promise<number> {
    try {
      // Get all users who have follows (active users)
      const activeUsers = await this.prisma.follow.findMany({
        distinct: ['userId'],
        select: { userId: true },
      });

      this.logger.log(`Refreshing suggestions for ${activeUsers.length} users`);

      let processedCount = 0;

      for (const { userId } of activeUsers) {
        try {
          await this.generateSuggestionsForUser(userId);
          processedCount++;
        } catch (error) {
          this.logger.error(
            `Failed to refresh suggestions for user ${userId}:`,
            error,
          );
        }
      }

      // Clean up expired suggestions
      const deletedCount = await this.cleanupExpiredSuggestions();
      this.logger.log(
        `Refreshed ${processedCount} users, deleted ${deletedCount} expired suggestions`,
      );

      return processedCount;
    } catch (error) {
      this.logger.error('Error refreshing all suggestions:', error);
      return 0;
    }
  }
}
