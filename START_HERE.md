# 🚀 START HERE - PEPO Development

**Status**: Ready to develop!  
**Date**: December 29, 2024

---

## ✅ What's Done

- ✅ Database configured and seeded
- ✅ Backend infrastructure complete
- ✅ Web app UI complete
- ✅ Brand assets integrated
- ✅ Documentation comprehensive
- ✅ Backend is starting...

---

## 🎯 What to Do RIGHT NOW

### Step 1: Start Web Application

Open a **new terminal** and run:

```bash
cd /Users/visionalventure/Pepo
npm run web:dev
```

This will start the web app on **http://localhost:3000**

---

### Step 2: Visit the Test Page

Once the web app is running, open your browser and go to:

**http://localhost:3000/test-pepo**

This page lets you:
- ✨ Test all 5 Pepo bee emotions
- 🎨 See the design system
- 🎬 Preview animations
- 🔄 Toggle NGO mode

---

### Step 3: Start Coding - Connect Login Page

This is your **FIRST TASK**:

#### File to Edit
`apps/web/app/login/page.tsx`

#### What to Do
Connect the login form to the backend API using the `useAuth` hook.

#### Code Changes Needed

1. **Import the hook**:
```tsx
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/Toast';
```

2. **Use the hook**:
```tsx
const { login, isLoading, error } = useAuth();
const router = useRouter();
```

3. **Update the password login handler**:
```tsx
const handlePasswordLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    await login(email, password);
    toast.success('Welcome back!');
    router.push('/browse');
  } catch (error: any) {
    toast.error(error.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};
```

4. **Test it**:
   - Go to http://localhost:3000/login
   - Use: user1@example.com / password123
   - Should redirect to /browse on success

---

### Step 4: Check Backend Status

The backend should be running. Check it:

```bash
# In a new terminal
curl http://localhost:4000/health
```

Expected response:
```json
{"status":"ok"}
```

If not running, start it:
```bash
npm run backend:dev
```

---

## 📋 Your Task List (Priority Order)

### Week 1: Core Features

1. **🔴 Connect Login Page** (2-3 hours) ← **START HERE**
   - File: `apps/web/app/login/page.tsx`
   - Use `useAuth` hook
   - Test with user1@example.com

2. **🔴 Connect Signup Page** (2-3 hours)
   - File: `apps/web/app/signup/page.tsx`
   - Use `useAuth.register()`
   - Add validation

3. **🔴 Connect Browse Page** (3-4 hours)
   - File: `apps/web/app/browse/page.tsx`
   - Use `useGiveaways` hook
   - Display real data

4. **🔴 Implement Create Giveaway** (4-5 hours)
   - File: `apps/web/app/create/page.tsx`
   - Handle image upload
   - Use FormData

5. **🔴 Connect Detail Page** (3-4 hours)
   - File: `apps/web/app/giveaway/[id]/page.tsx`
   - Fetch giveaway by ID
   - Express interest button

6. **🔴 Implement Conduct Draw** (3 hours)
   - Add draw button for creators
   - Show loading animation
   - Celebrate winner

---

## 🛠️ Development Setup

### Terminal Setup

You need **3 terminals**:

#### Terminal 1: Backend (Already Running)
```bash
npm run backend:dev
# Port: 4000
```

#### Terminal 2: Web App (Start Now!)
```bash
npm run web:dev
# Port: 3000
```

#### Terminal 3: Commands/Testing
```bash
# Use for git, testing, database queries, etc.
```

---

## 🔑 Test Accounts

| Email | Password | Role |
|-------|----------|------|
| user1@example.com | password123 | User |
| user2@example.com | password123 | User |
| admin@pepo.app | admin123 | Admin |
| ngo@foodbank.org | password123 | NGO |

---

## 🎨 Quick Reference

### Using Pepo Bee
```tsx
import { PepoBee } from '@/components/PepoBee';

// Loading
<PepoBee emotion="loading" size={200} />

// Success
<PepoBee emotion="celebrate" size={250} />

// Error
<PepoBee emotion="alert" size={150} />
```

### Using Toast
```tsx
import { toast } from '@/components/Toast';

toast.success('Success!');
toast.error('Error!');
toast.info('Info!');
```

### Using Auth Hook
```tsx
import { useAuth } from '@/hooks/useAuth';

const { login, register, logout, user, isAuthenticated } = useAuth();

// Login
await login(email, password);

// Register
await register({ name, email, password, city });

// Logout
logout();
```

### Using Giveaways Hook
```tsx
import { useGiveaways } from '@/hooks/useGiveaways';

const { 
  giveaways, 
  fetchGiveaways, 
  createGiveaway,
  expressInterest,
  conductDraw 
} = useGiveaways();
```

---

## 📚 Important Files

### Frontend
- `apps/web/app/login/page.tsx` - Login page ← **START HERE**
- `apps/web/hooks/useAuth.ts` - Auth state management
- `apps/web/hooks/useGiveaways.ts` - Giveaway state
- `apps/web/lib/apiClient.ts` - API client (all endpoints)
- `apps/web/components/Toast.tsx` - Notifications

### Backend
- `backend/src/auth/auth.controller.ts` - Auth endpoints
- `backend/src/giveaways/giveaways.controller.ts` - Giveaway endpoints
- `backend/src/draw/draw.controller.ts` - Draw endpoints

### Documentation
- `NEXT_STEPS_GUIDE.md` - Detailed guide
- `QUICKSTART_DEV.md` - Setup guide
- `INDEX.md` - Find any document

---

## 🐛 Troubleshooting

### Backend not responding?
```bash
# Check if running
lsof -ti:4000

# Restart if needed
npm run backend:dev
```

### Web app won't start?
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Start again
npm run web:dev
```

### Database issues?
```bash
# Check connection
psql pepo -c "SELECT COUNT(*) FROM users;"

# Regenerate client
npm run db:generate
```

### CORS errors?
Check `backend/src/main.ts` has CORS enabled for localhost:3000

---

## ✅ Success Checklist

Before you start coding, make sure:

- [ ] Backend is running (port 4000)
- [ ] Web app is running (port 3000)
- [ ] You can visit http://localhost:3000
- [ ] You can visit http://localhost:3000/test-pepo
- [ ] Database has test data (7 users, 9 giveaways)
- [ ] You've read this file
- [ ] You know which file to edit first

---

## 🎯 Today's Goal

**Complete Task #1: Connect Login Page**

**Time**: 2-3 hours  
**File**: `apps/web/app/login/page.tsx`  
**Test**: Login with user1@example.com / password123

---

## 🚀 Let's Code!

1. ✅ Backend is starting
2. 🎯 Start web app: `npm run web:dev`
3. 🎯 Visit: http://localhost:3000/test-pepo
4. 🎯 Edit: `apps/web/app/login/page.tsx`
5. 🎯 Test login flow
6. 🎯 Celebrate with Pepo! 🐝

---

**You've got everything you need. Time to build! 💪**

**Give Freely. Live Lightly.** 🐝💛

---

*Start Here Guide - December 29, 2024*  
*First Task: Connect Login Page*  
*Estimated Time: 2-3 hours*



