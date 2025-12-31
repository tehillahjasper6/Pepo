# PEPO Brand Assets - Implementation Guide

Quick integration guide for developers.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Web/React
npm install lottie-react @rive-app/react-canvas

# React Native
npm install lottie-react-native
cd ios && pod install
```

### 2. Copy Brand Assets

```bash
cp -r brand-assets/ public/brand-assets/  # Web
cp -r brand-assets/ assets/brand-assets/  # React Native
```

### 3. Basic Usage

```typescript
import Lottie from 'lottie-react';
import { usePepoEmotion } from './brand-assets/motion/PepoEmotionResolver';
import idleAnimation from './brand-assets/animations/pepo-idle.json';

function PepoMascot() {
  const { trigger, getAnimation } = usePepoEmotion();

  return (
    <Lottie
      animationData={idleAnimation}
      loop={true}
      style={{ width: 150, height: 150 }}
    />
  );
}
```

## 📱 Platform-Specific Implementation

### Web (Next.js/React)

```typescript
// components/PepoBee.tsx
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export function PepoBee({ emotion = 'idle' }) {
  const animationData = require(`@/brand-assets/animations/pepo-${emotion}.json`);
  
  return (
    <Lottie
      animationData={animationData}
      loop={emotion === 'idle' || emotion === 'loading'}
      style={{ width: 200, height: 200 }}
    />
  );
}
```

### React Native (Expo)

```typescript
// components/PepoBee.tsx
import LottieView from 'lottie-react-native';

export function PepoBee({ emotion = 'idle' }) {
  return (
    <LottieView
      source={require('../brand-assets/animations/pepo-idle.json')}
      autoPlay
      loop
      style={{ width: 200, height: 200 }}
    />
  );
}
```

### Rive Interactive

```typescript
// components/PepoInteractive.tsx
import { useRive } from '@rive-app/react-canvas';

export function PepoInteractive() {
  const { RiveComponent, rive } = useRive({
    src: '/brand-assets/rive/pepo-interactive.riv',
    stateMachines: 'PepoStateMachine',
    autoplay: true,
  });

  const celebrate = () => {
    rive?.setInputState('PepoStateMachine', 'isCelebrating', true);
  };

  return (
    <div onClick={celebrate}>
      <RiveComponent style={{ width: 300, height: 300 }} />
    </div>
  );
}
```

## 🎯 Common Use Cases

### Winner Announcement

```typescript
function WinnerScreen() {
  const { trigger } = usePepoEmotion();

  useEffect(() => {
    trigger('winner_selected');
  }, []);

  return (
    <div>
      <PepoBee emotion="celebrate" />
      <h1>You Won! 🎉</h1>
    </div>
  );
}
```

### Loading State

```typescript
function LoadingDrawResult() {
  return (
    <div className="flex flex-col items-center">
      <PepoBee emotion="loading" />
      <p>Selecting winner...</p>
    </div>
  );
}
```

### Error Handling

```typescript
function ErrorState({ error }) {
  return (
    <div>
      <PepoBee emotion="alert" />
      <p>{error.message}</p>
    </div>
  );
}
```

### NGO Mode

```typescript
function NGODashboard() {
  const { trigger } = usePepoEmotion({ ngoMode: true });

  return (
    <div className="ngo-mode">
      <PepoBee emotion="trust" />
      <h1>Impact Dashboard</h1>
    </div>
  );
}
```

## 🎨 Styling

### CSS Integration

```css
.pepo-container {
  --pepo-primary: #F4B400;
  --pepo-secondary: #6BBF8E;
  --pepo-bg: #FFF9EE;
}

.pepo-bee {
  filter: drop-shadow(0 4px 8px rgba(244, 180, 0, 0.2));
  transition: transform 0.3s ease;
}

.pepo-bee:hover {
  transform: scale(1.05);
}
```

### Tailwind CSS

```typescript
// Already configured in apps/web/tailwind.config.js
<div className="bg-primary-500 rounded-lg shadow-card">
  <PepoBee />
</div>
```

## ⚡ Performance Tips

### 1. Lazy Load Animations

```typescript
const PepoBee = dynamic(() => import('./PepoBee'), {
  loading: () => <div>Loading...</div>,
  ssr: false,
});
```

### 2. Preload Critical Animations

```typescript
useEffect(() => {
  // Preload celebrate animation
  import('../brand-assets/animations/pepo-celebrate.json');
}, []);
```

### 3. Optimize Bundle Size

```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.json$/,
      type: 'asset/resource',
    });
    return config;
  },
};
```

## ♿ Accessibility

### Reduced Motion

```typescript
function PepoBee({ emotion }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <img src={`/brand-assets/logos/pepo-bee-mascot.svg`} alt="Pepo" />;
  }

  return <Lottie animationData={animation} />;
}

function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  return prefersReducedMotion;
}
```

### Screen Reader Support

```typescript
<div role="img" aria-label="Pepo celebrating your win">
  <PepoBee emotion="celebrate" />
</div>
```

## 🔧 Troubleshooting

### Animations Not Playing

```typescript
// Ensure autoplay is enabled
<Lottie animationData={data} autoplay />

// Check if reduced motion is blocking
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
```

### Large Bundle Size

```bash
# Analyze bundle
npm run build -- --analyze

# Use dynamic imports
const animation = () => import('./animation.json');
```

### Rive Not Loading

```bash
# Install peer dependencies
npm install @rive-app/canvas
```

## 📚 Examples

See `/examples` folder for complete implementations:
- `examples/web-integration.tsx`
- `examples/mobile-integration.tsx`
- `examples/rive-interactive.tsx`

## 🤝 Contributing

When adding new animations:
1. Export from After Effects as Lottie JSON
2. Optimize with [lottie-optimizer](https://github.com/airbnb/lottie-web)
3. Add to emotion resolver
4. Document use case

---

**Need help?** Contact: dev@pepo.app



