import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// TODO: Uncomment when @nestjs/cache-manager is installed
// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { Cache } from 'cache-manager';

// Stub cache manager for development (no-op implementation)
const stubCacheManager = {
  get: async (key: string): Promise<any> => undefined,
  set: async (key: string, value: any, ttl?: number): Promise<void> => {},
  del: async (key: string): Promise<void> => {},
  reset: async (): Promise<void> => {},
};

export interface PageViewEvent {
  userId?: string;
  pageUrl: string;
  referrer?: string;
  sessionId: string;
  timestamp: Date;
  duration?: number;
}

export interface UserActionEvent {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface ConversionEvent {
  userId: string;
  conversionType: string;
  value?: number;
  funnel?: string;
  step?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class AnalyticsService {
  private cacheManager = stubCacheManager;

  constructor(
    private prisma: PrismaService,
    // TODO: Uncomment when @nestjs/cache-manager is installed
    // @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Track page view
   */
  async trackPageView(event: PageViewEvent): Promise<void> {
    try {
      // Store in database
      // Note: You may want to batch these for performance
      const cacheKey = `pageviews:${event.sessionId}`;
      const existing = await this.cacheManager.get(cacheKey);
      const pageviews = existing ? [...existing, event] : [event];
      await this.cacheManager.set(cacheKey, pageviews, 3600000); // 1 hour TTL

      // Store key metrics in cache for dashboard
      const pageKey = `pageview:${event.pageUrl}`;
      const count = await this.cacheManager.get(pageKey);
      await this.cacheManager.set(pageKey, (count || 0) + 1, 86400000); // 24 hours TTL
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  /**
   * Track user action
   */
  async trackUserAction(event: UserActionEvent): Promise<void> {
    try {
      const cacheKey = `action:${event.userId}:${event.action}`;
      const count = await this.cacheManager.get(cacheKey);
      await this.cacheManager.set(cacheKey, (count || 0) + 1, 86400000); // 24 hours TTL

      // Track action type
      const actionKey = `action:${event.action}`;
      const actionCount = await this.cacheManager.get(actionKey);
      await this.cacheManager.set(
        actionKey,
        (actionCount || 0) + 1,
        86400000,
      ); // 24 hours TTL
    } catch (error) {
      console.error('Error tracking user action:', error);
    }
  }

  /**
   * Track conversion event
   */
  async trackConversion(event: ConversionEvent): Promise<void> {
    try {
      // Store conversion in database
      const cacheKey = `conversion:${event.userId}:${event.conversionType}`;
      const conversions = await this.cacheManager.get(
        cacheKey,
      );
      const updated = conversions ? [...conversions, event] : [event];
      await this.cacheManager.set(cacheKey, updated, 2592000000); // 30 days TTL

      // Track by type
      const typeKey = `conversion:${event.conversionType}`;
      const typeCount = await this.cacheManager.get(typeKey);
      await this.cacheManager.set(
        typeKey,
        (typeCount || 0) + 1,
        2592000000,
      ); // 30 days TTL
    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  }

  /**
   * Get analytics dashboard data
   */
  async getDashboardMetrics() {
    try {
      // Get page view stats
      const pageviews = await this.cacheManager.get(
        'pageviews',
      );
      const totalPageviews = Object.values(pageviews || {}).reduce(
        (a, b) => (a as number) + (b as number),
        0,
      );

      // Get user action stats
      const userActions = await this.cacheManager.get(
        'actions',
      );
      const totalActions = Object.values(userActions || {}).reduce(
        (a, b) => (a as number) + (b as number),
        0,
      );

      // Get conversion stats
      const conversions = await this.cacheManager.get(
        'conversions',
      );
      const totalConversions = Object.values(conversions || {}).reduce(
        (a, b) => (a as number) + (b as number),
        0,
      );

      // Get user stats
      const totalUsers = await this.prisma.user.count();
      const activeUsersLast7Days = await this.prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      });

      // Get giveaway stats
      const totalGiveaways = await this.prisma.giveaway.count();
      const activeGiveaways = await this.prisma.giveaway.count({
        where: {
          status: 'ACTIVE' as any,
        },
      });

      const completedGiveaways = await this.prisma.giveaway.count({
        where: {
          status: 'COMPLETED',
        },
      });

      return {
        pageviews: {
          total: totalPageviews,
          topPages: pageviews,
        },
        userActions: {
          total: totalActions,
          byType: userActions,
        },
        conversions: {
          total: totalConversions,
          byType: conversions,
        },
        users: {
          total: totalUsers,
          activeLastWeek: activeUsersLast7Days,
        },
        giveaways: {
          total: totalGiveaways,
          active: activeGiveaways,
          completed: completedGiveaways,
        },
      };
    } catch (error) {
      console.error('Error getting dashboard metrics:', error);
      return null;
    }
  }

  /**
   * Get funnel analysis
   */
  async getFunnelAnalysis(
    funnel: string,
  ): Promise<Record<string, number> | null> {
    try {
      const funnelKey = `funnel:${funnel}`;
      return await this.cacheManager.get(funnelKey);
    } catch (error) {
      console.error('Error getting funnel analysis:', error);
      return null;
    }
  }

  /**
   * Get user journey/cohort data
   */
  async getUserCohort(cohortDate: Date) {
    try {
      const cohortStart = new Date(cohortDate);
      cohortStart.setHours(0, 0, 0, 0);

      const cohortEnd = new Date(cohortDate);
      cohortEnd.setDate(cohortEnd.getDate() + 1);
      cohortEnd.setHours(0, 0, 0, 0);

      const cohortUsers = await this.prisma.user.findMany({
        where: {
          createdAt: {
            gte: cohortStart,
            lt: cohortEnd,
          },
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });

      return {
        date: cohortDate,
        size: cohortUsers.length,
        users: cohortUsers,
      };
    } catch (error) {
      console.error('Error getting user cohort:', error);
      return null;
    }
  }

  /**
   * Get retention metrics
   */
  async getRetentionMetrics() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newUsersLast30 = await this.prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      });

      const activeUsersLast7 = await this.prisma.user.count({
        where: {
          lastLoginAt: {
            gte: sevenDaysAgo,
          },
        },
      });

      const activeUsersToday = await this.prisma.user.count({
        where: {
          lastLoginAt: {
            gte: today,
          },
        },
      });

      return {
        newUsersLast30Days: newUsersLast30,
        activeUsersLast7Days: activeUsersLast7,
        activeUsersToday: activeUsersToday,
        retention7Day:
          newUsersLast30 > 0
            ? Math.round((activeUsersLast7 / newUsersLast30) * 100)
            : 0,
      };
    } catch (error) {
      console.error('Error getting retention metrics:', error);
      return null;
    }
  }

  /**
   * Track event batch for performance
   */
  async trackBatch(
    events: (PageViewEvent | UserActionEvent | ConversionEvent)[],
  ): Promise<void> {
    try {
      for (const event of events) {
        if ('pageUrl' in event) {
          await this.trackPageView(event as PageViewEvent);
        } else if ('conversionType' in event) {
          await this.trackConversion(event as ConversionEvent);
        } else {
          await this.trackUserAction(event as UserActionEvent);
        }
      }
    } catch (error) {
      console.error('Error tracking batch:', error);
    }
  }
}
