# PEPO Advanced Features Implementation Guide

## Overview

This document describes the complete implementation of three major features for the PEPO platform:

1. **Digest Notifications System** - Daily/weekly email and in-app digests
2. **Campaign Reminder System** - Timely reminders for NGO campaigns
3. **Smart Follow Suggestions Engine** - AI-powered NGO recommendations

All features are **JSON-driven**, **scalable**, **modular**, and **production-ready**.

---

## Architecture Overview

### Module Structure

```
backend/src/
├── digests/                           # Digest Notification System
│   ├── digest.service.ts             # Core service logic
│   ├── digest.controller.ts          # REST API endpoints
│   ├── digest.module.ts              # Feature module
│   ├── dto/
│   │   └── digest-preference.dto.ts  # Request/response DTOs
│   └── digest.service.spec.ts        # Unit tests
├── campaign-reminders/                # Campaign Reminder System
│   ├── campaign-reminder.service.ts  # Core service logic
│   ├── campaign-reminder.controller.ts # REST API endpoints
│   ├── campaign-reminder.module.ts   # Feature module
│   ├── dto/
│   │   └── campaign-reminder.dto.ts  # Request/response DTOs
│   └── campaign-reminder.service.spec.ts # Unit tests
├── follow-suggestions/                # Follow Suggestions Engine
│   ├── follow-suggestion.service.ts  # Core service logic
│   ├── follow-suggestion.controller.ts # REST API endpoints
│   ├── follow-suggestion.module.ts   # Feature module
│   ├── dto/
│   │   └── follow-suggestion.dto.ts  # Request/response DTOs
│   └── follow-suggestion.service.spec.ts # Unit tests
├── workers/
│   ├── advanced-features-scheduler.ts # Background job scheduler
│   ├── notification-worker.service.ts # Notification delivery worker
│   └── workers.module.ts             # Worker module
└── common/config/
    └── advanced-features.config.ts    # Centralized configuration
```

---

## Feature #1: Digest Notifications System

### Purpose
Send users daily or weekly digest notifications summarizing activities from NGOs they follow.

### Database Models

```prisma
enum DigestFrequency {
  DAILY
  WEEKLY
}

enum DigestChannel {
  IN_APP      // In-app notification
  EMAIL       // Email digest
  PUSH        // Push notification
}

model UserDigestPreference {
  id                String          @id @default(uuid())
  userId            String          @unique
  frequency         DigestFrequency @default(DAILY)
  isEnabled         Boolean         @default(true)
  channels          DigestChannel[] @default([IN_APP])
  lastDigestSentAt  DateTime?
  nextScheduledAt   DateTime?
  includeNewPosts   Boolean         @default(true)      // New giveaways
  includeCampaigns  Boolean         @default(true)      // Active campaigns
  includeCompleted  Boolean         @default(false)     // Completed giveaways
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([userId])
  @@index([nextScheduledAt])
}
```

### API Endpoints

#### Get User's Digest Preferences
```
GET /api/digests/preferences
Authorization: Bearer {token}

Response: {
  id: string
  userId: string
  frequency: "DAILY" | "WEEKLY"
  isEnabled: boolean
  channels: ["IN_APP" | "EMAIL" | "PUSH"][]
  lastDigestSentAt?: Date
  nextScheduledAt?: Date
  includeNewPosts: boolean
  includeCampaigns: boolean
  includeCompleted: boolean
  createdAt: Date
  updatedAt: Date
}
```

#### Update Digest Preferences
```
PUT /api/digests/preferences
Authorization: Bearer {token}
Content-Type: application/json

Body: {
  frequency?: "DAILY" | "WEEKLY"
  isEnabled?: boolean
  channels?: ["IN_APP" | "EMAIL" | "PUSH"][]
  includeNewPosts?: boolean
  includeCampaigns?: boolean
  includeCompleted?: boolean
}
```

#### Update Frequency
```
PUT /api/digests/frequency
Authorization: Bearer {token}
Content-Type: application/json

Body: {
  frequency: "DAILY" | "WEEKLY"
}
```

#### Update Channels
```
PUT /api/digests/channels
Authorization: Bearer {token}
Content-Type: application/json

Body: {
  channels: ["IN_APP" | "EMAIL" | "PUSH"][]
}
```

