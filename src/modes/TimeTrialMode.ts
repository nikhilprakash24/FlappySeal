/**
 * Time Trial Mode (v0.2)
 *
 * Score as many points as possible within 60 seconds.
 */

import Phaser from 'phaser';
import { GameMode, GameModeType, GameModeConfig, GameModeRules, GameModeResults } from './GameMode';
import { GAME_CONFIG, UI_CONFIG } from '../config/constants';

export class TimeTrialMode extends GameMode {
  private obstaclesPassed: number = 0;
  private timeLimitMs: number = 60000; // 60 seconds

  constructor(scene: Phaser.Scene) {
    const config: GameModeConfig = {
      type: GameModeType.TIME_TRIAL,
      name: 'Time Trial',
      description: 'Score as many points as possible in 60 seconds!',
      icon: '⏱️',
      unlocked: true,
    };

    const rules: GameModeRules = {
      hasObstacles: true,
      hasTimeLimit: true,
      hasPowerUps: true,
      hasWaterPhysics: false,
      customDifficulty: 1.2, // Slightly faster
    };

    super(scene, config, rules);
  }

  init(): void {
    this.startTime = this.scene.time.now;
    this.score = 0;
    this.obstaclesPassed = 0;
    this.timeRemaining = this.timeLimitMs;
  }

  update(time: number, delta: number): void {
    // Update time remaining
    if (this.timeRemaining !== undefined && this.timeRemaining > 0) {
      this.timeRemaining -= delta;
      if (this.timeRemaining < 0) {
        this.timeRemaining = 0;
      }
    }
  }

  isComplete(): boolean {
    // Complete when time runs out
    return this.timeRemaining !== undefined && this.timeRemaining <= 0;
  }

  isFailed(): boolean {
    // Can't really "fail" time trial, just get a lower score
    return false;
  }

  getUI(): Phaser.GameObjects.GameObject[] {
    const ui: Phaser.GameObjects.GameObject[] = [];

    // Timer display (large and prominent)
    const timerContainer = this.scene.add.container(GAME_CONFIG.WIDTH / 2, 40);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(-80, 0, 160, 60, 10);

    // Determine color based on time remaining
    const seconds = Math.ceil((this.timeRemaining || 0) / 1000);
    let timerColor = '#44ff44'; // Green
    if (seconds <= 10) {
      timerColor = '#ff4444'; // Red
    } else if (seconds <= 20) {
      timerColor = '#ffaa44'; // Orange
    }

    bg.lineStyle(3, parseInt(timerColor.replace('#', '0x')), 1);
    bg.strokeRoundedRect(-80, 0, 160, 60, 10);

    const timerIcon = this.scene.add.text(
      0,
      15,
      '⏱️',
      {
        fontSize: '24px',
      }
    ).setOrigin(0.5);

    const timerText = this.scene.add.text(
      0,
      40,
      `${seconds}s`,
      {
        fontSize: '28px',
        color: timerColor,
        fontStyle: 'bold',
        fontFamily: 'Arial',
      }
    ).setOrigin(0.5);

    // Pulse animation when time is running low
    if (seconds <= 10) {
      this.scene.tweens.add({
        targets: [timerText, bg],
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    timerContainer.add([bg, timerIcon, timerText]);
    timerContainer.setDepth(95);

    ui.push(timerContainer);

    return ui;
  }

  getResults(): GameModeResults {
    const timeElapsed = this.scene.time.now - this.startTime;

    return {
      mode: GameModeType.TIME_TRIAL,
      score: this.score,
      timeElapsed,
      success: true, // Always successful (just with varying scores)
      stars: this.calculateStars(),
      rewards: {
        experience: this.score * 10, // 10 XP per point (higher than endless)
        currency: this.score, // 1 fish per point
      },
      statistics: {
        obstaclesPassed: this.obstaclesPassed,
        pointsPerSecond: this.score / 60,
      },
    };
  }

  /**
   * Calculate star rating based on score
   */
  private calculateStars(): number {
    if (this.score >= 100) return 3; // 100+ in 60s is expert
    if (this.score >= 60) return 2;  // 60+ is good (1 per second)
    if (this.score >= 30) return 1;  // 30+ is acceptable
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
