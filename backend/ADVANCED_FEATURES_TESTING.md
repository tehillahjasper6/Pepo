# PEPO Advanced Features - Integration & Testing Guide

## Overview

This guide provides comprehensive instructions for testing, validating, and deploying the three advanced features:
1. Digest Notifications System
2. Campaign Reminder System
3. Smart Follow Suggestions Engine

---

## Unit Testing

### Running Tests

```bash
# Test all services
npm test

# Test specific service
npm test digests.service.spec.ts
npm test campaign-reminder.service.spec.ts
npm test follow-suggestion.service.spec.ts

# Test with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Test Structure

Each service has a comprehensive test suite covering:

#### DigestService Tests
- ✅ `getOrCreateDigestPreference` - Return existing or create new
- ✅ `updateDigestPreference` - Update user preferences
- ✅ `toggleDigest` - Enable/disable digests
- ✅ `updateDigestFrequency` - Change frequency
- ✅ `processPendingDigests` - Main job function
- ✅ `getDigestPreferences` - Retrieve preferences

#### CampaignReminderService Tests
- ✅ `processPendingReminders` - Main job function
- ✅ `hasRecentReminder` - Check cooldown (idempotency)
- ✅ `getCampaignReminderSettings` - Retrieve settings
- ✅ `updateCampaignReminderSetting` - Update via upsert
- ✅ `disableCampaignReminders` - Bulk disable
- ✅ `getCampaignReminderLogs` - Retrieve logs
- ✅ `cleanupOldReminderLogs` - Cleanup job
- ✅ `getReminderTitle` & `getReminderBody` - Message generation

#### FollowSuggestionService Tests
- ✅ `generateSuggestionsForUser` - Generate for one user
- ✅ `getSuggestionsForUser` - Retrieve with filtering
- ✅ `markSuggestionAsViewed` - Track interaction
- ✅ `markSuggestionAsFollowed` - Track follow
- ✅ `markSuggestionAsIgnored` - Track dismissal
- ✅ `cleanupExpiredSuggestions` - Cleanup job
- ✅ `refreshAllSuggestions` - Batch refresh
- ✅ Signal calculations (popularity, category, location, history, trust)
- ✅ `calculateConfidenceScore` - Weighted average
- ✅ `generateReason` - Reason generation

### Sample Test Cases

#### Digest Service Test Example
```typescript
describe('DigestService', () => {
  describe('updateDigestPreference', () => {
    it('should update user digest preference', async () => {
      const userId = 'user-123';
      const updates = {
        frequency: DigestFrequency.WEEKLY,
        isEnabled: false,
      };
      const updatedPreference = { userId, ...updates };

      jest.spyOn(prismaService.userDigestPreference, 'update')
        .mockResolvedValue(updatedPreference as any);

      const result = await service.updateDigestPreference(userId, updates);

      expect(result).toEqual(updatedPreference);
    });
  });
});
```

---

## Integration Testing

### Setup Integration Test Environment

```bash
# 1. Start Docker PostgreSQL (if not running)
docker-compose up -d postgres

# 2. Apply migrations
npx prisma migrate deploy

# 3. Seed test data (optional)
npm run seed:test

