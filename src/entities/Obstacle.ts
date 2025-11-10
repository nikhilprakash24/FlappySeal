/**
 * Obstacle Entity
 *
 * Represents a single obstacle (coral or jellyfish) in the game.
 * Handles its own rendering and provides collision bounds.
 */

import Phaser from 'phaser';
import { OBSTACLE_CONFIG, GAME_CONFIG } from '../config/constants';
import { ObstacleType, type Bounds } from '../types';

export class Obstacle {
  private scene: Phaser.Scene;
  private topObstacle: Phaser.GameObjects.Graphics;
  private bottomObstacle: Phaser.GameObjects.Graphics;
  private type: ObstacleType;
  private gapY: number;
  private gapSize: number;
  private passed: boolean = false;

  public x: number;

  constructor(scene: Phaser.Scene, x: number, gapY: number, gapSize: number, type: ObstacleType) {
    this.scene = scene;
    this.x = x;
    this.gapY = gapY;
    this.gapSize = gapSize;
    this.type = type;

    // Create graphics objects for top and bottom obstacles
    this.topObstacle = scene.add.graphics();
    this.bottomObstacle = scene.add.graphics();

    this.draw();
  }

  /**
   * Draw the obstacle graphics
   */
  private draw(): void {
    const topHeight = this.gapY - this.gapSize / 2;
    const bottomY = this.gapY + this.gapSize / 2;
    const bottomHeight = GAME_CONFIG.HEIGHT - bottomY;

    // Clear previous drawings
    this.topObstacle.clear();
    this.bottomObstacle.clear();

    if (this.type === ObstacleType.CORAL) {
      this.drawCoral(this.topObstacle, this.x, 0, topHeight, false);
      this.drawCoral(this.bottomObstacle, this.x, bottomY, bottomHeight, true);
    } else {
      this.drawJellyfish(this.topObstacle, this.x, 0, topHeight, false);
      this.drawJellyfish(this.bottomObstacle, this.x, bottomY, bottomHeight, true);
    }
  }

  /**
   * Draw coral-style obstacle
   */
  private drawCoral(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    height: number,
    isBottom: boolean
  ): void {
    // Base coral color (dark pink/red)
    graphics.fillStyle(0xd54062, 1);

    // Main pillar
    const width = OBSTACLE_CONFIG.WIDTH;
    graphics.fillRect(x, y, width, height);

    // Add texture with branches
    graphics.fillStyle(0xe65a73, 1);
    const branchCount = Math.floor(height / 40);

    for (let i = 0; i < branchCount; i++) {
      const branchY = y + (height / branchCount) * i + 10;
      const branchWidth = 15;
      const branchHeight = 20;

      // Left branch
      graphics.fillEllipse(x - branchWidth / 2, branchY, branchWidth, branchHeight);
      // Right branch
      graphics.fillEllipse(x + width + branchWidth / 2, branchY, branchWidth, branchHeight);
    }

    // Add highlights
    graphics.fillStyle(0xf77794, 0.5);
    graphics.fillRect(x + 5, y, 10, height);

    // Base/tip decoration
    if (isBottom) {
      // Bottom has a base
      graphics.fillStyle(0xa0324a, 1);
      graphics.fillRect(x - 5, y, width + 10, 15);
    } else {
      // Top has pointed tip
      graphics.fillStyle(0xa0324a, 1);
      graphics.fillTriangle(
        x, y + height,
        x + width, y + height,
        x + width / 2, y + height + 15
      );
    }
  }

  /**
   * Draw jellyfish-style obstacle
   */
  private drawJellyfish(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    height: number,
    isBottom: boolean
  ): void {
    const width = OBSTACLE_CONFIG.WIDTH;
    const bellHeight = Math.min(60, height * 0.3);
    const bellY = isBottom ? y : y + height - bellHeight;

    // Jellyfish bell (translucent blue/purple)
    graphics.fillStyle(0x9b5de5, 0.8);
    graphics.fillEllipse(x + width / 2, bellY + bellHeight / 2, width, bellHeight);

    // Inner glow
    graphics.fillStyle(0xc77dff, 0.4);
    graphics.fillEllipse(x + width / 2, bellY + bellHeight / 2, width * 0.7, bellHeight * 0.7);

    // Tentacles
    graphics.lineStyle(3, 0x9b5de5, 0.6);
    const tentacleCount = 5;
    const tentacleLength = isBottom ? height - bellHeight : height - bellHeight;

    for (let i = 0; i < tentacleCount; i++) {
      const tentacleX = x + (width / (tentacleCount + 1)) * (i + 1);
      const startY = isBottom ? bellY + bellHeight : bellY;
      const endY = isBottom ? y + height : y;

      // Wavy tentacle path
      const path = new Phaser.Curves.Path(tentacleX, startY);
      const segments = 3;
      const segmentHeight = tentacleLength / segments;

      for (let j = 0; j < segments; j++) {
        const currentY = startY + (isBottom ? 1 : -1) * segmentHeight * j;
        const nextY = startY + (isBottom ? 1 : -1) * segmentHeight * (j + 1);
        const curveOffset = (i % 2 === 0 ? 5 : -5) * Math.sin(Date.now() / 500 + i);

        path.lineTo(tentacleX + curveOffset, (currentY + nextY) / 2);
        path.lineTo(tentacleX, nextY);
      }

      path.draw(graphics);
    }
  }

  /**
   * Update obstacle position
   */
  update(scrollSpeed: number): void {
    this.x -= scrollSpeed;
    this.draw();
  }

  /**
   * Check if obstacle is off-screen and can be removed
   */
  isOffScreen(): boolean {
    return this.x + OBSTACLE_CONFIG.WIDTH < 0;
  }

  /**
   * Check if seal has passed this obstacle
   */
  hasPassed(sealX: number): boolean {
    if (!this.passed && sealX > this.x + OBSTACLE_CONFIG.WIDTH) {
      this.passed = true;
      return true;
    }
    return false;
  }

  /**
   * Get collision bounds for top obstacle
   */
  getTopBounds(): Bounds {
    return {
      x: this.x,
      y: 0,
      width: OBSTACLE_CONFIG.WIDTH,
      height: this.gapY - this.gapSize / 2,
    };
  }

  /**
   * Get collision bounds for bottom obstacle
   */
  getBottomBounds(): Bounds {
    return {
      x: this.x,
      y: this.gapY + this.gapSize / 2,
      width: OBSTACLE_CONFIG.WIDTH,
      height: GAME_CONFIG.HEIGHT - (this.gapY + this.gapSize / 2),
    };
  }

  /**
   * Get bounds for the gap (safe zone)
   */
  getGapBounds(): Bounds {
    return {
      x: this.x,
      y: this.gapY - this.gapSize / 2,
      width: OBSTACLE_CONFIG.WIDTH,
      height: this.gapSize,
    };
  }

  /**
   * Destroy this obstacle and clean up
   */
  destroy(): void {
    this.topObstacle.destroy();
    this.bottomObstacle.destroy();
  }

  /**
   * Reset obstacle for object pooling
   */
  reset(x: number, gapY: number, gapSize: number, type: ObstacleType): void {
    this.x = x;
    this.gapY = gapY;
    this.gapSize = gapSize;
    this.type = type;
    this.passed = false;
    this.draw();
  }
}
