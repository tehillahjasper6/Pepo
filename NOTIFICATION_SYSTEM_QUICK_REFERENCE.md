# Notification System - Quick Reference

## Installation (One-Time Setup)

```bash
cd /Users/visionalventure/Pepo/backend
npm install
npm run prisma:migrate  # If schema changed
```

## API Endpoints

### Get Notifications
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/notifications
```

### Get Unread Count
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/notifications/unread-count
```

### Mark as Read
```bash
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/notifications/{id}/read
```

### Get Preferences
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/notifications/preferences
```

### Set Preference (Disable for specific NGO)
```bash
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"NGO_NEW_POST", "isEnabled":false, "ngoId":"ngo-123"}' \
  http://localhost:3000/notifications/preferences
```

### Set Global Preference
```bash
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"NGO_NEW_POST", "isEnabled":false}' \
  http://localhost:3000/notifications/preferences
```

## Database Queries

### Check notifications for user
```sql
SELECT * FROM "Notification" 
WHERE "userId" = 'user-id' 
ORDER BY "createdAt" DESC 
LIMIT 50;
```

### Check preferences
```sql
SELECT * FROM "NotificationPreference" 
WHERE "userId" = 'user-id';
```

### Check Redis queue
```bash
redis-cli
> KEYS notifications:ngo_post:*
> GET "notifications:ngo_post:ngo-id:item-id"
```

## Debugging

### Check if worker is running
Look for these logs on startup:
```
[NotificationWorkerService] Scheduled job initialized
```

### Check queue status
```bash
redis-cli
> DBSIZE  # Total Redis keys
> KEYS notifications:*  # All notification keys
```

### Test notification creation
```bash
# Create giveaway as NGO
POST /ngo/campaigns/{campaignId}/giveaways/bulk
# Watch Redis queue
redis-cli MONITOR | grep notifications:ngo_post:
```

## Code Integration

### Send Notification to Followers (automatic)
When NGO creates giveaway, this happens automatically:
```typescript
// In ngo.service.ts
await this.notificationsService.enqueueNGOPostNotification(
  ngoId,
  itemId,
  'New item from [NGO]',
  'Item title (quantity available)',
  '/giveaway/{itemId}'
);
```

### Check Preference Programmatically
```typescript
// In your service
const allowed = await this.notificationsService.isNotificationEnabled(
  userId,
  'NGO_NEW_POST',
  ngoId  // optional
);

if (allowed) {
  // Send notification
}
```

### Update User Preference
```typescript
await this.notificationsService.setPreference(
  userId,
  'NGO_NEW_POST',
  false,  // disable
  ngoId   // optional
);
```

## Background Worker Jobs

The worker runs these scheduled tasks:

| Job | Schedule | Purpose |
|-----|----------|---------|
| processNGOPostNotifications | Every 30 sec | Process queued notifications |
| processFailedNotifications | Every 5 min | Retry failed tasks |
| cleanupOldNotifications | Daily 2 AM | Delete old records |

## Performance

- **Notification Queue**: Stored in Redis, TTL 1 hour
- **Processing**: Batches of 100 followers per cycle
- **Push Notifications**: Async (fire-and-forget)
- **Database Lookups**: Per-preference checked before creation

## Troubleshooting

| Problem | Check |
|---------|-------|
| Notifications not sent | Redis running? Queue empty? Preferences allow? |
| Worker not running | Look for startup logs, check ScheduleModule import |
| Push notifications fail | VAPID keys set? Device registered? |
| Memory issues | Reduce batch size, increase processing frequency |

## File Locations

- Service: `backend/src/notifications/notifications.service.ts`
- Controller: `backend/src/notifications/notifications.controller.ts`
- Worker: `backend/src/workers/notification-worker.service.ts`
- Module: `backend/src/workers/workers.module.ts`
- Documentation: `NOTIFICATION_SYSTEM.md`
- Setup Guide: `NOTIFICATION_SYSTEM_SETUP.md`

## Key Concepts

**Notification Types**: SYSTEM_ALERT, NGO_NEW_POST, ITEM_CLAIMED, DRAW_RESULT, etc.

**Queue Pattern**: `notifications:ngo_post:{ngoId}:{itemId}`

**Preference Hierarchy**:
1. Global disabled → Block all
2. Per-NGO disabled → Block for that NGO
3. Otherwise → Allow (default)

**Processing Flow**:
NGO creates giveaway → Enqueue → Worker picks up → Check preferences → Create notifications → Send push
