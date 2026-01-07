import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface Circle {
  id: string;
  name: string;
  description: string;
  city: string;
  neighborhood: string;
  radius: number; // in km
  memberCount: number;
  createdBy: string;
  createdAt: Date;
}

@Injectable()
export class NeighborhoodCircleService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new neighborhood circle
   */
  async createCircle(userId: string, data: {
    name: string;
    description: string;
    city: string;
    neighborhood: string;
    radius?: number;
  }) {
    // Validate circle doesn't already exist
    const exists = await this.prisma.neighborhoodCircle.findFirst({
      where: {
        city: data.city,
        neighborhood: data.neighborhood,
        name: data.name,
      },
    });
    if (exists) throw new Error('Circle already exists for this city/neighborhood/name');

    // Optionally: Validate city/neighborhood exist in a reference table

    // Create circle
    const circle = await this.prisma.neighborhoodCircle.create({
      data: {
        name: data.name,
        description: data.description,
        city: data.city,
        neighborhood: data.neighborhood,
        radius: data.radius || 5,
        createdBy: userId,
      },
    });
    // Add creator as first member
    await this.prisma.neighborhoodCircleMember.create({
      data: {
        userId,
        circleId: circle.id,
      },
    });
    return circle;
  }

  /**
   * Join a neighborhood circle
   */
  async joinCircle(userId: string, circleId: string) {
    // Check if already member
    const member = await this.prisma.neighborhoodCircleMember.findUnique({
      where: { userId_circleId: { userId, circleId } },
    });
    if (member) return { status: 'already_member', circleId, joinedAt: member.joinedAt };

    // Optionally: Check if user location is within circle (requires user location info)

    // Add user to circle
    const newMember = await this.prisma.neighborhoodCircleMember.create({
      data: { userId, circleId },
    });
    return { status: 'joined', circleId, joinedAt: newMember.joinedAt };
  }

  /**
   * Leave a neighborhood circle
   */
  async leaveCircle(userId: string, circleId: string) {
    // Remove user from circle
    await this.prisma.neighborhoodCircleMember.deleteMany({ where: { userId, circleId } });
    // If user was creator and only member, delete circle
    const circle = await this.prisma.neighborhoodCircle.findUnique({ where: { id: circleId } });
    const members = await this.prisma.neighborhoodCircleMember.findMany({ where: { circleId } });
    if (circle && circle.createdBy === userId && members.length === 0) {
      await this.prisma.neighborhoodCircle.delete({ where: { id: circleId } });
      return { status: 'deleted', circleId };
    }
    return { status: 'left', circleId };
  }

  /**
   * Get circles for user's location
   */
  async getNearbyCircles(userCity: string, userLatitude: number, userLongitude: number) {
    // Query all circles in the city (no real geospatial, just city match)
    const circles = await this.prisma.neighborhoodCircle.findMany({ where: { city: userCity } });
    // For demo: fake distance as 1.0 for all
    // Optionally: Add real geospatial logic if lat/lng stored
    return circles.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      city: c.city,
      neighborhood: c.neighborhood,
      radius: c.radius,
      memberCount: undefined, // can be filled by counting members
      distance: 1.0,
      joined: false,
    }));
  }

  /**
   * Get circle members
   */
  async getCircleMembers(circleId: string, limit = 20) {
    const members = await this.prisma.neighborhoodCircleMember.findMany({
      where: { circleId },
      take: limit + 1,
      include: { user: true },
    });
    return {
      circleId,
      memberCount: await this.prisma.neighborhoodCircleMember.count({ where: { circleId } }),
      members: members.slice(0, limit).map((m) => ({ userId: m.userId, joinedAt: m.joinedAt, user: m.user })),
      hasMore: members.length > limit,
    };
  }

  /**
   * Get circle giveaways
   */
  async getCircleGiveaways(circleId: string, limit = 20) {
    // Get all members
    const members = await this.prisma.neighborhoodCircleMember.findMany({ where: { circleId } });
    const userIds = members.map((m) => m.userId);
    // Get active giveaways from these users
    const giveaways = await this.prisma.giveaway.findMany({
      where: { userId: { in: userIds }, status: 'OPEN' },
      take: limit + 1,
    });
    return {
      circleId,
      giveawayCount: giveaways.length,
      giveaways: giveaways.slice(0, limit),
      hasMore: giveaways.length > limit,
    };
  }

  /**
   * Get user's circles
   */
  async getUserCircles(userId: string) {
    const memberships = await this.prisma.neighborhoodCircleMember.findMany({
      where: { userId },
      include: { circle: true },
    });
    return {
      userId,
      circles: memberships.map((m) => m.circle),
      total: memberships.length,
    };
  }

  /**
   * Post to circle (announcement/request)
   */
  async postToCircle(userId: string, circleId: string, data: {
    type: 'announcement' | 'request' | 'event';
    title: string;
    description: string;
    image?: string;
  }) {
    // Validate user is member
    const member = await this.prisma.neighborhoodCircleMember.findUnique({ where: { userId_circleId: { userId, circleId } } });
    if (!member) throw new Error('User is not a member of this circle');
    // Create post
    const post = await this.prisma.neighborhoodCirclePost.create({
      data: {
        userId,
        circleId,
        type: data.type,
        title: data.title,
        description: data.description,
        image: data.image,
      },
    });
    return {
      postId: post.id,
      status: 'posted',
      createdAt: post.createdAt,
    };
  }

  /**
   * Get circle activity feed
   */
  async getCircleFeed(circleId: string, limit = 20) {
    // Get posts (sorted by recency)
    const posts = await this.prisma.neighborhoodCirclePost.findMany({
      where: { circleId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    });
    return {
      circleId,
      feed: posts.slice(0, limit),
      hasMore: posts.length > limit,
    };
  }

  /**
   * Update circle info (creator only)
   */
  async updateCircle(userId: string, circleId: string, updates: any) {
    // Verify user is creator
    const circle = await this.prisma.neighborhoodCircle.findUnique({ where: { id: circleId } });
    if (!circle || circle.createdBy !== userId) throw new Error('Only the creator can update the circle');
    const updated = await this.prisma.neighborhoodCircle.update({
      where: { id: circleId },
      data: updates,
    });
    return {
      status: 'updated',
      circleId,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Delete circle (creator only)
   */
  async deleteCircle(userId: string, circleId: string) {
    // Verify user is creator
    const circle = await this.prisma.neighborhoodCircle.findUnique({ where: { id: circleId } });
    if (!circle || circle.createdBy !== userId) throw new Error('Only the creator can delete the circle');
    // Delete all related data (members, posts)
    await this.prisma.neighborhoodCircleMember.deleteMany({ where: { circleId } });
    await this.prisma.neighborhoodCirclePost.deleteMany({ where: { circleId } });
    await this.prisma.neighborhoodCircle.delete({ where: { id: circleId } });
    return {
      status: 'deleted',
      circleId,
    };
  }

  /**
   * Get circle statistics
   */
  async getCircleStats(circleId: string) {
    // Calculate stats
    const memberCount = await this.prisma.neighborhoodCircleMember.count({ where: { circleId } });
    // For demo, activeMembers = memberCount, others are placeholders
    return {
      circleId,
      memberCount,
      activeMembers: memberCount,
      giveawayCount: 0,
      completedExchanges: 0,
      totalItemsShared: 0,
      co2Saved: 0,
      averageTrustScore: 0,
    };
  }
}
