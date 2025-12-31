# Rive Interactive Animation

## File: `pepo-interactive.riv`

This directory is for the interactive Rive animation file that provides advanced state machine control for Pepo.

## State Machine: `PepoStateMachine`

### Inputs
- `isIdle` (boolean) - Default resting state
- `isGiving` (boolean) - Sharing/gifting action
- `isCelebrating` (boolean) - Success, winner selected
- `isError` (boolean) - System error state
- `trustLevel` (number 0-1) - Community trust level
- `ngoMode` (boolean) - NGO/charity mode (calmer motion)
- `intensity` (number 0-1) - Animation intensity multiplier

### States
1. **Idle** - Default resting state
2. **Giving** - Sharing/gifting action
3. **Celebrating** - Success, winner selected
4. **Concerned** - Low trust, issue detected
5. **Error** - System error state
6. **TrustBuilding** - Building community trust

## Creating the Rive File

To create `pepo-interactive.riv`:

1. Open [Rive Editor](https://rive.app)
2. Create a new file
3. Import or recreate the Pepo bee character from `logos/pepo-bee-mascot.svg`
4. Create the state machine with the inputs and states listed above
5. Design transitions between states
6. Export as `pepo-interactive.riv`

## Usage

See `motion/RiveStateMachine.ts` for the TypeScript controller.

```typescript
import { RiveStateMachine } from '../motion/RiveStateMachine';

const rive = new RiveStateMachine({
  src: '/brand-assets/rive/pepo-interactive.riv',
  stateMachine: 'PepoStateMachine',
});

rive.setInput('isCelebrating', true);
rive.setInput('trustLevel', 0.9);
```

## Status

⚠️ **Pending**: Rive file needs to be created in Rive Editor.

For now, use Lottie animations from `animations/` directory.



