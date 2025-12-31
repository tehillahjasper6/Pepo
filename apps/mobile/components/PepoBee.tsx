import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import { useEffect, useRef } from 'react';

export type PepoEmotion = 'idle' | 'celebrate' | 'give' | 'loading' | 'alert';

interface PepoBeeProps {
  emotion?: PepoEmotion;
  size?: number;
  onComplete?: () => void;
}

// Import animations - using require for React Native
const idleAnimation = require('../../../brand-assets/animations/pepo-idle.json');
const celebrateAnimation = require('../../../brand-assets/animations/pepo-celebrate.json');
const giveAnimation = require('../../../brand-assets/animations/pepo-give.json');
const loadingAnimation = require('../../../brand-assets/animations/pepo-loading.json');
const alertAnimation = require('../../../brand-assets/animations/pepo-alert.json');

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

export function PepoBee({
  emotion = 'idle',
  size = 200,
  onComplete,
}: PepoBeeProps) {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    // Reset animation when emotion changes
    if (animationRef.current) {
      animationRef.current.play();
    }
  }, [emotion]);

  const animationData = animationMap[emotion] || animationMap.idle;
  const shouldLoop = loopMap[emotion] ?? true;

  return (
    <View style={{ width: size, height: size }}>
      <LottieView
        ref={animationRef}
        source={animationData}
        autoPlay
        loop={shouldLoop}
        onAnimationFinish={onComplete}
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}



