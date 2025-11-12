/**
 * Score Manager System
 *
 * Manages game scoring, high score persistence, and score display.
 */

import Phaser from 'phaser';
import { storage } from '../utils/storage';
import { formatNumber } from '../utils/helpers';
import { UI_CONFIG } from '../config/constants';

export class ScoreManager {
  private scene: Phaser.Scene;
  private currentScore: number = 0;
  private highScore: number = 0;
  private scoreText?: Phaser.GameObjects.Text;
  private highScoreText?: Phaser.GameObjects.Text;
  private onScoreChange?: (score: number) => void;
  private lastMilestone: number = 0;
  private milestones: number[] = [5, 10, 25, 50, 100];

  constructor(scene: Phaser.Scene, onScoreChange?: (score: number) => void) {
    this.scene = scene;
    this.onScoreChange = onScoreChange;
    this.highScore = storage.getHighScore();
  }

  /**
   * Initialize score display
   */
  createScoreDisplay(): void {
    // Current score (large, centered at top)
    this.scoreText = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      50,
      '0',
      {
        fontSize: UI_CONFIG.FONTS.SCORE.SIZE,
        color: UI_CONFIG.COLORS.PRIMARY,
        fontFamily: UI_CONFIG.FONTS.SCORE.FAMILY,
        fontStyle: UI_CONFIG.FONTS.SCORE.STYLE,
        stroke: UI_CONFIG.COLORS.BACKGROUND,
        strokeThickness: 6,
      }
    ).setOrigin(0.5, 0).setDepth(100);

    // High score (smaller, top right)
    this.highScoreText = this.scene.add.text(
      this.scene.cameras.main.width - 20,
      20,
      `Best: ${formatNumber(this.highScore)}`,
      {
        fontSize: '20px',
        color: UI_CONFIG.COLORS.SECONDARY,
        fontFamily: UI_CONFIG.FONTS.BUTTON.FAMILY,
        stroke: UI_CONFIG.COLORS.BACKGROUND,
        strokeThickness: 4,
      }
    ).setOrigin(1, 0).setDepth(100);
  }

  /**
   * Add points to current score
   */
  addPoints(points: number): void {
    this.currentScore += points;
    this.updateDisplay();

    // Check and update high score
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      storage.setHighScore(this.highScore);

      // Visual feedback for new high score
      if (this.highScoreText) {
        this.scene.tweens.add({
          targets: this.highScoreText,
          scale: 1.2,
          duration: 200,
          yoyo: true,
          ease: 'Back.easeOut',
        });
      }
    }

    // Notify listeners
    if (this.onScoreChange) {
      this.onScoreChange(this.currentScore);
    }

    // Visual feedback for score increase
    if (this.scoreText) {
      this.scene.tweens.add({
        targets: this.scoreText,
        scale: 1.15,
        duration: 150,
        yoyo: true,
        ease: 'Back.easeOut',
      });
    }

    // Check for milestone celebrations
    this.checkMilestones();
  }

  /**
   * Check if player has reached any milestones
   */
  private checkMilestones(): void {
    for (const milestone of this.milestones) {
      if (this.currentScore >= milestone && this.lastMilestone < milestone) {
        this.lastMilestone = milestone;
        this.showMilestone(milestone);
        break; // Only show one milestone at a time
      }
    }
  }

  /**
   * Display milestone celebration
   */
  private showMilestone(milestone: number): void {
    let message = '';
    let color = '#ffaa00';

    if (milestone === 5) {
      message = '🌟 NICE START!';
      color = '#44ff44';
    } else if (milestone === 10) {
      message = '🔥 GETTING GOOD!';
      color = '#ffaa00';
    } else if (milestone === 25) {
      message = '⚡ ON FIRE!';
      color = '#ff6600';
    } else if (milestone === 50) {
      message = '💎 AMAZING!';
      color = '#00d4ff';
    } else if (milestone === 100) {
      message = '👑 LEGENDARY!';
      color = '#ffff00';
    }

    // Create milestone text
    const milestoneText = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      message,
      {
        fontSize: '48px',
        color: color,
        fontFamily: 'Arial',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 8,
      }
    ).setOrigin(0.5).setDepth(200).setScale(0);

    // Animate milestone appearance
    this.scene.tweens.add({
      targets: milestoneText,
      scale: 1.5,
      duration: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Hold for a moment
        this.scene.time.delayedCall(1000, () => {
          // Fade out and move up
          this.scene.tweens.add({
            targets: milestoneText,
            y: milestoneText.y - 100,
            alpha: 0,
            scale: 0.8,
            duration: 600,
            ease: 'Back.easeIn',
            onComplete: () => {
              milestoneText.destroy();
            },
          });
        });
      },
    });

    // Add screen flash
    this.scene.cameras.main.flash(200, 255, 200, 0, false, undefined, 0.3);

    // Add particles effect
    const particles = this.scene.add.particles(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      'particle',
      {
        speed: { min: 100, max: 300 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        lifespan: 1000,
        frequency: 20,
        quantity: 3,
        tint: parseInt(color.replace('#', '0x')),
      }
    ).setDepth(150);

    // Stop particles after a bit
    this.scene.time.delayedCall(500, () => {
      particles.stop();
      this.scene.time.delayedCall(1500, () => {
        particles.destroy();
      });
    });
  }

  /**
   * Update score display
   */
  private updateDisplay(): void {
    if (this.scoreText) {
      this.scoreText.setText(formatNumber(this.currentScore));
    }
    if (this.highScoreText) {
      this.highScoreText.setText(`Best: ${formatNumber(this.highScore)}`);
    }
  }

  /**
   * Get current score
   */
  getScore(): number {
    return this.currentScore;
  }

  /**
   * Get high score
   */
  getHighScore(): number {
    return this.highScore;
  }

  /**
   * Reset current score (for new game)
   */
  reset(): void {
    this.currentScore = 0;
    this.lastMilestone = 0; // Reset milestones for new game
    this.updateDisplay();
  }

  /**
   * Hide score display
   */
  hide(): void {
    if (this.scoreText) this.scoreText.setVisible(false);
    if (this.highScoreText) this.highScoreText.setVisible(false);
  }

  /**
   * Show score display
   */
  show(): void {
    if (this.scoreText) this.scoreText.setVisible(true);
    if (this.highScoreText) this.highScoreText.setVisible(true);
  }

  /**
   * Clean up
   */
  destroy(): void {
    if (this.scoreText) this.scoreText.destroy();
    if (this.highScoreText) this.highScoreText.destroy();
  }
}
