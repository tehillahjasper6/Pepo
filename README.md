# PEPO 🐝

**Give Freely. Live Lightly.**

PEPO is a community-based giving and sharing platform designed to promote generosity, fairness, and dignity. It is NOT a marketplace—there is no buying, selling, or bidding.

> **📚 New here?** Check out the **[Documentation Index (INDEX.md)](./INDEX.md)** to find everything you need!  
> **🚀 Want to start coding?** Jump to **[QUICKSTART_DEV.md](./QUICKSTART_DEV.md)** for a 5-minute setup guide!

## 🌟 Core Philosophy

- **Giving should feel human, not transactional**
- **Fairness is enforced through random selection**
- **Dignity for both giver and receiver**
- **Privacy-first communication**
- **No favoritism, no pressure, no social ranking**

## 🏗️ Architecture

This is a monorepo containing:

```
pepo-monorepo/
├── apps/
│   ├── web/           # Next.js web application
│   ├── mobile/        # React Native (Expo) mobile app
│   └── admin/         # Admin dashboard
├── backend/           # NestJS API server
├── packages/
│   ├── ui/            # Shared UI components
│   ├── types/         # TypeScript types
│   └── config/        # Shared configurations
└── infrastructure/    # Docker, deployment configs
```

## 🛠️ Tech Stack

### Frontend
- **Web**: Next.js 14, React 18, Tailwind CSS
- **Mobile**: React Native (Expo), NativeWind
- **Animation**: Framer Motion

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis (draw locking & randomness)
- **Storage**: Cloudinary
- **Notifications**: Firebase Cloud Messaging

### Infrastructure
- Docker & Docker Compose
- Cloud-ready (AWS/GCP compatible)
- CI/CD ready

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd Pepo
npm install
```

2. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your configurations
```

3. **Start infrastructure**
```bash
docker-compose up -d
```

4. **Run database migrations**
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

5. **Start development servers**

```bash
# Terminal 1: Backend
npm run backend:dev

# Terminal 2: Web App
npm run web:dev

# Terminal 3: Mobile App
npm run mobile:dev

# Terminal 4: Admin Panel
npm run admin:dev
```

### Access Points
- **Web App**: http://localhost:3000
- **Mobile App**: Expo Go app (scan QR code)
- **Admin Panel**: http://localhost:3001
- **API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api/docs

## 👥 User Roles

1. **Individual User** (Giver / Receiver)
2. **NGO / Charity Organization**
3. **Admin / Trust Team**

## ✨ Core Features

### For Individual Users
- ✅ Post items for giveaway with photos
- ✅ Express interest in items
- ✅ Fair random draw system
- ✅ Gender-based eligibility (private, secure)
- ✅ In-app messaging (post-winner only)
- ✅ Push notifications

### For NGOs/Charities
- ✅ Verification system with badges
- ✅ Bulk giveaway management
- ✅ Scheduled giveaways
- ✅ Advanced eligibility rules
- ✅ Impact dashboard & reports
- ✅ QR-based distribution tracking

### For Admins
- ✅ User management
- ✅ NGO verification workflow
- ✅ Abuse & report handling
- ✅ Draw audit logs
- ✅ Platform analytics

## 🎨 Design System

### Brand Colors
- **Honey Gold**: `#F4B400` (Primary actions)
- **Bee Black**: `#1E1E1E` (Text, headers)
- **Pollen Cream**: `#FFF9EE` (Background)
- **Leaf Green**: `#6BBF8E` (NGO mode, trust)
- **Sky Blue**: `#6FAED9` (Info)
- **Soft Coral**: `#F28B82` (Alerts)

### Typography
- **Font**: Poppins (preferred) or Nunito
- **Tone**: Friendly, warm, conversational

### Visual Language
- Rounded corners (8-20px)
- Soft shadows
- Bee mascot integration
- Honey-cell card design

## 🔐 Security Features

- Cryptographically secure random winner selection
- Gender stored encrypted, never displayed publicly
- Draw event audit logging
- RBAC (Role-Based Access Control)
- Rate limiting
- Input validation & sanitization

## 📱 Platform Support

- **iOS**: 13.0+
- **Android**: 6.0+
- **Web**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Responsive**: Mobile-first design

## 🧪 Testing

```bash
# Run all tests
npm test

# Backend tests
cd backend && npm test

# Web tests
cd apps/web && npm test

# Mobile tests
cd apps/mobile && npm test
```

## 📦 Build for Production

```bash
# Build all apps
npm run build

# Build specific app
cd apps/web && npm run build
cd apps/mobile && npm run build:ios
cd apps/mobile && npm run build:android
```

## 🐳 Docker Deployment

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 Documentation

### Quick Start Guides
- 🚀 **[5-Minute Quickstart](./QUICKSTART_DEV.md)** - Get up and running fast
- 📖 **[Development Complete Summary](./DEVELOPMENT_COMPLETE_SUMMARY.md)** - Current state overview
- 🎯 **[Full Development Guide](./FULL_DEVELOPMENT_COMPLETE.md)** - Comprehensive details

### Technical Documentation
- 🏗️ **[Architecture Guide](./ARCHITECTURE.md)** - System design and structure
- ⚙️ **[Setup Guide](./SETUP.md)** - Installation instructions
- 🚢 **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment
- 📊 **[Development Progress](./DEVELOPMENT_PROGRESS.md)** - Task tracker

### Brand & Design
- 🎨 **[Brand Integration](./BRAND_INTEGRATION_COMPLETE.md)** - Using brand assets
- 🐝 **[Brand Assets](./brand-assets/README.md)** - Logos, animations, tokens
- 🎬 **[Motion Design](./brand-assets/IMPLEMENTATION.md)** - Animation guide

### Application Guides
- 🌐 **[Backend API](./backend/README.md)** - NestJS backend documentation
- 💻 **[Web App](./apps/web/README.md)** - Next.js web application
- 📱 **[Mobile App](./apps/mobile/README.md)** - React Native app
- 🔧 **[Admin Panel](./apps/admin/README.md)** - Admin dashboard

### Database
- 📊 **[Database Schema](./backend/prisma/schema.prisma)** - Prisma schema file
- 🌱 **[Seed Data](./backend/prisma/seed.ts)** - Sample data script

## 🤝 Contributing

1. Follow the existing code style
2. Write meaningful commit messages
3. Add tests for new features
4. Update documentation

## 📄 License

Proprietary - All rights reserved

## 💬 Support

For questions and support, contact: support@pepo.app

---

**Built with ❤️ by the PEPO Team**

*Give Freely. Live Lightly.* 🐝

