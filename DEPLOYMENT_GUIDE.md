# 🚀 PEPO Platform - Complete Deployment Guide

**Version**: 1.0.0  
**Status**: Production-Ready  
**Last Updated**: December 29, 2024

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Mobile App Deployment](#mobile-app-deployment)
7. [Domain & SSL](#domain--ssl)
8. [Monitoring & Logging](#monitoring--logging)
9. [CI/CD Setup](#cicd-setup)
10. [Post-Deployment](#post-deployment)

---

## ✅ Pre-Deployment Checklist

### **Code Quality**
- [x] All features tested
- [x] Error handling implemented
- [x] Loading states added
- [x] TypeScript types complete
- [x] No console errors
- [x] Performance optimized

### **Security**
- [x] Environment variables secured
- [x] JWT secrets changed
- [x] Database credentials secure
- [x] CORS configured
- [x] Rate limiting enabled
- [x] Input validation

### **Documentation**
- [x] API documentation
- [x] Environment variables documented
- [x] Deployment steps documented
- [x] Troubleshooting guide

---

## 🔧 Environment Setup

### **1. Generate VAPID Keys for Push Notifications**

```bash
cd backend
npx web-push generate-vapid-keys
```

**Save these keys** - you'll need them for environment variables:
- Public Key: `VAPID_PUBLIC_KEY`
- Private Key: `VAPID_PRIVATE_KEY`

### **2. Environment Variables**

#### **Backend (.env)**
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/pepo?schema=public"

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# VAPID Keys (Push Notifications)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# Email (Optional)
EMAIL_FROM=noreply@pepo.app
EMAIL_API_KEY=your-email-api-key

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# URLs
WEB_URL=https://pepo.app
API_URL=https://api.pepo.app
ADMIN_URL=https://admin.pepo.app

# Node
NODE_ENV=production
PORT=4000
```

#### **Web App (.env.local)**
```bash
NEXT_PUBLIC_API_URL=https://api.pepo.app/api
NEXT_PUBLIC_WEB_URL=https://pepo.app
```

#### **Admin Panel (.env.local)**
```bash
NEXT_PUBLIC_API_URL=https://api.pepo.app
```

---

## 🗄️ Database Setup

### **Option 1: Managed Database (Recommended)**

#### **Supabase (PostgreSQL)**
1. Create account at https://supabase.com
2. Create new project
3. Copy connection string
4. Update `DATABASE_URL` in backend `.env`

#### **Neon (PostgreSQL)**
1. Create account at https://neon.tech
2. Create new project
3. Copy connection string
4. Update `DATABASE_URL` in backend `.env`

#### **Railway (PostgreSQL)**
1. Create account at https://railway.app
2. Create PostgreSQL service
3. Copy connection string
4. Update `DATABASE_URL` in backend `.env`

### **Option 2: Self-Hosted Database**

```bash
# Install PostgreSQL
sudo apt-get install postgresql

# Create database
sudo -u postgres psql
CREATE DATABASE pepo;
CREATE USER pepo_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE pepo TO pepo_user;
\q

# Update DATABASE_URL
DATABASE_URL="postgresql://pepo_user:secure_password@localhost:5432/pepo?schema=public"
```

### **Run Migrations**

```bash
cd backend
npm run db:migrate
npm run db:seed  # Optional: seed with initial data
```

---

## 🗄️ Redis Setup

### **Option 1: Managed Redis (Recommended)**

#### **Upstash**
1. Create account at https://upstash.com
2. Create Redis database
3. Copy connection details
4. Update `REDIS_HOST` and `REDIS_PASSWORD`

#### **Redis Cloud**
1. Create account at https://redis.com/cloud
2. Create database
3. Copy connection details
4. Update Redis environment variables

### **Option 2: Self-Hosted Redis**

```bash
# Install Redis
sudo apt-get install redis-server

# Configure
sudo nano /etc/redis/redis.conf
# Set: requirepass your_redis_password

# Restart
sudo systemctl restart redis
```

---

## 🚀 Backend Deployment

### **Option 1: Railway (Recommended)**

1. **Create Account**
   - Visit https://railway.app
   - Sign up with GitHub

2. **Create Project**
   - New Project → Deploy from GitHub
   - Select your PEPO repository
   - Select `backend` folder

3. **Configure**
   - Add environment variables (from checklist above)
   - Set root directory: `backend`
   - Set build command: `npm install && npm run build`
   - Set start command: `npm run start:prod`

4. **Deploy**
   - Railway auto-deploys on push
   - Get your API URL: `https://your-app.railway.app`

### **Option 2: Render**

1. **Create Account**
   - Visit https://render.com
   - Sign up

2. **Create Web Service**
   - New → Web Service
   - Connect GitHub repository
   - Settings:
     - **Root Directory**: `backend`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm run start:prod`
     - **Environment**: Node

3. **Add Environment Variables**
   - Add all variables from checklist

4. **Deploy**
   - Render auto-deploys on push

### **Option 3: AWS/GCP/Azure**

#### **AWS (EC2 + RDS)**

1. **Launch EC2 Instance**
   ```bash
   # Ubuntu 22.04 LTS
   # t3.medium or larger
   ```

2. **Install Dependencies**
   ```bash
   ssh into instance
   sudo apt-get update
   sudo apt-get install -y nodejs npm postgresql-client
   ```

3. **Clone Repository**
   ```bash
   git clone your-repo-url
   cd Pepo/backend
   npm install --production
   ```

4. **Set Up PM2**
   ```bash
   npm install -g pm2
   pm2 start dist/main.js --name pepo-backend
   pm2 save
   pm2 startup
   ```

5. **Set Up Nginx**
   ```bash
   sudo apt-get install nginx
   # Configure reverse proxy to port 4000
   ```

#### **GCP (Cloud Run)**

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 4000
   CMD ["node", "dist/main.js"]
   ```

2. **Deploy**
   ```bash
   gcloud builds submit --tag gcr.io/your-project/pepo-backend
   gcloud run deploy pepo-backend --image gcr.io/your-project/pepo-backend
   ```

---

## 🌐 Frontend Deployment

### **Option 1: Vercel (Recommended)**

1. **Create Account**
   - Visit https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - New Project → Import Git Repository
   - Select PEPO repository
   - Configure:
     - **Root Directory**: `apps/web`
     - **Framework Preset**: Next.js
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`

3. **Environment Variables**
   - Add `NEXT_PUBLIC_API_URL`
   - Add `NEXT_PUBLIC_WEB_URL`

4. **Deploy**
   - Vercel auto-deploys on push
   - Get your URL: `https://pepo.vercel.app`

### **Option 2: Netlify**

1. **Create Account**
   - Visit https://netlify.com
   - Sign up

2. **New Site from Git**
   - Connect repository
   - Settings:
     - **Base directory**: `apps/web`
     - **Build command**: `npm run build`
     - **Publish directory**: `.next`

3. **Environment Variables**
   - Add all `NEXT_PUBLIC_*` variables

4. **Deploy**
   - Netlify auto-deploys on push

### **Option 3: Self-Hosted**

```bash
# Build
cd apps/web
npm install
npm run build

# Start
npm start

# Or use PM2
pm2 start npm --name pepo-web -- start
```

---

## 📱 Mobile App Deployment

### **iOS (App Store)**

1. **Prerequisites**
   - Apple Developer Account ($99/year)
   - Xcode installed
   - Mac computer

2. **Build**
   ```bash
   cd apps/mobile
   eas build --platform ios
   ```

3. **Submit**
   ```bash
   eas submit --platform ios
   ```

### **Android (Google Play)**

1. **Prerequisites**
   - Google Play Developer Account ($25 one-time)
   - Android Studio (optional)

2. **Build**
   ```bash
   cd apps/mobile
   eas build --platform android
   ```

3. **Submit**
   ```bash
   eas submit --platform android
   ```

---

## 🔒 Domain & SSL

### **Custom Domain Setup**

1. **Purchase Domain**
   - Use Namecheap, Google Domains, or similar
   - Domain: `pepo.app` (or your choice)

2. **Configure DNS**

   **For Vercel (Web App)**:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

   **For Railway/Render (Backend)**:
   ```
   Type: CNAME
   Name: api
   Value: your-backend.railway.app
   ```

3. **SSL Certificate**
   - Vercel/Railway/Render provide free SSL
   - Auto-renewal included

---

## 📊 Monitoring & Logging

### **Application Monitoring**

#### **Sentry (Error Tracking)**
1. Create account at https://sentry.io
2. Install SDK:
   ```bash
   npm install @sentry/nextjs @sentry/node
   ```
3. Configure in backend and frontend
4. Get error alerts

#### **LogRocket (Session Replay)**
1. Create account at https://logrocket.com
2. Install SDK
3. Monitor user sessions

### **Uptime Monitoring**

#### **UptimeRobot**
1. Create account at https://uptimerobot.com
2. Add monitors:
   - Backend API: `https://api.pepo.app/health`
   - Web App: `https://pepo.app`
3. Get alerts on downtime

### **Analytics**

#### **Plausible (Privacy-Friendly)**
1. Create account at https://plausible.io
2. Add script to web app
3. Track page views

---

## 🔄 CI/CD Setup

### **GitHub Actions**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy PEPO

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      - name: Run tests
        run: |
          cd backend
          npm test
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@v1.0.0
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend

  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd apps/web
          npm ci
      - name: Build
        run: |
          cd apps/web
          npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: apps/web
```

---

## ✅ Post-Deployment

### **1. Verify Deployment**

```bash
# Check backend
curl https://api.pepo.app/health
# Expected: {"status":"ok"}

# Check web app
curl https://pepo.app
# Expected: HTML page

# Check database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

### **2. Run Migrations**

```bash
cd backend
npm run db:migrate
```

### **3. Seed Initial Data (Optional)**

```bash
cd backend
npm run db:seed
```

### **4. Test Features**

- [ ] User registration
- [ ] User login
- [ ] Browse giveaways
- [ ] Create giveaway
- [ ] Express interest
- [ ] Conduct draw
- [ ] Real-time messaging
- [ ] Push notifications

### **5. Set Up Monitoring**

- [ ] Configure Sentry
- [ ] Set up UptimeRobot
- [ ] Add analytics
- [ ] Configure alerts

---

## 🐛 Troubleshooting

### **Backend Won't Start**

```bash
# Check logs
pm2 logs pepo-backend

# Check environment variables
echo $DATABASE_URL
echo $JWT_SECRET

# Check database connection
psql $DATABASE_URL -c "SELECT 1;"
```

### **Frontend Build Fails**

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### **Database Connection Issues**

```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Check migrations
cd backend
npx prisma migrate status
```

### **Push Notifications Not Working**

1. Check VAPID keys are set
2. Verify service worker is registered
3. Check browser console for errors
4. Test with `curl` to backend endpoint

---

## 📚 Additional Resources

### **Documentation**
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)

### **Support**
- Check `DEPLOYMENT.md` for detailed steps
- Review `ARCHITECTURE.md` for system design
- See `TROUBLESHOOTING.md` for common issues

---

## 🎯 Quick Deploy Commands

### **Backend (Railway)**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

### **Frontend (Vercel)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd apps/web
vercel --prod
```

---

## 🎊 Deployment Checklist

### **Pre-Deploy**
- [ ] All tests passing
- [ ] Environment variables set
- [ ] Database migrated
- [ ] VAPID keys generated
- [ ] SSL certificates ready

### **Deploy**
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Admin panel deployed (optional)
- [ ] Mobile apps submitted (optional)

### **Post-Deploy**
- [ ] Health checks passing
- [ ] Features tested
- [ ] Monitoring configured
- [ ] Alerts set up
- [ ] Documentation updated

---

**Ready to Deploy!** 🚀

*Give Freely. Live Lightly.* 🐝💛

---

*Deployment Guide - December 29, 2024*  
*Status: Production-Ready*  
*Platform: PEPO v1.0.0*




