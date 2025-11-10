/**
 * Water Physics System (EXPERIMENTAL)
 *
 * Adds realistic water turbulence and current mechanics.
 * Dive action provides advantage by cutting through currents.
 *
 * This is an experimental feature to test if added physics
 * complexity improves or hurts gameplay.
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/constants';

export interface WaterCurrent {
  x: number;
  y: number;
  width: number;
  height: number;
  forceX: number; // Horizontal push
  forceY: number; // Vertical push
  type: CurrentType;
}

export enum CurrentType {
  GENTLE = 'gentle',     // Weak current
  MODERATE = 'moderate', // Medium current
  STRONG = 'strong',     // Strong current
  TURBULENT = 'turbulent', // Chaotic turbulence
}

export interface WaterPhysicsConfig {
  enableCurrents: boolean;
  currentStrength: number; // Multiplier (0-2)
  turbulenceFrequency: number; // How often turbulence changes
  diveResistance: number; // How much dive cuts through (0-1)
}

export class WaterPhysicsSystem {
  private scene: Phaser.Scene;
  private config: WaterPhysicsConfig;
  private currents: WaterCurrent[] = [];
  private turbulenceNoise: number = 0;
  private lastTurbulenceUpdate: number = 0;

  // Visual indicators (optional debug)
  private currentVisuals: Phaser.GameObjects.Graphics[] = [];
  private showDebug: boolean = false;

  constructor(scene: Phaser.Scene, config?: Partial<WaterPhysicsConfig>) {
    this.scene = scene;
    this.config = {
      enableCurrents: true,
      currentStrength: 1.0,
      turbulenceFrequency: 2000, // 2 seconds
      diveResistance: 0.7, // Dive cuts through 70% of current
      ...config,
    };

    this.initializeCurrent();
  }

  /**
   * Initialize water currents
   */
  private initializeCurrent(): void {
    // Create vertical zones with different currents
    const zoneHeight = GAME_CONFIG.HEIGHT / 4;

    // Zone 1: Upper waters (gentle right current)
    this.currents.push({
      x: 0,
      y: 0,
      width: GAME_CONFIG.WIDTH,
      height: zoneHeight,
      forceX: 0.5,
      forceY: 0,
      type: CurrentType.GENTLE,
    });

    // Zone 2: Mid-upper (moderate left current)
    this.currents.push({
      x: 0,
      y: zoneHeight,
      width: GAME_CONFIG.WIDTH,
      height: zoneHeight,
      forceX: -0.8,
      forceY: 0.2,
      type: CurrentType.MODERATE,
    });

    // Zone 3: Mid-lower (turbulent)
    this.currents.push({
      x: 0,
      y: zoneHeight * 2,
      width: GAME_CONFIG.WIDTH,
      height: zoneHeight,
      forceX: 0,
      forceY: 0, // Will vary with turbulence
      type: CurrentType.TURBULENT,
    });

    // Zone 4: Deep waters (strong downward current)
    this.currents.push({
      x: 0,
      y: zoneHeight * 3,
      width: GAME_CONFIG.WIDTH,
      height: zoneHeight,
      forceX: 0.3,
      forceY: 1.2,
      type: CurrentType.STRONG,
    });

    if (this.showDebug) {
      this.createCurrentVisuals();
    }
  }

  /**
   * Apply water forces to seal
   */
  applyForces(
    sealX: number,
    sealY: number,
    sealVelocityX: number,
    sealVelocityY: number,
    isDiving: boolean
  ): { deltaX: number; deltaY: number } {
    if (!this.config.enableCurrents) {
      return { deltaX: 0, deltaY: 0 };
    }

    // Find which current zone seal is in
    const current = this.getCurrentAtPosition(sealX, sealY);
    if (!current) {
      return { deltaX: 0, deltaY: 0 };
    }

    let forceX = current.forceX;
    let forceY = current.forceY;

    // Add turbulence noise
    if (current.type === CurrentType.TURBULENT) {
      forceX += Math.sin(this.turbulenceNoise) * 0.5;
      forceY += Math.cos(this.turbulenceNoise * 1.3) * 0.5;
    }

    // Apply strength multiplier
    forceX *= this.config.currentStrength;
    forceY *= this.config.currentStrength;

    // Dive resistance: diving cuts through current
    if (isDiving && sealVelocityY > 5) {
      // Strong downward momentum cuts through horizontal currents
      const diveStrength = Math.min(sealVelocityY / 15, 1); // 0-1 based on dive speed
      const resistance = this.config.diveResistance * diveStrength;

      forceX *= (1 - resistance);
      // Diving with current in Y direction gets bonus
      if (forceY > 0 && sealVelocityY > 0) {
        forceY *= 1.2; // 20% boost when diving with downward current
      }
    }

    // Swimming up against downward current is harder
    if (sealVelocityY < -5 && forceY > 0) {
      forceY *= 1.3; // Swimming up against current is 30% harder
    }

    return {
      deltaX: forceX * 0.1, // Scale down for subtle effect
      deltaY: forceY * 0.1,
    };
  }

  /**
   * Get current at position
   */
  private getCurrentAtPosition(x: number, y: number): WaterCurrent | null {
    for (const current of this.currents) {
      if (
        x >= current.x &&
        x <= current.x + current.width &&
        y >= current.y &&
        y <= current.y + current.height
      ) {
        return current;
      }
    }
    return null;
  }

  /**
   * Update turbulence (call every frame)
   */
  update(time: number): void {
    if (time - this.lastTurbulenceUpdate > this.config.turbulenceFrequency) {
      this.turbulenceNoise = Math.random() * Math.PI * 2;
      this.lastTurbulenceUpdate = time;
    }

    if (this.showDebug) {
      this.updateCurrentVisuals();
    }
  }

  /**
   * Create visual indicators for currents (debug)
   */
  private createCurrentVisuals(): void {
    this.currents.forEach((current) => {
      const graphics = this.scene.add.graphics();
      graphics.setAlpha(0.3);
      graphics.setDepth(-25); // Behind everything

      this.currentVisuals.push(graphics);
    });
  }

  /**
   * Update current visualizations
   */
  private updateCurrentVisuals(): void {
    this.currents.forEach((current, index) => {
      const graphics = this.currentVisuals[index];
      if (!graphics) return;

      graphics.clear();

      // Color based on type
      let color: number;
      switch (current.type) {
        case CurrentType.GENTLE:
          color = 0x88ff88;
          break;
        case CurrentType.MODERATE:
          color = 0xffff88;
          break;
        case CurrentType.STRONG:
          color = 0xff8888;
          break;
        case CurrentType.TURBULENT:
          color = 0xff88ff;
          break;
      }

      graphics.fillStyle(color, 0.2);
      graphics.fillRect(current.x, current.y, current.width, current.height);

      // Draw force arrows
      const arrowCount = 5;
      const arrowSpacing = current.width / arrowCount;

      for (let i = 0; i < arrowCount; i++) {
        const arrowX = current.x + arrowSpacing * i + arrowSpacing / 2;
        const arrowY = current.y + current.height / 2;

        // Arrow direction based on force
        const arrowLength = Math.sqrt(current.forceX ** 2 + current.forceY ** 2) * 20;
        const angle = Math.atan2(current.forceY, current.forceX);

        const endX = arrowX + Math.cos(angle) * arrowLength;
        const endY = arrowY + Math.sin(angle) * arrowLength;

        graphics.lineStyle(2, color, 0.8);
        graphics.lineBetween(arrowX, arrowY, endX, endY);

        // Arrow head
        const headSize = 8;
        const headAngle1 = angle + Math.PI * 0.8;
        const headAngle2 = angle - Math.PI * 0.8;

        graphics.lineBetween(
          endX,
          endY,
          endX + Math.cos(headAngle1) * headSize,
          endY + Math.sin(headAngle1) * headSize
        );
        graphics.lineBetween(
          endX,
          endY,
          endX + Math.cos(headAngle2) * headSize,
          endY + Math.sin(headAngle2) * headSize
        );
      }
    });
  }

  /**
   * Toggle debug visualization
   */
  toggleDebug(): void {
    this.showDebug = !this.showDebug;

    if (this.showDebug && this.currentVisuals.length === 0) {
      this.createCurrentVisuals();
    } else if (!this.showDebug) {
      this.currentVisuals.forEach(g => g.destroy());
      this.currentVisuals = [];
    }
  }

  /**
   * Get current strength at position (for UI display)
   */
  getCurrentStrengthAtPosition(x: number, y: number): { strength: number; type: CurrentType } {
    const current = this.getCurrentAtPosition(x, y);
    if (!current) {
      return { strength: 0, type: CurrentType.GENTLE };
    }

    const strength = Math.sqrt(current.forceX ** 2 + current.forceY ** 2);
    return { strength, type: current.type };
  }

  /**
   * Modify current strength (for difficulty tuning)
   */
  setCurrentStrength(multiplier: number): void {
    this.config.currentStrength = Math.max(0, Math.min(2, multiplier));
  }

  /**
   * Enable/disable current system
   */
  setEnabled(enabled: boolean): void {
    this.config.enableCurrents = enabled;
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.currentVisuals.forEach(g => g.destroy());
    this.currentVisuals = [];
    this.currents = [];
  }
}
