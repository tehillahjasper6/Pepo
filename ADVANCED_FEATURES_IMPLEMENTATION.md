# Advanced Features Implementation Guide

## Overview

This document outlines the implementation of three advanced engagement features for the Pepo platform:

1. **Digest Notifications System** - Daily/weekly summaries of NGO posts and campaigns
2. **Campaign Reminder System** - Automated reminders for campaign launches and deadlines
3. **Smart Follow Suggestions Engine** - ML-based NGO recommendations using behavioral signals

## Feature 1: Digest Notifications System

### Purpose
Deliver curated summaries of followed NGO activities to users on a schedule (daily or weekly), reducing notification fatigue while keeping users informed.

### Key Components

#### Database Models
- **UserDigestPreference** - Stores user digest settings
  - Frequency (DAILY/WEEKLY)
  - Delivery channels (IN_APP, EMAIL, PUSH)
  - Content scope flags (includeNewPosts, includeCampaigns, includeCompleted)
  - Last sent timestamp and next scheduled time

#### Service: DigestService
**Location**: `backend/src/digests/digest.service.ts`

**Core Methods**:
- `processPendingDigests()` - Background job that finds all users with scheduled digests and processes them
- `generateAndSendDigest(userId, frequency)` - Compiles digest content and sends through enabled channels
- `buildDigestContent(userId, since, preferences)` - Queries database for new posts, campaigns, and completions
- `sendDigestThroughChannels()` - Routes digest to IN_APP, EMAIL, or PUSH channels

**Configuration** (JSON-driven):
```typescript
DIGEST_CONFIG = {
  frequencies: ['DAILY', 'WEEKLY'],
  channels: ['IN_APP', 'EMAIL', 'PUSH'],
  contentScope: {
    newPosts: true,
    campaigns: true,
    completed: false,
  },
  retentionDays: 30,
}
```

#### API Endpoints
- `GET /api/digests/preferences` - Get user's digest settings
- `PUT /api/digests/preferences` - Update all digest settings
- `PUT /api/digests/frequency` - Update frequency only
- `PUT /api/digests/channels` - Update delivery channels
- `PUT /api/digests/content-scope` - Update what content is included
- `PUT /api/digests/toggle` - Enable/disable digests
- `POST /api/digests/test` - Send test digest (development)

#### Background Job
- **Cron**: Every 6 hours (6 AM, 12 PM, 6 PM, 12 AM UTC)
- **File**: `backend/src/workers/advanced-features-scheduler.ts`
- **Method**: `processDigests()`

### User Flow
1. User sets digest preferences (frequency + channels)
2. Scheduler triggers every 6 hours
3. Service queries giveaways and campaigns since last digest
4. Digest compiled with user's content scope preferences
5. Sent through enabled channels
6. Next scheduled time calculated and stored

### Configuration Points
- Frequency enum: DAILY, WEEKLY
- Channels enum: IN_APP, EMAIL, PUSH
- Retention period: 30 days
- Query batch size: 20 items per category

---

## Feature 2: Campaign Reminder System

### Purpose
Send timely reminders to followers when campaigns are launching or ending, maximizing engagement and participation.

### Key Components

#### Database Models
- **CampaignReminderSetting** - Configures which reminders are enabled per campaign
- **CampaignReminderLog** - Audit trail of sent reminders (prevents duplicates via unique constraint)

#### Service: CampaignReminderService
**Location**: `backend/src/campaign-reminders/campaign-reminder.service.ts`

**Core Methods**:
- `processPendingReminders()` - Runs hourly to evaluate all campaigns
- `shouldSendReminder(campaign, reminderType, now)` - Determines if reminder timing matches
- `sendReminder(campaign, reminderType)` - Sends to all NGO followers
- `hasRecentReminder()` - Idempotency check using cooldown window
- `logReminderSent()` - Records sent reminder to prevent duplicates

**Reminder Types**:
- `CAMPAIGN_LAUNCH_7DAYS` - 7 days before launch
- `CAMPAIGN_LAUNCH_24HOURS` - 24 hours before launch
- `CAMPAIGN_LAUNCH_SAME_DAY` - Day of launch
- `CAMPAIGN_ENDING` - 24 hours before campaign ends
- `CAMPAIGN_LAUNCH_SOON` - 30 days before launch

**Configuration** (JSON-driven):
```typescript
REMINDER_CONFIG = {
  reminderTypes: [
    'CAMPAIGN_LAUNCH_7DAYS',
    'CAMPAIGN_LAUNCH_24HOURS',
    'CAMPAIGN_LAUNCH_SAME_DAY',
    'CAMPAIGN_ENDING',
    'CAMPAIGN_LAUNCH_SOON',
  ],
  reminderIntervals: {
    CAMPAIGN_LAUNCH_7DAYS: 7 * 24 * 60,     // 7 days in minutes
    CAMPAIGN_LAUNCH_24HOURS: 24 * 60,       // 24 hours in minutes
    CAMPAIGN_LAUNCH_SAME_DAY: 60,           // 1 hour in minutes
    CAMPAIGN_ENDING: 24 * 60,               // 24 hours
    CAMPAIGN_LAUNCH_SOON: 30 * 24 * 60,     // 30 days
  },
  cooldownMinutes: 60, // Prevent duplicates within 1 hour
}
```

