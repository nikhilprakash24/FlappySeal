/**
 * Challenge Mode (v0.2)
 *
 * Complete specific challenges with unique objectives and constraints.
 */

import Phaser from 'phaser';
import { GameMode, GameModeType, GameModeConfig, GameModeRules, GameModeResults } from './GameMode';
import { GAME_CONFIG } from '../config/constants';

export interface Challenge {
  id: string;
  name: string;
  description: string;
  objective: string;
  rules: GameModeRules;
  target: {
    type: 'score' | 'obstacles' | 'time' | 'perfect';
    value: number;
  };
  rewards: {
    experience: number;
    currency: number;
  };
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'first_flight',
    name: 'First Flight',
    description: 'Get comfortable with the controls',
    objective: 'Pass 10 obstacles',
    rules: {
      hasObstacles: true,
      hasTimeLimit: false,
      hasPowerUps: false,
      hasWaterPhysics: false,
      customDifficulty: 0.7, // Easier
    },
    target: { type: 'obstacles', value: 10 },
    rewards: { experience: 100, currency: 50 },
  },
  {
    id: 'speed_run',
    name: 'Speed Run',
    description: 'Score 50 points in 60 seconds',
    objective: 'Score 50 in 60s',
    rules: {
      hasObstacles: true,
      hasTimeLimit: true,
      hasPowerUps: true,
      hasWaterPhysics: false,
      customDifficulty: 1.2, // Faster
    },
    target: { type: 'score', value: 50 },
    rewards: { experience: 300, currency: 150 },
  },
  {
    id: 'no_swim',
    name: 'Dive Master',
    description: 'Only diving allowed - no swimming up!',
    objective: 'Pass 20 obstacles using only dive',
    rules: {
      hasObstacles: true,
      hasTimeLimit: false,
      hasPowerUps: false,
      hasWaterPhysics: false,
      customDifficulty: 1.0,
    },
    target: { type: 'obstacles', value: 20 },
    rewards: { experience: 400, currency: 200 },
  },
  {
    id: 'narrow_escape',
    name: 'Narrow Escape',
    description: 'Navigate through extremely tight gaps',
    objective: 'Pass 15 narrow obstacles',
    rules: {
      hasObstacles: true,
      hasTimeLimit: false,
      hasPowerUps: true,
      hasWaterPhysics: false,
      customDifficulty: 1.5, // Very narrow gaps
    },
    target: { type: 'obstacles', value: 15 },
    rewards: { experience: 500, currency: 250 },
  },
  {
    id: 'perfect_score',
    name: 'Flawless Victory',
    description: 'Pass 25 obstacles without touching any',
    objective: '25 obstacles, zero touches',
    rules: {
      hasObstacles: true,
      hasTimeLimit: false,
      hasPowerUps: false,
      hasWaterPhysics: false,
      customDifficulty: 1.0,
    },
    target: { type: 'perfect', value: 25 },
    rewards: { experience: 1000, currency: 500 },
  },
  {
    id: 'time_trial_30',
    name: '30-Second Sprint',
    description: 'Survive for 30 seconds',
    objective: 'Stay alive for 30 seconds',
    rules: {
      hasObstacles: true,
      hasTimeLimit: true,
      hasPowerUps: true,
      hasWaterPhysics: false,
      customDifficulty: 1.3,
    },
    target: { type: 'time', value: 30000 }, // 30 seconds in ms
    rewards: { experience: 350, currency: 175 },
  },
  {
    id: 'power_up_master',
    name: 'Power-Up Master',
    description: 'Collect and use 10 power-ups',
    objective: 'Collect 10 power-ups',
    rules: {
      hasObstacles: true,
      hasTimeLimit: false,
      hasPowerUps: true,
      hasWaterPhysics: false,
      customDifficulty: 1.0,
    },
    target: { type: 'obstacles', value: 30 }, // Must pass 30 to likely collect 10 power-ups
    rewards: { experience: 400, currency: 200 },
  },
  {
    id: 'marathon',
    name: 'Marathon',
    description: 'The ultimate endurance test',
    objective: 'Score 100 points',
    rules: {
      hasObstacles: true,
      hasTimeLimit: false,
      hasPowerUps: true,
      hasWaterPhysics: false,
      customDifficulty: 1.0,
    },
    target: { type: 'score', value: 100 },
    rewards: { experience: 2000, currency: 1000 },
  },
  {
    id: 'rhythm_master',
    name: 'Rhythm Master',
    description: 'Maintain perfect timing for 20 obstacles',
    objective: 'Pass through center of 20 gaps',
    rules: {
      hasObstacles: true,
      hasTimeLimit: false,
      hasPowerUps: false,
      hasWaterPhysics: false,
      customDifficulty: 1.0,
    },
    target: { type: 'perfect', value: 20 },
    rewards: { experience: 750, currency: 375 },
  },
  {
    id: 'gauntlet',
    name: 'The Gauntlet',
    description: 'All challenges combined',
    objective: 'Score 75 in 90 seconds with narrow gaps',
    rules: {
      hasObstacles: true,
      hasTimeLimit: true,
      hasPowerUps: true,
      hasWaterPhysics: false,
      customDifficulty: 1.8, // Very hard
    },
    target: { type: 'score', value: 75 },
    rewards: { experience: 3000, currency: 1500 },
  },
];

