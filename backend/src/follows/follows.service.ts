import { Injectable, BadRequestException, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PaginationDto } from './dto/pagination.dto';
import { FollowFilterDto } from './dto/follow-filter.dto';

/**
 * FollowsService
 * Manages user follow relationships with NGOs
 * Features: Follow/unfollow, pagination, filtering, batch operations, trending, muting, suggestions
 */
@Injectable()
export class FollowsService {
  private readonly logger = new Logger(FollowsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  /**
   * Follow an NGO
   * @param userId User ID
   * @param ngoId NGO ID
   * @returns Created follow record
   */
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
        ngo: {
          select: {
            id: true,
            organizationName: true,
            impactScore: true,
          },
        },
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

    const isMuted = await this.prisma.userNGOPreference.findUnique({
      where: { userId_ngoId: { userId, ngoId } },
      select: { isMuted: true },
    });

    return {
      ngoId,
      isFollowing: !!follow,
      isMuted: isMuted?.isMuted || false,
    };
  }

  /**
   * List followed NGOs with pagination and filtering
   * @param userId User ID
   * @param pagination Page and limit
   * @param filters Category, sort, search
   * @returns Paginated list of follows
   */
  async listFollowedNGOs(
    userId: string,
    pagination: PaginationDto = {},
    filters: FollowFilterDto = {},
  ) {
    const { page = 1, limit = 20 } = pagination;
    const cacheKey = `follows:${userId}:${page}:${limit}:${filters.sortBy}:${filters.category}`;

    // Check cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const offset = (page - 1) * limit;
    const orderBy = this.buildOrderBy(filters.sortBy || 'followedAt');

    // Build where clause
    const where: any = { userId };
    if (filters.category) {
      where.ngo = { category: filters.category };
    }
    if (filters.search) {
      where.ngo = {
        ...where.ngo,
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
              impactScore: true,
              category: true,
              _count: { select: { follows: true } },
            },
          },
        },
        skip: offset,
        take: limit,
        orderBy,
      }),
      this.prisma.follow.count({ where }),
    ]);

    const result = {
      data: follows.map(f => ({
        ...f,
        ngo: {
          ...f.ngo,
          followerCount: f.ngo._count.follows,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    // Cache for 5 minutes
    await this.cache.set(cacheKey, result, 300000);
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
   * Get trending NGOs based on recent follows and impact
   * @param limit Number of results
   * @returns Trending NGOs
   */
  async getTrendingNGOs(limit: number = 10) {
    const cacheKey = 'trending-ngos';
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const trending = await this.prisma.nGOProfile.findMany({
      where: {
        follows: {
          some: {
            createdAt: { gte: thirtyDaysAgo },
          },
        },
      },
      select: {
        id: true,
        organizationName: true,
        impactScore: true,
        category: true,
        _count: { select: { follows: true } },
      },
      orderBy: [{ impactScore: 'desc' }, { follows: { _count: 'desc' } }],
      take: limit,
    });

    const result = trending.map(ngo => ({
      id: ngo.id,
      name: ngo.organizationName,
      impactScore: ngo.impactScore,
      category: ngo.category,
      followerCount: ngo._count.follows,
    }));

    // Cache for 1 hour
    await this.cache.set(cacheKey, result, 3600000);
    return result;
  }

  /**
   * Get NGO suggestions for a user based on behavior
   * @param userId User ID
   * @param limit Number of suggestions
   * @returns Suggested NGOs
   */
  async getSuggestionsForUser(userId: string, limit: number = 10) {
    const cacheKey = `suggestions:${userId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    // Get NGOs user already follows
    const userFollows = await this.prisma.follow.findMany({
      where: { userId },
      select: { ngoId: true },
    });
    const followedIds = userFollows.map(f => f.ngoId);

    // Get user's followed NGOs' categories
    const followedNGOs = await this.prisma.nGOProfile.findMany({
      where: { id: { in: followedIds } },
      select: { category: true },
    });
    const userCategories = [...new Set(followedNGOs.map(n => n.category))];

    // Find similar NGOs not followed
    const suggestions = await this.prisma.nGOProfile.findMany({
      where: {
        id: { notIn: followedIds },
        category: userCategories.length > 0 ? { in: userCategories } : undefined,
        userNGOPreferences: {
          none: {
            userId,
            isMuted: true,
          },
        },
      },
      select: {
        id: true,
        organizationName: true,
        category: true,
        impactScore: true,
        _count: { select: { follows: true } },
      },
      orderBy: [{ impactScore: 'desc' }, { follows: { _count: 'desc' } }],
      take: limit,
    });

    const result = suggestions.map(ngo => ({
      id: ngo.id,
      name: ngo.organizationName,
      category: ngo.category,
      impactScore: ngo.impactScore,
      followerCount: ngo._count.follows,
      reason:
        userCategories.length > 0
          ? `Similar to NGOs you follow in ${userCategories[0]} category`
          : 'Highly recommended',
    }));

    // Cache for 1 hour
    await this.cache.set(cacheKey, result, 3600000);
    return result;
  }

  /**
   * Get mutual follows (users following the same NGO)
   * @param userId User ID
   * @param ngoId NGO ID
   * @returns Users following same NGO
   */
  async getMutualFollows(userId: string, ngoId: string, limit: number = 5) {
    const mutuals = await this.prisma.follow.findMany({
      where: {
        ngoId,
        userId: { not: userId },
        user: {
          follows: {
            some: { ngoId },
          },
        },
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
   * Mute an NGO (hide from recommendations but keep follow)
   * @param userId User ID
   * @param ngoId NGO ID
   * @param reason Optional reason
   */
  async muteNGO(userId: string, ngoId: string, reason?: string) {
    const result = await this.prisma.userNGOPreference.upsert({
      where: { userId_ngoId: { userId, ngoId } },
      create: { userId, ngoId, isMuted: true, muteReason: reason },
      update: { isMuted: true, muteReason: reason },
    });

    await this.invalidateFollowCaches(userId, ngoId);

    this.logger.log(`User ${userId} muted NGO ${ngoId}`);

    return { success: true, isMuted: result.isMuted };
  }

  /**
   * Unmute an NGO
   * @param userId User ID
   * @param ngoId NGO ID
   */
  async unmuteNGO(userId: string, ngoId: string) {
    const result = await this.prisma.userNGOPreference.upsert({
      where: { userId_ngoId: { userId, ngoId } },
      create: { userId, ngoId, isMuted: false },
      update: { isMuted: false },
    });

    await this.invalidateFollowCaches(userId, ngoId);

    this.logger.log(`User ${userId} unmuted NGO ${ngoId}`);

    return { success: true, isMuted: result.isMuted };
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
  }

  private async invalidateBatchFollowCaches(
    userId: string,
    ngoIds: string[],
  ) {
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
  }

  private buildOrderBy(sortBy: string) {
    const orderMap = {
      name: { ngo: { organizationName: 'asc' as const } },
      followedAt: { createdAt: 'desc' as const },
      impactScore: { ngo: { impactScore: 'desc' as const } },
    };
    return orderMap[sortBy] || orderMap['followedAt'];
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Deprecated methods kept for backward compatibility
  // ════════════════════════════════════════════════════════════════════════════

  async countFollowers(ngoId: string) {
    return this.prisma.follow.count({ where: { ngoId } });
  }
}
