# 🐝 Quick Start - PEPO with Brand Assets

## ✅ Integration Complete!

Brand assets are now live in PEPO apps.

---

## 🚀 Start Everything

```bash
# Terminal 1 - Backend API
cd /Users/visionalventure/Pepo
npm run backend:dev

# Terminal 2 - Web App (with brand assets!)
npm run web:dev

# Terminal 3 - Admin Panel
npm run admin:dev
```

---

## 🎨 See Pepo in Action

### 1. **Test All Animations**
Visit: **http://localhost:3000/test-pepo**

- Test all 5 emotions (idle, celebrate, give, loading, alert)
- Preview pre-built components
- See brand colors
- Interactive controls

### 2. **Landing Page**
Visit: **http://localhost:3000**

- Animated bee in hero section
- Clean brand integration
- Honey Gold theme throughout

### 3. **Admin Dashboard**
Visit: **http://localhost:3001**

- Bee icon in header
- Professional admin UI

---

## 💻 Use in Your Code

### Simple Component
```typescript
import { PepoBee } from '@/components/PepoBee';

<PepoBee emotion="celebrate" size={200} />
```

### With Hook
```typescript
import { usePepo } from '@/hooks/usePepo';

const { celebrateWin, showLoading } = usePepo();
celebrateWin(); // Shows celebration animation
```

### Pre-built Components
```typescript
import { LoadingDraw, WinnerCelebration, ErrorState } from '@/components/LoadingDraw';

<LoadingDraw />
<WinnerCelebration winnerName="John" />
<ErrorState message="Error occurred" />
```

---

## 🎯 5 Pepo Emotions

| Emotion | When to Use | Duration |
|---------|------------|----------|
| `idle` | Default, waiting | 3s loop |
| `celebrate` | Winner selected, milestone | 2.5s |
| `give` | Giveaway posted | 2s |
| `loading` | Draw in progress | 2s loop |
| `alert` | Errors, warnings | 2s |

---

## 📍 Where to Add Next

### Winner Screen
```typescript
// In giveaways/[id]/winner/page.tsx
<WinnerCelebration winnerName={winner.name} />
```

### Draw Button
```typescript
const { showLoading, celebrateWin } = usePepo();

const closeDraw = async () => {
  showLoading();
  await api.closeDraw(id);
  celebrateWin();
};
```

### Giveaway Created
```typescript
const { showGiving } = usePepo();

const createGiveaway = async (data) => {
  await api.create(data);
  showGiving();
};
```

---

## 🎨 Brand Colors (Already in Tailwind)

```typescript
// Honey Gold (Primary)
className="bg-primary-500 hover:bg-primary-600"

// Leaf Green (NGO/Trust)
className="bg-secondary-500 text-white"

// Backgrounds
className="bg-background-default" // Pollen Cream
```

---

## 📂 What Was Created

### Components
- ✅ `apps/web/components/PepoBee.tsx` - Main component
- ✅ `apps/web/components/LoadingDraw.tsx` - Helpers
- ✅ `apps/admin/components/PepoBee.tsx` - Admin version

### Hooks
- ✅ `apps/web/hooks/usePepo.ts` - Emotion management

### Pages
- ✅ `apps/web/app/test-pepo/page.tsx` - Test page
- ✅ `apps/web/app/page.tsx` - Updated with bee

### Assets
- ✅ `/brand-assets/` - Complete asset library
- ✅ Symlinked to `/public/brand-assets/`

---

## 📚 Full Documentation

- **README**: `/brand-assets/README.md`
- **Integration Guide**: `/brand-assets/INTEGRATE_INTO_PEPO.md`
- **Summary**: `/brand-assets/BRAND_SUMMARY.md`
- **Complete Guide**: `/BRAND_INTEGRATION_COMPLETE.md`

---

## ✅ Checklist

**Done:**
- [x] Brand assets created (logos, animations)
- [x] Motion intelligence system
- [x] Web components created
- [x] Admin components created
- [x] Landing page updated
- [x] Test page created
- [x] Hooks created
- [x] Assets symlinked

**Next:**
- [ ] Add to draw system
- [ ] Add to winner screen
- [ ] Add to error states
- [ ] Mobile app integration

---

## 🎉 You're Ready!

**Pepo is now part of your PEPO platform!**

Visit http://localhost:3000/test-pepo to see all animations.

---

*Give Freely. Live Lightly.* 🐝💛



