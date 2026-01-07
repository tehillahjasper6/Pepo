# Testing & Deployment Guide

## Overview
This document covers testing, deployment, and monitoring setup for the PEPO platform.

## Testing

### Backend Testing

The backend uses Jest for unit and integration testing.

```bash
# Run all tests
npm run test --workspace=@pepo/backend

# Run tests in watch mode
npm run test:watch --workspace=@pepo/backend

# Run with coverage
npm run test:cov --workspace=@pepo/backend

# Run e2e tests
npm run test:e2e --workspace=@pepo/backend
```

**Backend Test Structure:**
- Located in `backend/test/` directory
- Unit tests for services (business logic)
- E2E tests for API endpoints
- Database seeding for test fixtures

### Frontend Testing

Admin and Web frontends use Jest/Vitest for unit testing.

```bash
# Admin app tests
npm run test --workspace=@pepo/admin
npm run test:watch --workspace=@pepo/admin
npm run test:cov --workspace=@pepo/admin

# Web app tests
npm run test --workspace=@pepo/web
```

**Frontend Test Structure:**
- Located in `__tests__/` directories
- Component tests using React Testing Library
- Hook tests for custom React hooks
- Integration tests for pages

### Running All Tests

```bash
# Run tests across all packages
npm run test

# With coverage reporting
npm run test:cov --workspace=@pepo/backend
```

## Docker Deployment

### Local Development with Docker

```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f admin

# Rebuild images
docker-compose up -d --build
```

**Services:**
- `postgres` (port 5432): Database
- `redis` (port 6379): Cache
- `backend` (port 3000): NestJS API
- `admin` (port 3001): Next.js admin dashboard

### Building Production Images

```bash
# Build admin frontend image
docker build -f apps/admin/Dockerfile -t pepo-admin:latest .

# Build backend image
docker build -f backend/Dockerfile -t pepo-backend:latest .
```

## Environment Configuration

### Required Environment Variables

**Backend (.env):**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/pepo?schema=public
JWT_SECRET=your-secret-key-min-32-chars
NODE_ENV=production
REDIS_HOST=redis
REDIS_PORT=6379
PORT=3000
```

**Admin Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://api.example.com
NODE_ENV=production
```

### Optional Environment Variables

**Backend (if using external services):**
```env
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
FIREBASE_PROJECT_ID=your-firebase-project
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
```

## Health Checks & Monitoring

### Health Check Endpoints

```bash
# Basic health check
curl http://localhost:3000/health

# Readiness check (includes database)
curl http://localhost:3000/health/ready

# Liveness check
curl http://localhost:3000/health/live
```

**Response Examples:**

Basic Health:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production",
  "uptime": 3600.5
}
```

Readiness Check:
```json
{
  "status": "ready",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

### Kubernetes Probe Configuration

If deploying on Kubernetes, configure probes as follows:

```yaml
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

### Docker Health Checks

Docker Compose already includes health checks for all services:

```yaml
healthcheck:
  test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
  interval: 10s
  timeout: 5s
  retries: 5
```

## CI/CD Pipeline

GitHub Actions automatically runs on every push to `main` and `develop`:

1. **Lint & Type Check** - Code quality validation
2. **Build** - Compile all applications
3. **Test** - Run unit and integration tests
4. **Docker Build** - Validate Docker images (main branch only)

View pipeline status: `.github/workflows/ci-cd.yml`

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing (`npm run test`)
- [ ] Type checking passes (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Health checks responding
- [ ] Docker images built and tested
- [ ] CI/CD pipeline green

## Performance Monitoring

### Database
- Monitor query performance with Prisma Studio
- Run `npm run prisma:studio --workspace=backend`

### Backend
- API response times tracked in logs
- Rate limiting: 100 req/min (general), 10 req/min (auth), 5 req/min (uploads)
- Rate limiting headers included in responses

### Frontend
- Next.js analytics enabled
- Bundle size monitoring through build output

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
docker exec pepo-postgres pg_isready -U postgres

# View database logs
docker logs pepo-postgres
```

### Backend Startup Issues
```bash
# Check backend logs
docker logs pepo-backend

# Verify environment variables
docker exec pepo-backend env | grep -E "DATABASE|JWT|REDIS"

# Run migrations
npm run db:migrate --workspace=backend
```

### Frontend Build Issues
```bash
# Clear build cache
npm run clean --workspace=@pepo/admin

# Rebuild
npm run build --workspace=@pepo/admin

# Check build logs
npm run build --workspace=@pepo/admin 2>&1 | head -50
```

## Scaling & Load Testing

### Load Testing with k6

```bash
# Install k6 (macOS)
brew install k6

# Run basic load test
k6 run tests/load-test.js
```

### Horizontal Scaling
- Use load balancer (nginx/HAProxy)
- Multiple backend instances behind load balancer
- Shared Redis for session/cache
- Database read replicas (optional)

## Next Steps

1. **Set up monitoring** - Sentry for error tracking, DataDog for performance
2. **Configure CI/CD secrets** - Registry credentials, deployment keys
3. **Set up automated backups** - Database backups to S3
4. **Implement log aggregation** - ELK Stack or CloudWatch
5. **Add security scanning** - OWASP Zap, Snyk
