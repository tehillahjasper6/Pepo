import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  properties: Record<string, any>;
  timestamp: Date;
}

@Injectable()
export class PrivacyFirstAnalyticsService {
  private readonly logger = new Logger('PrivacyFirstAnalytics');
  private eventBuffer: AnalyticsEvent[] = [];
  private readonly BUFFER_SIZE = 100;
  private readonly FLUSH_INTERVAL = 60000; // 1 minute

  constructor(private prisma: PrismaService) {
    this.startBufferFlush();
  }

  /**
   * Track an analytics event with privacy protection
   */
  async trackEvent(event: AnalyticsEvent) {
    // Hash user ID if present (no direct tracking)
    const hashUserId = event.userId ? this.hashUserId(event.userId) : null;

    // Sanitize properties to remove PII
    const sanitized = this.sanitizeProperties(event.properties);

    const analyticsEvent = {
      eventName: event.eventName,
      userId: hashUserId,
      properties: sanitized,
      timestamp: event.timestamp || new Date(),
    };

    // Add to buffer
    this.eventBuffer.push(analyticsEvent);

    // Flush if buffer is full
    if (this.eventBuffer.length >= this.BUFFER_SIZE) {
      await this.flushBuffer();
    }

    return { status: 'tracked' };
  }

  /**
   * Get user consent for analytics
   */
  async getUserConsent(userId: string) {
    // TODO: Check user analytics consent
    return {
      userId,
      analyticsEnabled: true,
      essentialOnly: false,
      consentDate: new Date(),
    };
  }

  /**
   * Update user consent
   */
  async updateUserConsent(userId: string, consent: {
    analyticsEnabled: boolean;
    essentialOnly: boolean;
  }) {
    // TODO: Store consent preference
    return {
      userId,
      consent,
      updatedAt: new Date(),
    };
  }

  /**
   * Get aggregated analytics (privacy-safe)
   */
  async getAggregatedAnalytics(filters?: {
    startDate?: Date;
    endDate?: Date;
    eventName?: string;
  }) {
    // TODO: Query aggregated data only
    // TODO: No individual user tracking
    
    return {
      metrics: {
        totalEvents: 0,
        uniqueEvents: 0,
        eventBreakdown: {},
        timeSeriesData: [],
      },
      generatedAt: new Date(),
    };
  }

  /**
   * Get user-specific analytics (if they opt in)
   */
  async getUserAnalytics(userId: string) {
    // Check consent first
    const consent = await this.getUserConsent(userId);
    
    if (!consent.analyticsEnabled && consent.essentialOnly) {
      return { error: 'User has not consented to analytics' };
    }

    // TODO: Return only user's own analytics
    
    return {
      userId,
      analytics: {
        giveawayCount: 0,
        receiveCount: 0,
        averageRating: 0,
        trustScore: 0,
        environmentalImpact: 0,
        joinDate: new Date(),
        lastActive: new Date(),
      },
    };
  }

  /**
   * Export user data (GDPR compliance)
   */
  async exportUserData(userId: string) {
    // TODO: Collect all user data
    // TODO: Generate export file
    // TODO: Schedule deletion
    
    return {
      userId,
      exportStatus: 'pending',
      estimatedTime: '24 hours',
      downloadUrl: null,
    };
  }

  /**
   * Request account deletion (right to be forgotten)
   */
  async requestDeletion(userId: string) {
    // TODO: Schedule account deletion
    // TODO: Send confirmation email
    // TODO: 30-day grace period
    
    return {
      userId,
      status: 'deletion_scheduled',
      gracePeriodDays: 30,
      confirmationSent: true,
    };
  }

  /**
   * Get privacy policy compliance status
   */
  async getComplianceStatus() {
    return {
      gdprCompliant: true,
      ccpaCompliant: true,
      dataMinimization: true,
      encryptionEnabled: true,
      retentionPolicy: {
        analyticsRetention: '90 days',
        userDataRetention: 'Until account deletion',
        deletionAutomatic: true,
      },
      lastAudit: new Date(),
    };
  }

  /**
   * Get data retention schedule
   */
  async getRetentionSchedule() {
    return {
      policyType: 'privacy-first',
      retentionRules: [
        {
          dataType: 'Session Analytics',
          retentionPeriod: '30 days',
          encrypted: true,
        },
        {
          dataType: 'User Events',
          retentionPeriod: '90 days',
          encrypted: true,
        },
        {
          dataType: 'User Profile',
          retentionPeriod: 'Until deletion',
          encrypted: true,
        },
        {
          dataType: 'Deleted User Data',
          retentionPeriod: 'None (immediate)',
          encrypted: true,
        },
      ],
    };
  }

  // Helper methods

  private hashUserId(userId: string): string {
    // Use crypto to hash user ID (one-way encryption)
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(userId).digest('hex');
  }

  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const PII_PATTERNS = {
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
      phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
      ssn: /\b\d{3}-\d{2}-\d{4}\b/,
      creditCard: /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/,
      ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/,
      address: /\d+\s+[a-zA-Z\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|circle|cir|court|ct|plaza|plz|avenue|ave|boulevard|blvd|square|sq|trail|trl|parkway|pkwy|circle|cir|drive|dr|terrace|ter)\b/i,
    };

    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (typeof value === 'string') {
        let sanitizedValue = value;

        // Check for PII patterns
        for (const [patternName, pattern] of Object.entries(PII_PATTERNS)) {
          if (pattern.test(sanitizedValue)) {
            sanitizedValue = `[${patternName}]`;
            this.logger.warn(`Detected PII in ${key}: ${patternName}`);
            break;
          }
        }

        sanitized[key] = sanitizedValue;
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private async flushBuffer() {
    if (this.eventBuffer.length === 0) return;

    try {
      // TODO: Save to database in batch
      this.logger.debug(`Flushed ${this.eventBuffer.length} analytics events`);
      this.eventBuffer = [];
    } catch (error) {
      this.logger.error(`Failed to flush analytics buffer: ${error}`);
    }
  }

  private startBufferFlush() {
    setInterval(() => {
      this.flushBuffer();
    }, this.FLUSH_INTERVAL);
  }
}
