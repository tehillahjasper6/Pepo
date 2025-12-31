# PEPO Backend API 🐝

REST API for the PEPO platform built with NestJS, PostgreSQL, Prisma, and Redis.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 7
- npm >= 9

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp ../.env.example .env
# Edit .env with your configuration

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npm run prisma:seed
```

### Development

```bash
# Start development server
npm run start:dev

# The API will be available at:
# http://localhost:4000/api
# http://localhost:4000/api/docs (Swagger)
```

### Using Docker

```bash
# From project root
docker-compose up -d

# Run migrations
docker-compose exec backend npx prisma migrate dev

# Seed database
docker-compose exec backend npm run prisma:seed
```

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
├── src/
│   ├── auth/            # Authentication (OTP, OAuth)
│   ├── users/           # User management
│   ├── giveaways/       # Giveaway CRUD
│   ├── draw/            # Random draw logic ⭐
│   ├── messages/        # In-app messaging
│   ├── notifications/   # Push & in-app notifications
│   ├── ngo/             # NGO features
│   ├── admin/           # Admin panel
│   ├── prisma/          # Prisma service
│   ├── redis/           # Redis service
│   ├── cloudinary/      # Image upload
│   ├── app.module.ts    # Root module
│   └── main.ts          # Entry point
└── test/                # E2E tests
```

## 🔐 Authentication

### Email + OTP
```bash
POST /api/auth/send-otp
{
  "email": "user@example.com"
}

POST /api/auth/verify-otp
{
  "email": "user@example.com",
  "code": "123456"
}
```

### Email + Password
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "city": "New York",
  "gender": "MALE"
}

POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Google OAuth
```bash
GET /api/auth/google
GET /api/auth/google/callback
```

## 🎁 Core API Endpoints

### Giveaways
```bash
GET    /api/giveaways              # Get all (feed)
GET    /api/giveaways/:id          # Get single
POST   /api/giveaways              # Create
PUT    /api/giveaways/:id          # Update
DELETE /api/giveaways/:id          # Cancel

POST   /api/giveaways/:id/interest # Express interest
DELETE /api/giveaways/:id/interest # Withdraw interest
```

### Draw System (CORE FEATURE)
```bash
POST /api/draw/:giveawayId/close   # Close draw & select winners
GET  /api/draw/:giveawayId/results # Get draw results
```

**How it works:**
1. Giver taps "Close Draw & Pick Winner"
2. System acquires distributed lock (Redis)
3. Validates participants and eligibility
4. Selects winner(s) using cryptographically secure randomness
5. Creates immutable winner records
6. Sends notifications
7. Enables messaging between giver and winner

### Users
```bash
GET /api/users/me                  # Get profile
PUT /api/users/me                  # Update profile
GET /api/users/me/stats            # Get stats
GET /api/users/me/giveaways        # My giveaways
GET /api/users/me/participations   # My participations
GET /api/users/me/wins             # My wins
```

### Messages
```bash
POST /api/messages                          # Send message
GET  /api/messages/giveaway/:giveawayId     # Get messages
GET  /api/messages/conversations            # Get conversations
```

### Notifications
```bash
GET /api/notifications                 # Get all
GET /api/notifications/unread-count    # Unread count
PUT /api/notifications/:id/read        # Mark as read
PUT /api/notifications/mark-all-read   # Mark all read
```

### NGO
```bash
POST /api/ngo/apply              # Apply for NGO status
GET  /api/ngo/profile            # Get profile
GET  /api/ngo/verified           # List verified NGOs
POST /api/ngo/campaigns          # Create campaign
GET  /api/ngo/campaigns          # Get campaigns
GET  /api/ngo/dashboard          # Impact dashboard
```

### Admin
```bash
GET  /api/admin/stats                    # Platform stats
GET  /api/admin/users                    # All users
PUT  /api/admin/users/:id/status         # Update user status
GET  /api/admin/ngo/pending              # Pending NGOs
POST /api/admin/ngo/:id/verify           # Verify NGO
POST /api/admin/ngo/:id/reject           # Reject NGO
GET  /api/admin/reports                  # Reports
POST /api/admin/reports/:id/resolve      # Resolve report
GET  /api/admin/audit-logs               # Audit logs
```

## 🗄️ Database

### Migrations
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database
npx prisma migrate reset
```

### Prisma Studio
```bash
npx prisma studio
# Opens at http://localhost:5555
```

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Bcrypt password hashing
- ✅ Role-based access control (RBAC)
- ✅ Request throttling
- ✅ Input validation
- ✅ CORS protection
- ✅ Cryptographically secure randomness
- ✅ Gender privacy (never exposed publicly)
- ✅ Audit logging

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📊 Monitoring

### Health Check
```bash
GET /api/health
```

### Logs
```bash
# View logs
docker-compose logs -f backend

# Audit logs
GET /api/admin/audit-logs
```

## 🚢 Deployment

### Environment Variables (Production)
```env
DATABASE_URL=postgresql://user:pass@host:5432/pepo
REDIS_HOST=redis.production.com
JWT_SECRET=super-secure-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
NODE_ENV=production
```

### Build
```bash
npm run build
npm run start:prod
```

### Docker Production
```bash
docker build -t pepo-backend --target production .
docker run -p 4000:4000 --env-file .env pepo-backend
```

## 📚 API Documentation

Full API documentation is available at:
- **Development**: http://localhost:4000/api/docs
- **Production**: https://api.pepo.app/docs

## 🐝 Test Credentials

After seeding:

| Role  | Email              | Password    |
|-------|-------------------|-------------|
| Admin | admin@pepo.app    | admin123    |
| User  | user1@example.com | password123 |
| NGO   | ngo@foodbank.org  | password123 |

## 🤝 Contributing

1. Follow NestJS best practices
2. Write tests for new features
3. Update API documentation
4. Run linting before committing

## 📄 License

Proprietary - All rights reserved



