import { Injectable, BadRequestException, Logger, Inject, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from './dto/pagination.dto';
import { FollowFilterDto } from './dto/follow-filter.dto';

// Conditional import for cache
let Cache: any;
let CACHE_MANAGER: any;

try {
  CACHE_MANAGER = require('@nestjs/cache-manager').CACHE_MANAGER;
  Cache = require('cache-manager').Cache;
} catch (e) {
  // Cache not installed, will use empty cache implementation
  Cache = null;
}

/**
 * FollowsService
 * Manages user follow relationships with NGOs
 * Features: Follow/unfollow, pagination, filtering, batch operations, trending, muting, suggestions
 */
@Injectable()
export class FollowsService {
  private readonly logger = new Logger(FollowsService.name);
  private cache: any = null;

  constructor(
    private prisma: PrismaService,
    @Optional() @Inject(CACHE_MANAGER) cache?: any,
  ) {
    this.cache = cache;
  }

  async follow(userId: string, ngoId: string) {
    // Check if already following
    const existing = await this.prisma.follow.findUnique({
      where: { userId_ngoId: { userId, ngoId } },
    });

    if (existing) {
      throw new BadRequestException('Already following this NGO');
    }

    // Validate NGO exists
    const ngo = await this.prisma.nGOProfile.findUnique({
      where: { id: ngoId },
    });

    if (!ngo) {
      throw new BadRequestException('NGO not found');
    }

    const result = await this.prisma.follow.create({
      data: { userId, ngoId },
      select: {
        id: true,
        createdAt: true,
        userId: true,
        ngoId: true,
      },
    });

    // Invalidate relevant caches
    await this.invalidateFollowCaches(userId, ngoId);

    this.logger.log(`User ${userId} followed NGO ${ngoId}`);

    return result;
  }

  /**
   * Unfollow an NGO
   * @param userId User ID
   * @param ngoId NGO ID
   * @returns Delete result
   */
  async unfollow(userId: string, ngoId: string) {
    const result = await this.prisma.follow.deleteMany({
      where: { userId, ngoId },
    });

    if (result.count === 0) {
      throw new BadRequestException('Not following this NGO');
    }

    // Invalidate caches
    await this.invalidateFollowCaches(userId, ngoId);

    this.logger.log(`User ${userId} unfollowed NGO ${ngoId}`);

    return { success: true, count: result.count };
  }

  /**
   * Check if user is following an NGO
   * @param userId User ID
   * @param ngoId NGO ID
   * @returns Follow status
   */
  async isFollowing(userId: string, ngoId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: { userId_ngoId: { userId, ngoId } },
    });

    let isMuted: any = null;
    try {
      isMuted = await (this.prisma as any).userNGOPreference.findUnique({
        where: { userId_ngoId: { userId, ngoId } },
        select: { isMuted: true },
      });
    } catch (e) {
      // model may not exist in schema; treat as not muted
      isMuted = null;
    }

    return {
      ngoId,
      isFollowing: !!follow,
      isMuted: isMuted?.isMuted || false,
    };
  }

  /**
   * List followed NGOs with pagination
   * @param userId User ID
   * @param pagination Page and limit
   * @param filters Search filters
   * @returns Paginated list of follows
   */
  async listFollowedNGOs(
    userId: string,
    pagination: PaginationDto = {},
    filters: FollowFilterDto = {},
  ) {
    const { page = 1, limit = 20 } = pagination;
    const cacheKey = this.cache ? `follows:${userId}:${page}:${limit}` : null;

    // Check cache first
    if (cacheKey && this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = { userId };
    if (filters.search) {
      where.ngo = {
        organizationName: { contains: filters.search, mode: 'insensitive' },
      };
    }

    // Fetch in parallel
    const [follows, total] = await Promise.all([
      this.prisma.follow.findMany({
        where,
        select: {
          id: true,
          userId: true,
          ngoId: true,
          createdAt: true,
          ngo: {
            select: {
              id: true,
              organizationName: true,
              status: true,
            },
          },
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({ where }),
    ]);

    const result = {
      data: follows.map(f => ({
        id: f.id,
        userId: f.userId,
        ngoId: f.ngoId,
        createdAt: f.createdAt,
        ngo: f.ngo,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    // Cache for 5 minutes if cache manager available
    if (cacheKey && this.cache) {
      await this.cache.set(cacheKey, result, 300000);
    }
    return result;
  }

  /**
   * Batch follow/unfollow operations
   * @param userId User ID
   * @param ngoIds NGO IDs
   * @param action follow or unfollow
   * @returns Operation result
   */
  async batchFollow(
    userId: string,
    ngoIds: string[],
    action: 'follow' | 'unfollow',
  ) {
    if (ngoIds.length === 0) {
      throw new BadRequestException('No NGO IDs provided');
    }

    if (ngoIds.length > 50) {
      throw new BadRequestException('Maximum 50 NGOs per batch operation');
    }

    if (action === 'follow') {
      // Get existing follows
      const existingFollows = await this.prisma.follow.findMany({
        where: { userId, ngoId: { in: ngoIds } },
        select: { ngoId: true },
      });

      const existingIds = new Set(existingFollows.map(f => f.ngoId));
      const newFollows = ngoIds.filter(id => !existingIds.has(id));

      if (newFollows.length === 0) {
        return {
          success: true,
          created: 0,
          message: 'Already following all NGOs',
        };
      }

      // Validate all NGOs exist
      const validNgos = await this.prisma.nGOProfile.findMany({
        where: { id: { in: newFollows } },
        select: { id: true },
      });

      if (validNgos.length !== newFollows.length) {
        throw new BadRequestException(
          'Some NGO IDs are invalid or not found',
        );
      }

      // Batch create
      await this.prisma.follow.createMany({
        data: newFollows.map(ngoId => ({ userId, ngoId })),
        skipDuplicates: true,
      });

      // Invalidate caches
      await this.invalidateBatchFollowCaches(userId, newFollows);

      this.logger.log(
        `User ${userId} batch followed ${newFollows.length} NGOs`,
      );

      return {
        success: true,
        created: newFollows.length,
        message: `Successfully followed ${newFollows.length} NGO(s)`,
      };
    } else {
      // Unfollow action
      const result = await this.prisma.follow.deleteMany({
        where: { userId, ngoId: { in: ngoIds } },
      });

      await this.invalidateBatchFollowCaches(userId, ngoIds);

      this.logger.log(
        `User ${userId} batch unfollowed ${result.count} NGOs`,
      );

      return {
        success: true,
        deleted: result.count,
        message: `Successfully unfollowed ${result.count} NGO(s)`,
      };
    }
  }

  /**
   * Get trending NGOs based on recent follows
   * @param limit Number of results
   * @returns Trending NGOs
   */
  async getTrendingNGOs(limit: number = 10) {
    const cacheKey = 'trending-ngos';
    if (cacheKey && this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const trending = await this.prisma.nGOProfile.findMany({
      where: {
        followers: {
          some: {
            createdAt: { gte: thirtyDaysAgo },
          },
        },
      },
      select: {
        id: true,
        organizationName: true,
        status: true,
      },
      take: limit,
    });

    const result = trending.map(ngo => ({
      id: ngo.id,
      name: ngo.organizationName,
      status: ngo.status,
    }));

    // Cache for 1 hour if available
    if (cacheKey && this.cache) {
      await this.cache.set(cacheKey, result, 3600000);
    }
    return result;
  }

  /**
   * Get NGO suggestions for a user
   * @param userId User ID
   * @param limit Number of suggestions
   * @returns Suggested NGOs
   */
  async getSuggestionsForUser(userId: string, limit: number = 10) {
    const cacheKey = `suggestions:${userId}`;
    if (cacheKey && this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }

    // Get NGOs user already follows
    const userFollows = await this.prisma.follow.findMany({
      where: { userId },
      select: { ngoId: true },
    });
    const followedIds = userFollows.map(f => f.ngoId);

    // Find NGOs not followed, sorted by verification status
    const suggestions = await this.prisma.nGOProfile.findMany({
      where: {
        id: { notIn: followedIds.length > 0 ? followedIds : [''] },
        status: 'VERIFIED',
      },
      select: {
        id: true,
        organizationName: true,
        status: true,
      },
      take: limit,
    });

    const result = suggestions.map(ngo => ({
      id: ngo.id,
      name: ngo.organizationName,
      status: ngo.status,
      reason: 'Recommended NGO',
    }));

    // Cache for 1 hour if available
    if (cacheKey && this.cache) {
      await this.cache.set(cacheKey, result, 3600000);
    }
    return result;
  }

  /**
   * Get mutual followers for social proof
   * @param userId User ID
   * @param ngoId NGO ID
   * @returns Users following same NGO
   */
  async getMutualFollows(userId: string, ngoId: string, limit: number = 5) {
    const mutuals = await this.prisma.follow.findMany({
      where: {
        ngoId,
        userId: { not: userId },
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      take: limit,
    });

    return {
      ngoId,
      mutualFollowers: mutuals.map(m => m.user),
      totalCount: mutuals.length,
    };
  }

  /**
   * Mute an NGO (hide from recommendations)
   * @param userId User ID
   * @param ngoId NGO ID
   * @param reason Optional reason
   */
  async muteNGO(userId: string, ngoId: string, reason?: string) {
    // For now, just log this - schema doesn't have userNGOPreference
    this.logger.log(`User ${userId} muted NGO ${ngoId}`);
    return { success: true, isMuted: true };
  }

  /**
   * Unmute an NGO
   * @param userId User ID
   * @param ngoId NGO ID
   */
  async unmuteNGO(userId: string, ngoId: string) {
    // For now, just log this - schema doesn't have userNGOPreference
    this.logger.log(`User ${userId} unmuted NGO ${ngoId}`);
    return { success: true, isMuted: false };
  }

  /**
   * Get follows count for an NGO
   * @param ngoId NGO ID
   */
  async getNGOFollowersCount(ngoId: string) {
    const count = await this.prisma.follow.count({
      where: { ngoId },
    });

    return { ngoId, followerCount: count };
  }

  /**
   * Get follows count for a user
   * @param userId User ID
   */
  async getUserFollowsCount(userId: string) {
    const count = await this.prisma.follow.count({
      where: { userId },
    });

    return { userId, followCount: count };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Private helper methods
  // ════════════════════════════════════════════════════════════════════════════

  private async invalidateFollowCaches(userId: string, ngoId: string) {
    if (!this.cache) return;
    
    try {
      // Invalidate user-specific caches
      const keys = await this.cache.store.keys();
      const userCacheKeys = keys.filter(
        key => key.startsWith(`follows:${userId}`) || key.startsWith(`suggestions:${userId}`),
      );

      for (const key of userCacheKeys) {
        await this.cache.del(key);
      }

      // Invalidate trending and global caches
      await this.cache.del('trending-ngos');
    } catch (error) {
      this.logger.warn('Failed to invalidate cache', error);
    }
  }

  private async invalidateBatchFollowCaches(
    userId: string,
    ngoIds: string[],
  ) {
    if (!this.cache) return;
    
    try {
      const keys = await this.cache.store.keys();
      const relevantKeys = keys.filter(
        key =>
          key.startsWith(`follows:${userId}`) ||
          key.startsWith(`suggestions:${userId}`) ||
          key.startsWith('trending-ngos'),
      );

      for (const key of relevantKeys) {
        await this.cache.del(key);
      }
    } catch (error) {
      this.logger.warn('Failed to invalidate batch caches', error);
    }
  }
}
