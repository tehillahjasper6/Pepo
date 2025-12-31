# PEPO Quick Start Guide 🚀

Get PEPO running in 5 minutes!

## Step 1: Run Setup Script

```bash
./setup.sh
```

This creates all necessary `.env` files.

## Step 2: Start Infrastructure

```bash
docker-compose up -d
```

This starts PostgreSQL and Redis.

## Step 3: Setup Database

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with test data
npm run db:seed
```

## Step 4: Start Development Servers

Open 4 terminals:

**Terminal 1 - Backend:**
```bash
npm run backend:dev
```

**Terminal 2 - Web App:**
```bash
npm run web:dev
```

**Terminal 3 - Mobile App:**
```bash
npm run mobile:dev
```

**Terminal 4 - Admin Panel:**
```bash
npm run admin:dev
```

## Access the Apps

- 🌐 **Web App**: http://localhost:3000
- 📱 **Mobile App**: Scan QR code with Expo Go
- 🔧 **Admin Panel**: http://localhost:3001
- 🔌 **API**: http://localhost:4000
- 📚 **API Docs**: http://localhost:4000/api/docs

## Test Credentials

| Role  | Email              | Password    |
|-------|-------------------|-------------|
| Admin | admin@pepo.app    | admin123    |
| User  | user1@example.com | password123 |
| NGO   | ngo@foodbank.org  | password123 |

## Troubleshooting

### Port already in use?
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9
```

### Database connection error?
```bash
# Check if PostgreSQL is running
docker-compose ps
```

### Redis connection error?
```bash
# Restart Redis
docker-compose restart redis
```

### Need to reset everything?
```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Start fresh
docker-compose up -d
npm run db:migrate
npm run db:seed
```

## Next Steps

1. ✅ Browse giveaways at http://localhost:3000
2. ✅ Login with test account
3. ✅ Create a giveaway
4. ✅ Test the draw system
5. ✅ Check admin panel

---

**Need help?** See [SETUP.md](./SETUP.md) for detailed instructions.

**Ready to deploy?** See [DEPLOYMENT.md](./DEPLOYMENT.md).

*Give Freely. Live Lightly.* 🐝



