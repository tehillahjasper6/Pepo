# 🚀 PEPO Developer Quickstart

Get up and running with PEPO development in 5 minutes.

---

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis (optional, for caching)
- Git

---

## Step 1: Clone & Install (2 min)

```bash
# Clone the repository
cd /Users/visionalventure/Pepo

# Install all dependencies (backend, web, mobile, admin)
npm install
```

---

## Step 2: Setup Environment (1 min)

```bash
# Generate .env files for all apps
bash setup.sh

# Manual setup (if Docker not available)
bash setup-manual.sh
```

This creates:
- `/backend/.env` - Backend configuration
- `/apps/web/.env.local` - Web app configuration
- `/apps/admin/.env.local` - Admin configuration
- `/apps/mobile/.env` - Mobile configuration

---

## Step 3: Database Setup (2 min)

### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### Option B: Manual Setup

```bash
# Make sure PostgreSQL is running
# Create database
createdb pepo

# Update DATABASE_URL in backend/.env
# Then run migrations and seed
npm run db:migrate
npm run db:seed
```

---

## Step 4: Start Development Servers

Open **4 terminals** and run:

### Terminal 1: Backend API
```bash
npm run backend:dev
# Runs on http://localhost:3001
```

### Terminal 2: Web Application
```bash
npm run web:dev
# Runs on http://localhost:3000
```

### Terminal 3: Admin Panel (Optional)
```bash
npm run admin:dev
# Runs on http://localhost:3002
```

### Terminal 4: Mobile App (Optional)
```bash
npm run mobile:dev
# Opens Expo developer tools
```

---

## Step 5: Access the Apps

| App | URL | Credentials |
|-----|-----|-------------|
| **Web App** | http://localhost:3000 | Create account or use test@example.com |
| **Backend API** | http://localhost:3001 | - |
| **Admin Panel** | http://localhost:3002 | admin@pepo.com / admin123 |
| **Mobile** | Expo Go App | Scan QR code |

---

## 🎨 Test Brand Assets

Visit: **http://localhost:3000/test-pepo**

This page lets you:
- Test all 5 Pepo bee emotions (idle, celebrate, give, loading, alert)
- Preview brand colors and design system
- Toggle NGO mode
- See animations in action

---

## 🔑 Default Test Accounts

Created by the seed script:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@pepo.com | admin123 |
| **User** | john@example.com | password123 |
| **User** | jane@example.com | password123 |
| **NGO** | ngo@example.com | password123 |

---

## 📂 Project Structure

```
Pepo/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── auth/           # Authentication
│   │   ├── users/          # User management
│   │   ├── giveaways/      # Giveaway logic
│   │   ├── draw/           # Random draw system
│   │   └── ...
│   └── prisma/
│       └── schema.prisma   # Database schema
│
├── apps/
│   ├── web/                # Next.js Web App
│   │   ├── app/            # Pages (App Router)
│   │   ├── components/     # React components
│   │   └── hooks/          # Custom hooks
│   │
│   ├── mobile/             # React Native (Expo)
│   │   ├── app/            # Screens
│   │   └── components/     # Mobile components
│   │
│   └── admin/              # Next.js Admin Panel
│       └── app/            # Admin pages
│
├── packages/
│   ├── types/              # Shared TypeScript types
│   └── config/             # Shared configuration
│
└── brand-assets/           # Logos, animations, tokens
    ├── logos/              # SVG logos
    ├── animations/         # Lottie JSON files
    ├── motion/             # Emotion resolver
    └── tokens/             # Design tokens
```

---

## 🛠️ Useful Commands

### Development
```bash
# Start all apps (requires turbo)
npm run dev

# Start individual apps
npm run backend:dev
npm run web:dev
npm run mobile:dev
npm run admin:dev
```

### Database
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Reset database
npm run db:reset

# Open Prisma Studio (database GUI)
npx prisma studio --schema=backend/prisma/schema.prisma
```

### Code Quality
```bash
# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run type-check
```

---

## 🐛 Common Issues

### Issue: "Module not found: Can't resolve '@/components/...'"

**Solution**: Make sure `tsconfig.json` has the correct paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue: "Prisma schema validation error"

**Solution**: Generate Prisma client:
```bash
npm run db:generate
```

### Issue: "Database connection error"

**Solution**: Check `DATABASE_URL` in `backend/.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/pepo?schema=public"
```

### Issue: "Port 3000 already in use"

**Solution**: Kill the process or change port:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in package.json
"web:dev": "cd apps/web && next dev -p 3005"
```

---

## 📚 Next Steps

1. **Read the Docs**
   - `ARCHITECTURE.md` - System design
   - `DEVELOPMENT_PROGRESS.md` - What's built
   - `FULL_DEVELOPMENT_COMPLETE.md` - Comprehensive overview

2. **Explore Brand Assets**
   - Visit `/test-pepo` on the web app
   - Check `brand-assets/README.md`
   - Read `BRAND_INTEGRATION_COMPLETE.md`

3. **Start Coding**
   - Pick a feature from `DEVELOPMENT_PROGRESS.md` TODO section
   - Create a branch
   - Implement and test
   - Submit PR

4. **Join the Community**
   - Read `CONTRIBUTING.md`
   - Check existing issues
   - Ask questions

---

## 🎯 Your First Contribution

Try these beginner-friendly tasks:

1. **Add a new category** to giveaways (e.g., "Sports Equipment")
2. **Improve error messages** on the login page
3. **Add a loading state** to a button
4. **Write a unit test** for a utility function
5. **Update documentation** with your learnings

---

## 🆘 Get Help

- **Documentation**: Check `/docs` folder
- **Issues**: Open an issue on GitHub
- **Community**: Join our Discord (coming soon)

---

## ✅ Development Checklist

Before pushing code:

- [ ] Code runs without errors
- [ ] No console warnings
- [ ] Code is formatted (`npm run format`)
- [ ] Types are correct (`npm run type-check`)
- [ ] Tested on localhost
- [ ] Commit message is descriptive

---

**You're all set! Happy coding! 🐝💛**

*Give Freely. Live Lightly.*



