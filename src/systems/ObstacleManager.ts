/**
 * Obstacle Manager System
 *
 * Manages obstacle spawning, pooling, movement, and lifecycle.
 * Uses object pooling to avoid garbage collection spikes.
 */

import Phaser from 'phaser';
import { Obstacle } from '../entities/Obstacle';
import { OBSTACLE_CONFIG, GAME_CONFIG, SCORE_CONFIG } from '../config/constants';
import { ObstacleType } from '../types';
import { randomInt, randomFloat } from '../utils/helpers';
import { logger } from '../utils/logger';
import { errorHandler, ErrorSeverity } from '../utils/errorHandler';

export class ObstacleManager {
  private scene: Phaser.Scene;
  private obstacles: Obstacle[] = [];
  private obstaclePool: Obstacle[] = [];
  private lastSpawnTime: number = 0;
  private scrollSpeed: number = OBSTACLE_CONFIG.SCROLL_SPEED;
  private score: number = 0;
  private obstaclesPassed: number = 0; // NEW: Track obstacles for difficulty progression

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initialize();
  }

  /**
   * Initialize the obstacle system
   */
  private initialize(): void {
    // Pre-create some obstacles for the pool
    for (let i = 0; i < 5; i++) {
      const obstacle = this.createObstacle(GAME_CONFIG.WIDTH + 100, 300, 200, ObstacleType.CORAL);
      obstacle.hide(); // Hide but don't destroy graphics, ready for reuse
      this.obstaclePool.push(obstacle);
    }
  }

  /**
   * Create a new obstacle
   */
  private createObstacle(
    x: number,
    gapY: number,
    gapSize: number,
    type: ObstacleType
  ): Obstacle {
    return new Obstacle(this.scene, x, gapY, gapSize, type);
  }

  /**
   * Get an obstacle from the pool or create a new one
   */
  private getObstacle(x: number, gapY: number, gapSize: number, type: ObstacleType): Obstacle {
    if (this.obstaclePool.length > 0) {
      const obstacle = this.obstaclePool.pop()!;
      obstacle.reset(x, gapY, gapSize, type);
      return obstacle;
    }
    return this.createObstacle(x, gapY, gapSize, type);
  }

  /**
   * Return an obstacle to the pool
   */
  private returnToPool(obstacle: Obstacle): void {
    obstacle.hide(); // Hide but don't destroy, ready for reuse
    this.obstaclePool.push(obstacle);
  }

  /**
   * Calculate gap size based on progression (IMPROVED: Progressive difficulty)
   */
  private calculateGapSize(): number {
    // Start with very easy gaps, gradually reduce
    if (this.obstaclesPassed < SCORE_CONFIG.GRACE_PERIOD_OBSTACLES) {
      // First few obstacles are extra easy
      return OBSTACLE_CONFIG.STARTING_GAP;
    }

    // Gradually reduce gap size as player progresses
    const reduction = this.obstaclesPassed * OBSTACLE_CONFIG.GAP_REDUCTION_RATE;
    const targetGap = OBSTACLE_CONFIG.STARTING_GAP - reduction;

    // Clamp between MIN and MAX
    return Math.max(
      OBSTACLE_CONFIG.MIN_GAP,
      Math.min(OBSTACLE_CONFIG.MAX_GAP, targetGap)
    );
  }

  /**
   * Spawn a new obstacle
   */
  private spawnObstacle(): void {
    try {
      // Random gap position (avoid edges)
      const minGapY = 100;
      const maxGapY = GAME_CONFIG.HEIGHT - 100;
      const gapY = randomInt(minGapY, maxGapY);

      // Progressive gap size (starts easy, gets harder)
      const gapSize = this.calculateGapSize();

      // Validate gap values
      if (gapSize < 50 || gapSize > 500) {
        throw new Error(`Invalid gap size: ${gapSize}`);
      }

      // Random obstacle type
      const type = Math.random() < OBSTACLE_CONFIG.CORAL_CHANCE
        ? ObstacleType.CORAL
        : ObstacleType.JELLYFISH;

      // Spawn at right edge of screen
      const x = GAME_CONFIG.WIDTH + 50;

      const obstacle = this.getObstacle(x, gapY, gapSize, type);
      this.obstacles.push(obstacle);

      logger.debug('Obstacle spawned', { x, gapY, gapSize, type, obstaclesPassed: this.obstaclesPassed }, 'ObstacleManager');
    } catch (error) {
      errorHandler.handleError(
        'Failed to spawn obstacle',
        ErrorSeverity.MEDIUM,
        'ObstacleManager',
        error as Error
      );
      // Continue without spawning - game can proceed
    }
  }

  /**
   * Update all obstacles
   */
  update(time: number, sealX: number): number {
    try {
      let pointsEarned = 0;

      // Update scroll speed based on score (difficulty progression)
      this.updateScrollSpeed();

      // Initialize lastSpawnTime on first update to prevent immediate spawning
      if (this.lastSpawnTime === 0) {
        this.lastSpawnTime = time;
      }

      // Spawn new obstacles
      if (time - this.lastSpawnTime > OBSTACLE_CONFIG.SPAWN_INTERVAL) {
        this.spawnObstacle();
        this.lastSpawnTime = time;
      }

      // Update existing obstacles
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obstacle = this.obstacles[i];

        try {
          // Update position
          obstacle.update(this.scrollSpeed);

          // Check if passed by seal
          if (obstacle.hasPassed(sealX)) {
            pointsEarned += SCORE_CONFIG.POINTS_PER_OBSTACLE;
            this.obstaclesPassed++; // Track for difficulty progression
          }

          // Remove if off-screen
          if (obstacle.isOffScreen()) {
            this.obstacles.splice(i, 1);
            this.returnToPool(obstacle);
          }
        } catch (error) {
          // If single obstacle fails, remove it and continue
          logger.warn('Obstacle update failed, removing', error, 'ObstacleManager');
          this.obstacles.splice(i, 1);
          try {
            this.returnToPool(obstacle);
          } catch {
            // If can't return to pool, just remove
          }
        }
      }

      return pointsEarned;
    } catch (error) {
      errorHandler.handleError(
        'ObstacleManager update failed',
        ErrorSeverity.HIGH,
        'ObstacleManager',
        error as Error
      );
      return 0; // Return 0 points on error
    }
  }

  /**
   * Update scroll speed based on score (IMPROVED: Smooth progression with limits)
   */
  private updateScrollSpeed(): void {
    const speedIncrease =
      Math.floor(this.score / SCORE_CONFIG.SPEED_INCREASE_INTERVAL) *
      SCORE_CONFIG.SPEED_INCREASE_AMOUNT;

    // Apply min/max limits from OBSTACLE_CONFIG
    this.scrollSpeed = Math.max(
      OBSTACLE_CONFIG.MIN_SCROLL_SPEED,
      Math.min(
        OBSTACLE_CONFIG.MAX_SCROLL_SPEED,
        OBSTACLE_CONFIG.SCROLL_SPEED + speedIncrease
      )
    );
  }

  /**
   * Check collision with seal
   */
  checkCollision(sealX: number, sealY: number, sealWidth: number, sealHeight: number): boolean {
    // Validate seal bounds
    if (sealWidth <= 0 || sealHeight <= 0) {
      return false;
    }

    const sealBounds = {
      x: sealX,
      y: sealY,
      width: sealWidth,
      height: sealHeight,
    };

    for (const obstacle of this.obstacles) {
      // Skip obstacles that haven't reached the seal yet (with buffer)
      if (obstacle.x > sealX + sealWidth + 10) {
        continue;
      }

      // Skip obstacles that the seal has already passed (with buffer)
      if (obstacle.x + OBSTACLE_CONFIG.WIDTH + 10 < sealX) {
        continue;
      }

      // Check collision with top obstacle
      const topBounds = obstacle.getTopBounds();
      if (topBounds.height > 0 && this.boundsOverlap(sealBounds, topBounds)) {
        return true;
      }

      // Check collision with bottom obstacle
      const bottomBounds = obstacle.getBottomBounds();
      if (bottomBounds.height > 0 && this.boundsOverlap(sealBounds, bottomBounds)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Simple AABB collision detection
   */
  private boundsOverlap(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  /**
   * Update score (called from external score manager)
   */
  setScore(score: number): void {
    this.score = score;
  }

  /**
   * Get current scroll speed
   */
  getScrollSpeed(): number {
    return this.scrollSpeed;
  }

  /**
   * Reset the obstacle system
   */
  reset(): void {
    // Return all obstacles to pool
    for (const obstacle of this.obstacles) {
      this.returnToPool(obstacle);
    }
    this.obstacles = [];
    this.lastSpawnTime = 0;
    this.scrollSpeed = OBSTACLE_CONFIG.SCROLL_SPEED;
    this.score = 0;
    this.obstaclesPassed = 0; // Reset difficulty progression
  }

  /**
   * Clean up all obstacles
   */
  destroy(): void {
    for (const obstacle of this.obstacles) {
      obstacle.destroy();
    }
    for (const obstacle of this.obstaclePool) {
      obstacle.destroy();
    }
    this.obstacles = [];
    this.obstaclePool = [];
  }
}
