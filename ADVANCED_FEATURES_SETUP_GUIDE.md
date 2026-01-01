# Advanced Features Setup & Deployment Guide

## Prerequisites

Before deploying the advanced features, ensure you have:

- [x] NestJS backend running with PostgreSQL database
- [x] `@nestjs/schedule` package installed
- [x] `date-fns` package for date manipulation
- [x] Prisma ORM configured and working
- [x] Redis configured (for NotificationsService)
- [x] JWT authentication set up
- [x] Basic CORS and security middleware configured

---

## Step 1: Update Dependencies

If not already installed, add required packages:

```bash
cd backend

# Schedule support (if not already installed)
npm install @nestjs/schedule

# Date utilities (if not already installed)
npm install date-fns

# Swagger for API documentation (recommended)
npm install @nestjs/swagger swagger-ui-express
```

Verify installations:

```bash
npm list @nestjs/schedule date-fns
```

---

## Step 2: Update Prisma Schema

The Prisma schema has been updated with:
- 4 new database models
- 6 new enums
- 3 updated models with relationships

**Status**: ✅ Already completed and ready for migration

**Location**: `backend/prisma/schema.prisma`

---

## Step 3: Run Database Migration

```bash
cd backend

# Create and run the migration
npx prisma migrate dev --name add_advanced_features

# Or use db push if starting fresh
npx prisma db push
```

**What this does**:
- Creates `user_digest_preference` table
- Creates `campaign_reminder_setting` table
- Creates `campaign_reminder_log` table
- Creates `follow_suggestion` table
- Adds indexes for performance
- Generates Prisma client types

**Verify migration**:
```bash
npx prisma studio  # Open Prisma Studio to inspect

# Or query directly
psql -U your_db_user -d your_db_name
\dt  # List all tables - should see new tables
```

---

## Step 4: Verify File Structure

Ensure all new files are in place:

```
backend/src/
├── digests/
│   ├── digest.module.ts          ✅
│   ├── digest.service.ts         ✅
│   ├── digest.controller.ts      ✅
│   └── digest.service.spec.ts    ✅
├── campaign-reminders/
│   ├── campaign-reminder.module.ts      ✅
│   ├── campaign-reminder.service.ts     ✅
│   ├── campaign-reminder.controller.ts  ✅
│   └── campaign-reminder.service.spec.ts ✅
├── follow-suggestions/
│   ├── follow-suggestion.module.ts      ✅
│   ├── follow-suggestion.service.ts     ✅
│   ├── follow-suggestion.controller.ts  ✅
│   └── follow-suggestion.service.spec.ts ✅
├── workers/
│   ├── workers.module.ts                ✅ (UPDATED)
│   ├── notification-worker.service.ts   (existing)
│   └── advanced-features-scheduler.ts   ✅
└── app.module.ts                        ✅ (UPDATED)
```

Verify imports:

```bash
# Check if all modules compile
npm run build
```

---

## Step 5: Update App Configuration

### 5.1 Verify ScheduleModule in WorkersModule

Check `backend/src/workers/workers.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DigestModule } from '../digests/digest.module';
import { CampaignReminderModule } from '../campaign-reminders/campaign-reminder.module';
import { FollowSuggestionModule } from '../follow-suggestions/follow-suggestion.module';
// ... other imports

@Module({
  imports: [
    ScheduleModule.forRoot(),  // ✅ Required for @Cron decorators
    DigestModule,               // ✅ Added
    CampaignReminderModule,     // ✅ Added
    FollowSuggestionModule,     // ✅ Added
    NotificationsModule,
    RedisModule,
  ],
  providers: [NotificationWorkerService, AdvancedFeaturesScheduler],
  exports: [NotificationWorkerService, AdvancedFeaturesScheduler],
})
export class WorkersModule {}
```

### 5.2 Verify App Module Integration

Check `backend/src/app.module.ts`:

```typescript
import { DigestModule } from './digests/digest.module';
import { CampaignReminderModule } from './campaign-reminders/campaign-reminder.module';
import { FollowSuggestionModule } from './follow-suggestions/follow-suggestion.module';

@Module({
  imports: [
    // ... existing imports
    DigestModule,               // ✅ Added
    CampaignReminderModule,     // ✅ Added
    FollowSuggestionModule,     // ✅ Added
    WorkersModule,
  ],
  // ... rest of config
})
export class AppModule {}
```

---

## Step 6: Configure Environment Variables

Add to your `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pepo_db"

# Redis (for notifications)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email Service (for digest email channel - optional)
MAIL_SERVICE=gmail
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@pepo.app

# Push Notifications (for digest/reminder push channel)
PUSH_NOTIFICATIONS_KEY=your-firebase-key
PUSH_NOTIFICATIONS_SECRET=your-firebase-secret

# Feature Flags (enable/disable features)
ENABLE_DIGEST_NOTIFICATIONS=true
ENABLE_CAMPAIGN_REMINDERS=true
ENABLE_FOLLOW_SUGGESTIONS=true
```

