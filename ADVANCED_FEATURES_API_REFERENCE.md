# Advanced Features API Quick Reference

## Digest Notifications API

### Get User Digest Preferences
```http
GET /api/digests/preferences
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "id": "pref-123",
  "userId": "user-123",
  "frequency": "DAILY",
  "isEnabled": true,
  "channels": ["IN_APP", "EMAIL"],
  "includeNewPosts": true,
  "includeCampaigns": true,
  "includeCompleted": false,
  "lastDigestSentAt": "2025-01-01T10:00:00Z",
  "nextScheduledAt": "2025-01-02T10:00:00Z"
}
```

### Update Digest Preferences
```http
PUT /api/digests/preferences
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "frequency": "WEEKLY",
  "isEnabled": true,
  "channels": ["IN_APP", "PUSH"],
  "includeNewPosts": true,
  "includeCampaigns": true,
  "includeCompleted": true
}
```

### Update Digest Frequency Only
```http
PUT /api/digests/frequency
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "frequency": "WEEKLY"
}
```

**Valid Values**: `DAILY`, `WEEKLY`

### Update Digest Channels
```http
PUT /api/digests/channels
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "channels": ["IN_APP", "EMAIL", "PUSH"]
}
```

**Valid Channels**: `IN_APP`, `EMAIL`, `PUSH`

### Update Content Scope
```http
PUT /api/digests/content-scope
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "includeNewPosts": true,
  "includeCampaigns": true,
  "includeCompleted": false
}
```

### Toggle Digest On/Off
```http
PUT /api/digests/toggle
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "isEnabled": false
}
```

### Send Test Digest
```http
POST /api/digests/test
Authorization: Bearer <jwt_token>
```

---

## Campaign Reminders API

### Get Campaign Reminder Settings (NGO/Admin)
```http
GET /api/campaigns/:campaignId/reminders
Authorization: Bearer <jwt_token>
```

**Response**:
```json
[
  {
    "id": "setting-123",
    "campaignId": "campaign-456",
    "reminderType": "CAMPAIGN_LAUNCH_7DAYS",
    "isEnabled": true,
    "sentAt": null,
    "nextReminderAt": "2025-01-08T00:00:00Z",
    "cooldownMinutes": 60
  },
  {
    "id": "setting-124",
    "campaignId": "campaign-456",
    "reminderType": "CAMPAIGN_LAUNCH_24HOURS",
    "isEnabled": true,
    "sentAt": null,
    "nextReminderAt": "2025-01-14T00:00:00Z",
    "cooldownMinutes": 60
  }
]
```

### Enable/Disable Reminder Type
```http
PUT /api/campaigns/:campaignId/reminders/:reminderType
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "isEnabled": true
}
```

**Valid Reminder Types**:
- `CAMPAIGN_LAUNCH_7DAYS` - 7 days before launch
- `CAMPAIGN_LAUNCH_24HOURS` - 24 hours before launch
- `CAMPAIGN_LAUNCH_SAME_DAY` - Day of launch
- `CAMPAIGN_ENDING` - 24 hours before end
- `CAMPAIGN_LAUNCH_SOON` - 30 days before launch

### Disable All Campaign Reminders
```http
DELETE /api/campaigns/:campaignId/reminders
Authorization: Bearer <jwt_token>
```

### Get Reminder Audit Logs
```http
GET /api/campaigns/:campaignId/reminders/logs
Authorization: Bearer <jwt_token>
```

**Response**:
```json
[
  {
    "id": "log-123",
    "userId": "user-789",
    "campaignId": "campaign-456",
    "reminderType": "CAMPAIGN_LAUNCH_7DAYS",
    "sentAt": "2025-01-08T00:00:01Z"
  },
  {
    "id": "log-124",
    "userId": "user-790",
    "campaignId": "campaign-456",
    "reminderType": "CAMPAIGN_LAUNCH_7DAYS",
    "sentAt": "2025-01-08T00:00:05Z"
  }
]
```

---

## Follow Suggestions API

