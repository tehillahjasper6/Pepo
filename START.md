# 🐝 PEPO - Ready to Start!

## ✅ Setup Complete!

Your database is configured and seeded with test data.

## 🚀 Start the Application

Open **4 separate terminal windows** and run:

### Terminal 1 - Backend API
```bash
cd /Users/visionalventure/Pepo
npm run backend:dev
```
**Access**: http://localhost:4000
**API Docs**: http://localhost:4000/api/docs

### Terminal 2 - Web App
```bash
cd /Users/visionalventure/Pepo
npm run web:dev
```
**Access**: http://localhost:3000

### Terminal 3 - Admin Panel
```bash
cd /Users/visionalventure/Pepo
npm run admin:dev
```
**Access**: http://localhost:3001

### Terminal 4 - Mobile App (Optional)
```bash
cd /Users/visionalventure/Pepo
npm run mobile:dev
```
Scan QR code with **Expo Go** app on your phone.

---

## 🔐 Test Credentials

| Role  | Email              | Password    |
|-------|-------------------|-------------|
| Admin | admin@pepo.app    | admin123    |
| User  | user1@example.com | password123 |
| NGO   | ngo@foodbank.org  | password123 |

---

## 📋 What to Test

1. **Browse Giveaways** - Go to http://localhost:3000
2. **Login** - Use test credentials above
3. **Create Giveaway** - Post an item with photos
4. **Express Interest** - Join a draw
5. **Close Draw** - As a giver, close the draw and see random winner selection
6. **Admin Panel** - Login at http://localhost:3001 with admin credentials
7. **API Documentation** - Explore at http://localhost:4000/api/docs

---

## 🛠️ Useful Commands

```bash
# Stop all processes
# Press Ctrl+C in each terminal

# Restart database
createdb pepo  # If needed

# Reset database
cd backend
npx prisma migrate reset

# View logs
# Check terminal output

# Check database
cd backend
npx prisma studio  # Opens at localhost:5555
```

---

## ❓ Troubleshooting

### Port already in use?
```bash
lsof -ti:4000 | xargs kill -9  # Kill backend
lsof -ti:3000 | xargs kill -9  # Kill web
```

### Database connection error?
```bash
# Check PostgreSQL is running
psql -c "SELECT version();"

# Restart PostgreSQL
brew services restart postgresql@16  # macOS
```

### Redis connection error?
```bash
# Check Redis is running
redis-cli ping  # Should return PONG

# Start Redis
redis-server --daemonize yes
```

---

## 🎯 Key Features to Explore

### 1. Random Draw System ⭐
- Create a giveaway
- Have users express interest
- Close the draw
- See cryptographically secure random winner selection

### 2. Gender-Based Eligibility
- Create giveaway with gender restrictions
- See how system filters participants automatically
- Gender is private and never displayed

### 3. In-App Messaging
- Only available after winner selection
- Giver ↔ Winner communication
- No phone sharing needed

### 4. NGO Mode
- Login as NGO (ngo@foodbank.org)
- Create campaigns
- View impact dashboard

### 5. Admin Panel
- Monitor platform
- Verify NGOs
- View audit logs

---

## 📚 Documentation

- **Main**: [README.md](./README.md)
- **Setup**: [SETUP.md](./SETUP.md)
- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)
- **Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🎉 You're All Set!

**PEPO is ready to go!**

*Give Freely. Live Lightly.* 🐝💛



