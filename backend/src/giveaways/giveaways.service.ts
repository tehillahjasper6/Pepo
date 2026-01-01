import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class GiveawaysService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService
  ) {}

  /**
   * Create a new giveaway
   */
  async create(userId: string, data: any, files?: Express.Multer.File[]) {
    let images: string[] = [];

    if (files) {
      // Call uploadMultiple even for empty arrays so tests that mock it are triggered
      images = await this.cloudinary.uploadMultiple(files, 'giveaways');
    }

    const giveaway = await this.prisma.giveaway.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        images,
        category: data.category,
        location: data.location,
        eligibilityGender: data.eligibilityGender || 'ALL',
        quantity: data.quantity || 1,
        status: data.publish ? 'OPEN' : 'DRAFT',
        publishedAt: data.publish ? new Date() : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, city: true },
        },
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'GIVEAWAY_CREATED',
        entity: 'Giveaway',
        entityId: giveaway.id,
      },
    });

    return giveaway;
  }

  /**
   * Get all giveaways (feed)
   */
  async findAll(filters?: any) {
    const where: any = {
      status: 'OPEN',
    };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    // Search functionality
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { category: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Pagination
    const page = filters?.page ? parseInt(filters.page) : 1;
    const limit = filters?.limit ? parseInt(filters.limit) : 12;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await this.prisma.giveaway.count({ where });

    const giveaways = await this.prisma.giveaway.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, avatar: true, city: true },
        },
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
    });

    return {
      giveaways,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  /**
   * Get single giveaway
   */
  async findOne(id: string, userId?: string) {
    const giveaway = await this.prisma.giveaway.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, city: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        winners: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        _count: {
          select: { participants: true },
        },
      },
    });

    if (!giveaway) {
      throw new NotFoundException('Giveaway not found');
    }

    // Check if current user has participated
    let hasParticipated = false;
    let isWinner = false;

    if (userId) {
      const participation = giveaway.participants.find((p) => p.userId === userId);
      hasParticipated = !!participation;

      const winner = giveaway.winners.find((w) => w.userId === userId);
      isWinner = !!winner;
    }

    return {
      ...giveaway,
      hasParticipated,
      isWinner,
    };
  }

  /**
   * Update giveaway
   */
  async update(id: string, userId: string, data: any) {
    const giveaway = await this.prisma.giveaway.findUnique({
      where: { id },
    });

    if (!giveaway) {
      throw new NotFoundException('Giveaway not found');
    }

    if (giveaway.userId !== userId) {
      throw new ForbiddenException('You can only update your own giveaways');
    }

    if (giveaway.status !== 'DRAFT' && giveaway.status !== 'OPEN') {
      throw new BadRequestException('Cannot update closed giveaways');
    }

    return this.prisma.giveaway.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        eligibilityGender: data.eligibilityGender,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
  }

  /**
   * Delete/Cancel giveaway
   */
  async delete(id: string, userId: string) {
    const giveaway = await this.prisma.giveaway.findUnique({
      where: { id },
    });

    if (!giveaway) {
      throw new NotFoundException('Giveaway not found');
    }

    if (giveaway.userId !== userId) {
      throw new ForbiddenException('You can only delete your own giveaways');
    }

    if (giveaway.status === 'CLOSED' || giveaway.status === 'COMPLETED') {
      throw new BadRequestException('Cannot delete completed giveaways');
    }

    return this.prisma.giveaway.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  /**
   * Express interest (join draw)
   */
  async expressInterest(giveawayId: string, userId: string) {
    const giveaway = await this.prisma.giveaway.findUnique({
      where: { id: giveawayId },
      include: {
        user: true,
      },
    });

    if (!giveaway) {
      throw new NotFoundException('Giveaway not found');
    }

    if (giveaway.status !== 'OPEN') {
      throw new BadRequestException('Giveaway is not open for participation');
    }

    if (giveaway.userId === userId) {
      throw new BadRequestException('You cannot participate in your own giveaway');
    }

    // Check eligibility
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (giveaway.eligibilityGender !== 'ALL') {
      if (user.gender !== giveaway.eligibilityGender) {
        throw new ForbiddenException('You are not eligible for this giveaway');
      }
    }

    // Check if already participated
    const existing = await this.prisma.participant.findUnique({
      where: {
        userId_giveawayId: {
          userId,
          giveawayId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('You have already expressed interest');
    }

    // Create participation
    const participant = await this.prisma.participant.create({
      data: {
        userId,
        giveawayId,
        status: 'INTERESTED',
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        giveaway: {
          select: { id: true, title: true },
        },
      },
    });

    // Notify giver
    await this.prisma.notification.create({
      data: {
        userId: giveaway.userId,
        type: 'NEW_MESSAGE',
        title: 'New interest!',
        message: `${user.name} is interested in "${giveaway.title}"`,
        data: { giveawayId },
      },
    });

    return participant;
  }

  /**
   * Withdraw interest
   */
  async withdrawInterest(giveawayId: string, userId: string) {
    const participation = await this.prisma.participant.findUnique({
      where: {
        userId_giveawayId: {
          userId,
          giveawayId,
        },
      },
    });

    if (!participation) {
      throw new NotFoundException('Participation not found');
    }

    if (participation.status === 'SELECTED') {
      throw new BadRequestException('Cannot withdraw after being selected');
    }

    await this.prisma.participant.update({
      where: { id: participation.id },
      data: { status: 'WITHDRAWN' },
    });

    return { message: 'Interest withdrawn' };
  }
}