### Get Follow Suggestions
```http
GET /api/suggestions?limit=10&includeExpired=false
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `limit` (optional, default: 10, max: 50) - Number of suggestions to return
- `includeExpired` (optional, default: false) - Include expired suggestions

**Response**:
```json
[
  {
    "id": "sugg-123",
    "userId": "user-123",
    "suggestedNGOId": "ngo-456",
    "confidenceScore": 0.87,
    "reason": "Based on your category interests and participation history",
    "signalWeight": {
      "popularity": 0.8,
      "category_match": 0.9,
      "location_proximity": 0.7,
      "participation_history": 0.8,
      "trust_score": 0.9
    },
    "isViewed": false,
    "isFollowed": false,
    "isIgnored": false,
    "expiresAt": "2025-02-01T00:00:00Z",
    "suggestedNGO": {
      "id": "ngo-456",
      "organizationName": "Help Foundation",
      "focusArea": "Education"
    }
  }
]
```

### Generate Fresh Suggestions
```http
POST /api/suggestions/refresh
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "count": 15,
  "suggestions": [...]
}
```

### Mark Suggestion as Viewed
```http
PUT /api/suggestions/:suggestionId/view
Authorization: Bearer <jwt_token>
```

### Follow NGO from Suggestion
```http
POST /api/suggestions/:suggestionId/follow
Authorization: Bearer <jwt_token>
```

**Response**:
```json
{
  "success": true,
  "message": "NGO followed",
  "ngoId": "ngo-456"
}
```

### Ignore Suggestion
```http
PUT /api/suggestions/:suggestionId/ignore
Authorization: Bearer <jwt_token>
```

### Get Suggestion Details
```http
GET /api/suggestions/:suggestionId
Authorization: Bearer <jwt_token>
```

---

## Background Jobs Schedule

| Feature | Job | Frequency | Timezone |
|---------|-----|-----------|----------|
| Digests | `processDigests()` | Every 6 hours | UTC (6 AM, 12 PM, 6 PM, 12 AM) |
| Campaign Reminders | `processCampaignReminders()` | Every hour | UTC |
| Follow Suggestions | `refreshFollowSuggestions()` | Weekly (Mon) | UTC (2 AM) |
| Cleanup Reminders | `cleanupReminderLogs()` | Weekly (Sun) | UTC (3 AM) |
| Cleanup Suggestions | `cleanupSuggestions()` | Weekly (Sat) | UTC (2 AM) |

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid frequency value. Must be DAILY or WEEKLY",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden (Reminders - NGO/Admin Only)
```json
{
  "statusCode": 403,
  "message": "Only NGO and Admin users can access reminder settings",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Campaign not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Rate Limiting

All endpoints are rate-limited per the app's throttle configuration:
- **Default**: 100 requests per minute per user
- **Digest Endpoints**: Subject to default limit
- **Reminder Endpoints**: Subject to default limit
- **Suggestion Endpoints**: Subject to default limit

---

## Authentication

All endpoints require JWT authentication via:
```
Authorization: Bearer <jwt_token>
```

Token must be valid and not expired.

---

## Testing Requests

### Using cURL

#### Get digest preferences
```bash
curl -X GET http://localhost:3000/api/digests/preferences \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Update digest frequency
```bash
curl -X PUT http://localhost:3000/api/digests/frequency \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"frequency":"WEEKLY"}'
```

#### Get suggestions
```bash
curl -X GET "http://localhost:3000/api/suggestions?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get campaign reminders
```bash
curl -X GET http://localhost:3000/api/campaigns/CAMPAIGN_ID/reminders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Set up a Bearer token in the Authorization tab
2. Test each endpoint with the requests above
3. Verify database changes with `SELECT * FROM UserDigestPreference WHERE userId='...'`

---

## WebSocket Integration (Future)

When WebSocket support is added, these events will be emitted:

```typescript
// When digest is sent
'digest:sent' => {
  userId: string;
  frequency: DigestFrequency;
  itemCount: number;
  sentAt: Date;
}

// When reminder is sent
'reminder:sent' => {
  userId: string;
  campaignId: string;
  reminderType: ReminderType;
  sentAt: Date;
}

// When suggestion is generated
'suggestion:generated' => {
  userId: string;
  suggestedNGOId: string;
  confidenceScore: number;
}
```

---

## Monitoring & Analytics

Recommended metrics to track:

**Digest System**:
- Digests sent per day
- Average items per digest
- Open rate by frequency
- User retention with digests enabled

**Campaign Reminders**:
- Reminders sent per campaign
- User click-through rate
- Campaign participation uplift

**Follow Suggestions**:
- Suggestions generated per user
- Follow conversion rate
- Average confidence score
- Most effective signal weighting
