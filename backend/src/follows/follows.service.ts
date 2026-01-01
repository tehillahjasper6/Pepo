import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowsService {
  constructor(private prisma: PrismaService) {}

  async follow(userId: string, ngoId: string) {
    // Prevent duplicate follows via unique constraint
    try {
      const follow = await this.prisma.follow.create({
        data: { userId, ngoId },
      });
      return follow;
    } catch (err) {
      // Unique constraint violation or other error -> treat as duplicate
      throw new BadRequestException('Unable to follow NGO (maybe already followed)');
    }
  }

  async unfollow(userId: string, ngoId: string) {
    return this.prisma.follow.deleteMany({ where: { userId, ngoId } });
  }

  async listFollowedNGOs(userId: string) {
    return this.prisma.follow.findMany({ where: { userId }, include: { ngo: true } });
  }

  async countFollowers(ngoId: string) {
    return this.prisma.follow.count({ where: { ngoId } });
  }

  async isFollowing(userId: string, ngoId: string) {
    const f = await this.prisma.follow.findUnique({ where: { userId_ngoId: { userId, ngoId } } as any });
    return !!f;
  }
}
