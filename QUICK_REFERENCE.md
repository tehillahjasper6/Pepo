# 🚀 Quick Reference Card

## Most Common Commands

### Development
```bash
npm run dev                    # Start all dev servers
npm run dev --workspace=@pepo/admin    # Just admin
npm run build                  # Build all
npm run test                   # Test all
npm run lint                   # Lint all
```

### Database
```bash
npm run prisma:studio --workspace=backend         # UI management
npm run db:migrate --workspace=backend            # Run migrations
npm run db:seed --workspace=backend               # Add test data
npm run db:generate --workspace=backend           # Update client
```

### Docker
```bash
docker-compose up -d              # Start all services
docker-compose logs -f backend    # View logs
docker-compose down               # Stop all services
docker-compose up -d --build      # Rebuild and start
```

### Deployment
```bash
chmod +x deploy.sh
./deploy.sh production docker.io true
npm run db:migrate --workspace=backend
```

## URLs (Local Development)

| Service | URL | Purpose |
|---------|-----|---------|
| Admin | http://localhost:3001 | Admin dashboard |
| Web | http://localhost:3000 | Public app |
| API | http://localhost:3000/api | REST endpoints |
| API Docs | http://localhost:3000/api/docs | Swagger UI |
| DB Studio | (run prisma:studio) | Database UI |

## File Locations

| What | Where |
|------|-------|
| Admin Code | `/apps/admin/` |
| Web Code | `/apps/web/` |
| Backend Code | `/backend/` |
| Shared Types | `/packages/types/` |
| Tests | `__tests__/` (frontend), `test/` (backend) |
| Documentation | Root `.md` files |
| CI/CD | `.github/workflows/` |
| Docker | `*/Dockerfile` + `docker-compose.yml` |

## Environment Variables

### For Development (Development uses docker-compose defaults)

Create `.env` file:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pepo?schema=public
JWT_SECRET=dev-secret-key-change-in-production
NODE_ENV=development
REDIS_HOST=localhost
REDIS_PORT=6379
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### For Production

Update values in `.env`:
```env
DATABASE_URL=postgresql://[production-db-url]
JWT_SECRET=[strong-secret-key]
NODE_ENV=production
REDIS_HOST=[production-redis]
REDIS_PORT=6379
NEXT_PUBLIC_API_URL=https://api.example.com
```

## Health Checks

```bash
curl http://localhost:3000/health           # Overall health
curl http://localhost:3000/health/ready     # Ready for traffic?
curl http://localhost:3000/health/live      # Process alive?
```

## Testing Quick Guide

```bash
# Backend
npm run test --workspace=@pepo/backend                    # Run once
npm run test:watch --workspace=@pepo/backend             # Watch mode
npm run test:cov --workspace=@pepo/backend               # Coverage

# Admin
npm run test --workspace=@pepo/admin                      # Run once
npm run test:watch --workspace=@pepo/admin               # Watch mode

# All
npm run test                                              # Everything
```

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "database connection refused" | `docker-compose up -d postgres redis` |
| "port already in use" | Change port in `.env` or kill process |
| "node_modules issues" | `npm install && npm run clean && npm run build` |
| "TypeScript errors" | `npm run build` shows errors |
| "Docker build fails" | `docker-compose down -v && docker-compose up -d --build` |
| "Tests fail" | Check `.env` vars, run migrations |

## Git Workflow

```bash
git checkout -b feature/my-feature
# ... make changes ...
npm run format
npm run lint
npm run test
git add .
git commit -m "description of changes"
git push origin feature/my-feature
# Open PR on GitHub
```

## Package Structure

| Package | Purpose |
|---------|---------|
| `@pepo/admin` | Admin dashboard |
| `@pepo/web` | Public web app |
| `@pepo/mobile` | React Native mobile |
| `@pepo/backend` | NestJS API |
| `@pepo/types` | Shared TypeScript types |
| `@pepo/config` | Shared configuration |

## Important Files to Know

| File | Purpose |
|------|---------|
| `turbo.json` | Monorepo build config |
| `next.config.js` | Next.js config (admin) |
| `src/main.ts` (backend) | Backend entry point |
| `app/layout.tsx` (admin) | Root layout |
| `apps/admin/Dockerfile` | Admin deployment |
| `.github/workflows/ci-cd.yml` | CI/CD pipeline |
| `.env.example` | Config template |

## Performance Targets

| Metric | Target |
|--------|--------|
| API Response | < 200ms (p95) |
| Page Load | < 2 seconds (LCP) |
| Build Time | < 60 seconds |
| Error Rate | < 0.1% |
| Test Time | < 5 minutes |

## Security Quick Checklist

- [ ] Never commit `.env` file
- [ ] Use strong JWT_SECRET (min 32 chars)
- [ ] Rotate secrets regularly
- [ ] Validate all inputs
- [ ] Use HTTPS in production
- [ ] Keep dependencies updated (`npm audit`)

## Debugging Tips

```bash
# Enable debug logging (backend)
DEBUG=pepo:* npm run start:dev --workspace=backend

# Check TypeScript
npm run build --workspace=@pepo/backend

# View database
npm run prisma:studio --workspace=backend

# Test specific file
npm run test -- path/to/test.ts --watch

# Kill process on port
lsof -i :3000 | awk 'NR!=1 {print $2}' | xargs kill -9
```

## Where to Look For...

| Need | Location |
|------|----------|
| Admin features | `/apps/admin/app/` |
| API endpoints | `/backend/src/` (by feature module) |
| Styles | `tailwind.config.js` or component files |
| Types | `/packages/types/src/` |
| Tests | `__tests__/` or `test/` directories |
| Documentation | Root `.md` files |
| Configuration | `.env.example`, `next.config.js` |

## Quick Onboarding

1. `npm install` - Install dependencies
2. `cp .env.example .env` - Create config
3. `docker-compose up -d postgres redis` - Start DB
4. `npm run db:migrate --workspace=backend` - Migrations
5. `npm run dev` - Start everything
6. Open http://localhost:3001 (admin) or http://localhost:3000 (web)

---

**Pro Tip:** Keep this file open in a terminal or bookmark it!

For detailed info, see COMPLETE_SETUP_GUIDE.md
