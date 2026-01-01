# Notification System with Follow-Based NGO Post Notifications

## Overview

The Pepo platform now includes a comprehensive notification system that notifies users when NGOs they follow post new items/giveaways. This is implemented with preference management and background worker processing for scalability.

## Architecture

### Components

1. **NotificationsService** (`backend/src/notifications/notifications.service.ts`)
   - Core service for managing notifications
   - Handles in-app notifications and push notifications
   - Manages notification preferences per user and per NGO
   - Queue-based processing for follow-based notifications

2. **NotificationWorkerService** (`backend/src/workers/notification-worker.service.ts`)
   - Background worker processing notifications asynchronously
   - Runs scheduled jobs:
     - Every 30 seconds: Process queued NGO post notifications
     - Every 5 minutes: Retry failed notifications
     - Daily at 2 AM: Clean up old notifications

3. **NotificationsController** (`backend/src/notifications/notifications.controller.ts`)
   - REST API endpoints for notification management
   - User preference management endpoints

4. **RedisService** (`backend/src/redis/redis.service.ts`)
   - Stores notification queues for asynchronous processing
   - Used for caching and key-value operations

## Features

### 1. Follow-Based NGO Post Notifications

When an NGO posts new items/giveaways, all followers receive notifications:

```typescript
// When creating giveaways, the system automatically:
await this.notificationsService.enqueueNGOPostNotification(
  ngoId,
  itemId,
  'New item from [NGO Name]',
  '[Item title] ([quantity] available)',
  '/giveaway/{itemId}'
);
```

**Process Flow:**
1. NGO creates giveaway → enqueues notification
2. Background worker picks up queue task every 30 seconds
3. Worker fetches all followers of the NGO
4. For each follower, checks notification preferences
5. Creates in-app notification for those who allow it
6. Sends push notification asynchronously

### 2. Notification Preferences

Users can control which notifications they receive:

**Global preferences** (apply to all NGOs):
```json
{
  "type": "NGO_NEW_POST",
  "isEnabled": true,
  "ngoId": null
}
```

**Per-NGO preferences** (override global for specific NGO):
```json
{
  "type": "NGO_NEW_POST",
  "isEnabled": false,
  "ngoId": "ngo-id-123"
}
```

**Preference Hierarchy:**
1. If global preference is DISABLED → notification blocked
2. If per-NGO preference exists → use that
3. Otherwise → allow (default)

### 3. Scalable Queue Processing

**Why queuing?**
- Sending notifications to millions of followers could take minutes
- Queuing allows the NGO's API request to return immediately
- Background worker processes in batches to avoid memory issues

**Queue Details:**
- Key: `notifications:ngo_post:{ngoId}:{itemId}`
- TTL: 1 hour (enough time for worker to process)
- Processed in batches of 100 followers per cycle

## API Endpoints

