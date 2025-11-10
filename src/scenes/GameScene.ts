/**
 * Main Game Scene
 *
 * Core gameplay scene with obstacle system, collision detection, and scoring.
 */

import Phaser from 'phaser';
import { Seal } from '../entities/Seal';
import { ObstacleManager } from '../systems/ObstacleManager';
import { ScoreManager } from '../systems/ScoreManager';
import { ParticleManager } from '../systems/ParticleManager';
import { BackgroundManager } from '../systems/BackgroundManager';
import { AudioManager } from '../systems/AudioManager';
import { PowerUpSystem, PowerUpType } from '../systems/PowerUpSystem';
import { SEAL_CONFIG, UI_CONFIG, GAME_CONFIG, AUDIO_CONFIG } from '../config/constants';
import { GameState } from '../types';

export class GameScene extends Phaser.Scene {
  private seal?: Seal;
  private obstacleManager?: ObstacleManager;
  private scoreManager?: ScoreManager;
  private particleManager?: ParticleManager;
  private backgroundManager?: BackgroundManager;
  private audioManager?: AudioManager;
  private powerUpSystem?: PowerUpSystem;
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
    // Initialize background manager (handles parallax and effects)
    this.backgroundManager = new BackgroundManager(this);

    // Initialize particle manager
    this.particleManager = new ParticleManager(this);

    // Initialize audio manager
    this.audioManager = new AudioManager(this);

    // Initialize power-up system (v0.2)
    this.powerUpSystem = new PowerUpSystem(this);
    this.setupPowerUpEvents();

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

      if (this.gameState === GameState.PLAYING && this.seal && this.particleManager) {
        const centerX = this.cameras.main.width / 2;

        if (pointer.x < centerX) {
          // Left side: Swim up
          this.seal.swimUp();
          this.particleManager.createSplash(this.seal.x, this.seal.y, true);
          this.particleManager.createBubbleStream(this.seal.x - 30, this.seal.y, 3);
          this.audioManager?.playSFX(AUDIO_CONFIG.SOUNDS.SWIM_UP);
        } else {
          // Right side: Dive down
          this.seal.dive();
          this.particleManager.createSplash(this.seal.x, this.seal.y, false);
          this.particleManager.createBubbleStream(this.seal.x - 30, this.seal.y, 3);
          this.audioManager?.playSFX(AUDIO_CONFIG.SOUNDS.DIVE_DOWN);
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
   * Setup power-up event listeners
   */
  private setupPowerUpEvents(): void {
    // Power-up collected
    this.events.on('powerup-collected', (data: any) => {
      if (this.particleManager) {
        this.particleManager.createExplosion(data.x, data.y);
        this.particleManager.createScorePop(data.x, data.y);
      }
      this.audioManager?.playSFX('powerup_collect');
    });

    // Power-up activated
    this.events.on('powerup-activated', (data: any) => {
      this.audioManager?.playSFX('powerup_activate');
    });

    // Power-up expired
    this.events.on('powerup-expired', (data: any) => {
      this.audioManager?.playSFX('powerup_end');
    });
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

    // Start music
    this.audioManager?.playMusic();
  }

  /**
   * Handle game over
   */
  private gameOver(): void {
    this.gameState = GameState.GAME_OVER;

    // Play collision sound
    this.audioManager?.playSFX(AUDIO_CONFIG.SOUNDS.COLLISION);

    // Create collision explosion effect
    if (this.seal && this.particleManager) {
      this.particleManager.createExplosion(this.seal.x, this.seal.y);
    }

    // Delayed game over sound
    this.time.delayedCall(300, () => {
      this.audioManager?.playSFX(AUDIO_CONFIG.SOUNDS.GAME_OVER);
    });

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
    this.powerUpSystem?.reset();

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

    // Update power-up system
    if (this.powerUpSystem) {
      const sealBounds = this.seal.getBounds();
      this.powerUpSystem.update(
        time,
        this.seal.x,
        this.seal.y,
        sealBounds.width,
        sealBounds.height
      );
    }

    // Update seal physics
    this.seal.update();

    // Create swim trail effect
    if (this.particleManager && time % 100 < 16) {
      this.particleManager.createTrail(this.seal.x - 30, this.seal.y);
    }

    // Check boundary collisions (unless ghost mode is active)
    const shouldCheckCollision = !this.powerUpSystem?.shouldIgnoreCollision();
    if (shouldCheckCollision && (this.seal.isHittingTop() || this.seal.isHittingBottom())) {
      this.handleCollision();
      return;
    }

    // Update obstacles and check for points
    if (this.obstacleManager && this.scoreManager) {
      const pointsEarned = this.obstacleManager.update(time, this.seal.x);
      if (pointsEarned > 0) {
        // Apply score multiplier from power-ups
        const multiplier = this.powerUpSystem?.getScoreMultiplier() || 1;
        this.scoreManager.addPoints(pointsEarned * multiplier);
        // Create score celebration effect
        if (this.particleManager) {
          this.particleManager.createScorePop(this.seal.x, this.seal.y);
        }
        // Play score sound
        this.audioManager?.playSFX(AUDIO_CONFIG.SOUNDS.SCORE);
      }

      // Update parallax background
      if (this.backgroundManager) {
        this.backgroundManager.update(this.obstacleManager.getScrollSpeed());
      }

      // Check obstacle collisions (with modified hitbox from power-ups)
      const sealBounds = this.seal.getBounds();
      const hitboxScale = this.powerUpSystem?.getHitboxScale() || 1.0;
      const scaledWidth = sealBounds.width * hitboxScale;
      const scaledHeight = sealBounds.height * hitboxScale;

      const collision = this.obstacleManager.checkCollision(
        sealBounds.x + (sealBounds.width - scaledWidth) / 2,
        sealBounds.y + (sealBounds.height - scaledHeight) / 2,
        scaledWidth,
        scaledHeight
      );

      if (collision && shouldCheckCollision) {
        this.handleCollision();
        return;
      }
    }
  }

  /**
   * Handle collision (check for shield, then game over)
   */
  private handleCollision(): void {
    // Check if shield is active
    if (this.powerUpSystem?.isActive(PowerUpType.SHIELD)) {
      // Use shield to absorb collision
      this.powerUpSystem.usePowerUp(PowerUpType.SHIELD);

      // Visual feedback - flash and sound
      if (this.particleManager && this.seal) {
        this.particleManager.createExplosion(this.seal.x, this.seal.y);
      }
      this.audioManager?.playSFX('shield_break');

      // Camera shake for impact
      this.cameras.main.shake(200, 0.01);

      return; // Survive the collision
    }

    // No shield - game over
    this.gameOver();
  }

  /**
   * Clean up when scene is shut down
   */
  shutdown(): void {
    this.seal?.destroy();
    this.obstacleManager?.destroy();
    this.scoreManager?.destroy();
    this.particleManager?.destroy();
    this.backgroundManager?.destroy();
    this.audioManager?.destroy();
    this.powerUpSystem?.destroy();
    this.events.removeAllListeners();
    this.input.removeAllListeners();
  }
}
