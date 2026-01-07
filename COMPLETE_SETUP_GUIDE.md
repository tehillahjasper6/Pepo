# PEPO Platform - Complete Setup Guide

This is the complete technical documentation for the PEPO (Community-based Giving & Sharing) platform.

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Development Setup](#development-setup)
4. [Testing & Quality](#testing--quality)
5. [Deployment](#deployment)
6. [Monitoring](#monitoring)
7. [Contributing](#contributing)

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)

### Development Environment

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your local configuration

# 3. Start infrastructure (PostgreSQL, Redis)
docker-compose up -d postgres redis

# 4. Run database migrations
npm run db:migrate --workspace=backend

# 5. Seed database (optional)
npm run db:seed --workspace=backend

# 6. Start all development servers
npm run dev
```

**Access the applications:**
- Admin Dashboard: http://localhost:3001
- Web App: http://localhost:3000
- Backend API: http://localhost:3000/api
- API Documentation: http://localhost:3000/api/docs

### Production Deployment

```bash
# 1. Make the deploy script executable
chmod +x deploy.sh

# 2. Run deployment script
./deploy.sh production docker.io true

# 3. Run database migrations
npm run db:migrate --workspace=backend

# 4. Verify health
curl https://your-api-url/health
```

For detailed deployment instructions, see [TESTING_AND_DEPLOYMENT.md](TESTING_AND_DEPLOYMENT.md)

## Project Structure

```
pepo/
├── apps/
│   ├── admin/              # Admin Dashboard (Next.js 14)
│   ├── web/                # Public Web App (Next.js 14)
│   └── mobile/             # React Native Mobile App
├── backend/                # NestJS Backend API
├── packages/
│   ├── config/             # Shared configuration
│   ├── types/              # TypeScript type definitions
│   └── ui/                 # Shared UI components
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
├── docker-compose.yml      # Local development services
├── deploy.sh               # Deployment automation script
├── TESTING_AND_DEPLOYMENT.md
├── MONITORING_AND_ERROR_HANDLING.md
└── package.json            # Monorepo configuration
```

## Development Setup

### Tools & IDE Setup

**VS Code Recommended Extensions:**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Thunder Client (or Postman)
- SQLTools (database visualization)

**.vscode/settings.json** (Create in workspace root)
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true
  }
}
```

### NPM Scripts

**Root Level:**
```bash
npm run dev              # Start all development servers
npm run build            # Build all applications
npm run test             # Run all tests
npm run lint             # Run linter
npm start                # Start all production servers
npm run clean            # Clean all build artifacts
npm run format           # Format all code with Prettier
```

**Workspace Specific:**
```bash
# Admin App
npm run dev --workspace=@pepo/admin
npm run build --workspace=@pepo/admin
npm run test --workspace=@pepo/admin
npm run lint --workspace=@pepo/admin

# Backend
npm run start:dev --workspace=@pepo/backend
npm run build --workspace=@pepo/backend
npm run test --workspace=@pepo/backend
npm run db:migrate --workspace=@pepo/backend
npm run prisma:studio --workspace=@pepo/backend

# Web App
npm run dev --workspace=@pepo/web
npm run build --workspace=@pepo/web
npm run test --workspace=@pepo/web
```

### Database Development

```bash
# View and manage database visually
npm run prisma:studio --workspace=backend

# Create a new migration after schema changes
npm run prisma:migrate --workspace=backend

# Seed the database with test data
npm run db:seed --workspace=backend

# Reset database (⚠️ caution: destructive)
npm run prisma:reset --workspace=backend
```

## Testing & Quality

### Running Tests

```bash
# Run all tests
npm run test

# Backend tests
npm run test --workspace=@pepo/backend
npm run test:watch --workspace=@pepo/backend
npm run test:cov --workspace=@pepo/backend

# Frontend tests
npm run test --workspace=@pepo/admin
npm run test:watch --workspace=@pepo/admin
npm run test:cov --workspace=@pepo/admin
```

### Code Quality

```bash
# Lint all code
npm run lint

# Format code
npm run format

# Type checking
npm run build  # Includes TypeScript compilation
```

### Test Coverage Requirements

| Package | Minimum Coverage |
|---------|-----------------|
| Backend | 80% |
| Admin App | 60% |
| Web App | 60% |

### Pre-commit Hooks

Install and configure Husky (if not already done):

```bash
npm install husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run test"
```

## Deployment

### Docker Deployment

**Local Testing:**
```bash
# Build images
docker build -f apps/admin/Dockerfile -t pepo-admin:latest .
docker build -f backend/Dockerfile -t pepo-backend:latest .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f admin

# Stop services
docker-compose down
```

**Production Deployment:**
```bash
# Use deployment script
./deploy.sh production docker.io true

# Or deploy to Kubernetes
kubectl apply -f k8s/
kubectl rollout status deployment/pepo-backend
```

### Environment Configuration

Create `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit with your production values:

```env
# Database
DATABASE_URL=postgresql://user:password@prod-db:5432/pepo

# JWT Authentication
JWT_SECRET=your-production-secret-key-min-32-chars

# Environment
NODE_ENV=production
PORT=3000

# Redis
REDIS_HOST=prod-redis
REDIS_PORT=6379

# (Optional) External Services
SENDGRID_API_KEY=...
TWILIO_ACCOUNT_SID=...
FIREBASE_PROJECT_ID=...
```

### Database Migrations

```bash
# Run pending migrations
npm run db:migrate --workspace=backend

# Check migration status
npx prisma migrate status --schema backend/prisma/schema.prisma

# Create new migration after schema changes
npx prisma migrate dev --schema backend/prisma/schema.prisma --name descriptive_name

# Generate Prisma Client
npm run db:generate --workspace=backend
```

### Health Checks

```bash
# Basic health check
curl https://api.example.com/health

# Readiness check (database connectivity)
curl https://api.example.com/health/ready

# Liveness check
curl https://api.example.com/health/live
```

## Monitoring

### Health Check System

The platform includes three-tier health check system:

- **Liveness** (`/health/live`) - Application is running
- **Readiness** (`/health/ready`) - Application is ready to serve traffic
- **Status** (`/health`) - General health information

### Error Tracking

Configure error tracking service (e.g., Sentry):

```env
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

### Performance Monitoring

Monitor key metrics:
- API response times (target: < 200ms)
- Database query performance
- Error rate (target: < 0.1%)
- Server resource usage (CPU, Memory)

See [MONITORING_AND_ERROR_HANDLING.md](MONITORING_AND_ERROR_HANDLING.md) for detailed information.

## Architecture

### Tech Stack

**Frontend:**
- Next.js 14 (Admin & Web)
- React 19
- TypeScript
- Tailwind CSS
- React Hook Form
- Zustand (state management)

**Backend:**
- NestJS
- PostgreSQL
- Prisma ORM
- Redis
- Socket.IO (WebSockets)

**DevOps:**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Turbo (monorepo management)

### Key Features

1. **Admin Dashboard**
   - Moderation & content management
   - User management & fraud detection
   - Analytics & reporting
   - Trust score calculation

2. **Public Web App**
   - Giveaway creation & participation
   - User profiles & following
   - Notification system
   - Mobile-responsive design

3. **Backend API**
   - RESTful API with Swagger docs
   - Real-time notifications (WebSockets)
   - Advanced search & filtering
   - Rate limiting & throttling

## Contributing

### Code Style

We follow strict TypeScript and code quality standards:

```bash
# Lint and format before committing
npm run lint    # Fix linting issues
npm run format  # Format code with Prettier
npm run test    # Ensure tests pass
```

### Git Workflow

1. Create feature branch: `git checkout -b feature/description`
2. Make changes and commit: `git commit -am "description"`
3. Push to branch: `git push origin feature/description`
4. Open Pull Request on GitHub
5. CI/CD pipeline runs automatically
6. Merge when all checks pass

### TypeScript Standards

- Strict mode enabled
- Type all function parameters and returns
- Use interfaces for object shapes
- Avoid `any` type (use `unknown` if necessary)

### Testing Standards

- Write tests for new features
- Maintain > 80% code coverage
- Test both happy path and error cases
- Use descriptive test names

## Troubleshooting

### Build Issues

```bash
# Clean and rebuild
npm run clean
npm install
npm run build

# Check for TypeScript errors
npm run build --workspace=@pepo/admin
```

### Database Issues

```bash
# Reset database
npm run prisma:reset --workspace=backend

# Generate Prisma Client
npm run db:generate --workspace=backend

# Verify connection
npm run prisma:studio --workspace=backend
```

### Docker Issues

```bash
# Rebuild images
docker-compose up -d --build

# View service logs
docker-compose logs -f service-name

# Clean up
docker-compose down -v  # Remove volumes too
```

## Support & Resources

- **Documentation**: See individual guides in repository
- **API Documentation**: http://localhost:3000/api/docs (Swagger UI)
- **Database**: https://app.prisma.io (Cloud GUI option)
- **GitHub Issues**: Report bugs and request features

## License

Proprietary - All rights reserved

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Code review completed
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Health checks verified
- [ ] Monitoring configured
- [ ] Backups enabled
- [ ] SSL certificates configured
- [ ] Load testing completed
- [ ] Documentation updated

---

**Last Updated:** January 2024
**Version:** 1.0.0
