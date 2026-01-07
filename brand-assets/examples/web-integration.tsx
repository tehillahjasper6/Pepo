/**
 * PEPO Brand Assets - Web Integration Example
 * Complete example for Next.js/React applications
 */

import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import { usePepoEmotion, PepoEmotion } from '../motion/PepoEmotionResolver';

// Import animations
import idleAnimation from '../animations/pepo-idle.json';
import celebrateAnimation from '../animations/pepo-celebrate.json';
import giveAnimation from '../animations/pepo-give.json';
import loadingAnimation from '../animations/pepo-loading.json';
import alertAnimation from '../animations/pepo-alert.json';

interface PepoBeeProps {
  emotion?: PepoEmotion;
  size?: number;
  ngoMode?: boolean;
  onComplete?: () => void;
}

export function PepoBee({ 
  emotion = PepoEmotion.IDLE, 
  size = 200,
  ngoMode = false,
  onComplete 
}: PepoBeeProps) {
  const [currentAnimation, setCurrentAnimation] = useState(idleAnimation);
  const [loop, setLoop] = useState(true);
  
  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const animationMap: Record<PepoEmotion, unknown> = {
      [PepoEmotion.IDLE]: idleAnimation,
      [PepoEmotion.CELEBRATING]: celebrateAnimation,
      [PepoEmotion.GIVING]: giveAnimation,
      [PepoEmotion.LOADING]: loadingAnimation,
      [PepoEmotion.CONCERNED]: alertAnimation,
      [PepoEmotion.ERROR]: alertAnimation,
      [PepoEmotion.TRUST]: idleAnimation,
    };

    const loopMap: Record<PepoEmotion, boolean> = {
      [PepoEmotion.IDLE]: true,
      [PepoEmotion.CELEBRATING]: false,
      [PepoEmotion.GIVING]: false,
      [PepoEmotion.LOADING]: true,
      [PepoEmotion.CONCERNED]: false,
      [PepoEmotion.ERROR]: false,
      [PepoEmotion.TRUST]: false,
    };

    setCurrentAnimation(animationMap[emotion] as typeof idleAnimation);
    setLoop(loopMap[emotion]);
  }, [emotion]);

  // Fallback to static SVG if reduced motion
  if (prefersReducedMotion) {
    return (
      <img 
        src="/brand-assets/logos/pepo-bee-mascot.svg" 
        alt="Pepo the Bee"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div 
      className={`pepo-bee-container ${ngoMode ? 'ngo-mode' : ''}`}
      style={{ width: size, height: size }}
    >
      <Lottie
        animationData={currentAnimation}
        loop={loop}
        onComplete={onComplete}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

/**
 * Smart Pepo Component - Auto-resolves emotions
 */
export function SmartPepoBee({ action, data, ngoMode = false }: any) {
  const { trigger, getAnimation } = usePepoEmotion({ ngoMode });
  const [emotionState, setEmotionState] = useState<any>(null);

  useEffect(() => {
    if (action) {
      const state = trigger(action, data);
      setEmotionState(state);
    }
  }, [action, data]);

  if (!emotionState) {
    return <PepoBee emotion={PepoEmotion.IDLE} ngoMode={ngoMode} />;
  }

  return (
    <PepoBee 
      emotion={emotionState.emotion} 
      ngoMode={ngoMode}
    />
  );
}

/**
 * Pepo Logo Component
 */
interface PepoLogoProps {
  variant?: 'mascot' | 'wordmark' | 'hive';
  size?: 'small' | 'medium' | 'large';
}

export function PepoLogo({ variant = 'wordmark', size = 'medium' }: PepoLogoProps) {
  const sizeMap = {
    small: 150,
    medium: 250,
    large: 350,
  };

  const variantMap = {
    mascot: '/brand-assets/logos/pepo-bee-mascot.svg',
    wordmark: '/brand-assets/logos/pepo-wordmark.svg',
    hive: '/brand-assets/logos/pepo-hive-icon.svg',
  };

  return (
    <img 
      src={variantMap[variant]} 
      alt={`PEPO ${variant}`}
      style={{ width: sizeMap[size], height: 'auto' }}
    />
  );
}

/**
 * Context-Aware Pepo
 */
export function ContextualPepo() {
  const [emotion, setEmotion] = useState<PepoEmotion>(PepoEmotion.IDLE);

  // Example: Winner announcement
  const handleWinnerSelected = () => {
    setEmotion(PepoEmotion.CELEBRATING);
    setTimeout(() => setEmotion(PepoEmotion.IDLE), 3000);
  };

  // Example: Give action
  const handleGiveaway = () => {
    setEmotion(PepoEmotion.GIVING);
    setTimeout(() => setEmotion(PepoEmotion.IDLE), 2500);
  };

  // Example: Loading
  const handleLoading = () => {
    setEmotion(PepoEmotion.LOADING);
  };

  return (
    <div className="contextual-pepo">
      <PepoBee emotion={emotion} />
      
      <div className="controls">
        <button onClick={handleWinnerSelected}>Winner!</button>
        <button onClick={handleGiveaway}>Give</button>
        <button onClick={handleLoading}>Load</button>
      </div>
    </div>
  );
}

/**
 * Reduced Motion Hook
 */
function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
}

/**
 * Pepo Celebration Screen
 */
export function WinnerCelebration({ winnerName }: { winnerName: string }) {
  return (
    <div className="winner-celebration">
      <PepoBee 
        emotion={PepoEmotion.CELEBRATING}
        size={300}
        onComplete={() => console.log('Celebration complete!')}
      />
      <h1 className="text-4xl font-bold mt-8">
        Congratulations {winnerName}! 🎉
      </h1>
      <p className="text-xl text-gray-600 mt-4">
        You've been selected!
      </p>
    </div>
  );
}

/**
 * NGO Mode Example
 */
export function NGODashboard() {
  return (
    <div className="ngo-dashboard">
      <header className="flex items-center space-x-4 mb-8">
        <PepoBee 
          emotion={PepoEmotion.TRUST}
          size={80}
          ngoMode={true}
        />
        <div>
          <h1 className="text-3xl font-bold">NGO Dashboard</h1>
          <p className="text-secondary-500">Community Impact</p>
        </div>
      </header>
      
      {/* Dashboard content */}
    </div>
  );
}

export default PepoBee;



