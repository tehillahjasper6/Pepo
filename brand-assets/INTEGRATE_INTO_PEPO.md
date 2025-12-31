# Integrating Brand Assets into PEPO Apps

Quick guide to add brand assets to existing PEPO applications.

## 🚀 Step 1: Install Dependencies

### Web & Admin Apps
```bash
cd apps/web
npm install lottie-react @rive-app/react-canvas

cd apps/admin
npm install lottie-react
```

### Mobile App
```bash
cd apps/mobile
npm install lottie-react-native
cd ios && pod install  # iOS only
```

## 📁 Step 2: Copy Brand Assets

Brand assets are already in `/brand-assets/` at project root.

Update paths in your apps:

### Web App (`apps/web`)
```typescript
// lib/brandAssets.ts
export const BRAND_ASSETS_PATH = '/brand-assets';

export function getBrandAsset(path: string) {
  return `${BRAND_ASSETS_PATH}/${path}`;
}
```

### Mobile App (`apps/mobile`)
```typescript
// Copy animations to assets folder
cp ../../../brand-assets/animations/* ./assets/animations/

// Or use require for local files
const idleAnimation = require('../../../brand-assets/animations/pepo-idle.json');
```

## 🎨 Step 3: Create Pepo Component

### Web: `apps/web/components/PepoBee.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { PepoEmotion } from '@/brand-assets/motion/PepoEmotionResolver';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface PepoBeeProps {
  emotion?: string;
  size?: number;
}

export function PepoBee({ emotion = 'idle', size = 200 }: PepoBeeProps) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    import(`../../../brand-assets/animations/pepo-${emotion}.json`)
      .then(data => setAnimationData(data.default))
      .catch(() => import(`../../../brand-assets/animations/pepo-idle.json`)
        .then(data => setAnimationData(data.default))
      );
  }, [emotion]);

  if (!animationData) return null;

  return (
    <div style={{ width: size, height: size }}>
      <Lottie
        animationData={animationData}
        loop={emotion === 'idle' || emotion === 'loading'}
      />
    </div>
  );
}
```

### Mobile: `apps/mobile/components/PepoBee.tsx`
```typescript
import LottieView from 'lottie-react-native';
import { View } from 'react-native';

interface PepoBeeProps {
  emotion?: string;
  size?: number;
}

export function PepoBee({ emotion = 'idle', size = 200 }: PepoBeeProps) {
  const animationMap = {
    idle: require('../../../brand-assets/animations/pepo-idle.json'),
    celebrate: require('../../../brand-assets/animations/pepo-celebrate.json'),
    give: require('../../../brand-assets/animations/pepo-give.json'),
    loading: require('../../../brand-assets/animations/pepo-loading.json'),
    alert: require('../../../brand-assets/animations/pepo-alert.json'),
  };

  return (
    <View style={{ width: size, height: size }}>
      <LottieView
        source={animationMap[emotion] || animationMap.idle}
        autoPlay
        loop={emotion === 'idle' || emotion === 'loading'}
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}
```

## 🎯 Step 4: Use in Key Screens

### Winner Announcement (`apps/web/app/giveaways/[id]/winner/page.tsx`)
```typescript
import { PepoBee } from '@/components/PepoBee';

export default function WinnerPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <PepoBee emotion="celebrate" size={300} />
      <h1 className="text-4xl font-bold mt-8">You Won! 🎉</h1>
      <p className="text-xl text-gray-600 mt-4">
        Congratulations on being selected!
      </p>
    </div>
  );
}
```

### Landing Page (`apps/web/app/page.tsx`)
```typescript
// Add Pepo to hero section
<header className="bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600">
  <div className="container mx-auto px-4 py-20 text-center">
    <PepoBee emotion="idle" size={150} />
    <h1 className="text-5xl font-bold text-white mb-6">
      Give Freely. Live Lightly.
    </h1>
  </div>
</header>
```

### Loading States (`apps/web/components/LoadingDraw.tsx`)
```typescript
export function LoadingDraw() {
  return (
    <div className="flex flex-col items-center">
      <PepoBee emotion="loading" size={200} />
      <p className="mt-4 text-gray-600">Selecting winner...</p>
    </div>
  );
}
```

### Mobile Home (`apps/mobile/app/(tabs)/index.tsx`)
```typescript
import { PepoBee } from '@/components/PepoBee';

