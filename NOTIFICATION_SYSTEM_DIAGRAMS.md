# Notification System - Architecture & Flow Diagrams

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Pepo Platform                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              REST API (NestJS)                       │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │ NGO Controller         Notifications         │   │   │
│  │  │ - Create Giveaway      Controller            │   │   │
│  │  │                        - Get Notifications   │   │   │
│  │  │                        - Get Preferences     │   │   │
│  │  │                        - Set Preferences     │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Services Layer                          │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │ NGOService     NotificationsService          │   │   │
│  │  │ - Creates      - Queues notifications        │   │   │
│  │  │   giveaways    - Processes notifications    │   │   │
│  │  │ - Calls        - Manages preferences        │   │   │
│  │  │   enqueue()    - Sends push                 │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│           ↓                              ↓                   │
│  ┌──────────────────┐          ┌──────────────────┐          │
│  │   Redis Queue    │          │    Database      │          │
│  │  notifications:  │          │  - Notifications │          │
│  │   ngo_post:*     │          │  - Preferences   │          │
│  │                  │          │  - Users/NGOs    │          │
│  └──────────────────┘          └──────────────────┘          │
│           ↑                              ↑                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Background Worker (Scheduled Jobs)          │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │ NotificationWorkerService                    │   │   │
│  │  │ ✓ Every 30s  - Process NGO post queue        │   │   │
│  │  │ ✓ Every 5min - Retry failed notifications   │   │   │
│  │  │ ✓ Daily 2AM  - Cleanup old records          │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│           ↓                                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        External Services                             │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │ PushNotificationService                      │   │   │
│  │  │ - Firebase Cloud Messaging                  │   │   │
│  │  │ - Web Push API                              │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 2. Notification Flow - NGO Posts Giveaway

```
┌─────────────────────────────────────────────────────────────┐
│ NGO Creates Giveaway                                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ POST /ngo/campaigns/{campaignId}/giveaways/bulk             │
│ (NGOController.createBulkGiveaways)                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ NGOService.createBulkGiveaways                              │
│ 1. Validate NGO is verified                                 │
│ 2. Create giveaway in database                              │
│ 3. Update NGO metrics                                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ FOR EACH GIVEAWAY:                                           │
│ notificationsService.enqueueNGOPostNotification()           │
│                                                              │
│ Task = {                                                     │
│   ngoId: "ngo-123",                                         │
│   itemId: "giveaway-456",                                   │
│   title: "New item from Red Cross",                         │
│   message: "Winter clothes (50 available)",                 │
│   link: "/giveaway/giveaway-456"                            │
│ }                                                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼ (Async)
┌──────────────────────────────────────────────────────────────┐
│ Redis Queue                                                  │
│ KEY: notifications:ngo_post:ngo-123:giveaway-456            │
│ VALUE: Task (JSON)                                           │
│ TTL: 1 hour                                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ (API returns immediately)
                           │
        ┌──────────────────┴──────────────────┐
        │ 200 OK                              │
        │ "Giveaways created successfully"   │
        │                                     │
        └─────────────────────────────────────┘
                           │
        (Now, background worker takes over)
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ BACKGROUND WORKER (Every 30 seconds)                        │
│ NotificationWorkerService.processNGOPostNotifications       │
│                                                              │
│ 1. Query Redis for: notifications:ngo_post:*               │
│ 2. For each task found:                                     │
│    a. Fetch from Redis                                      │
│    b. Call processNGOPostNotification()                     │
│    c. Delete from Redis                                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ NotificationsService.processNGOPostNotification             │
│                                                              │
│ 1. Get all followers of NGO (from database)                 │
│ 2. Process in batches of 100                                │
│ 3. For each follower:                                       │
│    a. Check notification preference                         │
│    b. If allowed, create Notification record               │
│    c. Send push notification (async)                        │
│                                                              │
│ Returns: count of notifications created                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼ (In-App)                           ▼ (Push)
┌─────────────────────┐             ┌─────────────────────┐
│ Notification Table  │             │ Firebase/Web Push   │
│                     │             │                     │
│ - userId: "user-1"  │             │ - Device notified   │
│ - title: "New item" │             │ - Browser shows    │
│ - message: "..."    │             │ - Mobile notifies  │
│ - referenceId: ...  │             │                     │
│ - isRead: false     │             │                     │
│ - createdAt: now    │             │                     │
└─────────────────────┘             └─────────────────────┘
```

## 3. Preference Management Flow

```
┌──────────────────────────────────────────────────────────────┐
│ User Sets Notification Preference                            │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ PUT /notifications/preferences                               │
│ {                                                             │
│   "type": "NGO_NEW_POST",                                    │
│   "isEnabled": false,                                        │
│   "ngoId": "ngo-123"  (optional)                             │
│ }                                                             │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ NotificationsController.setPreference()                      │
│                                                              │
│ Calls: notificationsService.setPreference(                  │
│   userId: "user-456",                                       │
│   type: "NGO_NEW_POST",                                     │
│   isEnabled: false,                                         │
│   ngoId: "ngo-123"                                          │
│ )                                                            │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ Database - NotificationPreference Table                      │
│                                                              │
│ UPSERT:                                                      │
│ WHERE userId="user-456" AND type="NGO_NEW_POST"             │
│       AND ngoId="ngo-123"                                   │
│                                                              │
│ If exists: UPDATE isEnabled = false                         │
│ If not exists: CREATE new record                            │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ Preference Applied                                           │
│                                                              │
│ Now when NGO-123 posts new giveaways:                       │
│ 1. Worker gets follower "user-456"                          │
│ 2. Checks preference (found: disabled)                      │
│ 3. SKIPS notification creation for this user               │
│ 4. User doesn't receive notification                        │
└──────────────────────────────────────────────────────────────┘
```

