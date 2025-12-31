'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

// Import animations
import idleAnimation from '../../../brand-assets/animations/pepo-idle.json';
import loadingAnimation from '../../../brand-assets/animations/pepo-loading.json';

export type PepoEmotion = 'idle' | 'loading';

interface PepoBeeProps {
  emotion?: PepoEmotion;
  size?: number;
}

export function PepoBee({ 
  emotion = 'idle', 
  size = 200
}: PepoBeeProps) {
  const [animationData, setAnimationData] = useState(idleAnimation);
  const [shouldLoop, setShouldLoop] = useState(true);

  useEffect(() => {
    const animationMap = {
      idle: idleAnimation,
      loading: loadingAnimation,
    };

    const loopMap = {
      idle: true,
      loading: true,
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
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export function PepoIcon({ size = 40 }: { size?: number }) {
  return (
    <span className="text-3xl" style={{ fontSize: size }}>🐝</span>
  );
}