#### Toggle Digest
```
PUT /api/digests/toggle
Authorization: Bearer {token}
Content-Type: application/json

Body: {
  isEnabled: boolean
}
```

### Service Methods

#### Core Methods
- `getOrCreateDigestPreference(userId)` - Get or create user preferences
- `updateDigestPreference(userId, updates)` - Update preferences
- `processPendingDigests()` - Process all pending digests (scheduled job)
- `generateAndSendDigest(userId, frequency)` - Generate and send digest

#### Preference Management
- `toggleDigest(userId, isEnabled)` - Enable/disable digests
- `updateDigestFrequency(userId, frequency)` - Change frequency
- `updateDigestChannels(userId, channels)` - Change channels
- `updateContentScope(userId, scope)` - Change content scope

### Digest Content
Digests include:

1. **New Posts** (if enabled)
   - New giveaways from followed NGOs
   - Posted within the digest period

2. **Campaigns** (if enabled)
   - Active campaigns from followed NGOs
   - Created within the digest period

3. **Completed Giveaways** (if enabled)
   - Giveaways completed during the period
   - Number of winners

### Background Job

**Schedule**: Every 6 hours (0, 6, 12, 18 UTC)

```typescript
// In advanced-features-scheduler.ts
@Cron(CronExpression.EVERY_6_HOURS)
async processDigests() {
  const count = await this.digestService.processPendingDigests();
  // Log: "Processed {count} digests"
}
```

### Configuration (JSON Schema)

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

---

## Feature #2: Campaign Reminder System

### Purpose
Send timely reminders to users following an NGO when campaigns are launching or ending.

### Database Models

```prisma
enum ReminderType {
  CAMPAIGN_LAUNCH_SOON        // 30 days before
  CAMPAIGN_LAUNCH_7DAYS       // 7 days before
  CAMPAIGN_LAUNCH_24HOURS     // 24 hours before
  CAMPAIGN_LAUNCH_SAME_DAY    // On day of launch
  CAMPAIGN_ENDING             // 24 hours before end
}

model CampaignReminderSetting {
  id              String       @id @default(uuid())
  campaignId      String
  reminderType    ReminderType
  isEnabled       Boolean      @default(true)
  sentAt          DateTime?
  nextReminderAt  DateTime?
  cooldownMinutes Int          @default(60)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  campaign Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  @@unique([campaignId, reminderType])
}

model CampaignReminderLog {
  id           String       @id @default(uuid())
  userId       String
  campaignId   String
  reminderType ReminderType
  sentAt       DateTime     @default(now())

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  campaign Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  @@unique([userId, campaignId, reminderType])
}
```

### API Endpoints

#### Get Campaign Reminder Settings (NGO/Admin only)
```
GET /api/campaigns/{campaignId}/reminders
Authorization: Bearer {token}

Response: [{
  id: string
  campaignId: string
  reminderType: ReminderType
  isEnabled: boolean
  sentAt?: Date
  nextReminderAt?: Date
  cooldownMinutes: number
  createdAt: Date
  updatedAt: Date
}]
```

#### Update Reminder Setting (NGO/Admin only)
```
PUT /api/campaigns/{campaignId}/reminders/{reminderType}
Authorization: Bearer {token}
Content-Type: application/json

Body: {
  isEnabled: boolean
}
```

#### Disable All Campaign Reminders (NGO/Admin only)
```
DELETE /api/campaigns/{campaignId}/reminders
Authorization: Bearer {token}

Response: {
  success: boolean
  message: string
  timestamp: Date
}
```

#### Get Reminder Logs (NGO/Admin only)
```
GET /api/campaigns/{campaignId}/reminders/logs
Authorization: Bearer {token}

Response: [{
  id: string
  userId: string
  campaignId: string
  reminderType: ReminderType
  sentAt: Date
}]
```

### Service Methods

#### Core Methods
- `processPendingReminders()` - Process all pending reminders (scheduled job)
- `sendReminder(campaign, reminderType)` - Send reminders to followers
- `shouldSendReminder(campaign, reminderType, now)` - Determine if reminder is due