## 4. Preference Hierarchy

```
When sending notification to user for NGO post:

                        START
                          │
                          ▼
            ┌─────────────────────────┐
            │ Check GLOBAL preference  │
            │ type=NGO_NEW_POST        │
            │ ngoId=null               │
            └────────┬────────┬────────┘
                     │        │
              ┌──────┘        └──────┐
              │                     │
              ▼                     ▼
         DISABLED?          NOT FOUND?
             │                    │
             │                    ▼
             │              Check NGO preference
             │              type=NGO_NEW_POST
             │              ngoId=specific
             │                    │
             ▼                    ▼
        BLOCK ALL           DISABLED?
                                │
                        ┌───────┘
                        │
                        ▼
                    ✓ ALLOWED
                    (Default)
                        │
                        ▼
           Send Notification
           to User
```

## 5. Worker Schedule Timeline

```
Timeline (24 hours)

00:00  ├─ Cleanup old notifications (Daily cleanup)
       │
       ├─ * Every 5 min: Process failed notifications
       │  ├─ 00:05
       │  ├─ 00:10
       │  ├─ 00:15
       │  └─ ...
       │
       ├─ * Every 30 sec: Process NGO post queue
       │  ├─ 00:00:30
       │  ├─ 00:01:00
       │  ├─ 00:01:30
       │  └─ ...
       │
       ├─ ... (all day)
       │
02:00  ├─ ⭐ Cleanup old notifications (30+ days)
       │
       ├─ ... (continues all day)
       │
24:00  └─ Loop repeats next day
```

## 6. Data Model Relationship

```
┌──────────────────────┐
│       User           │
│  ┌────────────────┐  │
│  │ id (PK)        │  │
│  │ email          │  │
│  │ name           │  │
│  └────────────────┘  │
└──────┬───────────────┘
       │
       │ 1:N
       │
       ├──────────────────────────────┐
       │                              │
       ▼                              ▼
┌──────────────────┐      ┌──────────────────────┐
│   Notification   │      │Notification          │
│                  │      │Preference            │
│ ┌──────────────┐ │      │                      │
│ │ id           │ │      │ ┌──────────────────┐ │
│ │ userId  (FK) │ │      │ │ id               │ │
│ │ type         │ │      │ │ userId      (FK) │ │
│ │ title        │ │      │ │ ngoId       (FK) │ │
│ │ message      │ │      │ │ type             │ │
│ │ link         │ │      │ │ isEnabled        │ │
│ │ isRead       │ │      │ │ createdAt        │ │
│ │ createdAt    │ │      │ └──────────────────┘ │
│ └──────────────┘ │      └──────────────────────┘
└──────────────────┘
```

## 7. Redis Queue Structure

```
Redis Database

Key Format:
notifications:ngo_post:{ngoId}:{itemId}

Example Key:
notifications:ngo_post:ngo-5e3c7d81:giveaway-a2b4f9

Value (JSON):
{
  "ngoId": "ngo-5e3c7d81",
  "itemId": "giveaway-a2b4f9",
  "title": "New item from Red Cross Kenya",
  "message": "Winter clothes (50 available)",
  "link": "/giveaway/giveaway-a2b4f9",
  "createdAt": "2024-01-15T10:30:00Z"
}

TTL: 3600 seconds (1 hour)

Multiple items in queue:
notifications:ngo_post:ngo-123:item-1
notifications:ngo_post:ngo-123:item-2
notifications:ngo_post:ngo-456:item-3
...
```

## 8. Batch Processing

```
Followers of NGO (e.g., 10,500 followers)

│
├─ Batch 1 (100 followers)
│  ├─ Check preferences
│  ├─ Create notifications
│  └─ Send push (async)
│
├─ Batch 2 (100 followers)
│  ├─ Check preferences
│  ├─ Create notifications
│  └─ Send push (async)
│
├─ Batch 3 (100 followers)
│  ├─ Check preferences
│  ├─ Create notifications
│  └─ Send push (async)
│
... (105 batches total)
│
└─ Done! 10,500 notifications created in ~5 minutes

Cycle repeats every 30 seconds if queue has items
```

---

These diagrams show:
1. **System Architecture** - How components interact
2. **NGO Post Flow** - Complete flow from giveaway creation to notification
3. **Preference Flow** - How preferences are set and used
4. **Preference Hierarchy** - Decision logic for allowing/blocking
5. **Worker Schedule** - When background jobs run
6. **Data Model** - Database relationships
7. **Redis Structure** - Queue storage format
8. **Batch Processing** - How followers are processed

