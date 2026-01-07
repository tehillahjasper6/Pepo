import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  /**
   * Track page view event
   */
  @Post('page-view')
  @ApiOperation({ summary: 'Track page view' })
  async trackPageView(
    @Body()
    data: {
      pageUrl: string;
      referrer?: string;
      sessionId: string;
      duration?: number;
    },
    @CurrentUser() user?: JwtPayload,
  ) {
    await this.analyticsService.trackPageView({
      userId: user?.sub,
      pageUrl: data.pageUrl,
      referrer: data.referrer,
      sessionId: data.sessionId,
      duration: data.duration,
      timestamp: new Date(),
    });

    return { success: true };
  }

  /**
   * Track user action
   */
  @Post('action')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Track user action' })
  async trackAction(
    @Body()
    data: {
      action: string;
      resource: string;
      resourceId?: string;
      metadata?: Record<string, any>;
    },
    @CurrentUser() user: JwtPayload,
  ) {
    await this.analyticsService.trackUserAction({
      userId: user.sub,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      metadata: data.metadata,
      timestamp: new Date(),
    });

    return { success: true };
  }

  /**
   * Track conversion event
   */
  @Post('conversion')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Track conversion event' })
  async trackConversion(
    @Body()
    data: {
      conversionType: string;
      value?: number;
      funnel?: string;
      step?: number;
      metadata?: Record<string, any>;
    },
    @CurrentUser() user: JwtPayload,
  ) {
    await this.analyticsService.trackConversion({
      userId: user.sub,
      conversionType: data.conversionType,
      value: data.value,
      funnel: data.funnel,
      step: data.step,
      metadata: data.metadata,
      timestamp: new Date(),
    });

    return { success: true };
  }

  /**
   * Get analytics dashboard metrics (Admin only)
   */
  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics dashboard metrics' })
  async getDashboard() {
    const metrics = await this.analyticsService.getDashboardMetrics();
    return metrics;
  }

  /**
   * Get funnel analysis
   */
  @Get('funnel/:name')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get funnel analysis' })
  async getFunnel(@Param('name') funnelName: string) {
    const data = await this.analyticsService.getFunnelAnalysis(funnelName);
    return { funnel: funnelName, data };
  }

  /**
   * Get retention metrics
   */
  @Get('retention')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get retention metrics' })
  async getRetention() {
    const metrics = await this.analyticsService.getRetentionMetrics();
    return metrics;
  }

  /**
   * Get cohort analysis
   */
  @Get('cohort')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user cohort data' })
  async getCohort(@Query('date') date: string) {
    const cohortDate = new Date(date);
    const cohort = await this.analyticsService.getUserCohort(cohortDate);
    return cohort;
  }

  /**
   * Track batch events
   */
  @Post('batch')
  @ApiOperation({ summary: 'Track multiple events at once' })
  async trackBatch(
    @Body()
    data: {
      events: Array<{
        type: 'pageview' | 'action' | 'conversion';
        [key: string]: any;
      }>;
    },
    @CurrentUser() user?: JwtPayload,
  ) {
    const events = data.events.map((event) => {
      if (event.type === 'pageview') {
        return {
          userId: user?.sub,
          pageUrl: event.pageUrl,
          referrer: event.referrer,
          sessionId: event.sessionId,
          duration: event.duration,
          timestamp: new Date(),
        };
      } else if (event.type === 'conversion') {
        return {
          userId: user?.sub,
          conversionType: event.conversionType,
          value: event.value,
          funnel: event.funnel,
          step: event.step,
          metadata: event.metadata,
          timestamp: new Date(),
        };
      } else {
        return {
          userId: user?.sub,
          action: event.action,
          resource: event.resource,
          resourceId: event.resourceId,
          metadata: event.metadata,
          timestamp: new Date(),
        };
      }
    });

    await this.analyticsService.trackBatch(events);
    return { success: true, count: events.length };
  }
}
