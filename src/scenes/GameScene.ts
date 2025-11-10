/**
 * Main Game Scene
 *
 * Core gameplay scene with obstacle system, collision detection, and scoring.
 */

import Phaser from 'phaser';
import { Seal } from '../entities/Seal';
import { ObstacleManager } from '../systems/ObstacleManager';
import { ScoreManager } from '../systems/ScoreManager';
import { SEAL_CONFIG, UI_CONFIG, GAME_CONFIG } from '../config/constants';
import { GameState } from '../types';

export class GameScene extends Phaser.Scene {
  private seal?: Seal;
  private obstacleManager?: ObstacleManager;
  private scoreManager?: ScoreManager;
  private gameState: GameState = GameState.PLAYING;
  private isGameStarted: boolean = false;

  // UI elements
  private titleText?: Phaser.GameObjects.Text;
  private instructionText?: Phaser.GameObjects.Text;
  private gameOverText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Create underwater background
    this.createWaterEffect();

    // Create bubble animation
    this.createBubbleSystem();

    // Initialize seal
    this.seal = new Seal(this, SEAL_CONFIG.START_X, SEAL_CONFIG.START_Y);

    // Initialize obstacle manager
    this.obstacleManager = new ObstacleManager(this);

    // Initialize score manager
    this.scoreManager = new ScoreManager(this, (score) => {
      // Update obstacle manager with current score for difficulty scaling
      this.obstacleManager?.setScore(score);
    });
    this.scoreManager.createScoreDisplay();
    this.scoreManager.hide(); // Hide until game starts

    // Create start screen UI
    this.createStartScreen();

