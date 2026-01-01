# Notification System Implementation - Setup & Installation

## What Was Implemented

The Pepo platform now includes a **complete notification system** with the following features:

### 1. Follow-Based NGO Post Notifications ✅
- When an NGO posts new items/giveaways, all followers are automatically notified
- Scalable queue-based architecture using Redis
- Background worker processes notifications asynchronously

### 2. Notification Preferences Management ✅
- Users can enable/disable notifications globally
- Users can set per-NGO notification preferences
- Preferences are checked before sending notifications

### 3. In-App & Push Notifications ✅
- Notifications stored in database for in-app display
- Push notifications sent via web push/Firebase
- Async processing prevents blocking the main API

### 4. Background Worker Processing ✅
- Scheduled cron jobs for notification processing
- Automatic retry mechanism for failed notifications
- Cleanup of old notifications (30+ days)

## Files Created/Modified

### New Files Created:
1. **[/Users/visionalventure/Pepo/backend/src/workers/notification-worker.service.ts](backend/src/workers/notification-worker.service.ts)**
   - Background worker service with scheduled tasks
   - Processes notification queues every 30 seconds
   - Handles retry logic and cleanup

2. **[/Users/visionalventure/Pepo/backend/src/workers/workers.module.ts](backend/src/workers/workers.module.ts)**
   - Module for worker services
   - Imports ScheduleModule for cron jobs

3. **[/Users/visionalventure/Pepo/NOTIFICATION_SYSTEM.md](NOTIFICATION_SYSTEM.md)**
   - Comprehensive documentation for the notification system
   - API endpoints, architecture, and usage examples

### Modified Files:

1. **[backend/src/notifications/notifications.service.ts](backend/src/notifications/notifications.service.ts)**
   - Added `enqueueNGOPostNotification()` - queues notification for followers
   - Added `processNGOPostNotification()` - processes notification queue
   - Added `isNotificationEnabled()` - checks user preferences
   - Added `setPreference()` - manages notification preferences
   - Added `getPreferences()` - retrieves user preferences

2. **[backend/src/notifications/notifications.controller.ts](backend/src/notifications/notifications.controller.ts)**
   - Added `GET /notifications/preferences` endpoint
   - Added `PUT /notifications/preferences` endpoint

3. **[backend/src/ngo/ngo.service.ts](backend/src/ngo/ngo.service.ts)**
   - Injected NotificationsService
   - Added notification enqueueing in `createBulkGiveaways()`
   - Notifications sent asynchronously (fire-and-forget)

4. **[backend/src/notifications/notifications.module.ts](backend/src/notifications/notifications.module.ts)**
   - Added RedisModule to imports

5. **[backend/src/redis/redis.service.ts](backend/src/redis/redis.service.ts)**
   - Added `keys()` method for queue pattern matching

6. **[backend/src/app.module.ts](backend/src/app.module.ts)**
   - Added WorkersModule to imports

7. **[backend/package.json](backend/package.json)**
   - Added `@nestjs/schedule` dependency

## Installation Steps

### Step 1: Install Dependencies

```bash
cd /Users/visionalventure/Pepo/backend
npm install
```

This will install:
- `@nestjs/schedule` - For scheduling cron jobs
- All other existing dependencies

### Step 2: Update Database (If Schema Changed)

If you added the Prisma schema for notifications:

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (if schema file updated)
npm run prisma:migrate
```

### Step 3: Environment Configuration

Ensure these environment variables are set (in `.env`):

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Push Notifications (already configured)
VAPID_PUBLIC_KEY=your-key
VAPID_PRIVATE_KEY=your-key
VAPID_SUBJECT=your-email@example.com
```

### Step 4: Start the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The worker will automatically start when the application starts.

## Verification Checklist

After installation, verify everything works:

- [ ] Backend builds without errors: `npm run build`
- [ ] Application starts: `npm run start:dev`
- [ ] Redis is running: `redis-cli ping` → `PONG`
- [ ] Worker logs show scheduled jobs starting
- [ ] Notifications endpoints respond: `GET /notifications`

## Database Schema (Required)

Make sure your Prisma schema includes these models. If not, add them:

