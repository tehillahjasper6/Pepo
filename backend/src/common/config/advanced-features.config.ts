/**
 * PEPO Advanced Features Configuration
 * 
 * This file centralizes all configuration for:
 * 1. Digest Notifications System
 * 2. Campaign Reminder System  
 * 3. Follow Suggestions Engine
 *
 * All values are JSON-driven and can be externalized to environment variables or config service.
 * This ensures consistency across all features and makes it easy to adjust behavior without code changes.
 */

/**
 * Digest Notification Configuration
 * JSON Schema Reference: digest_frequencies, digest_channels, digest_content_scope
 */
export const DIGEST_CONFIG = {
  // Supported digest frequencies
  frequencies: {
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
  } as const,

  // Supported delivery channels
  channels: {
    IN_APP: 'IN_APP',      // In-app notifications
    EMAIL: 'EMAIL',        // Email digest
    PUSH: 'PUSH',          // Push notifications
  } as const,

  // Default content included in digests
  defaultContentScope: {
    newPosts: true,       // Include new NGO item posts
    campaigns: true,      // Include upcoming campaigns
    completed: false,     // Include completed giveaways
  },

  // Retention policy
  retentionDays: 30,      // Keep digest preference records for 30 days

  // Digest scheduling (in hours from now)
  scheduleDefaults: {
    DAILY: 24,            // Next daily digest 24 hours from now
    WEEKLY: 7 * 24,       // Next weekly digest 7 days from now
  },
} as const;

/**
 * Campaign Reminder Configuration
 * JSON Schema Reference: campaign_reminders, reminder_intervals, reminder_cooldown
 */
export const CAMPAIGN_REMINDER_CONFIG = {
  // All supported reminder types
  reminderTypes: {
    CAMPAIGN_LAUNCH_7DAYS: 'CAMPAIGN_LAUNCH_7DAYS',      // 7 days before launch
    CAMPAIGN_LAUNCH_24HOURS: 'CAMPAIGN_LAUNCH_24HOURS',  // 24 hours before launch
    CAMPAIGN_LAUNCH_SAME_DAY: 'CAMPAIGN_LAUNCH_SAME_DAY', // On day of launch (1 hour before)
    CAMPAIGN_ENDING: 'CAMPAIGN_ENDING',                   // 24 hours before end
    CAMPAIGN_LAUNCH_SOON: 'CAMPAIGN_LAUNCH_SOON',        // 30 days before launch
  } as const,

  // Reminder interval thresholds (in minutes)
  reminderIntervals: {
    CAMPAIGN_LAUNCH_7DAYS: 7 * 24 * 60,      // 7 days in minutes
    CAMPAIGN_LAUNCH_24HOURS: 24 * 60,        // 24 hours in minutes
    CAMPAIGN_LAUNCH_SAME_DAY: 60,            // 1 hour in minutes
    CAMPAIGN_ENDING: 24 * 60,                // 24 hours before end
    CAMPAIGN_LAUNCH_SOON: 30 * 24 * 60,      // 30 days in minutes
  } as const,

  // Cooldown period to prevent duplicate reminders
  cooldownMinutes: 60,                        // Minimum 1 hour between same reminder type

  // Default reminder settings (all enabled by default)
  defaultSettings: {
    isEnabled: true,
    cooldownMinutes: 60,
  },

  // Log retention policy
  logRetentionDays: 90,                       // Keep reminder logs for 90 days
} as const;

/**
 * Follow Suggestion Configuration
 * JSON Schema Reference: suggestion_signals, confidence_weights, suggestion_expiry
 */
export const FOLLOW_SUGGESTION_CONFIG = {
  // Signal weights for confidence calculation
  signals: {
    popularity: {
      weight: 0.2,
      description: 'NGO popularity (follower count)',
      minValue: 0,
      maxValue: 1,
    },
    category_match: {
      weight: 0.25,
      description: 'User interest alignment with NGO focus areas',
      minValue: 0,
      maxValue: 1,
    },
    location_proximity: {
      weight: 0.15,
      description: 'Geographic proximity between user and NGO',
      minValue: 0,
      maxValue: 1,
    },
    participation_history: {
      weight: 0.25,
      description: 'Similar past participation patterns',
      minValue: 0,
      maxValue: 1,
    },
    trust_score: {
      weight: 0.15,
      description: 'NGO trust score and verification status',
      minValue: 0,
      maxValue: 1,
    },
  } as const,

  // Confidence threshold for showing suggestions
  // Suggestions below this score are filtered out
  confidenceThreshold: 0.5,

  // Maximum suggestions per user
  maxSuggestionsPerUser: 20,

  // How long a suggestion remains valid (in days)
  suggestionExpiryDays: 30,

  // Minimum followers before NGO is eligible for suggestion
  minFollowersForSuggestion: 5,

  // Refresh schedule (default: weekly on Mondays at 2 AM UTC)
  refreshSchedule: '0 2 * * 1',

  // Confidence levels for suggestion quality
  confidenceLevels: {
    LOW: { min: 0, max: 0.5, label: 'Low Match' },
    MEDIUM: { min: 0.5, max: 0.75, label: 'Good Match' },
    HIGH: { min: 0.75, max: 1.0, label: 'Strong Match' },
  },
} as const;

/**
 * Background Job Scheduling Configuration
 * Defines all scheduled tasks for the advanced features
 */
