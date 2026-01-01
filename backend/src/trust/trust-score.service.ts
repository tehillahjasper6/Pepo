import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrustScoreService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate and update trust score for a user
   */
  async calculateTrustScore(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    // Get giving history
    const giveaways = await this.prisma.giveaway.findMany({
      where: { userId },
      include: {
        winners: { include: { pickup: true } },
        _count: { select: { participants: true } },
      },
    });

    const successfulGives = giveaways.filter(g => g.winners?.some(w => w.pickup?.completedAt)).length;
    const totalGiveaways = giveaways.length;
    const completionRate = totalGiveaways > 0 ? (successfulGives / totalGiveaways) * 100 : 0;

    // Get receiving history (participated and won)
    const participations = await this.prisma.participant.findMany({
      where: { userId },
    });

    const winnerRecords = await this.prisma.winner.findMany({
      where: { userId },
      include: { pickup: true },
    });

    const successfulReceives = winnerRecords.filter(w => w.pickup?.completedAt).length;

    // Get feedback scores
    const giverFeedback = await this.prisma.transactionFeedback.findMany({
      where: { giverId: userId },
    });

    const receiverFeedback = await this.prisma.transactionFeedback.findMany({
      where: { receiverId: userId },
    });

    const allFeedback = [...giverFeedback, ...receiverFeedback];
    const avgRating = allFeedback.length > 0
      ? allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length
      : 5;

    const feedbackScore = Math.min(100, (avgRating / 5) * 100);

    // Get negative reports count
    const negativeReports = await this.prisma.report.count({
      where: { reportedUser: userId },
    });

    // Calculate component scores
    const givingScore = Math.min(100, successfulGives * 10); // Max 10 gives for 100
    const receivingScore = Math.min(100, successfulReceives * 15); // Receiving is less weighted
    const reportPenalty = negativeReports * 15;

    // Weighted average
    const totalScore = Math.max(0, Math.min(100,
      (givingScore * 0.4 + receivingScore * 0.2 + feedbackScore * 0.4) - reportPenalty
    ));

    // Determine trust level
    let trustLevel = 'NEW';
    if (successfulGives > 0 && successfulGives < 3) trustLevel = 'EMERGING';
    if (successfulGives >= 3 && successfulGives < 10) trustLevel = 'TRUSTED';
    if (successfulGives >= 10) trustLevel = 'HIGHLY_TRUSTED';

    // Calculate average response time (stub - would need message timestamps)
    const responseTime = 24; // Default 24 hours

    // Update or create trust score
    const trustScore = await this.prisma.trustScore.upsert({
      where: { userId },
      update: {
        givingScore,
        receivingScore,
        feedbackScore,
        completionRate,
        responseTime,
        totalScore,
        trustLevel,
        successfulGives,
        successfulReceives,
        totalInteractions: participations.length + giveaways.length,
        negativeReports,
        calculatedAt: new Date(),
      },
      create: {
        userId,
        givingScore,
        receivingScore,
        feedbackScore,
        completionRate,
        responseTime,
        totalScore,
        trustLevel,
        successfulGives,
        successfulReceives,
        totalInteractions: participations.length + giveaways.length,
        negativeReports,
      },
    });

    return trustScore;
  }

  /**
   * Get trust score for user
   */
  async getTrustScore(userId: string) {
    const score = await this.prisma.trustScore.findUnique({
      where: { userId },
    });

    if (!score) {
      // Calculate if doesn't exist
      return this.calculateTrustScore(userId);
    }

    // Recalculate if older than 1 hour
    const hourAgo = new Date(Date.now() - 3600000);
    if (score.calculatedAt < hourAgo) {
      return this.calculateTrustScore(userId);
    }

    return score;
  }

  /**
   * Get trust levels distribution (for admin dashboard)
   */
  async getTrustDistribution() {
    const distribution = await this.prisma.trustScore.groupBy({
      by: ['trustLevel'],
      _count: true,
    });

    return distribution.reduce((acc, item) => ({
      ...acc,
      [item.trustLevel]: item._count,
    }), {});
  }

  /**
   * Get users by trust level
   */
  async getUsersByTrustLevel(level: string, take = 20) {
    return this.prisma.trustScore.findMany({
      where: { trustLevel: level },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { totalScore: 'desc' },
      take,
    });
  }
}
