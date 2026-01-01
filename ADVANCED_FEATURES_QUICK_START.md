# Advanced Features Quick Start

Get up and running with the three new advanced engagement features in 5 minutes.

## TL;DR

```bash
# 1. Apply database migration
cd backend
npx prisma migrate dev --name add_advanced_features

# 2. Verify compilation
npm run build

# 3. Run tests
npm test

# 4. Start development server
npm run start:dev

# 5. Test API endpoints
curl -X GET http://localhost:3000/api/digests/preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## What Was Added?

### 1. Digest Notifications System
- Daily/weekly summaries of NGO posts and campaigns
- Configurable channels: in-app, email, push
- API: `GET/PUT /api/digests/*`

### 2. Campaign Reminder System
- Automated reminders for campaign launches and deadlines
- 5 reminder types with strategic timing
- API: `GET/PUT/DELETE /api/campaigns/:id/reminders/*`

### 3. Smart Follow Suggestions
- ML-based NGO recommendations
- 5 weighted signals (popularity, category, location, history, trust)
- API: `GET/POST/PUT /api/suggestions/*`

---

## File Locations

**Services** (Business Logic):
- `/backend/src/digests/digest.service.ts`
- `/backend/src/campaign-reminders/campaign-reminder.service.ts`
- `/backend/src/follow-suggestions/follow-suggestion.service.ts`

**Controllers** (REST API):
- `/backend/src/digests/digest.controller.ts`
- `/backend/src/campaign-reminders/campaign-reminder.controller.ts`
- `/backend/src/follow-suggestions/follow-suggestion.controller.ts`

**Background Jobs**:
- `/backend/src/workers/advanced-features-scheduler.ts`

**Modules** (Configuration):
- `/backend/src/app.module.ts` (UPDATED)
- `/backend/src/workers/workers.module.ts` (UPDATED)

---

## Database Changes

4 new tables created:
- `user_digest_preference` - User digest settings
- `campaign_reminder_setting` - Campaign reminder configuration
- `campaign_reminder_log` - Audit trail for reminders
- `follow_suggestion` - Suggestion tracking and scoring

6 new enums created for configuration.

---

## API Examples

### Digest Preferences

```bash
# Get current preferences
curl -X GET http://localhost:3000/api/digests/preferences \
  -H "Authorization: Bearer JWT"

# Set to weekly with email
curl -X PUT http://localhost:3000/api/digests/preferences \
  -H "Authorization: Bearer JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": "WEEKLY",
    "channels": ["IN_APP", "EMAIL"]
  }'
```

### Campaign Reminders (NGO/Admin)

```bash
# Get reminder settings for a campaign
curl -X GET http://localhost:3000/api/campaigns/CAMPAIGN_ID/reminders \
  -H "Authorization: Bearer NGO_JWT"

# Enable 7-day launch reminder
curl -X PUT http://localhost:3000/api/campaigns/CAMPAIGN_ID/reminders/CAMPAIGN_LAUNCH_7DAYS \
  -H "Authorization: Bearer NGO_JWT" \
  -H "Content-Type: application/json" \
  -d '{"isEnabled": true}'
```

### Follow Suggestions

```bash
# Get suggestions for current user
curl -X GET "http://localhost:3000/api/suggestions?limit=10" \
  -H "Authorization: Bearer JWT"

# Generate fresh suggestions
curl -X POST http://localhost:3000/api/suggestions/refresh \
  -H "Authorization: Bearer JWT"

# Follow NGO from suggestion
curl -X POST http://localhost:3000/api/suggestions/SUGG_ID/follow \
  -H "Authorization: Bearer JWT"
```

---

## Background Jobs

All run automatically on schedule:

| Job | Time | Frequency |
|-----|------|-----------|
| Digest Processing | Every 6 hours | Compiles and sends digests |
| Campaign Reminders | Every hour | Evaluates campaign timings |
| Suggestion Refresh | Weekly (Monday 2 AM) | Generates recommendations |
| Cleanup Reminders | Weekly (Sunday 3 AM) | Deletes old audit logs |
| Cleanup Suggestions | Weekly (Saturday 2 AM) | Removes expired suggestions |

Monitor in logs:
```bash
npm run start:dev | grep -i "scheduler\|digest\|reminder"
```

---

## Configuration

All features use JSON-driven configuration (in service files):

```typescript
// Digest frequencies
DIGEST_CONFIG.frequencies = ['DAILY', 'WEEKLY']

// Reminder types
REMINDER_CONFIG.reminderTypes = [
  'CAMPAIGN_LAUNCH_7DAYS',
  'CAMPAIGN_LAUNCH_24HOURS',
  'CAMPAIGN_LAUNCH_SAME_DAY',
  'CAMPAIGN_ENDING'
]

// Suggestion signals (weights)
SIGNAL_CONFIG.signals = {
  popularity: { weight: 0.20 },
  category_match: { weight: 0.25 },
  location_proximity: { weight: 0.15 },
  participation_history: { weight: 0.25 },
  trust_score: { weight: 0.15 }
}
```

To externalize to JSON file:
1. Create `config/advanced-features.json`
2. Load via `ConfigService` in constructors
3. Enable A/B testing without code changes

---

## Testing

```bash
# Run all tests
npm test

# Run specific service tests
npm test -- digest.service.spec.ts
npm test -- campaign-reminder.service.spec.ts
npm test -- follow-suggestion.service.spec.ts

# Test with coverage
npm test -- --coverage
```

---

## Troubleshooting

### Scheduler jobs not running
```bash
# Check logs for scheduler initialization
npm run start:dev | grep -i "scheduler\|scheduled"

# Verify ScheduleModule imported
grep "ScheduleModule.forRoot()" backend/src/workers/workers.module.ts
```

### Database migration failed
```bash
# Check database connection
psql -U your_user -d your_db -c "SELECT version();"

# Try again
npx prisma migrate dev --name add_advanced_features
```

### Tests failing
```bash
# Make sure database exists
createdb pepo_test

# Run with verbose output
npm test -- --verbose

# Check for mocked service issues
grep "mockResolvedValue" *.spec.ts
```

---

## Next Steps

1. **Verify Everything Works**
   - Run `npm run build` - should compile with no errors
   - Run `npm test` - all tests should pass
   - Start server `npm run start:dev` - look for scheduler logs

2. **Test in Browser/Postman**
   - Use JWT token from auth endpoint
   - Test each API endpoint
   - Verify database records created

3. **Monitor Background Jobs**
   - Check logs for job execution
   - Manually insert test data to trigger jobs
   - Verify notifications sent

4. **Configure for Production**
   - Extract configuration to JSON file
   - Set environment variables
   - Configure email/push services

5. **Deploy**
   - Run Prisma migration on production DB
   - Deploy backend code
   - Monitor background job execution

---

## Documentation

For detailed information:
- **Full Implementation Guide**: See `ADVANCED_FEATURES_IMPLEMENTATION.md`
- **API Reference**: See `ADVANCED_FEATURES_API_REFERENCE.md`
- **Setup Instructions**: See `ADVANCED_FEATURES_SETUP_GUIDE.md`
- **Statistics Summary**: See `ADVANCED_FEATURES_SUMMARY.md`

---

## Key Files Summary

```
Implementation (13 files):
├── 3 Services (business logic)
├── 3 Controllers (REST APIs)
├── 3 Modules (NestJS configuration)
├── 3 Test files (unit tests)
├── 1 Scheduler (background jobs)

Configuration Updates (2 files):
├── app.module.ts (import feature modules)
└── workers.module.ts (import scheduler)

Documentation (4 files):
├── ADVANCED_FEATURES_IMPLEMENTATION.md
├── ADVANCED_FEATURES_API_REFERENCE.md
├── ADVANCED_FEATURES_SETUP_GUIDE.md
└── ADVANCED_FEATURES_QUICK_START.md (this file)
```

---

## Questions?

Refer to the detailed documentation files for answers on:
- How each signal weight affects recommendations
- Why certain reminder timings were chosen
- How to add new notification channels
- How to optimize for your user base
- How to troubleshoot issues

All code includes inline comments explaining complex logic.