#### API Endpoints
- `GET /api/campaigns/:campaignId/reminders` - Get reminder settings (NGO/Admin)
- `PUT /api/campaigns/:campaignId/reminders/:reminderType` - Enable/disable reminder type
- `DELETE /api/campaigns/:campaignId/reminders` - Disable all reminders
- `GET /api/campaigns/:campaignId/reminders/logs` - View reminder audit trail (NGO/Admin)

#### Background Job
- **Cron**: Every hour
- **File**: `backend/src/workers/advanced-features-scheduler.ts`
- **Method**: `processCampaignReminders()`

### Idempotency Mechanism
- **CampaignReminderLog** table tracks all sent reminders with unique constraint: `(userId, campaignId, reminderType)`
- **Cooldown Window**: 60 minutes - prevents same reminder sending twice within window
- Before sending: Check if reminder was sent in last 60 minutes
- After sending: Log reminder to database for audit trail

### User Flow
1. Campaign created with startDate and endDate
2. NGO can configure which reminder types to enable
3. Scheduler checks hourly for campaigns in reminder windows
4. For each matching reminder type:
   - Check idempotency (has reminder already been sent?)
   - Get all followers of campaign's NGO
   - Send reminder notification to each follower
   - Log reminder sent
5. User receives timed reminders about campaign events

---

## Feature 3: Smart Follow Suggestions Engine

### Purpose
Recommend NGOs for users to follow based on behavioral signals and ML-weighted scoring, increasing user engagement and platform growth.

### Key Components

#### Database Models
- **FollowSuggestion** - Tracks generated suggestions with scores and engagement status
  - Fields: userId, suggestedNGOId, confidenceScore, signalWeight (JSON), reason
  - Status flags: isViewed, isFollowed, isIgnored
  - Expiration: 30-day validity window

#### Service: FollowSuggestionService
**Location**: `backend/src/follow-suggestions/follow-suggestion.service.ts`

**Signal Weighting** (JSON-configured):
```typescript
SIGNAL_CONFIG = {
  signals: {
    popularity: { weight: 0.2 },           // NGO follower count
    category_match: { weight: 0.25 },      // User interest alignment
    location_proximity: { weight: 0.15 },  // Geographic proximity
    participation_history: { weight: 0.25 }, // Similar giveaway behavior
    trust_score: { weight: 0.15 },         // NGO verification/rating
  },
  confidenceThreshold: 0.5,               // Min score to show suggestion
  maxSuggestionsPerUser: 20,
  suggestionExpiryDays: 30,
}
```

**Core Methods**:
- `generateSuggestionsForUser(userId)` - Creates fresh suggestions for user
- `calculateSignalScores(userId, ngo)` - Evaluates all 5 weighted signals
- `calculateConfidenceScore(scores)` - Combines signals into 0-1 score
- `calculatePopularityScore(ngo)` - Based on follower count
- `calculateCategoryMatchScore(userId, ngo)` - User interests vs NGO focus area
- `calculateLocationProximityScore(userId, ngo)` - Geography alignment
- `calculateParticipationHistoryScore(userId, ngo)` - Giveaway participation patterns
- `calculateTrustScore(ngo)` - Verification status and ratings
- `refreshAllSuggestions()` - Weekly refresh for all active users

#### Signal Scoring Logic

1. **Popularity Score** (weight: 0.20)
   - Normalized follower count relative to average
   - Range: 0 (unpopular) to 1 (very popular)

2. **Category Match** (weight: 0.25) - Highest weight
   - 0.9 if NGO focus area matches user's followed NGO categories
   - 0.7 if similar categories in user's follow history
   - 0.4 otherwise
   - 0.5 if user has no follow history yet

3. **Location Proximity** (weight: 0.15)
   - 0.8 if same city
   - 0.6 if same state, different city
   - 0.4 if same country, different state
   - 0.2 if different country

4. **Participation History** (weight: 0.25) - Highest weight
   - 0.2 if user already participated in NGO's giveaways
   - 0.7 if user is active (participates in giveaways)
   - 0.5 if no participation history
   - Identifies engaged users more likely to participate further

5. **Trust Score** (weight: 0.15)
   - Base 0.5, +0.3 for verified status
   - Overrideable by trustScore rating (normalized 0-100 to 0-1)
   - Ensures low-trust suggestions are deprioritized