---

## Step 7: Compile and Test

### 7.1 Compile TypeScript

```bash
npm run build

# Check for type errors
npx tsc --noEmit
```

**Expected output**: No errors, clean compilation

### 7.2 Run Unit Tests

```bash
# Test all services
npm test

# Test specific service
npm test -- digest.service.spec.ts
npm test -- campaign-reminder.service.spec.ts
npm test -- follow-suggestion.service.spec.ts

# Run with coverage
npm test -- --coverage
```

**Expected**: All tests passing ✅

### 7.3 Run Linter

```bash
npm run lint

# Fix issues automatically
npm run lint:fix
```

---

## Step 8: Start Development Server

```bash
# Development mode with watch
npm run start:dev

# Or production mode
npm run build
npm run start:prod
```

**Watch for these startup logs**:

```
[NestFactory] Starting Nest application...
[Scheduler] Scheduled job: processDigests CRON 0 */6 * * * *
[Scheduler] Scheduled job: processCampaignReminders CRON 0 * * * * *
[Scheduler] Scheduled job: refreshFollowSuggestions CRON 0 2 * * 1 *
[Scheduler] Scheduled job: cleanupReminderLogs CRON 0 3 * * 0 *
[Scheduler] Scheduled job: cleanupSuggestions CRON 0 2 * * 6 *
Pepo Application listening on port 3000
```

**Troubleshooting**: If scheduler jobs don't appear:
1. Check `ScheduleModule.forRoot()` is imported in WorkersModule
2. Verify `@nestjs/schedule` package is installed
3. Check for import errors in console
4. Restart development server

---

## Step 9: Test API Endpoints

### 9.1 Create Test User

```bash
# Register a test user and note the JWT token
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "fullName": "Test User"
  }'
```

### 9.2 Test Digest Endpoints

```bash
# Get digest preferences (creates default if not exists)
curl -X GET http://localhost:3000/api/digests/preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with preference object

# Update frequency
curl -X PUT http://localhost:3000/api/digests/frequency \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"frequency":"WEEKLY"}'

# Expected: 200 OK with updated preference
```

### 9.3 Test Campaign Reminder Endpoints

```bash
# Get campaign settings (needs existing campaign)
curl -X GET http://localhost:3000/api/campaigns/CAMPAIGN_ID/reminders \
  -H "Authorization: Bearer NGO_USER_JWT_TOKEN"

# Expected: 200 OK with reminder settings array
```

### 9.4 Test Follow Suggestion Endpoints

```bash
# Get suggestions
curl -X GET "http://localhost:3000/api/suggestions?limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with suggestions array (may be empty if no suggests generated yet)

# Generate new suggestions
curl -X POST http://localhost:3000/api/suggestions/refresh \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with count and suggestions
```

---

## Step 10: Verify Background Jobs

### 10.1 Check Job Scheduling

Jobs should run automatically, but you can force them via database updates:

```bash
# For Digest Job: Insert a test user preference with nextScheduledAt in past
psql -d your_db_name -c "
  INSERT INTO user_digest_preference (id, user_id, frequency, is_enabled, channels, next_scheduled_at)
  VALUES ('test-123', 'test-user-id', 'DAILY', true, '{IN_APP}', NOW() - interval '1 hour')
"

# Wait up to 1 minute, then check logs for "Processed 1 digests"
```

### 10.2 Monitor Scheduler Logs

```bash
# View logs in real-time
npm run start:dev | grep -i "scheduler\|digest\|reminder\|suggestion"

# Or check logs file if configured
tail -f logs/application.log
```

**Expected log messages**:
- `[Scheduler] Scheduled job: processDigests CRON ...`
- `Processed X digests`
- `Processed reminders for X campaigns`
- `Refreshed suggestions for X users`

---

## Step 11: Database Verification

### 11.1 Verify Tables Created

```sql
-- Connect to PostgreSQL
psql -U your_db_user -d your_db_name

-- List tables
\dt

-- Verify new tables exist:
-- public | user_digest_preference
-- public | campaign_reminder_setting
-- public | campaign_reminder_log
-- public | follow_suggestion
```

### 11.2 Check Indexes

```sql
-- View indexes on new tables
\d user_digest_preference
\d campaign_reminder_setting
\d campaign_reminder_log
\d follow_suggestion

-- Should see indexes on:
-- - user_digest_preference (user_id unique, next_scheduled_at)
-- - campaign_reminder_log (user_id + campaign_id + reminder_type unique)
-- - follow_suggestion (user_id, confidence_score, expires_at)
```

### 11.3 Verify Constraints

