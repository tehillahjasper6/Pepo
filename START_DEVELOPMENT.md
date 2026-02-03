# 🚀 Start Development - Quick Guide

**Status**: ✅ **SERVERS STARTING**

---

## 🌐 Access Your Applications

### Backend API
- **URL**: http://localhost:4000
- **API Docs**: http://localhost:4000/api/docs
- **Status**: ✅ Running

### Web Application  
- **URL**: http://localhost:3000
- **Status**: ✅ Running

### Admin Panel
- **URL**: http://localhost:3001
- **Status**: ✅ Running

---

## 🧪 Test the NGO Trust Framework

### Step 1: Get an NGO Profile ID

**Option A: Via Admin Panel**
1. Go to http://localhost:3001
2. Login: `admin@pepo.app` / `admin123`
3. Navigate to NGOs section
4. Find an NGO and copy its ID

**Option B: Via Database**
```bash
cd backend
npx prisma studio
# Opens at http://localhost:5555
# Navigate to ngo_profiles table
# Copy an ID
```

### Step 2: Test Public Profile
1. Visit: http://localhost:3000/ngo/[ngoProfileId]
2. Verify profile displays:
   - Organization info
   - Mission statement
   - Impact statistics
   - Confidence score gauge
   - Transparency reports (if any)

### Step 3: Test Report Submission
1. Login as NGO: `ngo@foodbank.org` / `password123`
2. Go to: http://localhost:3000/ngo/transparency-report
3. Fill out form:
   - Period: Select dates
   - Campaigns: Enter number
   - Items: Enter distributed count
   - Beneficiaries: Enter count
   - Add locations
4. Submit report
5. Check admin panel for pending review

### Step 4: Test Admin Review
1. Login as admin: http://localhost:3001
2. Go to: http://localhost:3001/transparency-reports
3. Click "Review" on a pending report
4. Review details
5. Approve or reject with notes
6. Verify score updates

---

## 🔑 Test Credentials

| Role  | Email              | Password    | Use Case |
|-------|-------------------|-------------|----------|
| Admin | admin@pepo.app    | admin123    | Review reports, manage users |
| User  | user1@example.com | password123 | Browse, participate |
| NGO   | ngo@foodbank.org  | password123 | Submit reports, view profile |

---

## 📋 Quick Test Checklist

### ✅ Basic Functionality
- [ ] Backend API responds
- [ ] Web app loads
- [ ] Admin panel loads
- [ ] Can login with test accounts

### ✅ NGO Trust Framework
- [ ] Public profile page loads
- [ ] Confidence score displays
- [ ] Report form accessible
- [ ] Can submit report
- [ ] Admin can review reports
- [ ] Score recalculates after approval

### ✅ Existing Features
- [ ] Browse giveaways
- [ ] Create giveaway
- [ ] Express interest
- [ ] Conduct draw
- [ ] View messages
- [ ] Check notifications

---

## 🛠️ Useful Commands

### View Logs
The servers are running in the background. To see logs:
- Check your terminal windows
- Or restart servers in foreground to see output

### Stop Servers
```bash
# Kill all Node processes
pkill -f "node.*dev"

# Or kill specific ports
lsof -ti:4000 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Web
lsof -ti:3001 | xargs kill -9  # Admin
```

### Restart Servers
```bash
# Stop first, then:
npm run backend:dev  # Terminal 1
npm run web:dev      # Terminal 2
npm run admin:dev    # Terminal 3
```

### Database Access
```bash
cd backend
npx prisma studio
# Opens visual database browser at http://localhost:5555
```

---

## 🐛 Troubleshooting

### Servers Not Starting?
1. Check if ports are in use: `lsof -ti:4000,3000,3001`
2. Kill existing processes
3. Check database connection
4. Verify environment variables

### Database Errors?
```bash
cd backend
npx prisma migrate status
npx prisma generate
```

### Build Errors?
```bash
# Clean install
rm -rf node_modules
npm install
```

---

## 📚 Documentation

- **NGO Trust Framework**: `NGO_TRUST_FRAMEWORK.md`
- **Setup Guide**: `NGO_TRUST_FRAMEWORK_SETUP.md`
- **Implementation**: `IMPLEMENTATION_COMPLETE.md`
- **API Docs**: http://localhost:4000/api/docs

---

## 🎯 What to Test First

1. **Public Profile** - Most visible feature
2. **Report Submission** - Core workflow
3. **Admin Review** - Critical process
4. **Score Calculation** - Verify algorithm works

---

**Give Freely. Live Lightly.** 🐝💛

*Ready for Development - December 29, 2024*




