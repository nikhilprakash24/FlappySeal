/**
 * Animation State Machine
 *
 * Manages character animation states with smooth transitions.
 * Supports state-based animations, blending, and event triggers.
 */

import Phaser from 'phaser';

export enum AnimationState {
  IDLE = 'idle',
  SWIM_UP = 'swim_up',
  SWIM_DOWN = 'swim_down',
  GLIDE = 'glide',
  CELEBRATE = 'celebrate',
  HURT = 'hurt',
  DEATH = 'death',
}

export interface AnimationConfig {
  key: string;
  frames: string | number[];
  frameRate: number;
  repeat?: number;
  yoyo?: boolean;
}

export interface StateTransition {
  from: AnimationState;
  to: AnimationState;
  condition?: () => boolean;
  duration?: number;
}

export class AnimationStateMachine {
  private sprite: Phaser.GameObjects.Sprite;
  private currentState: AnimationState;
  private previousState?: AnimationState;
  private stateStartTime: number = 0;
  private transitions: Map<string, StateTransition> = new Map();
  private stateCallbacks: Map<AnimationState, () => void> = new Map();

  constructor(sprite: Phaser.GameObjects.Sprite, initialState: AnimationState = AnimationState.IDLE) {
    this.sprite = sprite;
    this.currentState = initialState;
  }

  /**
   * Create animation from config
   */
  static createAnimation(
    scene: Phaser.Scene,
    texture: string,
    config: AnimationConfig
  ): void {
    if (scene.anims.exists(config.key)) {
      return;
    }

    const frames = Array.isArray(config.frames)
      ? config.frames.map(frame => ({ key: texture, frame }))
      : scene.anims.generateFrameNames(texture, { start: 0, end: config.frames as number - 1 });

    scene.anims.create({
      key: config.key,
      frames,
      frameRate: config.frameRate,
      repeat: config.repeat ?? -1,
      yoyo: config.yoyo ?? false,
    });
  }

  /**
   * Register state transition rule
   */
  addTransition(from: AnimationState, to: AnimationState, condition?: () => boolean): void {
    const key = `${from}->${to}`;
    this.transitions.set(key, { from, to, condition });
  }

  /**
   * Register callback for state entry
   */
  onStateEnter(state: AnimationState, callback: () => void): void {
    this.stateCallbacks.set(state, callback);
  }

  /**
   * Change to new state
   */
  setState(newState: AnimationState, force: boolean = false): void {
    if (this.currentState === newState && !force) {
      return;
    }

    // Check if transition is valid
    const transitionKey = `${this.currentState}->${newState}`;
    const transition = this.transitions.get(transitionKey);

    if (transition && transition.condition && !transition.condition()) {
      return; // Transition condition not met
    }

    this.previousState = this.currentState;
    this.currentState = newState;
    this.stateStartTime = Date.now();

    // Play animation for new state
    const animKey = this.getAnimationKey(newState);
    if (this.sprite.anims && this.sprite.anims.exists(animKey)) {
      this.sprite.play(animKey);
    }

    // Trigger callback
    const callback = this.stateCallbacks.get(newState);
    if (callback) {
      callback();
    }
  }

  /**
   * Get current state
   */
  getState(): AnimationState {
    return this.currentState;
  }

  /**
   * Get time in current state (ms)
   */
  getStateTime(): number {
    return Date.now() - this.stateStartTime;
  }

  /**
   * Check if in specific state
   */
  isInState(state: AnimationState): boolean {
    return this.currentState === state;
  }

  /**
   * Update state machine (call every frame)
   */
  update(): void {
    // Auto-transitions based on conditions
    this.transitions.forEach((transition) => {
      if (
        transition.from === this.currentState &&
        transition.condition &&
        transition.condition()
      ) {
        this.setState(transition.to);
      }
    });
  }

  /**
   * Get animation key for state
   */
  private getAnimationKey(state: AnimationState): string {
    return `seal-${state}`;
  }

  /**
   * Create default seal animations
   * Using placeholder approach until real sprites arrive
   */
  static createDefaultSealAnimations(scene: Phaser.Scene, texture: string): void {
    // Idle animation
    this.createAnimation(scene, texture, {
      key: 'seal-idle',
      frames: [0, 1, 2, 1], // Breathing animation
      frameRate: 4,
      repeat: -1,
    });

    // Swim up animation
    this.createAnimation(scene, texture, {
      key: 'seal-swim_up',
      frames: [3, 4, 5],
      frameRate: 10,
      repeat: -1,
    });

    // Swim down animation
    this.createAnimation(scene, texture, {
      key: 'seal-swim_down',
      frames: [6, 7, 8],
      frameRate: 10,
      repeat: -1,
    });

    // Glide animation
    this.createAnimation(scene, texture, {
      key: 'seal-glide',
      frames: [9, 10],
      frameRate: 6,
      repeat: -1,
    });

    // Celebrate animation
    this.createAnimation(scene, texture, {
      key: 'seal-celebrate',
      frames: [11, 12, 13, 14, 15],
      frameRate: 8,
      repeat: 0,
    });

    // Hurt animation
    this.createAnimation(scene, texture, {
      key: 'seal-hurt',
      frames: [16, 17, 18],
      frameRate: 12,
      repeat: 0,
    });

    // Death animation
    this.createAnimation(scene, texture, {
      key: 'seal-death',
      frames: [19, 20, 21, 22, 23],
      frameRate: 8,
      repeat: 0,
    });
  }
}