```sql
-- Check unique constraints
SELECT * FROM information_schema.table_constraints
WHERE table_name IN (
  'user_digest_preference',
  'campaign_reminder_setting',
  'campaign_reminder_log',
  'follow_suggestion'
)
ORDER BY table_name;
```

---

## Step 12: Load Testing (Optional)

### 12.1 Test Digest Processing at Scale

```bash
# Create 100 test users with digest preferences
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/digests/preferences \
    -H "Authorization: Bearer TEST_JWT_$i" \
    -H "Content-Type: application/json" \
    -d '{"frequency":"DAILY","isEnabled":true}'
done

# Monitor performance
time npm run start:dev

# Check logs for processing time
```

### 12.2 Test Campaign Reminder Scaling

```bash
# Create campaigns with different start dates
# This will test hour-based scheduling

# Monitor logs for reminder processing times
```

---

## Step 13: Production Deployment

### 13.1 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Code lint checks passing
- [ ] Prisma migration applied to production database
- [ ] Environment variables configured for production
- [ ] Email service configured (if using email channel)
- [ ] Push notification service configured
- [ ] Database backups enabled
- [ ] Application monitoring/logging set up
- [ ] Rate limiting configured appropriately
- [ ] SSL/HTTPS enabled
- [ ] CORS configured for production domains

### 13.2 Deploy Backend

```bash
# Build production image
npm run build

# If using Docker
docker build -t pepo-backend:latest .

# Deploy using your infrastructure (AWS, GCP, Railway, etc.)
# Ensure environment variables are set in production

# Run migrations on production
npx prisma migrate deploy

# Verify application started
curl -X GET https://api.pepo.app/api/health
```

### 13.3 Monitor Production

```bash
# Check scheduler is running
curl -X GET https://api.pepo.app/api/health

# Monitor logs for errors
# Set up alerts for failed background jobs
```

---

## Step 14: Configure Monitoring & Alerts

### 14.1 Set Up Logging

```typescript
// In main.ts or app configuration
import { Logger } from '@nestjs/common';

const logger = new Logger();

// Catch unhandled exceptions
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```

### 14.2 Monitor Key Metrics

Create alerts for:
- Failed digest processing (error logs)
- Background job failures
- Database connection issues
- High response times on API endpoints

---

## Troubleshooting

### Issue: Scheduler jobs not running

**Solution**:
```bash
# 1. Verify ScheduleModule imported
grep "ScheduleModule.forRoot()" backend/src/workers/workers.module.ts

# 2. Check @Cron decorators are present
grep -r "@Cron" backend/src/workers/

# 3. Restart development server
npm run start:dev
```

### Issue: Database connection error during migration

**Solution**:
```bash
# 1. Check Prisma configuration
cat backend/.env | grep DATABASE_URL

# 2. Verify database is running
psql -U your_db_user -d postgres -c "SELECT version();"

# 3. Check network connectivity
ping localhost
```

### Issue: Tests failing with database errors

**Solution**:
```bash
# 1. Ensure test database exists
createdb pepo_test

# 2. Run tests with specific database
DATABASE_URL="postgresql://user:password@localhost:5432/pepo_test" npm test

# 3. Check mocked services in tests
grep "mockResolvedValue" backend/src/**/*.spec.ts
```

### Issue: Background jobs running but no notifications sent

**Solution**:
```bash
# 1. Check NotificationsService is working
npm test -- notifications.service.spec.ts

# 2. Verify Redis is running
redis-cli ping  # Should return PONG

# 3. Check email/push service credentials in .env
cat backend/.env | grep MAIL_

# 4. Look at detailed logs
DEBUG=* npm run start:dev | grep notification
```

---

## Next Steps

After successful deployment:

1. **Monitor Performance**
   - Track digest processing times
   - Monitor API response times
   - Analyze background job execution

2. **Gather User Feedback**
   - Are digests helping users?
   - Do reminders increase participation?
   - Are suggestions relevant?

3. **Optimize Configuration**
   - Adjust reminder timing based on data
   - Tune suggestion weights
   - Refine digest content scope

4. **Implement Analytics**
   - Track user engagement metrics
   - Measure follow conversion rates
   - Analyze reminder effectiveness

5. **Plan Enhancements**
   - Add email digest templates
   - Integrate SMS reminders
   - Implement user segmentation
   - Add admin dashboard

---

## Support & Resources

- **NestJS Schedule Documentation**: https://docs.nestjs.com/techniques/task-scheduling
- **Prisma Migrations**: https://www.prisma.io/docs/guides/migrate/migrations
- **Date-FNS**: https://date-fns.org/
- **Jest Testing**: https://jestjs.io/docs/getting-started

For issues, check the logs first:
```bash
tail -f logs/application.log
tail -f logs/error.log
```
