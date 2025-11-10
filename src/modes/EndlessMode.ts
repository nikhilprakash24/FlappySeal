/**
 * Endless Mode (v0.2)
 *
 * Classic endless gameplay - survive as long as possible,  score as high as possible.
 */

import Phaser from 'phaser';
import { GameMode, GameModeType, GameModeConfig, GameModeRules, GameModeResults } from './GameMode';
import { GAME_CONFIG } from '../config/constants';

export class EndlessMode extends GameMode {
  private obstacles Passed: number = 0;

  constructor(scene: Phaser.Scene) {
    const config: GameModeConfig = {
      type: GameModeType.ENDLESS,
      name: 'Endless Mode',
      description: 'Survive as long as possible and rack up the highest score!',
      icon: '∞',
      unlocked: true,
    };

    const rules: GameModeRules = {
      hasObstacles: true,
      hasTimeLimit: false,
      hasPowerUps: true,
      hasWaterPhysics: false,
      customDifficulty: 1.0,
    };

    super(scene, config, rules);
  }

  init(): void {
    this.startTime = this.scene.time.now;
    this.score = 0;
    this.obstaclesPassed = 0;
  }

  update(time: number, delta: number): void {
    // Endless mode has no special update logic
    // Game continues until player dies
  }

  isComplete(): boolean {
    // Endless mode never "completes"
    return false;
  }

  isFailed(): boolean {
    // Failure is handled by GameScene collision detection
    return false;
  }

  getUI(): Phaser.GameObjects.GameObject[] {
    // No special UI for endless mode
    return [];
  }

  getResults(): GameModeResults {
    const timeElapsed = this.scene.time.now - this.startTime;

    return {
      mode: GameModeType.ENDLESS,
      score: this.score,
      timeElapsed,
      success: true, // In endless, any attempt is "successful"
      stars: this.calculateStars(),
      rewards: {
        experience: this.score * 5, // 5 XP per point
        currency: Math.floor(this.score * 0.5), // 0.5 fish per point
      },
      statistics: {
        obstaclesPassed: this.obstaclesPassed,
        timeAlive: Math.floor(timeElapsed / 1000),
      },
    };
  }

  /**
   * Calculate star rating based on score
   */
  private calculateStars(): number {
    if (this.score >= 100) return 3;
    if (this.score >= 50) return 2;
    if (this.score >= 10) return 1;
    return 0;
  }

  /**
   * Update score (called by GameScene)
   */
  updateScore(newScore: number): void {
    this.score = newScore;
  }

  /**
   * Increment obstacles passed
   */
  incrementObstacles(): void {
    this.obstaclesPassed++;
  }
}
