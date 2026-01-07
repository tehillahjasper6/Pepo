# Monitoring & Error Handling Guide

## Error Handling Architecture

### Backend Error Handling

The backend uses NestJS exception filters and custom error responses.

#### Global Exception Filter

All errors are caught and transformed into consistent JSON responses:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/endpoint"
}
```

#### Error Types

| Type | Status | Use Case |
|------|--------|----------|
| ValidationException | 400 | Invalid input data |
| UnauthorizedException | 401 | Missing/invalid auth |
| ForbiddenException | 403 | Insufficient permissions |
| NotFoundException | 404 | Resource not found |
| ConflictException | 409 | Duplicate resource |
| InternalServerException | 500 | Server error |

#### Logging Strategy

Logs are written to both console and files with severity levels:

```
ERROR   - Critical failures, unhandled exceptions
WARN    - Unexpected conditions, rate limiting
INFO    - Important events, job completion
DEBUG   - Detailed operational data (dev only)
```

### Frontend Error Handling

#### Admin Dashboard

- **Network Errors**: Display toast notifications with retry options
- **Validation Errors**: Show form-field level error messages
- **Permission Errors**: Redirect to 403 error page
- **Server Errors**: Show modal with error details and support contact

#### Error Boundaries

React Error Boundaries catch component rendering errors:

```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <button 
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Try again
      </button>
    </div>
  )
}
```

## Monitoring Setup

### Health Check System

Three-tier health check system for different monitoring needs:

#### 1. Liveness Probe (`/health/live`)
- Checks if application is running
- Response time: < 100ms
- Used by: Container orchestration

#### 2. Readiness Probe (`/health/ready`)
- Checks application dependencies (database, cache)
- Response time: < 500ms
- Used by: Load balancers

#### 3. Basic Health (`/health`)
- General application status
- Includes uptime and environment info
- Used by: Dashboard monitoring

### Integration with Popular Platforms

#### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pepo-backend
spec:
  template:
    spec:
      containers:
      - name: backend
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
          
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Docker Compose

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
```

### Sentry Integration

For error tracking and performance monitoring:

```bash
# Install Sentry
npm install @sentry/nextjs @sentry/node

# Configure in backend/src/main.ts
import * as Sentry from "@sentry/node"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
})
```

### Performance Monitoring

#### Database Query Monitoring

Use Prisma's built-in logging:

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

#### API Response Time Tracking

Responses include timing headers:

```
X-Response-Time: 125ms
X-DB-Time: 45ms
X-Cache-Hit: true
```

#### Frontend Performance

Monitor with Web Vitals:

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```

## Alerting & Notifications

### Alert Thresholds

| Metric | Alert Level | Action |
|--------|-------------|--------|
| Error Rate > 1% | Warning | Page on-call |
| Error Rate > 5% | Critical | Wake up on-call |
| DB Connection Pool Exhausted | Critical | Restart service |
| API Response Time > 1s | Warning | Monitor |
| Disk Usage > 80% | Warning | Review logs |
| Disk Usage > 95% | Critical | Cleanup immediately |

### Setting Up Alerts

#### Using CloudWatch

```bash
# Create alarm for high error rate
aws cloudwatch put-metric-alarm \
  --alarm-name pepo-backend-error-rate \
  --alarm-description "Alert if error rate exceeds 1%" \
  --metric-name ErrorRate \
  --namespace PEPO \
  --statistic Average \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold
```

#### Using Datadog

```python
# In backend initialization
from datadog import initialize, api

options = {
    'api_key': os.getenv('DATADOG_API_KEY'),
    'app_key': os.getenv('DATADOG_APP_KEY')
}

initialize(**options)

# Monitor custom metrics
statsd.gauge('pepo.db.connections', current_connections)
statsd.increment('pepo.api.requests')
```

## Logging Best Practices

### Structured Logging

Use structured logs for better analysis:

```typescript
logger.log({
  timestamp: new Date(),
  level: 'INFO',
  service: 'authentication',
  userId: user.id,
  action: 'login',
  ipAddress: request.ip,
  duration: 150, // ms
  metadata: {
    provider: 'google',
    mfaEnabled: true,
  }
})
```

### Log Aggregation

Send logs to centralized service:

```bash
# Using ELK Stack
npm install winston-elasticsearch

# Or use cloud solution
npm install winston-cloudwatch  # AWS CloudWatch
npm install winston-datadog     # Datadog
```

### Log Retention Policy

- **Development**: 7 days
- **Staging**: 30 days
- **Production**: 90 days (compliance requirement)

## Debugging & Troubleshooting

### Enable Debug Logging

```bash
# Backend
DEBUG=pepo:* npm run start:dev

# Frontend
NEXT_PUBLIC_DEBUG=true npm run dev
```

### Common Issues & Solutions

#### High Database CPU

1. Check slow queries: `npm run prisma:studio`
2. Add indexes to frequently queried columns
3. Consider query optimization or caching

#### Memory Leaks

```bash
# Analyze memory usage
node --inspect dist/main.js

# Connect with Chrome DevTools
# chrome://inspect
```

#### Certificate Errors in Production

```bash
# Renew SSL certificates
certbot renew --dry-run

# Update in Docker
docker-compose up -d --build
```

## Monthly Maintenance

### Health Check

- [ ] Review error logs for patterns
- [ ] Check database size growth
- [ ] Verify backup integrity
- [ ] Update dependencies
- [ ] Review security advisories
- [ ] Optimize slow queries
- [ ] Clean up old logs

### Performance Review

- [ ] Analyze API response times
- [ ] Check database query performance
- [ ] Review frontend bundle size
- [ ] Check cache hit ratios
- [ ] Review rate limit violations

### Security Audit

- [ ] Rotate secrets/API keys
- [ ] Review access logs
- [ ] Check for failed auth attempts
- [ ] Update SSL certificates
- [ ] Review firewall rules

## Resources

- [NestJS Error Handling Docs](https://docs.nestjs.com/exception-filters)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Kubernetes Health Checks](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Sentry Documentation](https://docs.sentry.io/)
- [ELK Stack Guide](https://www.elastic.co/guide/en/elastic-stack/current/index.html)