#### Idempotency
- `hasRecentReminder(userId, campaignId, reminderType)` - Check cooldown
- `logReminderSent(userId, campaignId, reminderType)` - Record sent reminder

#### Settings Management
- `getCampaignReminderSettings(campaignId)` - Get all reminder settings
- `updateCampaignReminderSetting(campaignId, reminderType, isEnabled)` - Update setting
- `disableCampaignReminders(campaignId)` - Disable all reminders
- `getCampaignReminderLogs(campaignId)` - Get audit trail

#### Maintenance
- `cleanupOldReminderLogs(retentionDays)` - Clean logs older than X days

### Reminder Types & Timings

| Type | Timing | Message Example |
|------|--------|---|
| CAMPAIGN_LAUNCH_SOON | 30 days before | "Coming soon: Help the Homeless Campaign" |
| CAMPAIGN_LAUNCH_7DAYS | 7 days before | "Help the Homeless Campaign launching in 7 days" |
| CAMPAIGN_LAUNCH_24HOURS | 24 hours before | "Help the Homeless Campaign launches tomorrow!" |
| CAMPAIGN_LAUNCH_SAME_DAY | 0-1 hours before | "Help the Homeless Campaign is launching today" |
| CAMPAIGN_ENDING | 24 hours before end | "Help the Homeless Campaign ends tomorrow" |

### Background Jobs

**Campaign Reminder Processing** - Every hour
```typescript
@Cron(CronExpression.EVERY_HOUR)
async processCampaignReminders() {
  const count = await this.campaignReminderService.processPendingReminders();
}
```

**Cleanup Reminder Logs** - Every Sunday at 3 AM UTC
```typescript
@Cron('0 3 * * 0')
async cleanupReminderLogs() {
  const count = await this.campaignReminderService.cleanupOldReminderLogs(90);
}
```

### Configuration (JSON Schema)

```typescript
CAMPAIGN_REMINDER_CONFIG = {
  reminderTypes: [
    'CAMPAIGN_LAUNCH_SOON',
    'CAMPAIGN_LAUNCH_7DAYS',
    'CAMPAIGN_LAUNCH_24HOURS',
    'CAMPAIGN_LAUNCH_SAME_DAY',
    'CAMPAIGN_ENDING',
  ],
  reminderIntervals: {
    CAMPAIGN_LAUNCH_7DAYS: 7 * 24 * 60,
    CAMPAIGN_LAUNCH_24HOURS: 24 * 60,
    CAMPAIGN_LAUNCH_SAME_DAY: 60,
    CAMPAIGN_ENDING: 24 * 60,
    CAMPAIGN_LAUNCH_SOON: 30 * 24 * 60,
  },
  cooldownMinutes: 60,  // Prevent duplicate reminders within 1 hour
}
```

---

## Feature #3: Smart Follow Suggestions Engine

### Purpose
Recommend NGOs to users based on weighted signals from behavior and interests.

### Database Models

```prisma
model FollowSuggestion {
  id              String   @id @default(uuid())
  userId          String
  suggestedNGOId  String
  confidenceScore Float    @default(0.5)     // 0-1 score
  reason          String?  // "category_match", "popular_ngo", etc.
  signalWeight    Json?    // Weighted signals breakdown
  isViewed        Boolean  @default(false)
  isFollowed      Boolean  @default(false)
  isIgnored       Boolean  @default(false)
  viewedAt        DateTime?
  createdAt       DateTime @default(now())
  expiresAt       DateTime?                  // 30 days by default

  user User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  ngo  NGOProfile @relation(fields: [suggestedNGOId], references: [id], onDelete: Cascade)
  @@unique([userId, suggestedNGOId])
}
```

### API Endpoints

#### Get Follow Suggestions
```
GET /api/suggestions?limit=10&includeExpired=false
Authorization: Bearer {token}

Response: [{
  id: string
  userId: string
  suggestedNGOId: string
  ngo: {
    id: string
    organizationName: string
    status: string
    logo?: string
    missionStatement?: string
    focusAreas: string[]
    trustScore: number
  }
  confidenceScore: number  // 0-1
  reason: string           // "Based on category interests and NGO popularity"
  signalWeight: {
    popularity: number
    category_match: number
    location_proximity: number
    participation_history: number
    trust_score: number
  }
  isViewed: boolean
  isFollowed: boolean
  isIgnored: boolean
  viewedAt?: Date
  createdAt: Date
  expiresAt?: Date
}]
```

