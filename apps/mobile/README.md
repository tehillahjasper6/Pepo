# PEPO Mobile App 🐝📱

React Native (Expo) mobile application for iOS and Android.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on physical device
# Scan QR code with Expo Go app
```

## 📁 Project Structure

```
apps/mobile/
├── app/                    # Expo Router
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home
│   │   ├── browse.tsx     # Browse giveaways
│   │   ├── create.tsx     # Create giveaway
│   │   ├── messages.tsx   # Messages
│   │   └── profile.tsx    # Profile
│   ├── auth/              # Auth screens
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Welcome screen
├── components/            # Reusable components
├── lib/                   # Utilities
├── assets/                # Images, fonts
└── app.json              # Expo configuration
```

## 🎨 Design System

- **NativeWind**: Tailwind CSS for React Native
- **Colors**: PEPO design tokens
- **Typography**: System fonts with Poppins fallback
- **Components**: Rounded, warm, mobile-optimized UI

## ✨ Features

### Core Features
- ✅ Browse giveaways feed
- ✅ Express interest with one tap
- ✅ Create giveaways with camera/gallery
- ✅ In-app messaging
- ✅ Push notifications
- ✅ Profile & activity tracking

### Technical Features
- Expo Router (file-based routing)
- NativeWind (Tailwind CSS)
- Secure storage for tokens
- Image picker & camera
- Push notifications
- Offline support (coming soon)

## 🔐 Authentication

- Email + OTP
- Email + Password
- Google OAuth (native)
- Apple Sign In (iOS)

## 📱 Platform Support

- **iOS**: 13.0+
- **Android**: 6.0+ (API 23+)

## 🚢 Build & Deploy

### Development Build
```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

### Production Build
```bash
# iOS (App Store)
eas build --profile production --platform ios

# Android (Play Store)
eas build --profile production --platform android
```

### Submit to Stores
```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

## 🧪 Testing

```bash
# Run tests
npm test

# E2E tests (Detox)
npm run test:e2e
```

## 📚 Tech Stack

- React Native 0.73
- Expo SDK 50
- Expo Router
- NativeWind (Tailwind)
- Zustand (State)
- Axios (API)
- Expo Notifications
- Expo Image Picker



