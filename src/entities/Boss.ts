/**
 * Boss Encounter System (v0.2)
 *
 * Special boss enemies that appear every 500 points.
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/constants';

export enum BossType {
  OCTOPUS = 'octopus',
  SHARK = 'shark',
  SUBMARINE = 'submarine',
}

export interface BossConfig {
  type: BossType;
  name: string;
  health: number;
  speed: number;
  attackInterval: number; // milliseconds
}

export const BOSS_CONFIGS: Record<BossType, BossConfig> = {
  [BossType.OCTOPUS]: {
    type: BossType.OCTOPUS,
    name: 'Giant Octopus',
    health: 10,
    speed: 2,
    attackInterval: 2000,
  },
  [BossType.SHARK]: {
    type: BossType.SHARK,
    name: 'Megalodon',
    health: 15,
    speed: 4,
    attackInterval: 1500,
  },
  [BossType.SUBMARINE]: {
    type: BossType.SUBMARINE,
    name: 'Enemy Submarine',
    health: 20,
    speed: 1.5,
    attackInterval: 2500,
  },
};

export class Boss {
  private scene: Phaser.Scene;
  private config: BossConfig;
  private x: number;
  private y: number;
  private health: number;
  private graphics: Phaser.GameObjects.Graphics;
  private lastAttackTime: number = 0;
  private tentacles: Array<{ x: number; y: number; angle: number }> = [];
  private phase: number = 1;

  constructor(scene: Phaser.Scene, type: BossType) {
    this.scene = scene;
    this.config = BOSS_CONFIGS[type];
    this.health = this.config.health;
    this.x = GAME_CONFIG.WIDTH + 100;
    this.y = GAME_CONFIG.HEIGHT / 2;

    this.graphics = scene.add.graphics();

    if (type === BossType.OCTOPUS) {
      this.initializeOctopusTentacles();
    }

    this.draw();
  }

  /**
   * Initialize octopus tentacles
   */
  private initializeOctopusTentacles(): void {
    for (let i = 0; i < 8; i++) {
      this.tentacles.push({
        x: 0,
        y: 0,
        angle: (i / 8) * Math.PI * 2,
      });
    }
  }

  /**
   * Update boss
   */
  update(time: number, delta: number): void {
    // Move boss into position
    if (this.x > GAME_CONFIG.WIDTH - 150) {
      this.x -= this.config.speed;
    }

    // Bobbing motion
    this.y = GAME_CONFIG.HEIGHT / 2 + Math.sin(time / 1000) * 30;

    // Update tentacles animation
    if (this.config.type === BossType.OCTOPUS) {
      this.tentacles.forEach((tentacle, index) => {
        tentacle.angle = (index / 8) * Math.PI * 2 + Math.sin(time / 500) * 0.3;
      });
    }

    // Attack pattern
    if (time - this.lastAttackTime > this.config.attackInterval) {
      this.attack();
      this.lastAttackTime = time;
    }

    this.draw();
  }

  /**
   * Draw boss
   */
  private draw(): void {
    this.graphics.clear();
    this.graphics.setPosition(this.x, this.y);

    switch (this.config.type) {
      case BossType.OCTOPUS:
        this.drawOctopus();
        break;
      case BossType.SHARK:
        this.drawShark();
        break;
      case BossType.SUBMARINE:
        this.drawSubmarine();
        break;
    }
  }

  /**
   * Draw octopus boss
   */
  private drawOctopus(): void {
    // Head
    this.graphics.fillStyle(0xaa3366, 1);
    this.graphics.fillCircle(0, 0, 80);

    // Eyes (menacing)
    this.graphics.fillStyle(0xff0000, 1);
    this.graphics.fillCircle(-25, -20, 15);
    this.graphics.fillCircle(25, -20, 15);
    this.graphics.fillStyle(0x000000, 1);
    this.graphics.fillCircle(-25, -20, 8);
    this.graphics.fillCircle(25, -20, 8);

    // Tentacles
    this.tentacles.forEach(tentacle => {
      const endX = Math.cos(tentacle.angle) * 120;
      const endY = Math.sin(tentacle.angle) * 120;

      this.graphics.lineStyle(20, 0x883355, 1);
      this.graphics.lineBetween(0, 0, endX, endY);

      // Suction cups
      for (let i = 0; i < 3; i++) {
        const t = (i + 1) / 4;
        const cupX = endX * t;
        const cupY = endY * t;
        this.graphics.fillStyle(0xaa4477, 1);
        this.graphics.fillCircle(cupX, cupY, 8);
      }
    });
  }

  /**
   * Draw shark boss
   */
  private drawShark(): void {
    // Body
    this.graphics.fillStyle(0x555555, 1);
    this.graphics.fillEllipse(0, 0, 150, 60);

    // Head
    this.graphics.fillTriangle(-75, 0, -120, -20, -120, 20);

    // Dorsal fin
    this.graphics.fillTriangle(20, -30, 40, -70, 60, -30);

    // Tail
    this.graphics.fillTriangle(75, 0, 120, -40, 120, 40);

    // Eye
    this.graphics.fillStyle(0xff0000, 1);
    this.graphics.fillCircle(-90, -10, 10);

    // Teeth
    this.graphics.fillStyle(0xffffff, 1);
    for (let i = 0; i < 8; i++) {
      this.graphics.fillTriangle(
        -115 + i * 10,
        -5,
        -115 + i * 10,
        5,
        -120 + i * 10,
        0
      );
    }
  }

  /**
   * Draw submarine boss
   */
  private drawSubmarine(): void {
    // Hull
    this.graphics.fillStyle(0x444444, 1);
    this.graphics.fillEllipse(0, 0, 140, 50);

    // Conning tower
    this.graphics.fillRoundedRect(-30, -40, 60, 40, 10);

    // Periscope
    this.graphics.lineStyle(6, 0x666666, 1);
    this.graphics.lineBetween(0, -40, 0, -70);

    // Propeller (spinning)
    const propAngle = this.scene.time.now / 50;
    this.graphics.lineStyle(4, 0x888888, 1);
    for (let i = 0; i < 3; i++) {
      const angle = propAngle + (i * Math.PI * 2) / 3;
      const x1 = 70 + Math.cos(angle) * 20;
      const y1 = Math.sin(angle) * 20;
      this.graphics.lineBetween(70, 0, x1, y1);
    }

    // Torpedo tubes
    this.graphics.fillStyle(0x222222, 1);
    this.graphics.fillCircle(-40, 10, 8);
    this.graphics.fillCircle(-40, -10, 8);
  }

  /**
   * Boss attack
   */
  private attack(): void {
    // Emit attack event
    this.scene.events.emit('boss-attack', {
      type: this.config.type,
      x: this.x,
      y: this.y,
    });
  }

  /**
   * Take damage
   */
  takeDamage(amount: number): void {
    this.health -= amount;

    // Flash effect
    this.graphics.setAlpha(0.5);
    this.scene.time.delayedCall(100, () => {
      this.graphics.setAlpha(1);
    });

    // Phase transition
    const healthPercent = this.health / this.config.health;
    if (healthPercent < 0.5 && this.phase === 1) {
      this.phase = 2;
      // Speed up attacks
      this.config.attackInterval *= 0.7;
    }
  }

  /**
   * Check if boss is defeated
   */
  isDefeated(): boolean {
    return this.health <= 0;
  }

  /**
   * Get position
   */
  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Get collision bounds
   */
  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x - 80,
      y: this.y - 80,
      width: 160,
      height: 160,
    };
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.graphics.destroy();
  }
}
