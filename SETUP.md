# PEPO Setup Guide 🐝

Complete setup instructions for the PEPO platform.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14
- **Redis** >= 7
- **Docker** & **Docker Compose** (recommended)

## Quick Start (Recommended)

### 1. Clone and Install

```bash
cd Pepo
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pepo?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Optional - for OTP)
EMAIL_FROM=noreply@pepo.app
EMAIL_API_KEY=your-sendgrid-api-key

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# URLs
WEB_URL=http://localhost:3000
API_URL=http://localhost:4000
ADMIN_URL=http://localhost:3001
```

### 3. Start Infrastructure with Docker

```bash
docker-compose up -d
```

This will start PostgreSQL and Redis containers.

### 4. Setup Database

```bash
cd backend
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
```

### 5. Start Development Servers

Open 4 terminal windows:

**Terminal 1 - Backend API:**
```bash
npm run backend:dev
# Backend running at http://localhost:4000
# API Docs at http://localhost:4000/api/docs
```

**Terminal 2 - Web App:**
```bash
npm run web:dev
# Web app running at http://localhost:3000
```

**Terminal 3 - Mobile App:**
```bash
npm run mobile:dev
# Scan QR code with Expo Go app
```

**Terminal 4 - Admin Panel:**
```bash
npm run admin:dev
# Admin panel running at http://localhost:3001
```

## Test Credentials

After seeding the database, you can use:

| Role  | Email              | Password    |
|-------|-------------------|-------------|
| Admin | admin@pepo.app    | admin123    |
| User  | user1@example.com | password123 |
| NGO   | ngo@foodbank.org  | password123 |

## Manual Setup (Without Docker)

### Install PostgreSQL

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
createdb pepo
```

**Ubuntu:**
```bash
sudo apt install postgresql
sudo systemctl start postgresql
sudo -u postgres createdb pepo
```

### Install Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu:**
```bash
sudo apt install redis
sudo systemctl start redis
```

Then follow steps 4-5 above.

## Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret
3. Add them to `.env`

## Email Setup (Optional)

For OTP authentication:

1. Sign up at [SendGrid](https://sendgrid.com) or use another email service
2. Get your API key
3. Add to `.env`

For development, OTP codes are logged to console.

## OAuth Setup (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:4000/api/auth/google/callback`
   - `http://localhost:3000/auth/callback`
6. Add credentials to `.env`

### Apple Sign In (Mobile only)

1. Go to [Apple Developer](https://developer.apple.com)
2. Create App ID
3. Enable Sign In with Apple
4. Configure in Expo app.json

## Mobile App Setup

### Install Expo CLI

```bash
npm install -g expo-cli
```

### Install Expo Go

- **iOS**: Download from App Store
- **Android**: Download from Play Store

### Run on Device

```bash
cd apps/mobile
npm start
```

Scan QR code with Expo Go app.

## Verify Installation

### 1. Check Backend

```bash
curl http://localhost:4000/api/health
```

Should return: `{"status":"ok"}`

### 2. Check Web App

Open http://localhost:3000 - should see landing page

### 3. Check Admin Panel

Open http://localhost:3001 - should see admin dashboard

### 4. Check API Docs

Open http://localhost:4000/api/docs - should see Swagger UI

## Troubleshooting

### Database Connection Error

```bash
# Check if PostgreSQL is running
pg_isready

# Restart PostgreSQL
brew services restart postgresql@16  # macOS
sudo systemctl restart postgresql     # Linux
```

### Redis Connection Error

```bash
# Check if Redis is running
redis-cli ping

# Should return: PONG

# Restart Redis
brew services restart redis           # macOS
sudo systemctl restart redis          # Linux
```

### Port Already in Use

```bash
# Find and kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Or use different ports in .env
PORT=4001
```

### Prisma Issues

```bash
# Regenerate Prisma Client
cd backend
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Next Steps

1. ✅ Create your first giveaway
2. ✅ Test the draw system
3. ✅ Try in-app messaging
4. ✅ Explore NGO features
5. ✅ Review admin panel

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup.

## Support

- 📧 Email: support@pepo.app
- 📚 Docs: [API Documentation](http://localhost:4000/api/docs)
- 🐛 Issues: GitHub Issues

---

**Built with ❤️ by the PEPO Team**

*Give Freely. Live Lightly.* 🐝



