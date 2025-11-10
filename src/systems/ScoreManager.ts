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