```prisma
model Notification {
  id            String    @id @default(cuid())
  userId        String
  type          NotificationType
  title         String
  message       String
  referenceId   String?
  link          String?
  data          Json?
  isRead        Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([createdAt])
}

model NotificationPreference {
  id        String   @id @default(cuid())
  userId    String
  ngoId     String?
  type      NotificationType
  isEnabled Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  ngoProfile NGOProfile? @relation(fields: [ngoId], references: [id], onDelete: Cascade)
  
  @@unique([userId, ngoId, type])
}

enum NotificationType {
  SYSTEM_ALERT
  NGO_NEW_POST
  ITEM_CLAIMED
  DRAW_RESULT
  MESSAGE
  FOLLOW
  BADGE_EARNED
}
```

## How It Works (Flow Diagram)

```
1. NGO Creates Giveaway
   ↓
2. NGOService calls notificationsService.enqueueNGOPostNotification()
   ↓
3. Notification stored in Redis queue
   ↓
4. Background Worker picks up queue every 30 seconds
   ↓
5. Fetches all followers of the NGO
   ↓
6. For each follower:
   - Check notification preferences
   - Create in-app notification if allowed
   - Send push notification asynchronously
   ↓
7. Queue item removed after processing
```

## Key Design Decisions

### Why Queue-Based Processing?
- **Scalability**: Sending notifications to millions of followers could take minutes
- **Non-blocking**: NGO's request returns immediately
- **Reliability**: Failed notifications can be retried

### Why Preference Checking?
- **User Control**: Users can opt-out of specific NGOs
- **Preference Hierarchy**: Global setting overrides per-NGO settings
- **Privacy**: Respect user's notification preferences

### Why Background Worker?
- **Async Processing**: Doesn't block the main API
- **Scheduled Jobs**: Process at optimal times
- **Error Handling**: Built-in retry mechanism

## Testing the System

### Test 1: Create Giveaway with Notifications

```bash
# As NGO user, create giveaway
POST /ngo/campaigns/{campaignId}/giveaways/bulk
Content-Type: application/json

{
  "giveaways": [
    {
      "title": "Winter Jackets",
      "description": "Warm jackets for winter",
      "category": "clothing",
      "location": "Nairobi",
      "quantity": 50
    }
  ]
}
```

### Test 2: Check Redis Queue

```bash
redis-cli
> KEYS notifications:ngo_post:*
> GET "notifications:ngo_post:{ngoId}:{itemId}"
```

### Test 3: Verify Notifications Created

```bash
# As follower, get notifications
GET /notifications
Authorization: Bearer {token}
```

Should see newly created notifications after worker processes (within 30 seconds).

### Test 4: Test Preferences

```bash
# Disable notifications for an NGO
PUT /notifications/preferences
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "NGO_NEW_POST",
  "isEnabled": false,
  "ngoId": "ngo-id-123"
}

# Verify preference saved
GET /notifications/preferences
Authorization: Bearer {token}
```

## Troubleshooting

### Issue: `@nestjs/schedule not found`
**Solution**: Run `npm install` in backend directory

### Issue: Worker not processing notifications
**Solution**: 
1. Check Redis is running: `redis-cli ping`
2. Check logs for worker startup
3. Verify notifications in Redis queue: `redis-cli KEYS notifications:ngo_post:*`

### Issue: Notifications not sent to followers
**Solution**:
1. Verify follower relationship exists in database
2. Check notification preferences: `GET /notifications/preferences`
3. Ensure preferences don't block notifications

### Issue: Push notifications not delivering
**Solution**:
1. Verify VAPID keys in environment
2. Check user has registered device: `POST /notifications/register-device`
3. Check Firebase/push service is running

## Next Steps

1. **Run npm install**: Install @nestjs/schedule dependency
2. **Test the system**: Follow testing steps above
3. **Monitor logs**: Watch for notification processing
4. **Set up monitoring**: Track queue size and processing time
5. **User communication**: Inform users about new notification features

## Documentation

Full documentation available at: [/Users/visionalventure/Pepo/NOTIFICATION_SYSTEM.md](NOTIFICATION_SYSTEM.md)

Topics covered:
- Architecture overview
- Feature details
- Complete API reference
- Database schema
- Performance considerations
- Troubleshooting guide
- Future enhancements
