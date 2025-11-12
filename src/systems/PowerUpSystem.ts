/**
 * Power-Up System (v0.2 Phase 2)
 *
 * Manages power-up spawning, collection, and active effects.
 * Supports 8 core power-up types with visual/audio feedback.
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/constants';

export enum PowerUpType {
  SHIELD = 'shield',
  MAGNET = 'magnet',
  SLOW_MOTION = 'slow_motion',
  SPEED_BOOST = 'speed_boost',
  SCORE_MULTIPLIER = 'score_multiplier',
  GHOST_MODE = 'ghost_mode',
  SIZE_REDUCTION = 'size_reduction',
  AUTO_SWIM = 'auto_swim',
}

export interface PowerUpConfig {
  type: PowerUpType;
  name: string;
  description: string;
  duration: number; // milliseconds (0 = permanent until used)
  rarity: number; // 0-1, lower = rarer
  color: number;
  icon: string; // emoji for now, sprite key later
}

export interface ActivePowerUp {
  type: PowerUpType;
  startTime: number;
  duration: number;
  used?: boolean; // For one-time power-ups like shield
}

export interface PowerUpSpawn {
  x: number;
  y: number;
  type: PowerUpType;
  graphics: Phaser.GameObjects.Graphics;
  collected: boolean;
}

// Power-up configurations
export const POWER_UP_CONFIGS: Record<PowerUpType, PowerUpConfig> = {
  [PowerUpType.SHIELD]: {
    type: PowerUpType.SHIELD,
    name: 'Shield',
    description: 'Survive one collision',
    duration: 0, // Permanent until hit
    rarity: 0.3,
    color: 0x4488ff,
    icon: '🛡️',
  },
  [PowerUpType.MAGNET]: {
    type: PowerUpType.MAGNET,
    name: 'Magnet',
    description: 'Auto-collect nearby items',
    duration: 10000,
    rarity: 0.5,
    color: 0xff4488,
    icon: '🧲',
  },
  [PowerUpType.SLOW_MOTION]: {
    type: PowerUpType.SLOW_MOTION,
    name: 'Slow Motion',
    description: 'Slow down time',
    duration: 8000,
    rarity: 0.2,
    color: 0x88ffff,
    icon: '⏱️',
  },
  [PowerUpType.SPEED_BOOST]: {
    type: PowerUpType.SPEED_BOOST,
    name: 'Speed Boost',
    description: 'Move faster through water',
    duration: 7000,
    rarity: 0.4,
    color: 0xffff44,
    icon: '⚡',
  },
  [PowerUpType.SCORE_MULTIPLIER]: {
    type: PowerUpType.SCORE_MULTIPLIER,
    name: 'Score Multiplier',
    description: '2x points for duration',
    duration: 12000,
    rarity: 0.3,
    color: 0xff8844,
    icon: '✨',
  },
  [PowerUpType.GHOST_MODE]: {
    type: PowerUpType.GHOST_MODE,
    name: 'Ghost Mode',
    description: 'Pass through obstacles',
    duration: 5000,
    rarity: 0.15,
    color: 0xaa88ff,
    icon: '👻',
  },
  [PowerUpType.SIZE_REDUCTION]: {
    type: PowerUpType.SIZE_REDUCTION,
    name: 'Size Reduction',
    description: 'Smaller hitbox',
    duration: 10000,
    rarity: 0.35,
    color: 0x88ff88,
    icon: '🔻',
  },
  [PowerUpType.AUTO_SWIM]: {
    type: PowerUpType.AUTO_SWIM,
    name: 'Auto-Swim',
    description: 'AI controls seal',
    duration: 6000,
    rarity: 0.25,
    color: 0xff88ff,
    icon: '🤖',
  },
};

export class PowerUpSystem {
  private scene: Phaser.Scene;
  private activePowerUps: Map<PowerUpType, ActivePowerUp> = new Map();
  private spawns: PowerUpSpawn[] = [];
  private lastSpawnTime: number = 0;
  private spawnInterval: number = 8000; // Spawn every 8 seconds
  private maxActiveSpawns: number = 2;

  // Visual indicators
  private activeIndicators: Phaser.GameObjects.Container[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Update power-up system
   */
  update(time: number, sealX: number, sealY: number, sealWidth: number, sealHeight: number): void {
    // Update active power-ups (check for expiration)
    this.updateActivePowerUps(time);

    // Spawn new power-ups
    if (time - this.lastSpawnTime > this.spawnInterval) {
      this.spawnPowerUp(time);
      this.lastSpawnTime = time;
    }

    // Update spawned power-ups (animate and check collection)
    this.updateSpawns(time, sealX, sealY, sealWidth, sealHeight);

    // Update visual indicators
    this.updateIndicators();
  }

  /**
   * Check for expired power-ups
   */
  private updateActivePowerUps(time: number): void {
    const expired: PowerUpType[] = [];

    this.activePowerUps.forEach((powerUp, type) => {
      // Skip permanent power-ups that haven't been used
      if (powerUp.duration === 0 && !powerUp.used) {
        return;
      }

      // Check if duration-based power-up has expired
      if (powerUp.duration > 0 && time - powerUp.startTime > powerUp.duration) {
        expired.push(type);
      }

      // Check if one-time power-up was used
      if (powerUp.used) {
        expired.push(type);
      }
    });

    // Remove expired power-ups
    expired.forEach(type => {
      this.activePowerUps.delete(type);
      this.onPowerUpExpire(type);
    });
  }

  /**
   * Spawn a random power-up
   */
  private spawnPowerUp(time: number): void {
    // Limit active spawns
    const activeSpawns = this.spawns.filter(s => !s.collected).length;
    if (activeSpawns >= this.maxActiveSpawns) {
      return;
    }

    // Select random power-up based on rarity
    const type = this.selectRandomPowerUp();
    const config = POWER_UP_CONFIGS[type];

    // Random position (right side of screen)
    const x = GAME_CONFIG.WIDTH + 50;
    const y = Math.random() * (GAME_CONFIG.HEIGHT - 100) + 50;

    // Create visual representation
    const graphics = this.scene.add.graphics();
    graphics.setDepth(10);
    this.drawPowerUp(graphics, 0, 0, config);
    graphics.setPosition(x, y);

    this.spawns.push({
      x,
      y,
      type,
      graphics,
      collected: false,
    });
  }

  /**
   * Select random power-up based on rarity weights
   */
  private selectRandomPowerUp(): PowerUpType {
    const types = Object.values(PowerUpType);
    const totalWeight = types.reduce((sum, type) => sum + POWER_UP_CONFIGS[type].rarity, 0);
    let random = Math.random() * totalWeight;

    for (const type of types) {
      random -= POWER_UP_CONFIGS[type].rarity;
      if (random <= 0) {
        return type;
      }
    }

    return types[0]; // Fallback
  }

  /**
   * Draw power-up visual (placeholder procedural graphics)
   */
  private drawPowerUp(graphics: Phaser.GameObjects.Graphics, x: number, y: number, config: PowerUpConfig): void {
    graphics.clear();

    // Outer glow
    graphics.fillStyle(config.color, 0.3);
    graphics.fillCircle(x, y, 25);

    // Main circle
    graphics.fillStyle(config.color, 0.8);
    graphics.fillCircle(x, y, 20);

    // Inner highlight
    graphics.fillStyle(0xffffff, 0.6);
    graphics.fillCircle(x - 5, y - 5, 8);

    // Border
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.strokeCircle(x, y, 20);
  }

  /**
   * Update spawned power-ups
   */
  private updateSpawns(time: number, sealX: number, sealY: number, sealWidth: number, sealHeight: number): void {
    // Move power-ups left (scroll with obstacles)
    const scrollSpeed = 3; // TODO: sync with ObstacleManager

    for (let i = this.spawns.length - 1; i >= 0; i--) {
      const spawn = this.spawns[i];

      if (spawn.collected) continue;

      // Move left
      spawn.x -= scrollSpeed;
      spawn.graphics.setPosition(spawn.x, spawn.y);

      // Animate (bob up and down)
      const bobOffset = Math.sin(time / 200 + spawn.x / 50) * 5;
      spawn.graphics.setY(spawn.y + bobOffset);

      // Pulse animation
      const scale = 1 + Math.sin(time / 150 + spawn.x / 30) * 0.1;
      spawn.graphics.setScale(scale);

      // Check for collection
      const distance = Phaser.Math.Distance.Between(spawn.x, spawn.y, sealX, sealY);
      const collectionRadius = 40; // Generous collection area

      if (distance < collectionRadius) {
        this.collectPowerUp(spawn);
      }

      // Remove if off-screen
      if (spawn.x < -50) {
        spawn.graphics.destroy();
        this.spawns.splice(i, 1);
      }
    }
  }

  /**
   * Collect a power-up
   */
  private collectPowerUp(spawn: PowerUpSpawn): void {
    spawn.collected = true;
    spawn.graphics.destroy();

    // Activate power-up
    this.activatePowerUp(spawn.type, this.scene.time.now);

    // Visual feedback (emit event for particle system)
    this.scene.events.emit('powerup-collected', {
      x: spawn.x,
      y: spawn.y,
      type: spawn.type,
    });
  }

  /**
   * Activate a power-up
   */
  activatePowerUp(type: PowerUpType, time: number): void {
    const config = POWER_UP_CONFIGS[type];

    // Add to active power-ups
    this.activePowerUps.set(type, {
      type,
      startTime: time,
      duration: config.duration,
      used: false,
    });

    // Emit activation event
    this.scene.events.emit('powerup-activated', { type, config });

    // Create visual indicator
    this.createIndicator(type);
  }

  /**
   * Create on-screen indicator for active power-up
   */
  private createIndicator(type: PowerUpType): void {
    const config = POWER_UP_CONFIGS[type];
    const container = this.scene.add.container(0, 0);
    container.setDepth(100);

    // Position indicators in top-right corner
    const indicatorX = GAME_CONFIG.WIDTH - 60 - (this.activeIndicators.length * 50);
    const indicatorY = 100;

    // Background circle
    const bg = this.scene.add.graphics();
    bg.fillStyle(config.color, 0.8);
    bg.fillCircle(0, 0, 20);
    bg.lineStyle(2, 0xffffff, 1);
    bg.strokeCircle(0, 0, 20);

    container.add(bg);
    container.setPosition(indicatorX, indicatorY);

    this.activeIndicators.push(container);
  }

  /**
   * Update visual indicators
   */
  private updateIndicators(): void {
    // Remove indicators for inactive power-ups
    for (let i = this.activeIndicators.length - 1; i >= 0; i--) {
      const types = Array.from(this.activePowerUps.keys());
      if (i >= types.length) {
        this.activeIndicators[i].destroy();
        this.activeIndicators.splice(i, 1);
      }
    }

    // Update positions
    this.activeIndicators.forEach((indicator, index) => {
      const indicatorX = GAME_CONFIG.WIDTH - 60 - (index * 50);
      const indicatorY = 100;
      indicator.setPosition(indicatorX, indicatorY);
    });
  }

  /**
   * Handle power-up expiration
   */
  private onPowerUpExpire(type: PowerUpType): void {
    this.scene.events.emit('powerup-expired', { type });
  }

  /**
   * Check if specific power-up is active
   */
  isActive(type: PowerUpType): boolean {
    return this.activePowerUps.has(type);
  }

  /**
   * Get active power-up
   */
  getActive(type: PowerUpType): ActivePowerUp | undefined {
    return this.activePowerUps.get(type);
  }

  /**
   * Get all active power-ups
   */
  getAllActive(): ActivePowerUp[] {
    return Array.from(this.activePowerUps.values());
  }

  /**
   * Use a one-time power-up (like shield)
   */
  usePowerUp(type: PowerUpType): void {
    const powerUp = this.activePowerUps.get(type);
    if (powerUp) {
      powerUp.used = true;
    }
  }

  /**
   * Get score multiplier from active power-ups
   */
  getScoreMultiplier(): number {
    return this.isActive(PowerUpType.SCORE_MULTIPLIER) ? 2 : 1;
  }

  /**
   * Check if collisions should be ignored
   */
  shouldIgnoreCollision(): boolean {
    return this.isActive(PowerUpType.GHOST_MODE);
  }

  /**
   * Get hitbox scale modifier
   */
  getHitboxScale(): number {
    return this.isActive(PowerUpType.SIZE_REDUCTION) ? 0.7 : 1.0;
  }

  /**
   * Get time scale modifier
   */
  getTimeScale(): number {
    return this.isActive(PowerUpType.SLOW_MOTION) ? 0.6 : 1.0;
  }

  /**
   * Get speed multiplier
   */
  getSpeedMultiplier(): number {
    return this.isActive(PowerUpType.SPEED_BOOST) ? 1.5 : 1.0;
  }

  /**
   * Reset system
   */
  reset(): void {
    // Clear active power-ups
    this.activePowerUps.clear();

    // Destroy all spawns
    this.spawns.forEach(spawn => spawn.graphics.destroy());
    this.spawns = [];

    // Destroy indicators
    this.activeIndicators.forEach(indicator => indicator.destroy());
    this.activeIndicators = [];

    this.lastSpawnTime = 0;
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.reset();
  }
}
