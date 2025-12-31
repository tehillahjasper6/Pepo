import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        city: true,
        role: true,
        createdAt: true,
        // Don't expose gender publicly
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: any) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        city: data.city,
        avatar: data.avatar,
        gender: data.gender,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        city: true,
        role: true,
      },
    });

    return user;
  }

  async getUserStats(userId: string) {
    const [givenCount, receivedCount, participationCount] = await Promise.all([
      this.prisma.giveaway.count({
        where: { userId, status: 'COMPLETED' },
      }),
      this.prisma.winner.count({
        where: { userId },
      }),
      this.prisma.participant.count({
        where: { userId },
      }),
    ]);

    return {
      given: givenCount,
      received: receivedCount,
      participated: participationCount,
    };
  }

  async getUserGiveaways(userId: string) {
    return this.prisma.giveaway.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { participants: true },
        },
      },
    });
  }

  async getUserParticipations(userId: string) {
    return this.prisma.participant.findMany({
      where: { userId },
      include: {
        giveaway: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserWins(userId: string) {
    return this.prisma.winner.findMany({
      where: { userId },
      include: {
        giveaway: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, city: true },
            },
          },
        },
      },
      orderBy: { selectedAt: 'desc' },
    });
  }
}