### Get Notifications
```http
GET /notifications
Authorization: Bearer {token}
```
Response:
```json
[
  {
    "id": "notif-123",
    "userId": "user-456",
    "type": "NGO_NEW_POST",
    "title": "New item from Red Cross Kenya",
    "message": "Winter clothes (50 available)",
    "referenceId": "giveaway-789",
    "link": "/giveaway/giveaway-789",
    "isRead": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Get Unread Count
```http
GET /notifications/unread-count
Authorization: Bearer {token}
```
Response:
```json
{
  "count": 5
}
```

### Mark as Read
```http
PUT /notifications/{id}/read
Authorization: Bearer {token}
```

### Mark All as Read
```http
PUT /notifications/mark-all-read
Authorization: Bearer {token}
```

### Get Notification Preferences
```http
GET /notifications/preferences
Authorization: Bearer {token}
```
Response:
```json
[
  {
    "id": "pref-123",
    "userId": "user-456",
    "type": "NGO_NEW_POST",
    "ngoId": null,
    "isEnabled": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  {
    "id": "pref-124",
    "userId": "user-456",
    "type": "NGO_NEW_POST",
    "ngoId": "ngo-123",
    "isEnabled": false,
    "createdAt": "2024-01-10T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

### Set Preference
```http
PUT /notifications/preferences
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "NGO_NEW_POST",
  "isEnabled": false,
  "ngoId": "ngo-123"  // Optional - omit for global preference
}
```

### Get VAPID Public Key (for push notifications)
```http
GET /notifications/vapid-key
```

### Register Device for Push Notifications
```http
POST /notifications/register-device
Authorization: Bearer {token}
Content-Type: application/json

{
  "subscription": {
    "endpoint": "https://...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

### Unregister Device
```http
POST /notifications/unregister-device
Authorization: Bearer {token}
Content-Type: application/json

{
  "subscription": { ... }
}
```

## Database Schema

The following tables are required (should already exist in Prisma schema):

```prisma
model Notification {
  id            String    @id @default(cuid())
  userId        String
  type          NotificationType
  title         String
  message       String
  referenceId   String?   // e.g., giveaway ID
  link          String?   // Deep link to item
  data          Json?     // Additional metadata
  isRead        Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([createdAt])
}

model NotificationPreference {
  id       String   @id @default(cuid())
  userId   String
  ngoId    String?  // null for global preference
  type     NotificationType
  isEnabled Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  ngoProfile NGOProfile? @relation(fields: [ngoId], references: [id], onDelete: Cascade)
  
  @@unique([userId, ngoId, type])
  @@index([userId])
  @@index([ngoId])
}

enum NotificationType {
  SYSTEM_ALERT
  NGO_NEW_POST
  ITEM_CLAIMED
  DRAW_RESULT
  MESSAGE
  FOLLOW
  BADGE_EARNED
  // Add more as needed
}
```

## Implementation Checklist

- [x] Enhanced NotificationsService with queue-based processing
- [x] Added preference management methods
- [x] Created NotificationWorkerService for background processing
- [x] Added WorkersModule with schedule support
- [x] Updated NGOService to trigger notifications on giveaway creation
- [x] Added preference endpoints to NotificationsController
- [x] Updated RedisService with `keys()` method
- [x] Integrated WorkersModule into AppModule
- [ ] Run Prisma migration (if schema changes)
- [ ] Test notification flow end-to-end
- [ ] Set up monitoring for worker job failures
- [ ] Configure logging for notification processing

## Testing

### Manual Testing

1. **Test Notification Queue:**
   ```bash
   # Create a test giveaway as NGO
   POST /ngo/campaigns/{campaignId}/giveaways/bulk
   ```

2. **Check Redis Queue:**
   ```bash
   redis-cli
   > KEYS notifications:ngo_post:*
   > GET "notifications:ngo_post:ngo-id:item-id"
   ```

3. **Verify Notifications Created:**
   ```bash
   # Get notifications
   GET /notifications
   # Should see new notifications after worker processes queue
   ```

4. **Test Preferences:**
   ```bash
   # Disable notifications for an NGO
   PUT /notifications/preferences
   { "type": "NGO_NEW_POST", "isEnabled": false, "ngoId": "ngo-id" }
   
   # Verify that user doesn't get notifications from that NGO
   ```

### Monitoring

Key metrics to monitor:
- Queue size: `DBSIZE` on Redis for notifications
- Processing time: Worker logs with duration
- Failed notifications: `notifications:failed:*` keys in Redis
- Retry count: Task metadata in Redis

## Configuration

### Environment Variables

```bash
# Redis (already configured)
REDIS_HOST=localhost
REDIS_PORT=6379

# Push notifications (if using web push)
VAPID_PUBLIC_KEY=your-key
VAPID_PRIVATE_KEY=your-key
VAPID_SUBJECT=your-email@example.com
```

### Worker Schedule

Edit `NotificationWorkerService` to adjust cron schedules:

- **NGO Post Notifications:** `*/30 * * * * *` (every 30 seconds)
- **Failed Notification Retry:** `*/5 * * * *` (every 5 minutes)
- **Cleanup Old Notifications:** `0 2 * * *` (2 AM daily)

## Performance Considerations

1. **Batch Processing:** Followers are processed in batches of 100
   - Adjust `batchSize` parameter if needed
   - Trade-off: Larger batches = faster but more memory

2. **TTL on Queues:** Notifications have 1-hour TTL in Redis
   - Adjust TTL based on expected queue processing time
   - Items older than TTL will be discarded

3. **Preference Lookups:** Each notification creation checks preferences
   - Consider caching preferences in Redis for high-traffic scenarios
   - Current implementation: Database lookup (slower but fresher)

4. **Push Notifications:** Sent asynchronously (fire-and-forget)
   - Failures don't block the notification creation
   - Failed push notifications are logged but don't affect in-app notification

## Future Enhancements

1. **Email Notifications:** Add email template support
2. **SMS Notifications:** Integrate SMS provider
3. **Notification Digest:** Bundle multiple notifications into one
4. **AI-Driven Personalization:** Recommend notifications based on user behavior
5. **WebSocket Real-Time:** Stream notifications in real-time via WebSocket
6. **Notification Analytics:** Track open rates, click rates
7. **A/B Testing:** Test different notification messages
8. **Notification Templates:** Customizable templates per NGO

## Troubleshooting

### Notifications Not Being Sent

1. **Check Redis connection:**
   ```bash
   redis-cli ping
   # Should return PONG
   ```

2. **Check worker logs:**
   ```bash
   # Look for NotificationWorkerService logs
   # Should see "Processed X notifications..." messages
   ```

3. **Check user preferences:**
   ```bash
   GET /notifications/preferences
   # Verify notifications aren't disabled globally
   ```

### Queue Growing Too Large

1. **Check worker frequency:** Increase cron frequency for NGO post processing
2. **Check batch size:** Reduce batch size if worker is running out of memory
3. **Check database performance:** Slow database lookups block the worker

### Push Notifications Not Delivering

1. **Check VAPID keys:** Verify in environment variables
2. **Check device registration:** Ensure user has registered device subscriptions
3. **Check push service status:** Third-party push services may be down

## Support

For issues or questions about the notification system:
1. Check the logs: `NotificationWorkerService` and `NotificationsService` logs
2. Check Redis: Use `redis-cli` to inspect queues
3. Check database: Verify notification and preference records exist
4. File an issue with logs and reproduction steps