#### Generate Fresh Suggestions
```
POST /api/suggestions/refresh
Authorization: Bearer {token}

Response: {
  count: number
  generatedAt: Date
  expiresAt: Date
  suggestions: FollowSuggestionDto[]
}
```

#### Mark Suggestion as Viewed
```
PUT /api/suggestions/{suggestionId}/view
Authorization: Bearer {token}

Response: {
  success: boolean
  message: string
  suggestionId: string
  timestamp: Date
}
```

#### Follow NGO from Suggestion
```
POST /api/suggestions/{suggestionId}/follow
Authorization: Bearer {token}

Response: {
  success: boolean
  message: string
  ngoId: string
}
```

#### Ignore Suggestion
```
PUT /api/suggestions/{suggestionId}/ignore
Authorization: Bearer {token}

Response: {
  success: boolean
  message: string
  suggestionId: string
  timestamp: Date
}
```

### Weighted Signal Calculation

The confidence score is calculated as a weighted average of five signals:

```
Confidence = (
  popularity * 0.2 +
  category_match * 0.25 +
  location_proximity * 0.15 +
  participation_history * 0.25 +
  trust_score * 0.15
)
```

#### Signal Definitions

1. **Popularity** (weight: 0.2)
   - Based on NGO follower count
   - Normalized against average followers
   - Max score if above 2x average

2. **Category Match** (weight: 0.25)
   - User's interest categories vs NGO focus areas
   - 1.0 if perfect match, 0.7 if partial, 0.2 if no match
   - Highest weight signal

3. **Location Proximity** (weight: 0.15)
   - Distance-based scoring
   - 1.0 if same city, 0.7 if same country, 0.2 if different country
   - Lowest weight (location optional)

4. **Participation History** (weight: 0.25)
   - Similar past participation patterns
   - 0.2 if already participated in NGO's giveaways (avoid re-recommend)
   - 0.7 if user is active but hasn't participated
   - 0.5 if no participation history
   - Second-highest weight

5. **Trust Score** (weight: 0.15)
   - NGO verification status boost (+0.3)
   - NGO trust/confidence score (0-1)
   - Promotes verified, trustworthy NGOs

### Service Methods

#### Generation
- `generateSuggestionsForUser(userId)` - Generate suggestions for one user
- `refreshAllSuggestions()` - Refresh for all active users (scheduled job)

#### Signal Calculation
- `calculateSignalScores(userId, ngo)` - Calculate all 5 signals
- `calculatePopularityScore(ngo)` - Signal 1
- `calculateCategoryMatchScore(userId, ngo)` - Signal 2
- `calculateLocationProximityScore(userId, ngo)` - Signal 3
- `calculateParticipationHistoryScore(userId, ngo)` - Signal 4
- `calculateTrustScore(ngo)` - Signal 5
- `calculateConfidenceScore(scores)` - Final weighted score

#### Retrieval & Filtering
- `getSuggestionsForUser(userId, options)` - Get with filters
- `getExpiredSuggestions()` - Find expired ones

#### User Interaction Tracking
- `markSuggestionAsViewed(suggestionId)` - Track views
- `markSuggestionAsFollowed(suggestionId)` - Track follows
- `markSuggestionAsIgnored(suggestionId)` - Track dismissals

#### Maintenance
- `cleanupExpiredSuggestions()` - Remove expired suggestions

### Background Jobs

**Refresh Follow Suggestions** - Every Monday at 2 AM UTC
```typescript
@Cron('0 2 * * 1')
async refreshFollowSuggestions() {
  const count = await this.followSuggestionService.refreshAllSuggestions();
}
```

**Cleanup Expired Suggestions** - Every Saturday at 2 AM UTC
```typescript
@Cron('0 2 * * 6')
async cleanupSuggestions() {
  const count = await this.followSuggestionService.cleanupExpiredSuggestions();
}
```

### Configuration (JSON Schema)

