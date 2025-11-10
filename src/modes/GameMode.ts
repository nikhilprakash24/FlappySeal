/**
 * Game Mode Base Class (v0.2)
 *
 * Abstract base class for different game modes.
 */

import Phaser from 'phaser';

export enum GameModeType {
  ENDLESS = 'endless',
  CHALLENGE = 'challenge',
  TIME_TRIAL = 'time_trial',
  ZEN = 'zen',
}

export interface GameModeConfig {
  type: GameModeType;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface GameModeRules {
  hasObstacles: boolean;
  hasTimeLimit: boolean;
  hasPowerUps: boolean;
  hasWaterPhysics: boolean;
  customDifficulty?: number;
}

export abstract class GameMode {
  protected scene: Phaser.Scene;
  protected config: GameModeConfig;
  protected rules: GameModeRules;

  // Tracking
  protected startTime: number = 0;
  protected score: number = 0;
  protected timeRemaining?: number;

  constructor(scene: Phaser.Scene, config: GameModeConfig, rules: GameModeRules) {
    this.scene = scene;
    this.config = config;
    this.rules = rules;
  }

  /**
   * Initialize the game mode
   */
  abstract init(): void;

  /**
   * Update game mode logic
   */
  abstract update(time: number, delta: number): void;

  /**
   * Check if mode objectives are complete
   */
  abstract isComplete(): boolean;

  /**
   * Check if mode has failed
   */
  abstract isFailed(): boolean;

  /**
   * Get mode-specific UI elements
   */
  abstract getUI(): Phaser.GameObjects.GameObject[];

  /**
   * Get final score/results
   */
  abstract getResults(): GameModeResults;

  /**
   * Clean up
   */
  destroy(): void {
    // Override in subclasses if needed
  }

  // Getters
  getConfig(): GameModeConfig {
    return this.config;
  }

  getRules(): GameModeRules {
    return this.rules;
  }

  getScore(): number {
    return this.score;
  }

  getTimeRemaining(): number | undefined {
    return this.timeRemaining;
  }
}

export interface GameModeResults {
  mode: GameModeType;
  score: number;
  timeElapsed: number;
  success: boolean;
  stars?: number; // 1-3 star rating
  rewards: {
    experience: number;
    currency: number;
  };
  statistics: {
    [key: string]: number;
  };
}
