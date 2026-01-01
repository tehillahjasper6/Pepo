import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FraudDetectionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Run fraud detection on a user
   */
  async detectFraudActivity(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        giveaways: { include: { winners: { include: { pickup: true } } } },
        _count: { select: { participations: true } },
      },
    });

    if (!user) return null;

    let riskScore = 0;
    const flags: string[] = [];

    // 1. Check for rapid giveaway creation with low completion
    const recentGiveaways = user.giveaways.filter(g =>
      new Date(g.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    if (recentGiveaways.length > 10) {
      const completedCount = recentGiveaways.filter(g =>
        g.winners?.some(w => w.pickup?.completedAt)
      ).length;

      if (completedCount === 0) {
        riskScore += 20;
        flags.push(`High giveaway volume (${recentGiveaways.length}) with zero completions in 7 days`);
      } else if ((completedCount / recentGiveaways.length) < 0.3) {
        riskScore += 15;
        flags.push(`Low completion rate (${(completedCount / recentGiveaways.length * 100).toFixed(0)}%) on recent giveaways`);
      }
    }

    // 2. Check for new account with spike in activity
    const accountAge = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (24 * 60 * 60 * 1000));

    if (accountAge < 7 && recentGiveaways.length > 5) {
      riskScore += 15;
      flags.push(`New account (${accountAge} days old) with unusual activity surge`);
    }

    // 3. Check for participation spam (interesting in many giveaways but never follows through)
    const participationRate = await this.prisma.participant.count({
      where: { userId },
    });

    const winnerCount = await this.prisma.winner.count({
      where: { userId },
    });

    if (participationRate > 20 && winnerCount === 0) {
      riskScore += 12;
      flags.push(`High participation spam (${participationRate} interests, no wins)`);
    }

    // 4. Check for multiple reports against user
    const reportCount = await this.prisma.report.count({
      where: { reportedUser: userId },
    });

    if (reportCount > 0) {
      riskScore += reportCount * 10;
      flags.push(`${reportCount} user reports against account`);
    }

    // 5. Check for feedback with negative patterns
    const feedback = await this.prisma.transactionFeedback.findMany({
      where: { giverId: userId },
    });

    const negativeFeedback = feedback.filter(f => f.rating < 3 || !f.wouldRecommend);
    if (negativeFeedback.length > 2) {
      riskScore += negativeFeedback.length * 8;
      flags.push(`Multiple negative feedback items (${negativeFeedback.length})`);
    }

    // 6. Check for flagged comments
    const flaggedComments = feedback.filter(f => f.flagged).length;
    if (flaggedComments > 0) {
      riskScore += flaggedComments * 15;
      flags.push(`${flaggedComments} flagged comments (suspicious content)`);
    }

    // Determine action
    let action = 'none';
    if (riskScore > 70) action = 'suspend';
    else if (riskScore > 50) action = 'review';
    else if (riskScore > 25) action = 'warning';

    // Create or update fraud flag
    const existingFlag = await this.prisma.fraudFlag.findFirst({
      where: { userId, action: { not: 'none' } },
      orderBy: { createdAt: 'desc' },
    });

    // Only create new flag if score increased or action changed
    if (!existingFlag || riskScore > (existingFlag.riskScore || 0)) {
      await this.prisma.fraudFlag.create({
        data: {
          userId,
          riskScore: Math.min(100, riskScore),
          flagType: this.determineFlagType(flags),
          description: flags.join(' | '),
          action,
        },
      });
    }

    return {
      userId,
      riskScore: Math.min(100, riskScore),
      flags,
      action,
      timestamp: new Date(),
    };
  }

  /**
   * Review and resolve fraud flag
   */
  async resolveFraudFlag(flagId: string, reviewedBy: string, resolution: string, action: string) {
    return this.prisma.fraudFlag.update({
      where: { id: flagId },
      data: {
        reviewedAt: new Date(),
        reviewedBy,
        resolution,
        action,
      },
    });
  }

  /**
   * Get pending fraud reviews for admins
   */
  async getPendingReviews(take = 20) {
    return this.prisma.fraudFlag.findMany({
      where: {
        reviewedAt: null,
        action: { not: 'none' },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            _count: { select: { giveaways: true } },
          },
        },
      },
      orderBy: { riskScore: 'desc' },
      take,
    });
  }

  /**
   * Get fraud statistics for dashboard
   */
  async getFraudStats() {
    const [total, pending, reviewed, suspended] = await Promise.all([
      this.prisma.fraudFlag.count(),
      this.prisma.fraudFlag.count({ where: { reviewedAt: null } }),
      this.prisma.fraudFlag.count({ where: { reviewedAt: { not: null } } }),
      this.prisma.fraudFlag.count({ where: { action: 'suspend' } }),
    ]);

    const avgRiskScore = await this.prisma.fraudFlag.aggregate({
      _avg: { riskScore: true },
    });

    return {
      total,
      pending,
      reviewed,
      suspended,
      averageRiskScore: avgRiskScore._avg.riskScore || 0,
    };
  }

  private determineFlagType(flags: string[]): string {
    if (flags.some(f => f.includes('giveaway volume'))) return 'rapid_giveaway';
    if (flags.some(f => f.includes('New account'))) return 'new_account_spike';
    if (flags.some(f => f.includes('reports'))) return 'multiple_reports';
    if (flags.some(f => f.includes('participation spam'))) return 'participation_spam';
    if (flags.some(f => f.includes('negative feedback'))) return 'negative_feedback';
    return 'suspicious_activity';
  }
}