```typescript
FOLLOW_SUGGESTION_CONFIG = {
  signals: {
    popularity: { weight: 0.2 },
    category_match: { weight: 0.25 },
    location_proximity: { weight: 0.15 },
    participation_history: { weight: 0.25 },
    trust_score: { weight: 0.15 },
  },
  confidenceThreshold: 0.5,           // Min score to show
  maxSuggestionsPerUser: 20,          // Max suggestions
  suggestionExpiryDays: 30,           // Validity period
  minFollowersForSuggestion: 5,       // Min followers before suggesting
}
```

---

## Background Job Scheduler

All three features are driven by scheduled background jobs in the `AdvancedFeaturesScheduler`:

```typescript
// File: src/workers/advanced-features-scheduler.ts

@Injectable()
export class AdvancedFeaturesScheduler {
  @Cron(CronExpression.EVERY_6_HOURS)
  async processDigests() { ... }                      // Digests

  @Cron(CronExpression.EVERY_HOUR)
  async processCampaignReminders() { ... }            // Reminders

  @Cron('0 2 * * 1')
  async refreshFollowSuggestions() { ... }            // Suggestions refresh

  @Cron('0 3 * * 0')
  async cleanupReminderLogs() { ... }                 // Log cleanup

  @Cron('0 2 * * 6')
  async cleanupSuggestions() { ... }                  // Suggestion cleanup
}
```

---

## Data Validation & Constraints

All DTOs include validation using `class-validator`:

### Digest Preferences DTO
```typescript
export class UpdateDigestPreferenceDto {
  @IsOptional()
  @IsEnum(DigestFrequency)
  frequency?: DigestFrequency;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsEnum(DigestChannel, { each: true })
  channels?: DigestChannel[];

  // ... more fields
}
```

### Campaign Reminder DTO
```typescript
export class UpdateCampaignReminderDto {
  @IsBoolean()
  isEnabled: boolean;
}
```

### Follow Suggestion Query DTO
```typescript
export class GetFollowSuggestionsQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @IsOptional()
  @IsBoolean()
  includeExpired?: boolean;
}
```

---

## Error Handling & Logging

All services include comprehensive error handling:

```typescript
try {
  // Operation
} catch (error) {
  this.logger.error(`Error in operation:`, error);
  // Return default value or re-throw
}
```

Key logging points:
- Service initialization
- Database operations
- Job executions
- Email/push delivery
- Calculation steps

---

## Testing

Each service includes comprehensive unit tests:

```bash
npm test -- digests.service.spec.ts
npm test -- campaign-reminder.service.spec.ts
npm test -- follow-suggestion.service.spec.ts
```

Test coverage includes:
- Happy path scenarios
- Error handling
- Edge cases
- Mock database operations

---

## Deployment Checklist

- [ ] All DTOs created and validated
- [ ] Services fully implemented
- [ ] Controllers expose all endpoints
- [ ] Modules properly imported/exported
- [ ] Background scheduler configured
- [ ] Database migrations applied
- [ ] Configuration externalized
- [ ] Unit tests passing (100% coverage target)
- [ ] Integration tests passing
- [ ] Logging configured
- [ ] Error alerting setup
- [ ] Documentation complete

---

## Future Enhancements

1. **Email Integration** - Connect SendGrid/Mailgun for email digests
2. **Push Notifications** - Firebase Cloud Messaging integration
3. **A/B Testing** - Test different reminder timings
4. **Machine Learning** - Improve signal weighting over time
5. **Batch Processing** - Process millions of users efficiently
6. **Caching Layer** - Redis caching for performance
7. **Analytics** - Track open rates, click-through rates
8. **User Preferences UI** - Build UI components for settings

---

## References

- **Prisma Schema**: `/backend/prisma/schema.prisma`
- **Configuration**: `/backend/src/common/config/advanced-features.config.ts`
- **Services**: `/backend/src/digests|campaign-reminders|follow-suggestions/`
- **Controllers**: `/backend/src/digests|campaign-reminders|follow-suggestions/controller.ts`
- **DTOs**: `/backend/src/digests|campaign-reminders|follow-suggestions/dto/`
- **Scheduler**: `/backend/src/workers/advanced-features-scheduler.ts`
- **Tests**: `*.spec.ts` files in each module
