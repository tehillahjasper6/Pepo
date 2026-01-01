import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrustScoreService } from './trust-score.service';

@Injectable()
export class SmartMatchingService {
  constructor(
    private prisma: PrismaService,
    private trustScoreService: TrustScoreService,
  ) {}

  /**
   * Calculate smart match score for a user-giveaway pair
   */
  async calculateMatchScore(userId: string, giveawayId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const giveaway = await this.prisma.giveaway.findUnique({
      where: { id: giveawayId },
      include: { user: { include: { trustScore: true } } },
    });

    if (!user || !giveaway) return null;

    // 1. Proximity score (30 pts max)
    const proximityScore = this.calculateProximityScore(user.city, giveaway.location);

    // 2. Category interest (40 pts max)
    const categoryScore = this.calculateCategoryScore(user.id, giveaway.category);

    // 3. Time availability (20 pts max)
    const timeScore = this.calculateTimeScore(user.id, giveaway.createdAt);

    // 4. Trust alignment (10 pts max)
    const userTrust = await this.trustScoreService.getTrustScore(userId);
    const giverTrust = giveaway.user?.trustScore?.totalScore || 50;
    const trustScore = this.calculateTrustAlignment(userTrust?.totalScore || 50, giverTrust);

    const totalScore = proximityScore + categoryScore + timeScore + trustScore;

    return {
      giveawayId,
      userId,
      matchScore: Math.min(100, totalScore),
      breakdown: {
        proximity: proximityScore,
        category: categoryScore,
        availability: timeScore,
        trust: trustScore,
      },
    };
  }

  /**
   * Get personalized recommendations for user
   */
  async getRecommendations(userId: string, limit = 10) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return [];

    // Get active giveaways
    const giveaways = await this.prisma.giveaway.findMany({
      where: {
        status: 'OPEN',
        userId: { not: userId }, // Don't recommend own giveaways
      },
      include: {
        user: { include: { trustScore: true } },
        participants: { select: { id: true } },
      },
      take: 50, // Get top 50 to score
    });

    // Calculate scores
    const scored = await Promise.all(
      giveaways.map(async (g) => ({
        ...g,
        matchScore: await this.calculateMatchScore(userId, g.id),
      }))
    );

    // Sort by match score and return top results
    return scored
      .filter(s => s.matchScore)
      .sort((a, b) => b.matchScore.matchScore - a.matchScore.matchScore)
      .slice(0, limit)
      .map(s => ({
        giveaway: {
          id: s.id,
          title: s.title,
          description: s.description,
          images: s.images,
          category: s.category,
          location: s.location,
          participantCount: s.participants.length,
          giver: {
            id: s.user.id,
            name: s.user.name,
            avatar: s.user.avatar,
            trustScore: s.user.trustScore?.totalScore || 50,
          },
        },
        matchScore: s.matchScore.matchScore,
        reasons: this.generateReasons(s.matchScore.breakdown),
        distance: this.calculateDistance(user.city, s.location),
      }));
  }

  /**
   * Save match score to database for caching
   */
  async saveMatchScore(userId: string, giveawayId: string, score: number) {
    return this.prisma.smartMatchingScore.upsert({
      where: {
        unique_match_score: { userId, giveawayId },
      },
      update: { matchScore: score, calculatedAt: new Date() },
      create: { userId, giveawayId, matchScore: score },
    });
  }

  /**
   * Get trending giveaways (most matches in last 24h)
   */
  async getTrendingGiveaways(limit = 5) {
    return this.prisma.giveaway.findMany({
      where: {
        status: 'OPEN',
        publishedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      include: {
        participants: { select: { id: true } },
        user: { include: { trustScore: true } },
      },
      orderBy: { participants: { _count: 'desc' } },
      take: limit,
    });
  }

  // Helper methods

  private calculateProximityScore(userCity: string, giveawayLocation: string): number {
    // Simplified: same city = 30, different = 0
    if (userCity?.toLowerCase() === giveawayLocation?.toLowerCase()) {
      return 30;
    }
    return 0; // In production, use geocoding for distance calculation
  }

  private calculateCategoryScore(userId: string, category: string): number {
    // Stub: would analyze user's participation history by category
    return 20; // Default medium interest
  }

  private calculateTimeScore(userId: string, giveawayCreatedAt: Date): number {
    const ageHours = (Date.now() - giveawayCreatedAt.getTime()) / (1000 * 60 * 60);
    // Newer giveaways score higher (up to 20 pts for < 24h old)
    return Math.max(0, 20 - (ageHours / 24) * 20);
  }

  private calculateTrustAlignment(userTrust: number, giverTrust: number): number {
    // Users and givers with similar trust levels are better matches
    const diff = Math.abs(userTrust - giverTrust);
    return Math.max(0, 10 - (diff / 10));
  }

  private calculateDistance(userCity: string, giveawayLocation: string): number {
    // Simplified distance in km
    if (userCity?.toLowerCase() === giveawayLocation?.toLowerCase()) {
      return 1;
    }
    return 25; // Default 25km
  }

  private generateReasons(breakdown: any): string[] {
    const reasons = [];
    if (breakdown.proximity > 20) reasons.push('Close by');
    if (breakdown.category > 30) reasons.push('Matches your interests');
    if (breakdown.availability > 15) reasons.push('Recently posted');
    if (breakdown.trust > 7) reasons.push('Trusted giver');
    return reasons;
  }
}
