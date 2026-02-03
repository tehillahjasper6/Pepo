# PEPO Brand Asset System 🐝

Complete brand identity and motion intelligence system for PEPO.

## 📦 Package Contents

```
brand-assets/
├── logos/                  # SVG logos
│   ├── pepo-bee-mascot.svg
│   ├── pepo-wordmark.svg
│   └── pepo-hive-icon.svg
├── animations/             # Lottie animations
│   ├── pepo-idle.json
│   ├── pepo-celebrate.json
│   ├── pepo-give.json
│   ├── pepo-loading.json
│   └── pepo-alert.json
├── rive/                   # Interactive Rive files
│   └── pepo-interactive.riv
├── motion/                 # Motion intelligence
│   ├── PepoEmotionResolver.ts
│   └── RiveStateMachine.ts
├── tokens/                 # Design tokens
│   └── design-tokens.json
└── exports/                # PNG exports
    ├── icon-1024.png
    ├── icon-512.png
    └── icon-256.png
```

## 🎨 Logos

### Primary Bee Mascot
- **File**: `logos/pepo-bee-mascot.svg`
- **Usage**: App icons, splash screens, celebrations
- **Size**: 200x200 (scalable)
- **Colors**: Honey Gold (#F4B400), Bee Black (#1E1E1E)

### Wordmark
- **File**: `logos/pepo-wordmark.svg`
- **Usage**: Headers, marketing, branding
- **Size**: 400x120 (scalable)
- **Includes**: Bee icon + "PEPO" text + tagline

### Hive Icon
- **File**: `logos/pepo-hive-icon.svg`
- **Usage**: Community features, groups, NGO mode
- **Size**: 200x200 (scalable)
- **Pattern**: Honeycomb hexagons

## 🎬 Animations

### Lottie Animations

All animations are in JSON format, compatible with:
- Web: [lottie-web](https://github.com/airbnb/lottie-web)
- React: [lottie-react](https://www.npmjs.com/package/lottie-react)
- React Native: [lottie-react-native](https://github.com/lottie-react-native/lottie-react-native)

#### 1. Idle Animation
- **File**: `animations/pepo-idle.json`
- **Duration**: 3 seconds (loops)
- **Usage**: Default state, waiting
- **Motion**: Gentle floating, wing flutter

#### 2. Celebrate Animation
- **File**: `animations/pepo-celebrate.json`
- **Duration**: 2.5 seconds
- **Usage**: Winner selected, milestone reached
- **Motion**: Jumping, confetti, joy

#### 3. Give Animation
- **File**: `animations/pepo-give.json`
- **Duration**: 2 seconds
- **Usage**: Giveaway posted, item shared
- **Motion**: Extending gift, heart trail

#### 4. Loading Animation
- **File**: `animations/pepo-loading.json`
- **Duration**: 2 seconds (loops)
- **Usage**: Draw in progress, API calls
- **Motion**: Rotating, orbit dots

#### 5. Alert Animation
- **File**: `animations/pepo-alert.json`
- **Duration**: 2 seconds
- **Usage**: Errors, warnings, attention needed
- **Motion**: Concerned expression, pulse

## 🎮 Interactive Rive

### Pepo Interactive State Machine
- **File**: `rive/pepo-interactive.riv`
- **State Machine**: `PepoStateMachine`

#### Inputs
```typescript
{
  isIdle: boolean,
  isGiving: boolean,
  isCelebrating: boolean,
  isError: boolean,
  trustLevel: number (0-1),
  ngoMode: boolean,
  intensity: number (0-1)
}
```

#### States
- **Idle**: Default resting state
- **Giving**: Sharing/gifting action
- **Celebrating**: Success, winner
- **Concerned**: Low trust, issue
- **Error**: System error
- **TrustBuilding**: Building community trust

## 🧠 Motion Intelligence

### PepoEmotionResolver

Intelligent system that adapts Pepo's behavior based on context.

```typescript
import { PepoEmotionResolver, PepoEmotion, PepoContext } from './motion/PepoEmotionResolver';

const resolver = new PepoEmotionResolver({
  ngoMode: false,
  reducedMotion: false,
  trustLevel: 1.0,
  context: PepoContext.USER_MODE,
});

// Trigger emotion
const state = resolver.resolveEmotion('winner_selected');
// Returns: { emotion: 'celebrating', intensity: 1.0, duration: 2500, ... }

// Get animation path
const animPath = resolver.getAnimationPath();
// Returns: '/brand-assets/animations/pepo-celebrating.json'
```

### React Hook Usage

```typescript
import { usePepoEmotion } from './motion/PepoEmotionResolver';

function MyComponent() {
  const { trigger, getAnimation, currentEmotion } = usePepoEmotion({
    ngoMode: false,
  });

  const handleWin = () => {
    const state = trigger('winner_selected');
    // Play animation with returned state
  };

  return (
    <LottieAnimation
      src={getAnimation()}
      loop={state.loop}
      duration={state.duration}
    />
  );
}
```

## 🏢 NGO Mode

Specialized motion for NGO and charity organizations:

### Characteristics
- **Calmer**: 70% intensity
- **Slower**: 130% duration
- **Professional**: Refined easing
- **Trust Colors**: Leaf Green (#6BBF8E)

### Usage
```typescript
const resolver = new PepoEmotionResolver({
  ngoMode: true,
  trustLevel: 0.9,
});

// All animations automatically adapt
```

## 🎯 Design Tokens

Complete design system in `tokens/design-tokens.json`:

- **Colors**: Full palette with semantic colors
- **Typography**: Fonts, sizes, weights
- **Spacing**: 8-point grid system
- **Motion**: Durations, easing curves
- **Accessibility**: Contrast ratios, reduced motion

### Import Tokens

```typescript
import tokens from './tokens/design-tokens.json';

const primaryColor = tokens.colors.primary[500]; // #F4B400
const motionDuration = tokens.motion.duration.normal; // 300ms
```

## 📱 PNG Exports

Pre-rendered PNG icons for app stores and platforms:

- **1024x1024**: App Store, Play Store
- **512x512**: Web favicons, PWA
- **256x256**: Desktop icons

## 🌍 Africa-Ready Design

### Considerations
- **Low Bandwidth**: Optimized file sizes
- **Offline Support**: Static fallbacks
- **Accessibility**: High contrast, readable
- **Cultural Sensitivity**: Universal emotions
- **Mobile-First**: Touch-friendly

## ♿ Accessibility

### Reduced Motion
Automatically detected via `prefers-reduced-motion`:

```typescript
const resolver = new PepoEmotionResolver({
  reducedMotion: true, // 30% intensity, no loops
});
```

### High Contrast
All assets maintain WCAG AAA contrast ratios:
- Text: 7:1
- Large Text: 4.5:1
- Graphical: 3:1

## 📦 Installation

### Web/React
```bash
npm install lottie-react @rive-app/react-canvas
```

### React Native
```bash
npm install lottie-react-native
npx pod-install # iOS only
```

### Usage Example

```typescript
import Lottie from 'lottie-react';
import idleAnimation from './brand-assets/animations/pepo-idle.json';

function PepoBee() {
  return (
    <Lottie
      animationData={idleAnimation}
      loop={true}
      style={{ width: 200, height: 200 }}
    />
  );
}
```

## 🎨 Brand Guidelines

### Do's
✅ Use warm honey tones
✅ Keep corners rounded
✅ Apply soft shadows
✅ Show friendly expressions
✅ Maintain accessibility
✅ Respect motion preferences

### Don'ts
❌ Harsh colors or sharp edges
❌ Aggressive animations
❌ Complex or busy designs
❌ Ignore reduced motion
❌ Overlay critical content
❌ Use without context

## 🔧 Customization

### Custom Emotion
```typescript
resolver.queueEmotion('custom_action', {
  intensity: 0.8,
  duration: 2000,
});
```

### Trust Level
```typescript
resolver.updateConfig({
  trustLevel: 0.5, // Lower trust = calmer motion
});
```

## 📊 Performance

- **SVG**: < 5KB each
- **Lottie**: 5-15KB each
- **Rive**: ~50KB (all states)
- **Total Package**: ~200KB

## 📄 License

Proprietary - PEPO Brand Assets
© 2024 PEPO. All rights reserved.

## 🤝 Support

For brand asset questions:
- Email: brand@pepo.app
- Designer: design@pepo.app

---

**Built with love and honey** 🐝💛

*Give Freely. Live Lightly.*




