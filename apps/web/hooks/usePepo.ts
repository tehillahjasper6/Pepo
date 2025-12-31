import { useState, useCallback } from 'react';
import type { PepoEmotion } from '@/components/PepoBee';

export function usePepo() {
  const [currentEmotion, setCurrentEmotion] = useState<PepoEmotion>('idle');

  const celebrateWin = useCallback(() => {
    setCurrentEmotion('celebrate');
    setTimeout(() => setCurrentEmotion('idle'), 3000);
  }, []);

  const showGiving = useCallback(() => {
    setCurrentEmotion('give');
    setTimeout(() => setCurrentEmotion('idle'), 2500);
  }, []);

  const showLoading = useCallback(() => {
    setCurrentEmotion('loading');
  }, []);

  const showAlert = useCallback(() => {
    setCurrentEmotion('alert');
    setTimeout(() => setCurrentEmotion('idle'), 2500);
  }, []);

  const resetToIdle = useCallback(() => {
    setCurrentEmotion('idle');
  }, []);

  return {
    currentEmotion,
    celebrateWin,
    showGiving,
    showLoading,
    showAlert,
    resetToIdle,
  };
}