# 4. Run integration tests
npm run test:integration
```

### Integration Test Scenarios

#### Scenario 1: Complete Digest Flow
```typescript
describe('Digest Integration', () => {
  it('should send digest to user who follows NGOs', async () => {
    // 1. Create user and NGO
    const user = await prisma.user.create({ ... });
    const ngo = await prisma.nGOProfile.create({ ... });

    // 2. User follows NGO
    await prisma.follow.create({ 
      data: { userId: user.id, ngoId: ngo.id }
    });

    // 3. Set digest preference
    await digestService.updateDigestPreference(user.id, {
      frequency: DigestFrequency.DAILY,
      isEnabled: true,
      channels: [DigestChannel.IN_APP],
    });

    // 4. NGO creates giveaway
    const giveaway = await prisma.giveaway.create({
      data: { userId: ngo.userId, title: 'Test Giveaway' }
    });

    // 5. Trigger digest processing
    const count = await digestService.processPendingDigests();

    // 6. Verify notification created
    const notification = await prisma.notification.findFirst({
      where: { userId: user.id, type: 'DIGEST_SUMMARY' }
    });

    expect(notification).toBeDefined();
  });
});
```

#### Scenario 2: Campaign Reminder with Idempotency
```typescript
describe('Campaign Reminder Integration', () => {
  it('should send reminder only once within cooldown', async () => {
    // 1. Create campaign launching in 24 hours
    const campaign = await prisma.campaign.create({
      data: {
        title: 'Test Campaign',
        startDate: addHours(new Date(), 24),
        endDate: addDays(new Date(), 7),
      }
    });

    // 2. User follows NGO
    const user = await prisma.user.create({ ... });
    await prisma.follow.create({
      data: { userId: user.id, ngoId: campaign.ngoProfileId }
    });

    // 3. First reminder send
    await reminderService.processPendingReminders();
    let logs = await prisma.campaignReminderLog.findMany({
      where: { userId: user.id, campaignId: campaign.id }
    });
    expect(logs.length).toBe(1);

    // 4. Second send within cooldown (should not send)
    await reminderService.processPendingReminders();
    logs = await prisma.campaignReminderLog.findMany({
      where: { userId: user.id, campaignId: campaign.id }
    });
    expect(logs.length).toBe(1);  // Still 1, not 2

    // 5. After cooldown, should send again
    // (mock time advance or modify cooldown for testing)
  });
});
```

#### Scenario 3: Follow Suggestion with Signal Calculation
```typescript
describe('Follow Suggestion Integration', () => {
  it('should generate suggestions based on multiple signals', async () => {
    // 1. Create user with interests
    const user = await prisma.user.create({ ... });

    // 2. User follows health-focused NGO
    const healthNgo = await prisma.nGOProfile.create({
      data: { focusAreas: ['HEALTH'] }
    });
    await prisma.follow.create({
      data: { userId: user.id, ngoId: healthNgo.id }
    });

    // 3. User participates in health giveaways
    const giveaway = await prisma.giveaway.create({
      data: { userId: healthNgo.userId }
    });
    await prisma.participant.create({
      data: { userId: user.id, giveawayId: giveaway.id }
    });

    // 4. Create popular, verified health NGO (not followed)
    const suggestedNgo = await prisma.nGOProfile.create({
      data: {
        status: NGOStatus.VERIFIED,
        focusAreas: ['HEALTH'],
        trustScore: 85,
      }
    });
    // Add followers
    for (let i = 0; i < 100; i++) {
      await prisma.follow.create({
        data: { userId: `user-${i}`, ngoId: suggestedNgo.id }
      });
    }

    // 5. Generate suggestions
    const suggestions = await suggestionService.generateSuggestionsForUser(user.id);

    // 6. Verify suggestion for high-confidence match
    expect(suggestions.some(s => s.ngo.id === suggestedNgo.id)).toBe(true);
    const suggestion = suggestions.find(s => s.ngo.id === suggestedNgo.id);
    expect(suggestion.confidenceScore).toBeGreaterThan(0.5);
  });
});
```

---

## Manual API Testing

### Using cURL

#### Get Digest Preferences
```bash
curl -X GET http://localhost:3000/api/digests/preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Update Digest Preferences
```bash
curl -X PUT http://localhost:3000/api/digests/preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": "WEEKLY",
    "isEnabled": true,
    "channels": ["IN_APP", "EMAIL"],
    "includeNewPosts": true,
    "includeCampaigns": true,
    "includeCompleted": false
  }'
```