export class ChallengeMode extends GameMode {
  private challenge: Challenge;
  private obstaclesPassed: number = 0;
  private perfectPasses: number = 0;
  private powerUpsCollected: number = 0;
  private touches: number = 0;

  constructor(scene: Phaser.Scene, challengeId: string) {
    const challenge = CHALLENGES.find(c => c.id === challengeId);
    if (!challenge) {
      throw new Error(`Challenge ${challengeId} not found`);
    }

    const config: GameModeConfig = {
      type: GameModeType.CHALLENGE,
      name: challenge.name,
      description: challenge.description,
      icon: '🎯',
      unlocked: true,
    };

    super(scene, config, challenge.rules);
    this.challenge = challenge;
  }

  init(): void {
    this.startTime = this.scene.time.now;
    this.score = 0;
    this.obstaclesPassed = 0;
    this.perfectPasses = 0;
    this.powerUpsCollected = 0;
    this.touches = 0;

    // Set time remaining if challenge has time limit
    if (this.rules.hasTimeLimit && this.challenge.target.type === 'time') {
      this.timeRemaining = this.challenge.target.value;
    } else if (this.rules.hasTimeLimit) {
      this.timeRemaining = 60000; // Default 60 seconds
    }
  }

  update(time: number, delta: number): void {
    // Update time remaining if time-limited
    if (this.timeRemaining !== undefined) {
      this.timeRemaining -= delta;
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
      }
    }
  }

  isComplete(): boolean {
    switch (this.challenge.target.type) {
      case 'score':
        return this.score >= this.challenge.target.value;
      case 'obstacles':
        return this.obstaclesPassed >= this.challenge.target.value;
      case 'time':
        return this.timeRemaining !== undefined && this.timeRemaining <= 0;
      case 'perfect':
        return this.perfectPasses >= this.challenge.target.value && this.touches === 0;
      default:
        return false;
    }
  }

  isFailed(): boolean {
    // Time trial: fail if time runs out before reaching target
    if (this.challenge.target.type === 'score' && this.timeRemaining !== undefined) {
      return this.timeRemaining <= 0 && this.score < this.challenge.target.value;
    }

    // Perfect challenges: fail on any touch
    if (this.challenge.target.type === 'perfect' && this.touches > 0) {
      return true;
    }

    return false;
  }

  getUI(): Phaser.GameObjects.GameObject[] {
    const ui: Phaser.GameObjects.GameObject[] = [];

    // Challenge objective display
    const objectiveContainer = this.scene.add.container(GAME_CONFIG.WIDTH / 2, 30);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.6);
    bg.fillRoundedRect(-150, 0, 300, 50, 10);
    bg.lineStyle(2, 0x44ff44, 1);
    bg.strokeRoundedRect(-150, 0, 300, 50, 10);

    const titleText = this.scene.add.text(
      0,
      10,
      this.challenge.objective,
      {
        fontSize: '14px',
        color: '#44ff44',
        fontStyle: 'bold',
        fontFamily: 'Arial',
        align: 'center',
      }
    ).setOrigin(0.5);

    let progressText = '';
    switch (this.challenge.target.type) {
      case 'score':
        progressText = `${this.score}/${this.challenge.target.value}`;
        break;
      case 'obstacles':
        progressText = `${this.obstaclesPassed}/${this.challenge.target.value}`;
        break;
      case 'time':
        const seconds = Math.ceil((this.timeRemaining || 0) / 1000);
        progressText = `${seconds}s`;
        break;
      case 'perfect':
        progressText = `${this.perfectPasses}/${this.challenge.target.value} (${this.touches} touches)`;
        break;
    }

    const progress = this.scene.add.text(
      0,
      30,
      progressText,
      {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
        fontFamily: 'Arial',
      }
    ).setOrigin(0.5);

    objectiveContainer.add([bg, titleText, progress]);
    objectiveContainer.setDepth(95);

    ui.push(objectiveContainer);

    return ui;
  }

  getResults(): GameModeResults {
    const timeElapsed = this.scene.time.now - this.startTime;
    const success = this.isComplete() && !this.isFailed();

    return {
      mode: GameModeType.CHALLENGE,
      score: this.score,
      timeElapsed,
      success,
      stars: success ? 3 : 0,
      rewards: success ? this.challenge.rewards : { experience: 50, currency: 25 },
      statistics: {
        obstaclesPassed: this.obstaclesPassed,
        perfectPasses: this.perfectPasses,
        powerUpsCollected: this.powerUpsCollected,
        touches: this.touches,
      },
    };
  }

  // Public methods for GameScene to call
  updateScore(newScore: number): void {
    this.score = newScore;
  }

  incrementObstacles(isPerfect: boolean = false): void {
    this.obstaclesPassed++;
    if (isPerfect) {
      this.perfectPasses++;
    }
  }

  recordTouch(): void {
    this.touches++;
  }

  recordPowerUpCollected(): void {
    this.powerUpsCollected++;
  }

  getChallenge(): Challenge {
    return this.challenge;
  }
}
