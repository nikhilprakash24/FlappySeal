/**
 * Seal Entity
 *
 * The player character - a seal with dual-control mechanics.
 * Handles physics, rendering, and input response.
 */

import Phaser from 'phaser';
import { SEAL_CONFIG } from '../config/constants';
import { clamp } from '../utils/helpers';
import type { Bounds } from '../types';

export class Seal {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  public x: number;
  public y: number;
  private velocity: number = 0;
  private rotation: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    // Create graphics object for rendering
    this.graphics = scene.add.graphics();
    this.draw();
  }

  /**
   * Draw the seal
   */
  private draw(): void {
    this.graphics.clear();

    // Seal body (dark gray)
    this.graphics.fillStyle(0x3a3a3a, 1);
    this.graphics.fillEllipse(this.x, this.y, 60, 35);

    // Seal head
    this.graphics.fillEllipse(this.x + 40, this.y - 5, 35, 30);

    // Flippers
    this.graphics.fillEllipse(this.x - 20, this.y + 15, 25, 15);
    this.graphics.fillEllipse(this.x + 10, this.y + 15, 25, 15);

    // Tail
    this.graphics.fillTriangle(
      this.x - 35, this.y - 10,
      this.x - 35, this.y + 10,
      this.x - 50, this.y
    );

    // Eye
    this.graphics.fillStyle(0xffffff, 1);
    this.graphics.fillCircle(this.x + 45, this.y - 10, 5);
    this.graphics.fillStyle(0x000000, 1);
    this.graphics.fillCircle(this.x + 47, this.y - 10, 3);

    // Nose
    this.graphics.fillStyle(0x000000, 1);
    this.graphics.fillCircle(this.x + 58, this.y, 3);

    // Whiskers
    this.graphics.lineStyle(1, 0x000000, 0.5);
    for (let i = -1; i <= 1; i++) {
      this.graphics.lineBetween(this.x + 55, this.y + i * 5, this.x + 70, this.y + i * 7);
    }

    // Apply rotation to graphics object
    this.graphics.setRotation(Phaser.Math.DegToRad(this.rotation));
  }

  /**
   * Apply upward force (swim up)
   */
  swimUp(): void {
    this.velocity = SEAL_CONFIG.SWIM_UP_FORCE;
  }

  /**
   * Apply downward force (dive)
   */
  dive(): void {
    this.velocity = SEAL_CONFIG.DIVE_DOWN_FORCE;
  }

  /**
   * Update physics and position
   */
  update(): void {
    // Apply gravity
    this.velocity += SEAL_CONFIG.GRAVITY;

    // Clamp velocity to max
    this.velocity = clamp(this.velocity, -SEAL_CONFIG.MAX_VELOCITY, SEAL_CONFIG.MAX_VELOCITY);

    // Update position
    this.y += this.velocity;

    // Update rotation based on velocity
    this.rotation = clamp(
      this.velocity * SEAL_CONFIG.ROTATION_SPEED,
      -SEAL_CONFIG.MAX_ROTATION,
      SEAL_CONFIG.MAX_ROTATION
    );

    // Redraw at new position and rotation
    this.draw();
  }

  /**
   * Get collision bounds
   */
  getBounds(): Bounds {
    return {
      x: this.x - SEAL_CONFIG.WIDTH / 2,
      y: this.y - SEAL_CONFIG.HEIGHT / 2,
      width: SEAL_CONFIG.WIDTH,
      height: SEAL_CONFIG.HEIGHT,
    };
  }

  /**
   * Check if seal hit top boundary
   */
  isHittingTop(): boolean {
    return this.y - SEAL_CONFIG.HEIGHT / 2 <= 0;
  }

  /**
   * Check if seal hit bottom boundary
   */
  isHittingBottom(): boolean {
    return this.y + SEAL_CONFIG.HEIGHT / 2 >= this.scene.cameras.main.height;
  }

  /**
   * Get current position
   */
  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Get current velocity
   */
  getVelocity(): number {
    return this.velocity;
  }

  /**
   * Reset to starting position
   */
  reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.velocity = 0;
    this.rotation = 0;
    this.draw();
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.graphics.destroy();
  }
}
