/**
 * PEPO Rive State Machine Controller
 * For interactive Rive animations with state machines
 */

export interface RiveInputs {
  isIdle: boolean;
  isGiving: boolean;
  isCelebrating: boolean;
  isError: boolean;
  trustLevel: number; // 0-1
  ngoMode: boolean;
  intensity: number; // 0-1
}

export enum RiveState {
  IDLE = 'Idle',
  GIVING = 'Giving',
  CELEBRATING = 'Celebrating',
  CONCERNED = 'Concerned',
  ERROR = 'Error',
  TRUST_BUILDING = 'TrustBuilding',
}

export class PepoRiveController {
  private currentState: RiveState = RiveState.IDLE;
  private inputs: RiveInputs = {
    isIdle: true,
    isGiving: false,
    isCelebrating: false,
    isError: false,
    trustLevel: 1.0,
    ngoMode: false,
    intensity: 0.5,
  };

  /**
   * Set Rive state machine inputs
   */
  setInputs(inputs: Partial<RiveInputs>): void {
    // Reset all boolean inputs
    this.inputs.isIdle = false;
    this.inputs.isGiving = false;
    this.inputs.isCelebrating = false;
    this.inputs.isError = false;

    // Apply new inputs
    this.inputs = { ...this.inputs, ...inputs };

    // Determine current state
    this.updateState();
  }

  private updateState(): void {
    if (this.inputs.isError) {
      this.currentState = RiveState.ERROR;
    } else if (this.inputs.isCelebrating) {
      this.currentState = RiveState.CELEBRATING;
    } else if (this.inputs.isGiving) {
      this.currentState = RiveState.GIVING;
    } else if (this.inputs.trustLevel < 0.7) {
      this.currentState = RiveState.TRUST_BUILDING;
    } else if (this.inputs.isIdle) {
      this.currentState = RiveState.IDLE;
    }
  }

  /**
   * Get current state
   */
  getState(): RiveState {
    return this.currentState;
  }

  /**
   * Get current inputs
   */
  getInputs(): RiveInputs {
    return { ...this.inputs };
  }

  /**
   * Transition to state
   */
  transitionTo(state: RiveState): void {
    const stateMap: Record<RiveState, Partial<RiveInputs>> = {
      [RiveState.IDLE]: { isIdle: true },
      [RiveState.GIVING]: { isGiving: true },
      [RiveState.CELEBRATING]: { isCelebrating: true },
      [RiveState.CONCERNED]: { isIdle: true, intensity: 0.3 },
      [RiveState.ERROR]: { isError: true },
      [RiveState.TRUST_BUILDING]: { isIdle: true, trustLevel: 0.5 },
    };

    this.setInputs(stateMap[state]);
  }

  /**
   * Get Rive file path
   */
  getRiveFilePath(): string {
    return '/brand-assets/rive/pepo-interactive.riv';
  }

  /**
   * Get state machine name
   */
  getStateMachineName(): string {
    return 'PepoStateMachine';
  }
}

/**
 * React Hook for Rive Controller
 */
export function usePepoRive() {
  const controller = new PepoRiveController();

  const setState = (state: RiveState) => {
    controller.transitionTo(state);
  };

  const setInputs = (inputs: Partial<RiveInputs>) => {
    controller.setInputs(inputs);
  };

  return {
    controller,
    setState,
    setInputs,
    currentState: controller.getState(),
    riveFile: controller.getRiveFilePath(),
    stateMachine: controller.getStateMachineName(),
  };
}