// Add to home screen header
<View className="bg-primary-500 p-6 rounded-b-3xl">
  <View className="flex-row items-center">
    <PepoBee emotion="idle" size={60} />
    <View className="ml-4">
      <Text className="text-white text-2xl font-bold">Welcome to PEPO!</Text>
      <Text className="text-white/80">Give freely. Live lightly.</Text>
    </View>
  </View>
</View>
```

## 🏢 Step 5: NGO Mode Integration

### NGO Dashboard (`apps/web/app/ngo/dashboard/page.tsx`)
```typescript
import { usePepoEmotion } from '@/brand-assets/motion/PepoEmotionResolver';

export default function NGODashboard() {
  const { trigger } = usePepoEmotion({ ngoMode: true });

  return (
    <div className="ngo-dashboard">
      <header className="flex items-center space-x-4">
        <PepoBee emotion="trust" size={80} />
        <div>
          <h1>NGO Dashboard</h1>
          <p className="text-secondary-500">Community Impact</p>
        </div>
      </header>
    </div>
  );
}
```

## 📱 Step 6: Update App Icons

### Web (`apps/web/app/favicon.ico`)
Use `brand-assets/logos/pepo-bee-mascot.svg` converted to ICO

### Mobile (`apps/mobile/app.json`)
```json
{
  "expo": {
    "icon": "../../../brand-assets/exports/icon-1024.png",
    "splash": {
      "image": "../../../brand-assets/exports/splash-2048.png",
      "backgroundColor": "#F4B400"
    }
  }
}
```

## 🎨 Step 7: Update Design Tokens

### Web Tailwind (`apps/web/tailwind.config.js`)
Already configured! Using `@pepo/config` with brand tokens.

### Import Tokens Directly
```typescript
import tokens from '@/brand-assets/tokens/design-tokens.json';

const primaryColor = tokens.colors.primary[500];
const motionDuration = tokens.motion.duration.normal;
```

## ⚡ Step 8: Add Smart Emotion System

### Create Emotion Hook (`apps/web/hooks/usePepo.ts`)
```typescript
import { usePepoEmotion } from '@/brand-assets/motion/PepoEmotionResolver';

export function usePepo(options = {}) {
  const emotion = usePepoEmotion(options);
  
  return {
    ...emotion,
    celebrateWin: () => emotion.trigger('winner_selected'),
    showGiving: () => emotion.trigger('giveaway_created'),
    showLoading: () => emotion.trigger('loading'),
    showError: () => emotion.trigger('error'),
  };
}
```

### Use in Components
```typescript
function GiveawayCard({ giveaway }) {
  const { celebrateWin } = usePepo();

  const handleInterest = async () => {
    // Express interest
    await api.expressInterest(giveaway.id);
    celebrateWin(); // Show celebration
  };

  return (
    <div>
      <PepoBee emotion="idle" size={100} />
      <button onClick={handleInterest}>I'm Interested</button>
    </div>
  );
}
```

## 🔧 Step 9: Optimize Performance

### Lazy Load Animations
```typescript
const PepoBee = dynamic(() => import('@/components/PepoBee'), {
  loading: () => <div className="w-[200px] h-[200px] animate-pulse bg-primary-100" />,
  ssr: false,
});
```

### Preload Critical Animations
```typescript
// app/layout.tsx
useEffect(() => {
  // Preload celebrate animation for better UX
  import('@/brand-assets/animations/pepo-celebrate.json');
}, []);
```

## ✅ Integration Checklist

- [ ] Install lottie-react / lottie-react-native
- [ ] Create PepoBee component
- [ ] Add to landing page
- [ ] Add to winner screen
- [ ] Add to loading states
- [ ] Add to error states
- [ ] Update app icons
- [ ] Configure NGO mode
- [ ] Test reduced motion
- [ ] Optimize performance
- [ ] Test on mobile
- [ ] Update documentation

## 🎉 Quick Test

### Test All Emotions
```typescript
function TestPepo() {
  const [emotion, setEmotion] = useState('idle');

  return (
    <div>
      <PepoBee emotion={emotion} />
      <div className="flex gap-2 mt-4">
        <button onClick={() => setEmotion('idle')}>Idle</button>
        <button onClick={() => setEmotion('celebrate')}>Celebrate</button>
        <button onClick={() => setEmotion('give')}>Give</button>
        <button onClick={() => setEmotion('loading')}>Loading</button>
        <button onClick={() => setEmotion('alert')}>Alert</button>
      </div>
    </div>
  );
}
```

---

**🐝 Brand Assets are now integrated into PEPO!**

See `BRAND_SUMMARY.md` for complete documentation.



