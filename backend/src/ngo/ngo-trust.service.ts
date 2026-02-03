import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ConfidenceLevel,
  TransparencyReportStatus,
  NGOStatus,
} from '@prisma/client';

/**
 * NGO Trust Framework Service
 * 
 * Implements donor confidence scoring and transparency reporting
 * for verified NGOs on the Pepo platform.
 * 
 * Ethical Principles:
 * - No shaming language
 * - No leaderboards or public rankings
 * - Emphasis on growth and improvement
 * - Transparent but non-manipulable scoring
 */

interface ConfidenceScoreBreakdown {
  verificationScore: number;
  transparencyScore: number;
  activityScore: number;
  completionScore: number;
  feedbackScore: number;
  governmentRecognitionBonus: number;
  adminTrustAdjustment: number;
  totalScore: number;
  confidenceLevel: ConfidenceLevel;
}

@Injectable()
export class NGOTrustService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate donor confidence score for an NGO
   * 
   * Score Components (Total: 0-100):
   * - Verification Status: 30 points (baseline, mandatory)
   * - Transparency Reports: 0-25 points (consistency & completeness)
   * - Activity Score: 0-20 points (recent, consistent giving)
   * - Completion Rate: 0-15 points (campaign completion rate)
   * - User Feedback: 0-10 points (qualitative feedback)
   * - Government Recognition: +5 bonus (optional)
   * - Admin Trust Flags: -5 to +5 adjustment
   */
  async calculateConfidenceScore(ngoProfileId: string): Promise<ConfidenceScoreBreakdown> {
    const ngoProfile = await this.prisma.nGOProfile.findUnique({
      where: { id: ngoProfileId },
      include: {
        transparencyReports: {
          where: { status: TransparencyReportStatus.APPROVED },
          orderBy: { periodEnd: 'desc' },
        },
        campaigns: {
          include: {
            giveaways: true,
          },
        },
        feedback: {
          where: { isApproved: true },
        },
        confidenceScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!ngoProfile) {
      throw new Error('NGO profile not found');
    }

    // 1. Verification Score (30 points baseline)
    const verificationScore = ngoProfile.status === NGOStatus.VERIFIED ? 30 : 0;

    // 2. Transparency Score (0-25 points)
    const transparencyScore = this.calculateTransparencyScore(ngoProfile.transparencyReports);

    // 3. Activity Score (0-20 points)
    const activityScore = await this.calculateActivityScore(ngoProfileId);

    // 4. Completion Score (0-15 points)
    const completionScore = this.calculateCompletionScore(ngoProfile.campaigns);

    // 5. Feedback Score (0-10 points)
    const feedbackScore = this.calculateFeedbackScore(ngoProfile.feedback);

    // 6. Government Recognition Bonus (+5 points)
    const governmentRecognitionBonus = ngoProfile.hasGovernmentRecognition ? 5 : 0;

    // 7. Admin Trust Adjustment (-5 to +5)
    // This is set by admins, defaulting to 0
    const latestScore = ngoProfile.confidenceScores[0];
    const adminTrustAdjustment = latestScore?.adminTrustFlags || 0;

    // Calculate total
    const totalScore = Math.min(
      100,
      Math.max(
        0,
        verificationScore +
          transparencyScore +
          activityScore +
          completionScore +
          feedbackScore +
          governmentRecognitionBonus +
          adminTrustAdjustment
      )
    );

    // Determine confidence level
    const confidenceLevel = this.getConfidenceLevel(totalScore);

    const breakdown: ConfidenceScoreBreakdown = {
      verificationScore,
      transparencyScore,
      activityScore,
      completionScore,
      feedbackScore,
      governmentRecognitionBonus,
      adminTrustAdjustment,
      totalScore,
      confidenceLevel,
    };

    // Store score history
    await this.prisma.nGOConfidenceScore.create({
      data: {
        ngoProfileId,
        verificationScore,
        transparencyScore,
        activityScore,
        completionScore,
        feedbackScore,
        hasGovernmentRecognition: ngoProfile.hasGovernmentRecognition,
        adminTrustFlags: adminTrustAdjustment,
        totalScore,
        confidenceLevel,
        factorsBreakdown: breakdown as any,
      },
    });

    // Update NGO profile with latest score
    await this.prisma.nGOProfile.update({
      where: { id: ngoProfileId },
      data: { trustScore: totalScore },
    });

    return breakdown;
  }

  /**
   * Calculate transparency score based on report consistency
   * Max: 25 points
   */
  private calculateTransparencyScore(reports: any[]): number {
    if (reports.length === 0) return 0;

    // Base score for having reports: 10 points
    let score = 10;

    // Consistency bonus: +5 for each consecutive period
    // Check if reports are submitted on time
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const recentReports = reports.filter(
      (r) => new Date(r.periodEnd) >= oneYearAgo
    );

    // Completeness bonus: +5 if reports include financial data
    const hasFinancialData = reports.some(
      (r) => r.fundsReceivedMin !== null || r.fundsUtilized !== null
    );

    // Timeliness: Check if latest report is recent (within expected period)
    const latestReport = reports[0];
    if (latestReport) {
      const daysSinceReport = Math.floor(
        (now.getTime() - new Date(latestReport.periodEnd).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      // Quarterly: should report within 90 days, Annual: within 365 days
      const expectedDays =
        latestReport.reportFrequency === 'QUARTERLY' ? 90 : 365;
      if (daysSinceReport <= expectedDays) {
        score += 5; // Timely reporting
      }
    }

    if (hasFinancialData) {
      score += 5;
    }

    // Consistency: +1 for each report beyond the first (max +5)
    score += Math.min(5, recentReports.length - 1);

    return Math.min(25, score);
  }

  /**
   * Calculate activity score based on recent giving activity
   * Max: 20 points
   */
  private async calculateActivityScore(ngoProfileId: string): Promise<number> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentGiveaways = await this.prisma.giveaway.count({
      where: {
        campaign: {
          ngoProfileId,
        },
        createdAt: {
          gte: sixMonthsAgo,
        },
        status: {
          in: ['OPEN', 'CLOSED', 'COMPLETED'],
        },
      },
    });

    // Base score: 5 points for any activity
    let score = recentGiveaways > 0 ? 5 : 0;

    // Activity level bonus
    if (recentGiveaways >= 20) {
      score += 15; // Very active
    } else if (recentGiveaways >= 10) {
      score += 10; // Active
    } else if (recentGiveaways >= 5) {
      score += 5; // Moderate activity
    }

    return Math.min(20, score);
  }

  /**
   * Calculate completion score based on campaign completion rate
   * Max: 15 points
   */
  private calculateCompletionScore(campaigns: any[]): number {
    if (campaigns.length === 0) return 0;

    const completedCampaigns = campaigns.filter((c) => {
      const giveaways = c.giveaways || [];
      const completedGiveaways = giveaways.filter(
        (g: any) => g.status === 'COMPLETED'
      );
      return completedGiveaways.length > 0;
    });

    const completionRate = completedCampaigns.length / campaigns.length;

    // Score based on completion rate
    if (completionRate >= 0.9) return 15; // 90%+ completion
    if (completionRate >= 0.75) return 12; // 75%+ completion
    if (completionRate >= 0.5) return 8; // 50%+ completion
    if (completionRate >= 0.25) return 4; // 25%+ completion

    return 0;
  }

  /**
   * Calculate feedback score based on approved user feedback
   * Max: 10 points
   */
  private calculateFeedbackScore(feedback: any[]): number {
    if (feedback.length === 0) return 0;

    const positiveFeedback = feedback.filter((f) => f.isPositive);
    const positiveRatio = positiveFeedback.length / feedback.length;

    // Base score: 5 points for having feedback
    let score = 5;

    // Bonus based on positive ratio
    if (positiveRatio >= 0.9) {
      score += 5; // 90%+ positive
    } else if (positiveRatio >= 0.75) {
      score += 3; // 75%+ positive
    } else if (positiveRatio >= 0.5) {
      score += 1; // 50%+ positive
    }

    return Math.min(10, score);
  }

  /**
   * Get confidence level label based on score
   */
  private getConfidenceLevel(score: number): ConfidenceLevel {
    if (score >= 80) return ConfidenceLevel.HIGHLY_TRUSTED;
    if (score >= 50) return ConfidenceLevel.TRUSTED;
    return ConfidenceLevel.EMERGING;
  }

  /**
   * Get public NGO profile (only for verified NGOs)
   */
  async getPublicProfile(ngoProfileId: string) {
    const ngoProfile = await this.prisma.nGOProfile.findUnique({
      where: {
        id: ngoProfileId,
        status: NGOStatus.VERIFIED, // Only verified NGOs have public profiles
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
        campaigns: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        transparencyReports: {
          where: { status: TransparencyReportStatus.APPROVED },
          orderBy: { periodEnd: 'desc' },
          take: 5,
        },
        confidenceScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!ngoProfile) {
      throw new Error('NGO profile not found or not verified');
    }

    // Calculate current score if not exists
    let currentScore = ngoProfile.confidenceScores[0];
    if (!currentScore || this.isScoreStale(currentScore.calculatedAt)) {
      const breakdown = await this.calculateConfidenceScore(ngoProfileId);
      currentScore = await this.prisma.nGOConfidenceScore.findFirst({
        where: { ngoProfileId },
        orderBy: { calculatedAt: 'desc' },
      });
    }

    return {
      id: ngoProfile.id,
      organizationName: ngoProfile.organizationName,
      logo: ngoProfile.logo,
      country: ngoProfile.country,
      city: ngoProfile.city,
      yearEstablished: ngoProfile.yearEstablished,
      missionStatement: ngoProfile.missionStatement,
      focusAreas: ngoProfile.focusAreas,
      hasGovernmentRecognition: ngoProfile.hasGovernmentRecognition,
      governmentRecognitionBadge: ngoProfile.governmentRecognitionBadge,
      website: ngoProfile.website,
      totalItemsDistributed: ngoProfile.totalGiveaways,
      totalBeneficiariesImpacted: ngoProfile.totalBeneficiaries,
      activeCampaigns: ngoProfile.campaigns.filter((c) => c.isActive),
      pastCampaigns: ngoProfile.campaigns.filter((c) => !c.isActive),
      transparencyReports: ngoProfile.transparencyReports,
      confidenceScore: {
        score: currentScore?.totalScore || 0,
        level: currentScore?.confidenceLevel || ConfidenceLevel.EMERGING,
        lastUpdated: currentScore?.calculatedAt || new Date(),
      },
      verifiedAt: ngoProfile.verifiedAt,
    };
  }

  /**
   * Check if confidence score is stale (older than 30 days)
   */
  private isScoreStale(calculatedAt: Date): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return calculatedAt < thirtyDaysAgo;
  }
}




