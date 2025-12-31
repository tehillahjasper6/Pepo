'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

// Import animations
import idleAnimation from '../../../brand-assets/animations/pepo-idle.json';
import celebrateAnimation from '../../../brand-assets/animations/pepo-celebrate.json';
import giveAnimation from '../../../brand-assets/animations/pepo-give.json';
import loadingAnimation from '../../../brand-assets/animations/pepo-loading.json';
import alertAnimation from '../../../brand-assets/animations/pepo-alert.json';

export type PepoEmotion = 'idle' | 'celebrate' | 'give' | 'loading' | 'alert';

interface PepoBeeProps {
  emotion?: PepoEmotion;
  size?: number;
  onComplete?: () => void;
}

export function PepoBee({ 
  emotion = 'idle', 
  size = 200,
  onComplete 
}: PepoBeeProps) {
  const [animationData, setAnimationData] = useState(idleAnimation);
  const [shouldLoop, setShouldLoop] = useState(true);

  useEffect(() => {
    const animationMap = {
      idle: idleAnimation,
      celebrate: celebrateAnimation,
      give: giveAnimation,
      loading: loadingAnimation,
      alert: alertAnimation,
    };

    const loopMap = {
      idle: true,
      celebrate: false,
      give: false,
      loading: true,
      alert: false,
    };

    setAnimationData(animationMap[emotion]);
    setShouldLoop(loopMap[emotion]);
  }, [emotion]);

  return (
    <div 
      className="pepo-bee-container"
      style={{ width: size, height: size }}
    >
      <Lottie
        animationData={animationData}
        loop={shouldLoop}
        onComplete={onComplete}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export function PepoLogo({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeMap = {
    small: 150,
    medium: 250,
    large: 350,
  };

  return (
    <img 
      src="/brand-assets/logos/pepo-wordmark.svg"
      alt="PEPO"
      style={{ width: sizeMap[size], height: 'auto' }}
    />
  );
}

export function PepoIcon({ size = 60 }: { size?: number }) {
  return (
    <img 
      src="/brand-assets/logos/pepo-bee-mascot.svg"
      alt="Pepo the Bee"
      style={{ width: size, height: size }}
    />
  );
}



