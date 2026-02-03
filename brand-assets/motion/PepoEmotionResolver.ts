/**
 * PEPO Emotion Resolver
 * Intelligent motion system that adapts Pepo's behavior based on context
 */

export enum PepoEmotion {
  IDLE = 'idle',
  GIVING = 'giving',
  CELEBRATING = 'celebrating',
  CONCERNED = 'concerned',
  ERROR = 'error',
  LOADING = 'loading',
  TRUST = 'trust',
}

export enum PepoContext {
  USER_MODE = 'user',
  NGO_MODE = 'ngo',
  ADMIN_MODE = 'admin',
  DRAW_ACTIVE = 'draw_active',
  WINNER_SELECTED = 'winner_selected',
  FIRST_TIME = 'first_time',
}

export interface EmotionState {
  emotion: PepoEmotion;
  intensity: number; // 0-1
  duration: number; // milliseconds
  loop: boolean;
  easing: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
}

export interface MotionConfig {
  reducedMotion: boolean;
  ngoMode: boolean;
  trustLevel: number; // 0-1
  context: PepoContext;
}

export class PepoEmotionResolver {
  private currentEmotion: PepoEmotion = PepoEmotion.IDLE;
  private config: MotionConfig;
  private emotionQueue: EmotionState[] = [];

  constructor(config: Partial<MotionConfig> = {}) {
    this.config = {
      reducedMotion: false,
      ngoMode: false,
      trustLevel: 1.0,
      context: PepoContext.USER_MODE,
      ...config,
    };
  }

  /**
   * Resolve appropriate emotion based on action and context
   */
  resolveEmotion(action: string, data?: any): EmotionState {
    const emotion = this.determineEmotion(action, data);
    const state = this.createEmotionState(emotion);
    
    // Apply NGO mode moderation
    if (this.config.ngoMode) {
      state.intensity *= 0.7; // Calmer animations
      state.duration *= 1.3; // Slower pace
    }

    // Apply reduced motion
    if (this.config.reducedMotion) {
      state.intensity *= 0.3;
      state.duration *= 0.5;
      state.loop = false;
    }

    this.currentEmotion = emotion;
    return state;
  }

  private determineEmotion(action: string, data?: any): PepoEmotion {
    // Context-aware emotion mapping
    const emotionMap: Record<string, PepoEmotion> = {
      // Giveaway actions
      'giveaway_created': PepoEmotion.GIVING,
      'interest_expressed': PepoEmotion.TRUST,
      'draw_closed': PepoEmotion.LOADING,
      'winner_selected': PepoEmotion.CELEBRATING,
      'draw_failed': PepoEmotion.CONCERNED,
      
      // User actions
      'profile_completed': PepoEmotion.CELEBRATING,
      'first_login': PepoEmotion.TRUST,
      'message_sent': PepoEmotion.GIVING,
      
      // NGO actions
      'ngo_verified': PepoEmotion.CELEBRATING,
      'campaign_created': PepoEmotion.GIVING,
      'impact_milestone': PepoEmotion.CELEBRATING,
      
      // System states
      'loading': PepoEmotion.LOADING,
      'error': PepoEmotion.ERROR,
      'idle': PepoEmotion.IDLE,
      
      // Trust signals
      'transaction_verified': PepoEmotion.TRUST,
      'community_milestone': PepoEmotion.CELEBRATING,
    };

    return emotionMap[action] || PepoEmotion.IDLE;
  }

  private createEmotionState(emotion: PepoEmotion): EmotionState {
    const baseStates: Record<PepoEmotion, EmotionState> = {
      [PepoEmotion.IDLE]: {
        emotion,
        intensity: 0.3,
        duration: 3000,
        loop: true,
        easing: 'ease-in-out',
      },
      [PepoEmotion.GIVING]: {
        emotion,
        intensity: 0.8,
        duration: 2000,
        loop: false,
        easing: 'ease-out',
      },
      [PepoEmotion.CELEBRATING]: {
        emotion,
        intensity: 1.0,
        duration: 2500,
        loop: false,
        easing: 'ease-in-out',
      },
      [PepoEmotion.CONCERNED]: {
        emotion,
        intensity: 0.6,
        duration: 1500,
        loop: false,
        easing: 'ease-in',
      },
      [PepoEmotion.ERROR]: {
        emotion,
        intensity: 0.7,
        duration: 2000,
        loop: false,
        easing: 'ease-in-out',
      },
      [PepoEmotion.LOADING]: {
        emotion,
        intensity: 0.5,
        duration: Infinity,
        loop: true,
        easing: 'linear',
      },
      [PepoEmotion.TRUST]: {
        emotion,
        intensity: 0.6,
        duration: 1800,
        loop: false,
        easing: 'ease-out',
      },
    };

    return { ...baseStates[emotion] };
  }

  /**
   * Get animation file path for current emotion
   */
  getAnimationPath(emotion?: PepoEmotion): string {
    const targetEmotion = emotion || this.currentEmotion;
    const format = this.config.reducedMotion ? 'static' : 'lottie';
    
    return `/brand-assets/animations/pepo-${targetEmotion}.${format === 'lottie' ? 'json' : 'svg'}`;
  }

  /**
   * Calculate trust-based motion intensity
   * Lower trust = calmer, more reassuring animations
   */
  getTrustMotionScale(): number {
    return 0.5 + (this.config.trustLevel * 0.5);
  }

  /**
   * NGO Mode: Calmer, more professional motion
   */
  getNGOMotionConfig(): Partial<EmotionState> {
    return {
      intensity: 0.6,
      duration: 2000,
      easing: 'ease-in-out',
    };
  }

  /**
   * Queue emotion for sequential playback
   */
  queueEmotion(action: string, data?: any): void {
    const state = this.resolveEmotion(action, data);
    this.emotionQueue.push(state);
  }

  /**
   * Get next queued emotion
   */
  getNextEmotion(): EmotionState | null {
    return this.emotionQueue.shift() || null;
  }

  /**
   * Clear emotion queue
   */
  clearQueue(): void {
    this.emotionQueue = [];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MotionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current emotion
   */
  getCurrentEmotion(): PepoEmotion {
    return this.currentEmotion;
  }
}

/**
 * React Hook for Pepo Emotions
 */
export function usePepoEmotion(config?: Partial<MotionConfig>) {
  const resolver = new PepoEmotionResolver(config);

  const trigger = (action: string, data?: any) => {
    return resolver.resolveEmotion(action, data);
  };

  const getAnimation = (emotion?: PepoEmotion) => {
    return resolver.getAnimationPath(emotion);
  };

  return {
    trigger,
    getAnimation,
    currentEmotion: resolver.getCurrentEmotion(),
    resolver,
  };
}




