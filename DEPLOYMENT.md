# PEPO Deployment Guide 🚀

Production deployment instructions for PEPO platform.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Load Balancer                       │
│                    (nginx/CloudFlare)                   │
└────────────┬──────────────────────┬─────────────────────┘
             │                      │
      ┌──────▼──────┐        ┌─────▼──────┐
      │   Web App   │        │   API      │
      │  (Vercel)   │        │ (Railway)  │
      └─────────────┘        └──────┬─────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
              ┌──────▼──────┐            ┌────────▼────────┐
              │  PostgreSQL │            │     Redis       │
              │ (Supabase)  │            │ (Upstash/Redis) │
              └─────────────┘            └─────────────────┘
```

## Option 1: Cloud Platform (Recommended)

### Backend API (Railway / Render / Fly.io)

#### Railway Deployment

1. **Connect GitHub Repository**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init
```

2. **Configure Environment**
```bash
# Add PostgreSQL database
railway add --database postgres

# Add Redis
railway add --database redis

# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your-production-secret
railway variables set CLOUDINARY_CLOUD_NAME=your-cloud-name
# ... add all other variables
```

3. **Deploy**
```bash
railway up
```

#### Environment Variables

Set these in your Railway/Render dashboard:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-super-secure-secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
WEB_URL=https://pepo.app
API_URL=https://api.pepo.app
ADMIN_URL=https://admin.pepo.app
```

### Frontend Apps (Vercel)

#### Web App Deployment

1. **Connect GitHub**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Select `apps/web` as root directory

2. **Configure Build**
```bash
# Build Command
cd apps/web && npm run build

# Output Directory
apps/web/.next

# Install Command
npm install --workspace=@pepo/web
```

3. **Environment Variables**
```env
NEXT_PUBLIC_API_URL=https://api.pepo.app
NEXT_PUBLIC_WEB_URL=https://pepo.app
```

#### Admin Panel Deployment

Same as web app but:
- Root directory: `apps/admin`
- Domain: `admin.pepo.app`

### Mobile App (EAS Build)

1. **Install EAS CLI**
```bash
npm install -g eas-cli
```

2. **Configure EAS**
```bash
cd apps/mobile
eas init
```

3. **Build for iOS**
```bash
eas build --platform ios --profile production
```

4. **Build for Android**
```bash
eas build --platform android --profile production
```

5. **Submit to Stores**
```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

## Option 2: Self-Hosted (VPS)

### Server Requirements

- **OS**: Ubuntu 22.04 LTS
- **RAM**: 4GB minimum (8GB recommended)
- **CPU**: 2 cores minimum
- **Storage**: 50GB SSD
- **Providers**: DigitalOcean, Linode, AWS EC2

### Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Redis
sudo apt install redis-server

# Install nginx
sudo apt install nginx

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Docker (optional)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Clone and Build

```bash
# Clone repository
git clone <your-repo-url>
cd Pepo

# Install dependencies
npm install

# Build all apps
npm run build
```

### Setup Database

```bash
cd backend

# Run migrations
npx prisma migrate deploy

# Seed database
npm run prisma:seed
```

### Setup PM2

```bash
# Start backend
pm2 start "npm run start:prod" --name pepo-api --cwd backend

# Start web app
pm2 start "npm start" --name pepo-web --cwd apps/web

# Start admin
pm2 start "npm start" --name pepo-admin --cwd apps/admin

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Configure nginx

```nginx
# /etc/nginx/sites-available/pepo.app

# API
server {
    listen 80;
    server_name api.pepo.app;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Web App
server {
    listen 80;
    server_name pepo.app www.pepo.app;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Admin Panel
server {
    listen 80;
    server_name admin.pepo.app;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable sites:
```bash
sudo ln -s /etc/nginx/sites-available/pepo.app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificates
sudo certbot --nginx -d pepo.app -d www.pepo.app
sudo certbot --nginx -d api.pepo.app
sudo certbot --nginx -d admin.pepo.app
```

## Database Setup

### Managed PostgreSQL (Recommended)

**Supabase** (Free tier available)
1. Create project at [supabase.com](https://supabase.com)
2. Copy connection string
3. Update `DATABASE_URL` in environment variables

**Railway PostgreSQL**
```bash
railway add --database postgres
```

**AWS RDS / DigitalOcean Managed DB**
- Create managed PostgreSQL instance
- Configure connection pooling
- Enable automated backups

### Managed Redis

**Upstash** (Serverless Redis)
1. Create database at [upstash.com](https://upstash.com)
2. Copy connection string
3. Update `REDIS_URL`

**Redis Cloud**
- [redis.com](https://redis.com)
- Free tier: 30MB

## Monitoring & Logging

### Setup Application Monitoring

**PM2 Monitoring**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**Error Tracking (Optional)**
- [Sentry](https://sentry.io)
- [LogRocket](https://logrocket.com)

### Health Checks

```bash
# API Health
curl https://api.pepo.app/api/health

# Web App
curl -I https://pepo.app
```

## Backup Strategy

### Database Backups

**Automated Backups**
```bash
# Create backup script
cat > /home/pepo/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > /backups/pepo_$DATE.sql
find /backups -name "pepo_*.sql" -mtime +7 -delete
EOF

chmod +x /home/pepo/backup.sh

# Add to crontab (daily at 2am)
crontab -e
0 2 * * * /home/pepo/backup.sh
```

### File Backups

Use Cloudinary for images (already cloud-based).

## Security Checklist

- ✅ Use strong `JWT_SECRET`
- ✅ Enable HTTPS (SSL/TLS)
- ✅ Configure CORS properly
- ✅ Use environment variables for secrets
- ✅ Enable rate limiting
- ✅ Setup firewall (ufw)
- ✅ Regular security updates
- ✅ Database connection pooling
- ✅ Input validation
- ✅ SQL injection protection (Prisma handles this)

## Performance Optimization

### CDN Setup

**Cloudflare** (Recommended)
1. Add site to Cloudflare
2. Update nameservers
3. Enable caching and minification

### Image Optimization

Already handled by Cloudinary.

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_giveaways_status ON giveaways(status);
CREATE INDEX idx_giveaways_user_id ON giveaways(user_id);
CREATE INDEX idx_participants_giveaway_id ON participants(giveaway_id);
```

## Scaling Strategy

### Horizontal Scaling

1. **Backend**: Deploy multiple API instances behind load balancer
2. **Database**: Use read replicas
3. **Redis**: Use Redis Cluster

### Vertical Scaling

- Upgrade server resources
- Increase database connections
- Enable caching

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build --workspace=backend
      - run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/actions@v2
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## Post-Deployment

1. ✅ Test all features
2. ✅ Verify email/OTP works
3. ✅ Test image uploads
4. ✅ Test draw system
5. ✅ Check analytics
6. ✅ Monitor error logs
7. ✅ Test mobile apps

## Support

Need help deploying? Contact support@pepo.app

---

**Production Checklist**

- [ ] Environment variables set
- [ ] Database migrated
- [ ] Redis connected
- [ ] SSL certificates installed
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Domain DNS configured
- [ ] Mobile apps submitted
- [ ] Error tracking setup
- [ ] Performance testing done