    // Setup controls
    this.setupControls();
  }

  /**
   * Create underwater visual effects
   */
  private createWaterEffect(): void {
    // Depth layers
    this.add.rectangle(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2,
      GAME_CONFIG.WIDTH,
      GAME_CONFIG.HEIGHT,
      0x0a4f6e,
      0.3
    );

    this.add.rectangle(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2,
      GAME_CONFIG.WIDTH,
      GAME_CONFIG.HEIGHT,
      0x0d5f7e,
      0.2
    );

    // Animated light rays
    for (let i = 0; i < 5; i++) {
      const ray = this.add.rectangle(
        100 + i * 180,
        -100,
        40,
        800,
        0xffffff,
        0.05
      ).setAngle(15);

      this.tweens.add({
        targets: ray,
        alpha: 0.1,
        duration: 3000 + i * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  /**
   * Create ambient bubble system
   */
  private createBubbleSystem(): void {
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        const bubble = this.add.graphics();
        const x = Phaser.Math.Between(50, GAME_CONFIG.WIDTH - 50);
        const y = GAME_CONFIG.HEIGHT + 20;
        const size = Phaser.Math.Between(5, 15);

        bubble.fillStyle(0xffffff, 0.3);
        bubble.fillCircle(x, y, size);

        this.tweens.add({
          targets: bubble,
          y: -50,
          x: x + Phaser.Math.Between(-30, 30),
          alpha: 0,
          duration: Phaser.Math.Between(3000, 5000),
          ease: 'Sine.easeInOut',
          onComplete: () => {
            bubble.destroy();
          },
        });
      },
      callbackScope: this,
      loop: true,
    });
  }

  /**
   * Create start screen UI
   */
  private createStartScreen(): void {
    // Title
    this.titleText = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      100,
      'FlappySeal 🦭',
      {
        fontSize: UI_CONFIG.FONTS.TITLE.SIZE,
        color: UI_CONFIG.COLORS.PRIMARY,
        fontStyle: UI_CONFIG.FONTS.TITLE.STYLE,
        fontFamily: UI_CONFIG.FONTS.TITLE.FAMILY,
        stroke: UI_CONFIG.COLORS.BACKGROUND,
        strokeThickness: 6,
      }
    ).setOrigin(0.5).setDepth(100);

    // Floating animation
    this.tweens.add({
      targets: this.titleText,
      y: 90,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Instructions
    this.instructionText = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT - 100,
      'Left Click: Swim Up | Right Click: Dive Down\n\nClick to Start!',
      {
        fontSize: '20px',
        color: UI_CONFIG.COLORS.PRIMARY,
        stroke: UI_CONFIG.COLORS.BACKGROUND,
        strokeThickness: 4,
        align: 'center',
      }
    ).setOrigin(0.5).setDepth(100);

    // Pulse animation
    this.tweens.add({
      targets: this.instructionText,
      alpha: 0.6,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Setup input controls
   */
  private setupControls(): void {
    // Mouse/Touch controls
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isGameStarted) {
        this.startGame();
        return;
      }

      if (this.gameState === GameState.GAME_OVER) {
        this.restartGame();
        return;
      }

      if (this.gameState === GameState.PLAYING && this.seal) {
        const centerX = this.cameras.main.width / 2;

        if (pointer.x < centerX) {
          // Left side: Swim up
          this.seal.swimUp();
          this.createSplashEffect(this.seal.x, this.seal.y, true);
        } else {
          // Right side: Dive down
          this.seal.dive();
          this.createSplashEffect(this.seal.x, this.seal.y, false);
        }
      }
    });

    // Keyboard controls
    this.input.keyboard?.on('keydown-UP', () => {
      if (this.gameState === GameState.PLAYING && this.seal) {
        this.seal.swimUp();
      }
    });

    this.input.keyboard?.on('keydown-DOWN', () => {
      if (this.gameState === GameState.PLAYING && this.seal) {
        this.seal.dive();
      }
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      if (!this.isGameStarted) {
        this.startGame();
      } else if (this.gameState === GameState.GAME_OVER) {
        this.restartGame();
      }
    });
  }

  /**
   * Create splash particle effect
   */
  private createSplashEffect(x: number, y: number, isUp: boolean): void {
    const graphics = this.add.graphics();
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
      const angle = isUp
        ? Phaser.Math.Between(45, 135)
        : Phaser.Math.Between(225, 315);

      const speed = Phaser.Math.Between(50, 100);
      const size = Phaser.Math.Between(2, 5);

      graphics.fillStyle(0xffffff, 0.5);
      graphics.fillCircle(x, y, size);

      const radians = Phaser.Math.DegToRad(angle);
      const vx = Math.cos(radians) * speed;
      const vy = Math.sin(radians) * speed;

      this.tweens.add({
        targets: graphics,
        x: x + vx,
        y: y + vy,
        alpha: 0,
        duration: 500,
        onComplete: () => graphics.destroy(),
      });
    }
  }

  /**
   * Start the game
   */
  private startGame(): void {
    this.isGameStarted = true;
    this.gameState = GameState.PLAYING;

    // Hide start screen UI
    this.titleText?.destroy();
    this.instructionText?.destroy();

    // Show score
    this.scoreManager?.show();
  }

  /**
   * Handle game over
   */
  private gameOver(): void {
    this.gameState = GameState.GAME_OVER;

    // Game over text
    this.gameOverText = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2 - 50,
      'Game Over!',
      {
        fontSize: '64px',
        color: UI_CONFIG.COLORS.DANGER,
        fontStyle: 'bold',
        stroke: UI_CONFIG.COLORS.BACKGROUND,
        strokeThickness: 8,
      }
    ).setOrigin(0.5).setDepth(100);

    // Scale in animation
    this.gameOverText.setScale(0);
    this.tweens.add({
      targets: this.gameOverText,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
    });

    // Show final score
    const finalScoreText = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2 + 30,
      `Score: ${this.scoreManager?.getScore() || 0}`,
      {
        fontSize: '32px',
        color: UI_CONFIG.COLORS.PRIMARY,
        stroke: UI_CONFIG.COLORS.BACKGROUND,
        strokeThickness: 6,
      }
    ).setOrigin(0.5).setDepth(100);

    // Show high score if new record
    if (this.scoreManager && this.scoreManager.getScore() === this.scoreManager.getHighScore()) {
      const newRecordText = this.add.text(
        GAME_CONFIG.WIDTH / 2,
        GAME_CONFIG.HEIGHT / 2 + 70,
        '🏆 New Record! 🏆',
        {
          fontSize: '24px',
          color: UI_CONFIG.COLORS.SUCCESS,
          stroke: UI_CONFIG.COLORS.BACKGROUND,
          strokeThickness: 4,
        }
      ).setOrigin(0.5).setDepth(100);

      this.tweens.add({
        targets: newRecordText,
        scale: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    // Restart instruction
    const restartText = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT - 80,
      'Click to Restart',
      {
        fontSize: '20px',
        color: UI_CONFIG.COLORS.SECONDARY,
        stroke: UI_CONFIG.COLORS.BACKGROUND,
        strokeThickness: 4,
      }
    ).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: restartText,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Restart the game
   */
  private restartGame(): void {
    // Clean up game over UI
    this.children.getChildren().forEach((child) => {
      if (child.depth === 100) {
        child.destroy();
      }
    });

    // Reset all systems
    this.seal?.reset(SEAL_CONFIG.START_X, SEAL_CONFIG.START_Y);
    this.obstacleManager?.reset();
    this.scoreManager?.reset();
    this.scoreManager?.show();

    // Reset state
    this.gameState = GameState.PLAYING;
    this.isGameStarted = true;
  }

  /**
   * Main game loop
   */
  update(time: number): void {
    if (this.gameState !== GameState.PLAYING || !this.seal) {
      return;
    }

    // Update seal physics
    this.seal.update();

    // Check boundary collisions
    if (this.seal.isHittingTop() || this.seal.isHittingBottom()) {
      this.gameOver();
      return;
    }

    // Update obstacles and check for points
    if (this.obstacleManager && this.scoreManager) {
      const pointsEarned = this.obstacleManager.update(time, this.seal.x);
      if (pointsEarned > 0) {
        this.scoreManager.addPoints(pointsEarned);
      }

      // Check obstacle collisions
      const sealBounds = this.seal.getBounds();
      const collision = this.obstacleManager.checkCollision(
        sealBounds.x,
        sealBounds.y,
        sealBounds.width,
        sealBounds.height
      );

      if (collision) {
        this.gameOver();
        return;
      }
    }
  }

  /**
   * Clean up when scene is shut down
   */
  shutdown(): void {
    this.seal?.destroy();
    this.obstacleManager?.destroy();
    this.scoreManager?.destroy();
    this.input.removeAllListeners();
  }
}
