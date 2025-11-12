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
   * Draw coral-style obstacle (IMPROVED: More vibrant, better variety)
   */
  private drawCoral(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    height: number,
    isBottom: boolean
  ): void {
    const width = OBSTACLE_CONFIG.WIDTH;

    // IMPROVED: Richer coral colors with more depth
    const baseColor = 0xff6b9d; // Brighter pink
    const highlightColor = 0xffb3d0; // Light pink
    const shadowColor = 0xc92a5d; // Dark pink
    const accentColor = 0xff8fb3; // Medium pink

    // Shadow layer for depth
    graphics.fillStyle(shadowColor, 1);
    graphics.fillRect(x + 3, y, width, height);

    // Main coral body
    graphics.fillStyle(baseColor, 1);
    graphics.fillRect(x, y, width, height);

    // IMPROVED: More organic branch pattern
    const branchCount = Math.floor(height / 35);
    for (let i = 0; i < branchCount; i++) {
      const branchY = y + (height / branchCount) * i + (Math.random() * 15);
      const branchSize = 12 + Math.random() * 8;
      const branchHeight = 18 + Math.random() * 10;

      // Accent color for branches
      graphics.fillStyle(accentColor, 1);

      // Left branches (varied sizes)
      graphics.fillEllipse(x - branchSize / 2, branchY, branchSize, branchHeight);
      // Right branches (varied sizes)
      graphics.fillEllipse(x + width + branchSize / 2, branchY, branchSize, branchHeight);

      // Add small polyps on branches
      graphics.fillStyle(highlightColor, 0.8);
      graphics.fillCircle(x - branchSize / 2, branchY, 4);
      graphics.fillCircle(x + width + branchSize / 2, branchY, 4);
    }

    // IMPROVED: Better highlights with gradient effect
    graphics.fillStyle(highlightColor, 0.6);
    graphics.fillRect(x + 4, y, 12, height);

    // Additional texture dots
    graphics.fillStyle(highlightColor, 0.4);
    for (let i = 0; i < height; i += 20) {
      graphics.fillCircle(x + width / 2, y + i, 3);
    }

    // Base/tip decoration (more dramatic)
    if (isBottom) {
      // Bottom has wider, organic base
      graphics.fillStyle(shadowColor, 1);
      graphics.fillRoundedRect(x - 8, y, width + 16, 20, 8);
      graphics.fillStyle(baseColor, 0.8);
      graphics.fillRoundedRect(x - 6, y + 2, width + 12, 16, 6);
    } else {
      // Top has dramatic pointed tip
      graphics.fillStyle(shadowColor, 1);
      graphics.fillTriangle(
        x - 2, y + height,
        x + width + 2, y + height,
        x + width / 2, y + height + 20
      );
      graphics.fillStyle(baseColor, 0.9);
      graphics.fillTriangle(
        x, y + height,
        x + width, y + height,
        x + width / 2, y + height + 18
      );
    }
  }

  /**
   * Draw jellyfish-style obstacle (IMPROVED: More dramatic, better animation)
   */
  private drawJellyfish(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    height: number,
    isBottom: boolean
  ): void {
    const width = OBSTACLE_CONFIG.WIDTH;
    const bellHeight = Math.min(80, height * 0.35);
    const bellY = isBottom ? y : y + height - bellHeight;

    // IMPROVED: More vibrant jellyfish colors
    const bellColor = 0x7c3aed; // Deep purple
    const glowColor = 0xc084fc; // Light purple
    const tentacleColor = 0x9333ea; // Medium purple
    const accentColor = 0xe9d5ff; // Very light purple

    // Outer glow effect
    graphics.fillStyle(glowColor, 0.2);
    graphics.fillEllipse(x + width / 2, bellY + bellHeight / 2, width + 20, bellHeight + 20);

    // Main bell (larger, more dramatic)
    graphics.fillStyle(bellColor, 0.85);
    graphics.fillEllipse(x + width / 2, bellY + bellHeight / 2, width, bellHeight);

    // Multiple glow layers for depth
    graphics.fillStyle(glowColor, 0.5);
    graphics.fillEllipse(x + width / 2, bellY + bellHeight / 2, width * 0.75, bellHeight * 0.75);

    graphics.fillStyle(accentColor, 0.6);
    graphics.fillEllipse(x + width / 2, bellY + bellHeight / 2, width * 0.5, bellHeight * 0.5);

    // IMPROVED: More tentacles with varied thickness
    const tentacleCount = 7;
    const tentacleLength = isBottom ? height - bellHeight : height - bellHeight;
    const time = Date.now() / 400; // Animation speed

    for (let i = 0; i < tentacleCount; i++) {
      const tentacleX = x + (width / (tentacleCount + 1)) * (i + 1);
      const startY = isBottom ? bellY + bellHeight : bellY;

      // Varied tentacle thickness
      const thickness = i === Math.floor(tentacleCount / 2) ? 5 : (i % 2 === 0 ? 4 : 3);
      graphics.lineStyle(thickness, tentacleColor, 0.7);

      // IMPROVED: More organic wavy animation
      const path = new Phaser.Curves.Path(tentacleX, startY);
      const segments = 4;
      const segmentHeight = tentacleLength / segments;

      for (let j = 0; j < segments; j++) {
        const progress = j / segments;
        const currentY = startY + (isBottom ? 1 : -1) * segmentHeight * j;
        const nextY = startY + (isBottom ? 1 : -1) * segmentHeight * (j + 1);

        // More dynamic wave with multiple frequencies
        const waveOffset =
          Math.sin(time + i * 0.8 + progress * 2) * 6 +
          Math.sin(time * 1.5 + i * 1.2) * 3;

        path.lineTo(tentacleX + waveOffset, (currentY + nextY) / 2);
        path.lineTo(tentacleX - waveOffset / 2, nextY);
      }

      path.draw(graphics);

      // Add glowing dots along tentacles
      graphics.fillStyle(accentColor, 0.6);
      for (let j = 1; j < segments; j++) {
        const dotY = startY + (isBottom ? 1 : -1) * segmentHeight * j;
        graphics.fillCircle(tentacleX, dotY, 2.5);
      }
    }

    // IMPROVED: Bell rim detail
    graphics.lineStyle(3, accentColor, 0.5);
    const rimY = isBottom ? bellY + bellHeight : bellY;
    graphics.strokeEllipse(x + width / 2, rimY, width * 0.9, 15);
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
   * Hide obstacle and prepare for pooling (don't destroy graphics)
   */
  hide(): void {
    this.topObstacle.clear();
    this.bottomObstacle.clear();
    this.topObstacle.setVisible(false);
    this.bottomObstacle.setVisible(false);
  }

  /**
   * Show obstacle (make visible)
   */
  private show(): void {
    this.topObstacle.setVisible(true);
    this.bottomObstacle.setVisible(true);
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
    this.show();
    this.draw();
  }
}
