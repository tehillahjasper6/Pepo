import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { randomBytes } from 'crypto';

@Injectable()
export class DrawService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService
  ) {}

  /**
   * Close draw and select winner(s) using cryptographically secure randomness
   * This is the CORE feature of PEPO - fair and transparent random selection
   */
  async closeDrawAndSelectWinners(giveawayId: string, userId: string) {
    // 1. Acquire distributed lock
    const lockAcquired = await this.redis.acquireDrawLock(giveawayId);
    if (!lockAcquired) {
      throw new ConflictException('Draw is already being processed');
    }

    try {
      // 2. Verify giveaway ownership and status
      const giveaway = await this.prisma.giveaway.findUnique({
        where: { id: giveawayId },
        include: {
          participants: {
            where: { status: 'INTERESTED' },
            include: { user: true },
          },
          user: true,
        },
      });

      if (!giveaway) {
        throw new BadRequestException('Giveaway not found');
      }

      if (giveaway.userId !== userId) {
        throw new ForbiddenException('Only the giver can close the draw');
      }

      if (giveaway.status !== 'OPEN') {
        throw new BadRequestException('Giveaway is not open for participation');
      }

      if (giveaway.participants.length === 0) {
        throw new BadRequestException('No participants to select from');
      }

      // 3. Filter eligible participants (double-check eligibility)
      const eligibleParticipants = this.filterEligibleParticipants(
        giveaway.participants,
        giveaway
      );

      if (eligibleParticipants.length === 0) {
        throw new BadRequestException('No eligible participants');
      }

      // 4. Select winner(s) using cryptographically secure random selection
      const winnersToSelect = Math.min(giveaway.quantity, eligibleParticipants.length);
      const selectedWinners = this.selectRandomWinners(eligibleParticipants, winnersToSelect);

      // 5. Create winner records and update giveaway atomically
      const result = await this.prisma.$transaction(async (tx) => {
        // Update giveaway status
        const updatedGiveaway = await tx.giveaway.update({
          where: { id: giveawayId },
          data: {
            status: 'CLOSED',
            closedAt: new Date(),
            drawCompletedAt: new Date(),
            winnersCount: selectedWinners.length,
          },
        });

        // Create winner records and pickup records
        const winners = await Promise.all(
          selectedWinners.map((participant, index) =>
            tx.winner.create({
              data: {
                giveawayId,
                userId: participant.userId,
                drawNumber: index + 1,
                pickup: {
                  create: {
                    pickupCode: this.generatePickupCode(),
                  },
                },
              },
              include: {
                pickup: true,
              },
            })
          )
        );

        // Update participant statuses
        await tx.participant.updateMany({
          where: {
            giveawayId,
            userId: { in: selectedWinners.map((p) => p.userId) },
          },
          data: { status: 'SELECTED' },
        });

        await tx.participant.updateMany({
          where: {
            giveawayId,
            userId: { notIn: selectedWinners.map((p) => p.userId) },
          },
          data: { status: 'REJECTED' },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId,
            action: 'DRAW_COMPLETED',
            entity: 'Giveaway',
            entityId: giveawayId,
            metadata: {
              totalParticipants: eligibleParticipants.length,
              winnersSelected: selectedWinners.length,
              winnerIds: selectedWinners.map((p) => p.userId),
              timestamp: new Date().toISOString(),
            },
          },
        });

        return { giveaway: updatedGiveaway, winners };
      });

      // 6. Send notifications (async, don't block response)
      this.sendDrawNotifications(giveawayId, selectedWinners.map((p) => p.userId)).catch(
        (err) => {
          console.error('Failed to send draw notifications:', err);
        }
      );

      return result;
    } finally {
      // 7. Always release the lock
      await this.redis.releaseDrawLock(giveawayId);
    }
  }

  /**
   * Cryptographically secure random selection
   * Uses Node.js crypto.randomBytes for true randomness
   */
  private selectRandomWinners<T>(participants: T[], count: number): T[] {
    const pool = [...participants];
    const winners: T[] = [];

    for (let i = 0; i < count && pool.length > 0; i++) {
      const randomIndex = this.getSecureRandomInt(pool.length);
      winners.push(pool[randomIndex]);
      pool.splice(randomIndex, 1);
    }

    return winners;
  }

  /**
   * Generate cryptographically secure random integer
   */
  private getSecureRandomInt(max: number): number {
    const range = max;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8);
    const maxValue = Math.pow(256, bytesNeeded);
    const threshold = maxValue - (maxValue % range);

    let randomValue: number;
    do {
      const randomBuffer = randomBytes(bytesNeeded);
      randomValue = randomBuffer.readUIntBE(0, bytesNeeded);
    } while (randomValue >= threshold);

    return randomValue % range;
  }

  /**
   * Filter participants based on eligibility rules
   */
  private filterEligibleParticipants(participants: any[], giveaway: any) {
    return participants.filter((participant) => {
      // Gender eligibility
      if (giveaway.eligibilityGender !== 'ALL') {
        if (participant.user.gender !== giveaway.eligibilityGender) {
          return false;
        }
      }

      // Age eligibility (if implemented)
      // Add age checks here if needed

      return true;
    });
  }

  /**
   * Generate a unique pickup code
   */
  private generatePickupCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      const randomIndex = this.getSecureRandomInt(chars.length);
      code += chars[randomIndex];
    }
    return code;
  }

  /**
   * Generate QR code URL for pickup code
   */
  async generateQRCode(pickupCode: string): Promise<string> {
    // In production, use a QR code library
    // For now, return a QR code service URL
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${pickupCode}`;
  }

  /**
   * Send notifications to winners and non-winners
   */
  private async sendDrawNotifications(giveawayId: string, winnerIds: string[]) {
    const giveaway = await this.prisma.giveaway.findUnique({
      where: { id: giveawayId },
      include: {
        participants: {
          include: { user: true },
        },
      },
    });

    // Winner notifications
    const winnerNotifications = winnerIds.map((userId) =>
      this.prisma.notification.create({
        data: {
          userId,
          type: 'WINNER_SELECTED',
          title: '🎉 You won!',
          message: `Congratulations! You've been selected for "${giveaway.title}"`,
          data: { giveawayId },
        },
      })
    );

    // Non-winner notifications
    const nonWinnerIds = giveaway.participants
      .filter((p) => !winnerIds.includes(p.userId))
      .map((p) => p.userId);

    const nonWinnerNotifications = nonWinnerIds.map((userId) =>
      this.prisma.notification.create({
        data: {
          userId,
          type: 'DRAW_CLOSED',
          title: 'Draw closed',
          message: `Thank you for participating in "${giveaway.title}". Keep exploring PEPO!`,
          data: { giveawayId },
        },
      })
    );

    await Promise.all([...winnerNotifications, ...nonWinnerNotifications]);
  }

  /**
   * Get draw results for a giveaway
   */
  async getDrawResults(giveawayId: string) {
    const giveaway = await this.prisma.giveaway.findUnique({
      where: { id: giveawayId },
      include: {
        winners: true,
        participants: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
      },
    });

    if (!giveaway) {
      throw new BadRequestException('Giveaway not found');
    }

    return {
      giveaway,
      totalParticipants: giveaway.participants.length,
      winners: giveaway.winners,
      drawCompletedAt: giveaway.drawCompletedAt,
    };
  }
}

