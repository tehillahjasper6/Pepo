import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrustScoreService } from './trust-score.service';

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private trustScoreService: TrustScoreService,
  ) {}

  /**
   * Submit feedback after a successful transaction
   */
  async submitFeedback(giverId: string, receiverId: string, giveawayId: string, data: any) {
    // Verify the transaction exists
    const giveaway = await this.prisma.giveaway.findUnique({
      where: { id: giveawayId },
      include: { winners: true },
    });

    if (!giveaway) {
      throw new Error('Giveaway not found');
    }

    const winner = giveaway.winners?.find(w => w.userId === receiverId);
    if (!winner) {
      throw new Error('User did not win this giveaway');
    }

    // Check for inappropriate content
    const isFlagged = this.containsProhibitedContent(data.comments);

    const feedback = await this.prisma.transactionFeedback.upsert({
      where: {
        unique_transaction_feedback: {
          giverId,
          receiverId,
          giveawayId,
        },
      },
      update: {
        itemCondition: data.itemCondition || 'as-described',
        communicationQuality: data.communicationQuality || 'good',
        wouldRecommend: data.wouldRecommend !== false,
        comments: data.comments || null,
        rating: data.rating || 5,
        flagged: isFlagged,
      },
      create: {
        giverId,
        receiverId,
        giveawayId,
        itemCondition: data.itemCondition || 'as-described',
        communicationQuality: data.communicationQuality || 'good',
        wouldRecommend: data.wouldRecommend !== false,
        comments: data.comments || null,
        rating: data.rating || 5,
        flagged: isFlagged,
      },
    });

    // Recalculate trust scores for both users
    await this.trustScoreService.calculateTrustScore(giverId);
    await this.trustScoreService.calculateTrustScore(receiverId);

    // If negative feedback, flag potential fraud
    if (data.rating < 3 || !data.wouldRecommend) {
      await this.flagNegativeFeedback(giverId, receiverId, feedback.id);
    }

    return feedback;
  }

  /**
   * Get feedback for a user
   */
  async getUserFeedback(userId: string, type: 'given' | 'received' = 'given') {
    if (type === 'given') {
      return this.prisma.transactionFeedback.findMany({
        where: { giverId: userId },
        include: {
          receiver: { select: { id: true, name: true, avatar: true } },
          giveaway: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } else {
      return this.prisma.transactionFeedback.findMany({
        where: { receiverId: userId },
        include: {
          giver: { select: { id: true, name: true, avatar: true } },
          giveaway: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    }
  }

  /**
   * Get feedback statistics for a user
   */
  async getFeedbackStats(userId: string) {
    const givenFeedback = await this.prisma.transactionFeedback.findMany({
      where: { giverId: userId },
    });

    const receivedFeedback = await this.prisma.transactionFeedback.findMany({
      where: { receiverId: userId },
    });

    const avgGivenRating = givenFeedback.length > 0
      ? givenFeedback.reduce((sum, f) => sum + f.rating, 0) / givenFeedback.length
      : 0;

    const avgReceivedRating = receivedFeedback.length > 0
      ? receivedFeedback.reduce((sum, f) => sum + f.rating, 0) / receivedFeedback.length
      : 0;

    const recommendationRate = [...givenFeedback, ...receivedFeedback].filter(f => f.wouldRecommend).length / (givenFeedback.length + receivedFeedback.length || 1) * 100;

    return {
      totalFeedback: givenFeedback.length + receivedFeedback.length,
      givenFeedbackCount: givenFeedback.length,
      receivedFeedbackCount: receivedFeedback.length,
      avgGivenRating: parseFloat(avgGivenRating.toFixed(2)),
      avgReceivedRating: parseFloat(avgReceivedRating.toFixed(2)),
      recommendationRate: parseFloat(recommendationRate.toFixed(2)),
      flaggedComments: givenFeedback.concat(receivedFeedback).filter(f => f.flagged).length,
    };
  }

  /**
   * Flag negative feedback for admin review
   */
  private async flagNegativeFeedback(giverId: string, receiverId: string, feedbackId: string) {
    await this.prisma.fraudFlag.create({
      data: {
        userId: giverId,
        riskScore: 15,
        flagType: 'negative_feedback',
        description: `Received negative feedback (rating < 3 or not recommended) from ${receiverId}`,
        action: 'warning',
      },
    });
  }

  /**
   * Simple content moderation
   */
  private containsProhibitedContent(text?: string): boolean {
    if (!text) return false;

    const prohibited = [
      'violence',
      'hate',
      'harassment',
      'spam',
      'scam',
      'fraud',
    ];

    const lower = text.toLowerCase();
    return prohibited.some(word => lower.includes(word));
  }
}
