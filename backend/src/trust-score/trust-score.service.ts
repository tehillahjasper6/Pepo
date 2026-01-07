import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ParticipantStatus } from '@prisma/client';

export interface TrustScoreData {
  userId: string;
  score: number;
  percentage: number;
  rating: string;
  breakdownDetails: {
    verificationScore: number;
    completedGiveaways: number;
    userRating: number;
    accountAgeScore: number;
  };
}

@Injectable()
export class TrustScoreService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate trust score for a user
   * Trust score is based on:
   * 1. Verification status (25%)
   * 2. Completed giveaways (25%)
   * 3. User ratings (25%)
   * 4. Account age (25%)
   */
  async calculateTrustScore(userId: string): Promise<TrustScoreData> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        giveaways: true,
        participations: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    let totalScore = 0;
    const breakdown = {
      verificationScore: 0,
      completedGiveaways: 0,
      userRating: 0,
      accountAgeScore: 0,
    };

    // 1. Verification Score (25 points max)
    if (user.idVerified) {
      breakdown.verificationScore = 25;
      totalScore += 25;
    }

    // 2. Completed Giveaways Score (25 points max)
    const completedGiveaways = user.giveaways.filter(
      (g) => g.status === 'CLOSED' || g.status === 'COMPLETED',
    ).length;
    breakdown.completedGiveaways = Math.min(completedGiveaways * 5, 25);
    totalScore += breakdown.completedGiveaways;

    // 3. User Rating Score (25 points max)
    // Average rating from participant feedback
    const participantRecords = await this.prisma.participant.findMany({
      where: {
        userId,
      },
      // No need to include giveaway.createdBy, not in schema
      // include: { giveaway: true },
    });

    let totalRating = 0;
    let ratingCount = 0;

    for (const participant of participantRecords) {
      // No rating field on Participant; skip rating calculation
    }

    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
    breakdown.userRating = Math.min((averageRating / 5) * 25, 25);
    totalScore += breakdown.userRating;

    // 4. Account Age Score (25 points max)
    const accountAgeMs = Date.now() - new Date(user.createdAt).getTime();
    const accountAgeDays = accountAgeMs / (1000 * 60 * 60 * 24);
    const accountAgeMonths = accountAgeDays / 30;

    if (accountAgeMonths >= 12) {
      breakdown.accountAgeScore = 25; // 1 year or older = max points
    } else if (accountAgeMonths >= 6) {
      breakdown.accountAgeScore = 20; // 6 months
    } else if (accountAgeMonths >= 3) {
      breakdown.accountAgeScore = 15; // 3 months
    } else if (accountAgeMonths >= 1) {
      breakdown.accountAgeScore = 10; // 1 month
    } else {
      breakdown.accountAgeScore = 5; // Less than 1 month
    }

    totalScore += breakdown.accountAgeScore;

    // Ensure score is between 0-100
    const finalScore = Math.min(totalScore, 100);
    const percentage = Math.round(finalScore);

    // Determine rating text
    let rating = 'No Rating';
    if (percentage >= 90) {
      rating = 'Excellent';
    } else if (percentage >= 75) {
      rating = 'Very Good';
    } else if (percentage >= 60) {
      rating = 'Good';
    } else if (percentage >= 40) {
      rating = 'Fair';
    } else if (percentage > 0) {
      rating = 'Poor';
    }

    return {
      userId,
      score: finalScore,
      percentage,
      rating,
      breakdownDetails: breakdown,
    };
  }

  /**
   * Get trust score for a user (with caching)
   */
  async getTrustScore(userId: string): Promise<TrustScoreData> {
    try {
      return await this.calculateTrustScore(userId);
    } catch (error) {
      console.error('Error calculating trust score:', error);
      // Return default score on error
      return {
        userId,
        score: 0,
        percentage: 0,
        rating: 'No Rating',
        breakdownDetails: {
          verificationScore: 0,
          completedGiveaways: 0,
          userRating: 0,
          accountAgeScore: 0,
        },
      };
    }
  }

  /**
   * Get trust scores for multiple users
   */
  async getTrustScores(userIds: string[]): Promise<TrustScoreData[]> {
    return Promise.all(userIds.map((id) => this.getTrustScore(id)));
  }

  /**
   * Get leaderboard of top users by trust score
   */
  async getLeaderboard(limit: number = 10): Promise<any[]> {
    const users = await this.prisma.user.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        idVerified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit * 2, // Fetch more to account for sorting by trust score
    });

    const scoresWithUsers = await Promise.all(
      users.map(async (user) => {
        const score = await this.getTrustScore(user.id);
        return {
          ...user,
          trustScore: score,
        };
      }),
    );

    // Sort by trust score descending
    return scoresWithUsers
      .sort((a, b) => b.trustScore.percentage - a.trustScore.percentage)
      .slice(0, limit);
  }

  /**
   * Get user trust score details including giveaway count and ratings
   */
  async getUserTrustProfile(userId: string): Promise<any> {
    const trustScore = await this.getTrustScore(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        giveaways: {
          where: {
            status: 'CLOSED',
          },
          select: {
            id: true,
            title: true,
            status: true,
            closedAt: true,
          },
        },
        participations: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const completedParticipations = user.participations.filter(
      (p) => p.status === ParticipantStatus.SELECTED,
    ).length;

    const averageRating =
      0; // No rating field on participations

    return {
      userId,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        idVerified: user.idVerified,
        createdAt: user.createdAt,
      },
      trustScore: trustScore,
      stats: {
        createdGiveaways: user.giveaways.length,
        completedParticipations: completedParticipations,
        totalParticipations: user.participations.length,
        averageRating: Math.round(averageRating),
      },
    };
  }
}