#### API Endpoints
- `GET /api/suggestions` - Get active suggestions for user
- `POST /api/suggestions/refresh` - Generate new suggestions
- `PUT /api/suggestions/:suggestionId/view` - Mark as viewed
- `POST /api/suggestions/:suggestionId/follow` - Follow NGO from suggestion
- `PUT /api/suggestions/:suggestionId/ignore` - Mark suggestion as ignored
- `GET /api/suggestions/:suggestionId` - Get suggestion details

#### Background Job
- **Cron**: Every Monday at 2 AM UTC (weekly refresh)
- **File**: `backend/src/workers/advanced-features-scheduler.ts`
- **Method**: `refreshFollowSuggestions()`

### User Flow
1. User with follows gets suggestions via weekly refresh job
2. Suggestions ranked by confidence score (highest first)
3. User views suggestions in UI
4. Can choose to:
   - Follow the suggested NGO (marks suggestion as followed)
   - Ignore suggestion (marks as ignored, won't reappear)
   - Do nothing (can revisit later)
5. Old suggestions expire after 30 days

---

## Database Migrations

Run the Prisma migration to create new tables and enums:

```bash
cd backend
npx prisma migrate dev --name add_advanced_features
```

This creates:
- `UserDigestPreference` table
- `CampaignReminderSetting` table
- `CampaignReminderLog` table
- `FollowSuggestion` table
- 6 new enums (DigestFrequency, DigestChannel, ReminderType)
- Indexes for performance optimization

## Module Integration

All three features are integrated into the NestJS application via:

1. **Feature Modules**:
   - `DigestModule` → `DigestController` + `DigestService`
   - `CampaignReminderModule` → `CampaignReminderController` + `CampaignReminderService`
   - `FollowSuggestionModule` → `FollowSuggestionController` + `FollowSuggestionService`

2. **Workers Module** (`WorkersModule`):
   - Imports all three feature modules
   - Provides `AdvancedFeaturesScheduler` for background jobs
   - All cron jobs registered with `@nestjs/schedule`

3. **App Module** (`AppModule`):
   - Imports all three feature modules
   - `ScheduleModule.forRoot()` enabled in WorkersModule

## Testing

Unit tests provided for all services:

```bash
npm test -- digest.service.spec.ts
npm test -- campaign-reminder.service.spec.ts
npm test -- follow-suggestion.service.spec.ts
```

Tests cover:
- Service method functionality
- Error handling
- Database interaction
- Business logic validation

## Configuration Management

All configuration is JSON-driven for easy A/B testing:

```typescript
// In each service, configuration is defined as:
private readonly CONFIG = {
  // enum values
  // weighting logic
  // thresholds
  // timing intervals
}
```

To change configurations without code changes, extract to a config service or environment variables:

```typescript
constructor(private configService: ConfigService) {
  this.DIGEST_CONFIG = this.configService.get('digest');
  this.REMINDER_CONFIG = this.configService.get('campaign_reminders');
  this.SIGNAL_CONFIG = this.configService.get('follow_suggestions');
}
```

## Logging & Monitoring

All services include comprehensive logging:

```typescript
this.logger.log(`Processed ${count} digests`);
this.logger.error('Error in digest processing job:', error);
this.logger.debug('Processing digest for user...');
```

Monitor the logs for:
- Background job execution times
- Error rates in notification delivery
- Suggestion generation performance
- Database query slowdowns

## Performance Considerations

### Digest Processing
- Batch processes users with scheduled digests
- Queries limited to 20 items per category
- Runs every 6 hours (not realtime)

### Campaign Reminders
- Evaluates all campaigns hourly
- Cooldown window prevents duplicate sends
- Batch queries followers per campaign

### Follow Suggestions
- Full refresh runs weekly (not realtime)
- Expensive ML calculations done in background job
- Suggestions cached in database for 30 days
- Results paginated (10 items default, max 50)

---

## Deployment Checklist

- [ ] Run Prisma migration
- [ ] Verify all three modules import successfully
- [ ] Check ScheduleModule is enabled in WorkersModule
- [ ] Test background jobs manually with test endpoints
- [ ] Configure JSON settings in config service
- [ ] Set up logging/monitoring
- [ ] Test email integration for digest channel
- [ ] Test push notification service integration
- [ ] Run unit test suite
- [ ] Load test digest processing with large user base

---

## Future Enhancements

1. **Email Templates** - Professional HTML templates for email digests
2. **SMS Channel** - Add SMS delivery for reminders
3. **User Segmentation** - Advanced targeting for reminders
4. **A/B Testing** - Compare different timing/messaging strategies
5. **Analytics** - Track engagement metrics per feature
6. **Admin Dashboard** - View suggestion performance and reminder delivery rates
7. **Personalization** - Adjust weights based on user behavior over time
8. **Unsubscribe Links** - Allow users to opt-out of specific features
9. **Rate Limiting** - Prevent notification fatigue per user
10. **WebSocket Integration** - Realtime digest delivery instead of scheduled
