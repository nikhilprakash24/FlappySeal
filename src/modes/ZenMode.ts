/**
 * Zen Mode (v0.2)
 *
 * Peaceful, relaxing gameplay with no obstacles. Just swim and collect items.
 */

import Phaser from 'phaser';
import { GameMode, GameModeType, GameModeConfig, GameModeRules, GameModeResults } from './GameMode';
import { GAME_CONFIG } from '../config/constants';

export class ZenMode extends GameMode {
  private distanceTraveled: number = 0;
  private itemsCollected: number = 0;
  private lastUpdateTime: number = 0;

  constructor(scene: Phaser.Scene) {
    const config: GameModeConfig = {
      type: GameModeType.ZEN,
      name: 'Zen Mode',
      description: 'Peaceful swimming with no obstacles. Relax and explore.',
      icon: '🧘',
      unlocked: true,
    };

    const rules: GameModeRules = {
      hasObstacles: false,    // No obstacles!
      hasTimeLimit: false,
      hasPowerUps: false,     // No power-ups (not needed)
      hasWaterPhysics: false,
      customDifficulty: 0,    // No difficulty
    };

    super(scene, config, rules);
  }

  init(): void {
    this.startTime = this.scene.time.now;
    this.lastUpdateTime = this.startTime;
    this.score = 0;
    this.distanceTraveled = 0;
    this.itemsCollected = 0;
  }

  update(time: number, delta: number): void {
    // Track distance traveled (simple time-based calculation)
    const timeDelta = time - this.lastUpdateTime;
    this.lastUpdateTime = time;

    // Simulate scrolling distance
    this.distanceTraveled += (timeDelta / 1000) * 100; // 100 units per second

    // Score increases passively based on distance
    this.score = Math.floor(this.distanceTraveled / 50);
  }

  isComplete(): boolean {
    // Zen mode never "completes" - player can exit whenever
    return false;
  }

  isFailed(): boolean {
    // Can't fail zen mode!
    return false;
  }

  getUI(): Phaser.GameObjects.GameObject[] {
    const ui: Phaser.GameObjects.GameObject[] = [];

    // Zen mode indicator (top center)
    const zenContainer = this.scene.add.container(GAME_CONFIG.WIDTH / 2, 30);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x002200, 0.6);
    bg.fillRoundedRect(-120, 0, 240, 70, 10);
    bg.lineStyle(2, 0x44ff88, 1);
    bg.strokeRoundedRect(-120, 0, 240, 70, 10);

    const modeText = this.scene.add.text(
      0,
      10,
      '🧘 Zen Mode',
      {
        fontSize: '18px',
        color: '#88ffaa',
        fontStyle: 'bold',
        fontFamily: 'Arial',
      }
    ).setOrigin(0.5);

    const instructionText = this.scene.add.text(
      0,
      35,
      'No obstacles - just swim',
      {
        fontSize: '14px',
        color: '#aaffcc',
        fontFamily: 'Arial',
      }
    ).setOrigin(0.5);

    const distanceText = this.scene.add.text(
      0,
      55,
      `Distance: ${Math.floor(this.distanceTraveled)}m`,
      {
        fontSize: '12px',
        color: '#ffffff',
        fontFamily: 'Arial',
      }
    ).setOrigin(0.5);

    // Gentle pulse animation
    this.scene.tweens.add({
      targets: zenContainer,
      alpha: 0.7,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    zenContainer.add([bg, modeText, instructionText, distanceText]);
    zenContainer.setDepth(95);

    ui.push(zenContainer);

    // Exit hint
    const exitHint = this.scene.add.text(
      GAME_CONFIG.WIDTH - 20,
      GAME_CONFIG.HEIGHT - 20,
      'Press ESC to exit',
      {
        fontSize: '14px',
        color: '#888888',
        fontFamily: 'Arial',
      }
    ).setOrigin(1);
    exitHint.setDepth(95);
    exitHint.setAlpha(0.5);

    ui.push(exitHint);

    return ui;
  }

  getResults(): GameModeResults {
    const timeElapsed = this.scene.time.now - this.startTime;
    const minutesPlayed = timeElapsed / 60000;

    return {
      mode: GameModeType.ZEN,
      score: this.score,
      timeElapsed,
      success: true,
      stars: 1, // Zen mode always gives 1 star (participation)
      rewards: {
        experience: Math.floor(minutesPlayed * 100), // 100 XP per minute
        currency: Math.floor(minutesPlayed * 20),    // 20 fish per minute
      },
      statistics: {
        distanceTraveled: Math.floor(this.distanceTraveled),
        itemsCollected: this.itemsCollected,
        timeSpent: Math.floor(timeElapsed / 1000),
      },
    };
  }

  /**
   * Record item collected
   */
  collectItem(): void {
    this.itemsCollected++;
  }

  /**
   * Get distance traveled
   */
  getDistance(): number {
    return Math.floor(this.distanceTraveled);
  }
}
