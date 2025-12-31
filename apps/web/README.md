# PEPO Web Application 🐝

Next.js web application for the PEPO platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.local.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
apps/web/
├── app/                  # App Router (Next.js 14)
│   ├── page.tsx         # Home page
│   ├── layout.tsx       # Root layout
│   ├── globals.css      # Global styles
│   ├── browse/          # Browse giveaways
│   ├── giveaways/       # Giveaway details
│   ├── create/          # Create giveaway
│   ├── profile/         # User profile
│   ├── messages/        # Messaging
│   └── ngo/             # NGO mode
├── components/          # Reusable components
│   ├── Button.tsx
│   ├── GiveawayCard.tsx
│   ├── Header.tsx
│   └── ...
├── lib/                 # Utilities
│   ├── api.ts          # API client
│   ├── store.ts        # State management
│   └── utils.ts
└── public/             # Static assets
```

## 🎨 Design System

The app uses PEPO's design system with:
- **Primary Color**: Honey Gold (#F4B400)
- **Typography**: Poppins font
- **Components**: Rounded, warm, friendly UI
- **Tailwind CSS**: Utility-first styling

## 🔐 Authentication

- Email + OTP
- Email + Password
- Google OAuth
- Protected routes with middleware

## ✨ Features

### For Users
- Browse giveaways feed
- Express interest
- View participation history
- In-app messaging
- Notifications

### For Givers
- Create giveaways with photos
- Set eligibility rules
- Close draw & select winners
- Coordinate pickup

### For NGOs
- Create campaigns
- Bulk giveaways
- Impact dashboard
- Scheduled distributions

## 🚢 Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📚 Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Zustand (State)
- Axios (API)