export const SCHEDULER_CONFIG = {
  jobs: {
    // Process pending digests - every 6 hours
    processPendingDigests: {
      name: 'Process Pending Digests',
      cron: '0 */6 * * *',  // Every 6 hours
      timeout: 30000,       // 30 seconds
      maxRetries: 3,
    },

    // Process campaign reminders - every hour
    processCampaignReminders: {
      name: 'Process Campaign Reminders',
      cron: '0 * * * *',    // Every hour
      timeout: 20000,       // 20 seconds
      maxRetries: 3,
    },

    // Refresh follow suggestions - weekly on Monday at 2 AM UTC
    refreshFollowSuggestions: {
      name: 'Refresh Follow Suggestions',
      cron: '0 2 * * 1',    // Monday at 2 AM UTC
      timeout: 120000,      // 2 minutes (can be long-running)
      maxRetries: 2,
    },

    // Clean up old reminder logs - every Sunday at 3 AM UTC
    cleanupReminderLogs: {
      name: 'Cleanup Reminder Logs',
      cron: '0 3 * * 0',    // Sunday at 3 AM UTC
      timeout: 30000,       // 30 seconds
      maxRetries: 1,
    },

    // Clean up expired suggestions - every Saturday at 2 AM UTC
    cleanupExpiredSuggestions: {
      name: 'Cleanup Expired Suggestions',
      cron: '0 2 * * 6',    // Saturday at 2 AM UTC
      timeout: 30000,       // 30 seconds
      maxRetries: 1,
    },
  },
} as const;

/**
 * Notification Template Configuration
 * Templates used across all three features
 */
export const NOTIFICATION_TEMPLATES = {
  digest: {
    title: (frequency: string) => `Your ${frequency.toLowerCase()} digest is ready`,
    body: (summary: string) => summary,
  },
  campaignReminder: {
    CAMPAIGN_LAUNCH_7DAYS: {
      title: (campaignName: string) => `${campaignName} launching in 7 days`,
      body: (campaignName: string) =>
        `Get ready to participate in ${campaignName}. It launches in one week!`,
    },
    CAMPAIGN_LAUNCH_24HOURS: {
      title: (campaignName: string) => `${campaignName} launches tomorrow!`,
      body: (campaignName: string) =>
        `${campaignName} launches tomorrow. Prepare your participation!`,
    },
    CAMPAIGN_LAUNCH_SAME_DAY: {
      title: (campaignName: string) => `${campaignName} is launching today`,
      body: (campaignName: string) =>
        `${campaignName} is live now. Don't miss out!`,
    },
    CAMPAIGN_ENDING: {
      title: (campaignName: string) => `${campaignName} ends tomorrow`,
      body: (campaignName: string) =>
        `Hurry! ${campaignName} ends tomorrow. Participate now!`,
    },
    CAMPAIGN_LAUNCH_SOON: {
      title: (campaignName: string) => `Coming soon: ${campaignName}`,
      body: (campaignName: string) =>
        `An exciting campaign is coming soon from your favorite NGO.`,
    },
  },
  suggestion: {
    title: 'NGO Recommendation',
    body: (ngoName: string, reason: string) =>
      `We think you'd like ${ngoName}. ${reason}`,
  },
} as const;

/**
 * Error Handling & Logging Configuration
 */
export const ERROR_CONFIG = {
  // Log levels for different feature types
  logLevels: {
    DIGEST: 'debug',
    CAMPAIGN_REMINDER: 'debug',
    FOLLOW_SUGGESTION: 'debug',
  },

  // Retry strategies
  retryStrategies: {
    exponentialBackoff: {
      initialDelayMs: 1000,
      maxDelayMs: 30000,
      multiplier: 2,
    },
  },

  // Critical error thresholds
  alertingThresholds: {
    failureRate: 0.2,        // Alert if 20% of jobs fail
    consecutiveFailures: 3,   // Alert after 3 consecutive failures
  },
} as const;

/**
 * Feature Flags & Validation
 */
export const FEATURE_FLAGS = {
  // Enable/disable features globally
  digestNotificationsEnabled: true,
  campaignRemindersEnabled: true,
  followSuggestionsEnabled: true,

  // Channel-specific flags
  digestChannels: {
    inApp: true,
    email: false,  // Requires email service configuration
    push: false,   // Requires push service configuration
  },

  // Validation rules
  validation: {
    minDigestItems: 0,        // Digest sent even with 0 items
    maxEmailBatch: 1000,      // Max users per email batch
    maxPushBatch: 5000,       // Max users per push batch
  },
} as const;

/**
 * Caching Configuration
 */
export const CACHE_CONFIG = {
  // Cache TTL in seconds
  ttl: {
    suggestions: 3600,        // 1 hour for suggestions
    preferences: 1800,        // 30 minutes for user preferences
    campaigns: 600,           // 10 minutes for campaign data
  },

  // Cache key patterns
  keys: {
    suggestion: (userId: string) => `suggestion:${userId}`,
    preference: (userId: string) => `preference:${userId}`,
    campaign: (campaignId: string) => `campaign:${campaignId}`,
  },
} as const;

export default {
  DIGEST_CONFIG,
  CAMPAIGN_REMINDER_CONFIG,
  FOLLOW_SUGGESTION_CONFIG,
  SCHEDULER_CONFIG,
  NOTIFICATION_TEMPLATES,
  ERROR_CONFIG,
  FEATURE_FLAGS,
  CACHE_CONFIG,
};