#### Get Follow Suggestions
```bash
curl -X GET "http://localhost:3000/api/suggestions?limit=10&includeExpired=false" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Generate Fresh Suggestions
```bash
curl -X POST http://localhost:3000/api/suggestions/refresh \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Get Campaign Reminders
```bash
curl -X GET http://localhost:3000/api/campaigns/{campaignId}/reminders \
  -H "Authorization: Bearer YOUR_NGO_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Using Postman

1. **Create Environment Variables**
   ```
   base_url: http://localhost:3000
   jwt_token: your-jwt-token
   user_id: user-123
   campaign_id: campaign-456
   ngo_id: ngo-789
   ```

2. **Import Requests** (create collection with all endpoints)

3. **Test Workflow**
   - Get current preferences
   - Update preferences
   - Check digest was scheduled
   - Verify logs

---

## Database Seeding for Testing

### Create Test Data Script

```typescript
// scripts/seed-advanced-features.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAdvancedFeatures() {
  // 1. Create test users
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@test.com',
      name: 'Test User 1',
      passwordHash: 'hashed',
      role: 'USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@test.com',
      name: 'Test User 2',
      passwordHash: 'hashed',
      role: 'USER',
    },
  });

  // 2. Create test NGOs
  const ngo1 = await prisma.nGOProfile.create({
    data: {
      userId: 'ngo-user-1',
      organizationName: 'Health First NGO',
      status: 'VERIFIED',
      focusAreas: ['HEALTH'],
      trustScore: 85,
    },
  });

  // 3. Create follows
  await prisma.follow.create({
    data: {
      userId: user1.id,
      ngoId: ngo1.id,
    },
  });

  // 4. Set digest preferences
  await prisma.userDigestPreference.create({
    data: {
      userId: user1.id,
      frequency: 'DAILY',
      isEnabled: true,
      channels: ['IN_APP'],
    },
  });

  // 5. Create campaigns
  const campaign = await prisma.campaign.create({
    data: {
      title: 'Health Awareness Campaign',
      ngoProfileId: ngo1.id,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Test data seeded successfully');
}

seedAdvancedFeatures()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run with:
```bash
npx ts-node scripts/seed-advanced-features.ts
```

---

## Performance Testing

### Load Testing with Artillery

```yaml
# load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: 'Warm up'
    - duration: 120
      arrivalRate: 50
      name: 'Ramp up'
    - duration: 60
      arrivalRate: 100
      name: 'Peak load'

scenarios:
  - name: 'Digest Operations'
    flow:
      - get:
          url: '/api/digests/preferences'
          headers:
            Authorization: 'Bearer {{ token }}'
      - put:
          url: '/api/digests/preferences'
          json:
            frequency: 'WEEKLY'
      - think: 5

  - name: 'Follow Suggestions'
    flow:
      - get:
          url: '/api/suggestions?limit=10'
          headers:
            Authorization: 'Bearer {{ token }}'
      - post:
          url: '/api/suggestions/refresh'
      - think: 3
```

Run with:
```bash
npm install -g artillery
artillery run load-test.yml
```

---

## Monitoring & Logging

### Log Levels

```typescript
// Configured in advanced-features.config.ts
const ERROR_CONFIG = {
  logLevels: {
    DIGEST: 'debug',
    CAMPAIGN_REMINDER: 'debug',
    FOLLOW_SUGGESTION: 'debug',
  },
};
```

### Key Metrics to Monitor

1. **Digest Processing**
   - Digests processed per run
   - Average processing time
   - Failed digests (with reasons)
   - Email/push delivery rates

2. **Campaign Reminders**
   - Reminders sent per hour
   - Idempotency check hits (duplicates prevented)
   - Cooldown enforcement rate
   - Log storage growth

3. **Follow Suggestions**
   - Suggestions generated per user
   - Average confidence scores
   - Suggestion acceptance rate (views, follows)
   - Signal distribution analysis

### Sample Log Format

```
[2025-01-01T14:30:00Z] [DigestService] DEBUG Starting digest processing job
[2025-01-01T14:30:00Z] [DigestService] LOG Found 1245 pending digests to process
[2025-01-01T14:30:15Z] [DigestService] LOG Sent 1240 daily digests, 5 failed
[2025-01-01T14:30:15Z] [DigestService] DEBUG Completed in 15 seconds

[2025-01-01T15:00:00Z] [CampaignReminderService] DEBUG Starting reminder processing
[2025-01-01T15:00:00Z] [CampaignReminderService] LOG Checking 342 campaigns
[2025-01-01T15:01:30Z] [CampaignReminderService] LOG Sent 1850 reminders, prevented 43 duplicates
```

---

## Validation Checklist

Before deploying to production, verify:

### Database
- [ ] Migrations applied successfully
- [ ] All tables created: `user_digest_preferences`, `campaign_reminder_settings`, `campaign_reminder_logs`, `follow_suggestions`
- [ ] Indexes created for performance
- [ ] Foreign keys configured correctly

### Services
- [ ] All three services instantiated
- [ ] Dependencies injected correctly
- [ ] Configuration loaded from environment

### Controllers
- [ ] All endpoints accessible via API
- [ ] Authentication guards working
- [ ] Request/response DTOs validated
- [ ] Error responses properly formatted

### Schedulers
- [ ] `AdvancedFeaturesScheduler` registered
- [ ] All 5 cron jobs scheduled
- [ ] Job timings verified
- [ ] Error handling tested

### Features
- [ ] Digest generation working (manual test)
- [ ] Campaign reminders sending (manual test)
- [ ] Follow suggestions generating (manual test)
- [ ] Idempotency working (no duplicates)

### Error Handling
- [ ] Database errors caught and logged
- [ ] Invalid input rejected with proper messages
- [ ] Partial failures don't block entire job
- [ ] Retry logic working (if configured)

### Documentation
- [ ] API docs generated (Swagger)
- [ ] Configuration documented
- [ ] Database schema documented
- [ ] Deployment guide prepared

---

## Troubleshooting

### Issue: Digests not being sent

**Solution:**
```typescript
// Check if preference exists
const pref = await prisma.userDigestPreference.findUnique({
  where: { userId: 'user-id' }
});
console.log(pref);  // Should not be null

// Check if nextScheduledAt is in past
if (pref && pref.nextScheduledAt < new Date()) {
  console.log('Digest should be sent');
}

// Manually trigger
await digestService.processPendingDigests();
```

### Issue: Campaign reminders duplicating

**Solution:**
```typescript
// Check cooldown logic
const hasRecent = await campaignReminderService['hasRecentReminder'](
  'user-id',
  'campaign-id',
  'CAMPAIGN_LAUNCH_7DAYS'
);
console.log('Has recent:', hasRecent);  // Should be true if within cooldown

// Check logs
const logs = await prisma.campaignReminderLog.findMany({
  where: {
    userId: 'user-id',
    campaignId: 'campaign-id',
  },
  orderBy: { sentAt: 'desc' },
  take: 10,
});
console.log(logs);
```

### Issue: Suggestions not generating

**Solution:**
```typescript
// Check if user follows any NGOs
const follows = await prisma.follow.findMany({
  where: { userId: 'user-id' }
});
console.log('User follows:', follows.length);

// Check if other NGOs exist
const otherNgos = await prisma.nGOProfile.findMany({
  where: {
    id: { notIn: follows.map(f => f.ngoId) },
  },
  take: 5,
});
console.log('Other NGOs:', otherNgos.length);

// Manually generate
const suggestions = await followSuggestionService.generateSuggestionsForUser('user-id');
console.log('Generated suggestions:', suggestions.length);
```

---

## Next Steps

1. **Deploy to Staging**
   - Run all tests
   - Perform load testing
   - Monitor for 24 hours

2. **Production Deployment**
   - Create database backups
   - Schedule maintenance window
   - Monitor logs closely
   - Have rollback plan ready

3. **Post-Launch Monitoring**
   - Track performance metrics
   - Gather user feedback
   - Adjust weights/thresholds based on data
   - Plan Phase 2 enhancements
