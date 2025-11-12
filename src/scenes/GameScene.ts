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
import { GameMode, GameModeType } from '../modes/GameMode';
import { EndlessMode } from '../modes/EndlessMode';
import { ChallengeMode } from '../modes/ChallengeMode';
import { TimeTrialMode } from '../modes/TimeTrialMode';
import { ZenMode } from '../modes/ZenMode';
import { SEAL_CONFIG, UI_CONFIG, GAME_CONFIG, AUDIO_CONFIG } from '../config/constants';
import { GameState } from '../types';
import { logger } from '../utils/logger';
import { errorHandler, ErrorSeverity } from '../utils/errorHandler';

export class GameScene extends Phaser.Scene {
  private seal?: Seal;
  private obstacleManager?: ObstacleManager;
  private scoreManager?: ScoreManager;
  private particleManager?: ParticleManager;
  private backgroundManager?: BackgroundManager;
  private audioManager?: AudioManager;
  private powerUpSystem?: PowerUpSystem;
  private gameMode?: GameMode;
  private modeUI: Phaser.GameObjects.GameObject[] = [];
  private gameState: GameState = GameState.PLAYING;
  private isGameStarted: boolean = false;

  // UI elements
  private titleText?: Phaser.GameObjects.Text;
  private instructionText?: Phaser.GameObjects.Text;
  private gameOverText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  /**
   * Initialize game mode from registry
   */
  private initializeGameMode(): void {
    const modeType = this.registry.get('gameMode') as GameModeType || GameModeType.ENDLESS;
    const challengeId = this.registry.get('challengeId') as string;

    switch (modeType) {
      case GameModeType.ENDLESS:
        this.gameMode = new EndlessMode(this);
        break;
      case GameModeType.CHALLENGE:
        this.gameMode = new ChallengeMode(this, challengeId);
        break;
      case GameModeType.TIME_TRIAL:
        this.gameMode = new TimeTrialMode(this);
        break;
      case GameModeType.ZEN:
        this.gameMode = new ZenMode(this);
        break;
      default:
        this.gameMode = new EndlessMode(this);
    }

    this.gameMode.init();
  }

  create(): void {
    try {
      logger.info('GameScene initializing', undefined, 'GameScene');

      // Initialize game mode from registry (or default to endless)
      this.initializeGameMode();

      // Initialize background manager (handles parallax and effects)
      this.backgroundManager = new BackgroundManager(this);

      // Initialize particle manager
      this.particleManager = new ParticleManager(this);

      // Initialize audio manager
      this.audioManager = new AudioManager(this);

      // Initialize power-up system (only if mode allows it)
      if (this.gameMode?.getRules().hasPowerUps) {
        this.powerUpSystem = new PowerUpSystem(this);
        this.setupPowerUpEvents();
      }

      // Initialize seal
      this.seal = new Seal(this, SEAL_CONFIG.START_X, SEAL_CONFIG.START_Y);

      // Initialize obstacle manager (only if mode has obstacles)
      if (this.gameMode?.getRules().hasObstacles) {
        this.obstacleManager = new ObstacleManager(this);
      }

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

      logger.info('GameScene initialized successfully', undefined, 'GameScene');
    } catch (error) {
      errorHandler.handleError(
        'Failed to initialize GameScene',
        ErrorSeverity.CRITICAL,
        'GameScene',
        error as Error
      );
      // Show error to user
      this.add.text(
        GAME_CONFIG.WIDTH / 2,
        GAME_CONFIG.HEIGHT / 2,
        'Failed to load game.\nPlease refresh the page.',
        {
          fontSize: '24px',
          color: '#ff0000',
          align: 'center',
        }
      ).setOrigin(0.5);
    }
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
      '⬆ UP Arrow / W = Swim Up  |  ⬇ DOWN Arrow / S = Dive Down\nor Left Click = Up  |  Right Click = Down\n\nPress Any Key or Click to Start!',
      {
        fontSize: '18px',
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

    // ESC key for pause/menu
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.gameState === GameState.PLAYING) {
        this.togglePause();
      } else if (this.gameState === GameState.GAME_OVER) {
        // Return to menu from game over screen
        this.cameras.main.fadeOut(300);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('MenuScene');
        });
      }
    });

    // Keyboard controls
    this.input.keyboard?.on('keydown-UP', () => {
      if (!this.isGameStarted) {
        this.startGame();
        return;
      }
      if (this.gameState === GameState.PLAYING && this.seal && this.particleManager) {
        this.seal.swimUp();
        this.particleManager.createSplash(this.seal.x, this.seal.y, true);
        this.particleManager.createBubbleStream(this.seal.x - 30, this.seal.y, 3);
        this.audioManager?.playSFX(AUDIO_CONFIG.SOUNDS.SWIM_UP);
      }
    });

    this.input.keyboard?.on('keydown-DOWN', () => {
      if (this.gameState === GameState.PLAYING && this.seal && this.particleManager) {
        this.seal.dive();
        this.particleManager.createSplash(this.seal.x, this.seal.y, false);
        this.particleManager.createBubbleStream(this.seal.x - 30, this.seal.y, 3);
        this.audioManager?.playSFX(AUDIO_CONFIG.SOUNDS.DIVE_DOWN);
      }
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      if (!this.isGameStarted) {
        this.startGame();
      } else if (this.gameState === GameState.GAME_OVER) {
        this.restartGame();
      }
    });

    // W/S keys as alternatives
    this.input.keyboard?.on('keydown-W', () => {
      if (!this.isGameStarted) {
        this.startGame();
        return;
      }
      if (this.gameState === GameState.PLAYING && this.seal && this.particleManager) {
        this.seal.swimUp();
        this.particleManager.createSplash(this.seal.x, this.seal.y, true);
        this.particleManager.createBubbleStream(this.seal.x - 30, this.seal.y, 3);
        this.audioManager?.playSFX(AUDIO_CONFIG.SOUNDS.SWIM_UP);
      }
    });

    this.input.keyboard?.on('keydown-S', () => {
      if (this.gameState === GameState.PLAYING && this.seal && this.particleManager) {
        this.seal.dive();
        this.particleManager.createSplash(this.seal.x, this.seal.y, false);
        this.particleManager.createBubbleStream(this.seal.x - 30, this.seal.y, 3);
        this.audioManager?.playSFX(AUDIO_CONFIG.SOUNDS.DIVE_DOWN);
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

    // Ensure seal is in valid starting position
    if (this.seal) {
      this.seal.reset(SEAL_CONFIG.START_X, SEAL_CONFIG.START_Y);
    }

    // Hide start screen UI
    this.titleText?.destroy();
    this.instructionText?.destroy();

    // Show score (not for zen mode as it's passive)
    if (this.gameMode?.getConfig().type !== GameModeType.ZEN) {
      this.scoreManager?.show();
    }

    // Create mode-specific UI
    if (this.gameMode) {
      this.modeUI = this.gameMode.getUI();
    }

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

    // Delayed game over sound and show results
    this.time.delayedCall(300, () => {
      this.audioManager?.playSFX(AUDIO_CONFIG.SOUNDS.GAME_OVER);
      // Show results screen after delay
      this.time.delayedCall(500, () => {
        this.showResults(false);
      });
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

    // Show final score with rating
    const finalScore = this.scoreManager?.getScore() || 0;
    let rating = '';
    let ratingColor = '#ffffff';

    if (finalScore < 5) {
      rating = 'Keep trying!';
      ratingColor = '#888888';
    } else if (finalScore < 10) {
      rating = 'Not bad!';
      ratingColor = '#44ff44';
    } else if (finalScore < 25) {
      rating = 'Good job!';
      ratingColor = '#ffaa00';
    } else if (finalScore < 50) {
      rating = 'Great!';
      ratingColor = '#ff6600';
    } else if (finalScore < 100) {
      rating = 'Impressive!';
      ratingColor = '#00d4ff';
    } else {
      rating = 'LEGENDARY!';
      ratingColor = '#ff00ff';
    }

    const finalScoreText = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2 + 10,
      `Score: ${finalScore}`,
      {
        fontSize: '48px',
        color: UI_CONFIG.COLORS.PRIMARY,
        fontStyle: 'bold',
        stroke: UI_CONFIG.COLORS.BACKGROUND,
        strokeThickness: 6,
      }
    ).setOrigin(0.5).setDepth(100);

    const ratingText = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2 + 60,
      rating,
      {
        fontSize: '24px',
        color: ratingColor,
        fontStyle: 'bold',
      }
    ).setOrigin(0.5).setDepth(100);

    // Show high score if new record
    if (this.scoreManager && this.scoreManager.getScore() === this.scoreManager.getHighScore() && finalScore > 0) {
      const newRecordText = this.add.text(
        GAME_CONFIG.WIDTH / 2,
        GAME_CONFIG.HEIGHT / 2 + 100,
        '🏆 NEW RECORD! 🏆',
        {
          fontSize: '28px',
          color: UI_CONFIG.COLORS.SUCCESS,
          fontStyle: 'bold',
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
    } else {
      // Show best score
      const bestText = this.add.text(
        GAME_CONFIG.WIDTH / 2,
        GAME_CONFIG.HEIGHT / 2 + 100,
        `Best: ${this.scoreManager?.getHighScore() || 0}`,
        {
          fontSize: '20px',
          color: '#aaaaaa',
        }
      ).setOrigin(0.5).setDepth(100);
    }

    // Action buttons (Restart and Menu)
    const buttonWidth = 180;
    const buttonHeight = 50;
    const buttonSpacing = 20;
    const buttonsY = GAME_CONFIG.HEIGHT - 100;
    const totalWidth = buttonWidth * 2 + buttonSpacing;
    const startX = (GAME_CONFIG.WIDTH - totalWidth) / 2;

    // Restart button
    const restartContainer = this.add.container(startX + buttonWidth / 2, buttonsY).setDepth(100);

    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x44ff44, 1);
    buttonBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
    buttonBg.lineStyle(3, 0xffffff, 1);
    buttonBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);

    const restartText = this.add.text(0, 0, '↻ Restart', {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    restartContainer.add([buttonBg, restartText]);
    restartContainer.setSize(buttonWidth, buttonHeight);
    restartContainer.setInteractive({ useHandCursor: true });

    // Restart hover effects
    restartContainer.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x55ff55, 1);
      buttonBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
      buttonBg.lineStyle(4, 0xffff00, 1);
      buttonBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
      this.tweens.add({
        targets: restartContainer,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100,
      });
    });

    restartContainer.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x44ff44, 1);
      buttonBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
      buttonBg.lineStyle(3, 0xffffff, 1);
      buttonBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
      this.tweens.add({
        targets: restartContainer,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
    });

    restartContainer.on('pointerdown', () => {
      this.cameras.main.shake(100, 0.01);
      this.restartGame();
    });

    // Menu button
    const menuContainer = this.add.container(startX + buttonWidth * 1.5 + buttonSpacing, buttonsY).setDepth(100);

    const menuBg = this.add.graphics();
    menuBg.fillStyle(0x4488ff, 1);
    menuBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
    menuBg.lineStyle(3, 0xffffff, 1);
    menuBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);

    const menuText = this.add.text(0, 0, '◄ Menu', {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    menuContainer.add([menuBg, menuText]);
    menuContainer.setSize(buttonWidth, buttonHeight);
    menuContainer.setInteractive({ useHandCursor: true });

    // Menu hover effects
    menuContainer.on('pointerover', () => {
      menuBg.clear();
      menuBg.fillStyle(0x5599ff, 1);
      menuBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
      menuBg.lineStyle(4, 0xffff00, 1);
      menuBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
      this.tweens.add({
        targets: menuContainer,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100,
      });
    });

    menuContainer.on('pointerout', () => {
      menuBg.clear();
      menuBg.fillStyle(0x4488ff, 1);
      menuBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
      menuBg.lineStyle(3, 0xffffff, 1);
      menuBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
      this.tweens.add({
        targets: menuContainer,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
    });

    menuContainer.on('pointerdown', () => {
      this.cameras.main.shake(100, 0.01);
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });

    // Pulse animation for both buttons
    this.tweens.add({
      targets: [restartContainer, menuContainer],
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Updated keyboard hint
    const hintText = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT - 40,
      'Press SPACE to Restart | ESC for Menu',
      {
        fontSize: '14px',
        color: '#aaaaaa',
        fontFamily: 'Arial',
      }
    ).setOrigin(0.5).setDepth(100);
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
  update(time: number, delta: number): void {
    if (this.gameState !== GameState.PLAYING || !this.seal) {
      return;
    }

    try {
      this.gameUpdate(time, delta);
    } catch (error) {
      errorHandler.handleError(
        'Critical error in game update loop',
        ErrorSeverity.CRITICAL,
        'GameScene',
        error as Error
      );
      // Trigger game over to prevent infinite error loop
      this.gameOver();
    }
  }

  /**
   * Toggle pause state
   */
  private togglePause(): void {
    if (this.gameState === GameState.PLAYING) {
      this.gameState = GameState.PAUSED;
      this.scene.pause();

      // Show pause UI
      const pauseOverlay = this.add.graphics().setDepth(200);
      pauseOverlay.fillStyle(0x000000, 0.7);
      pauseOverlay.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
      (pauseOverlay as any).name = 'pauseOverlay';

      const pauseText = this.add.text(
        GAME_CONFIG.WIDTH / 2,
        GAME_CONFIG.HEIGHT / 2,
        'PAUSED\n\nPress ESC to Resume',
        {
          fontSize: '48px',
          color: '#ffffff',
          fontStyle: 'bold',
          align: 'center',
        }
      ).setOrigin(0.5).setDepth(201);
      (pauseText as any).name = 'pauseText';
    } else if (this.gameState === GameState.PAUSED) {
      this.gameState = GameState.PLAYING;
      this.scene.resume();

      // Remove pause UI
      const pauseOverlay = this.children.getByName('pauseOverlay');
      const pauseText = this.children.getByName('pauseText');
      pauseOverlay?.destroy();
      pauseText?.destroy();
    }
  }

  /**
   * Core game update logic (separated for error handling)
   */
  private gameUpdate(time: number, delta: number): void {

    // Update game mode (important for time-based modes)
    if (this.gameMode) {
      this.gameMode.update(time, delta);

      // Check for mode completion
      if (this.gameMode.isComplete()) {
        this.onModeComplete();
        return;
      }

      // Check for mode failure
      if (this.gameMode.isFailed()) {
        this.gameOver();
        return;
      }
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

    // IMPROVED: Dynamic swim trail based on velocity
    if (this.particleManager) {
      const velocity = Math.abs(this.seal.getVelocity());

      // More frequent trails when moving fast
      if (time % (velocity > 5 ? 50 : 100) < 16) {
        this.particleManager.createTrail(this.seal.x - 30, this.seal.y);
      }

      // Extra bubble stream when diving or swimming fast
      if (velocity > 7 && time % 200 < 16) {
        this.particleManager.createBubbleStream(
          this.seal.x - 40,
          this.seal.y,
          2
        );
      }
    }

    // Check boundary collisions (unless ghost mode is active)
    const shouldCheckCollision = !this.powerUpSystem?.shouldIgnoreCollision();

    // Only check collisions if seal is in a valid state
    const sealBounds = this.seal.getBounds();
    const isValidSealPosition = sealBounds &&
      sealBounds.y > -50 &&
      sealBounds.y < GAME_CONFIG.HEIGHT + 50;

    if (shouldCheckCollision && isValidSealPosition) {
      if (this.seal.isHittingTop() || this.seal.isHittingBottom()) {
        this.handleCollision();
        return;
      }
    }

    // Update obstacles and check for points
    if (this.obstacleManager && this.scoreManager) {
      const pointsEarned = this.obstacleManager.update(time, this.seal.x);
      if (pointsEarned > 0) {
        // Apply score multiplier from power-ups
        const multiplier = this.powerUpSystem?.getScoreMultiplier() || 1;
        this.scoreManager.addPoints(pointsEarned * multiplier);

        // Update game mode score
        if (this.gameMode) {
          if ('updateScore' in this.gameMode) {
            (this.gameMode as any).updateScore(this.scoreManager.getScore());
          }
          if ('incrementObstacles' in this.gameMode) {
            (this.gameMode as any).incrementObstacles();
          }
        }

        // IMPROVED: More satisfying score feedback
        if (this.particleManager && this.seal) {
          // Score pop with particles
          this.particleManager.createScorePop(this.seal.x, this.seal.y);
          // Extra burst of bubbles
          this.particleManager.createBubbleStream(this.seal.x + 30, this.seal.y, 5);
        }

        // IMPROVED: Subtle screen shake for satisfaction
        this.cameras.main.shake(80, 0.003);

        // IMPROVED: Brief zoom pulse
        this.cameras.main.zoomTo(1.02, 50);
        this.time.delayedCall(50, () => {
          this.cameras.main.zoomTo(1.0, 100);
        });

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

    // IMPROVED: MUCH more dramatic collision feedback
    // Intense screen shake
    this.cameras.main.shake(500, 0.02);

    // Red flash + brief slowdown effect
    this.cameras.main.flash(250, 255, 0, 0, true);

    // Zoom in slightly on impact
    this.cameras.main.zoomTo(1.05, 100);
    this.time.delayedCall(100, () => {
      this.cameras.main.zoomTo(1.0, 300);
    });

    // Extra particle explosion
    if (this.particleManager && this.seal) {
      this.particleManager.createExplosion(this.seal.x, this.seal.y);
      // Secondary explosion burst
      this.time.delayedCall(100, () => {
        if (this.particleManager && this.seal) {
          this.particleManager.createExplosion(this.seal.x, this.seal.y);
        }
      });
    }

    // No shield - game over
    this.gameOver();
  }

  /**
   * Handle mode completion (for timed/objective modes)
   */
  private onModeComplete(): void {
    this.gameState = GameState.GAME_OVER;

    // Play success sound
    this.audioManager?.playSFX('mode_complete');

    // Show results screen
    this.showResults(true);
  }

  /**
   * Show results screen
   */
  private showResults(success: boolean): void {
    if (!this.gameMode) return;

    const results = this.gameMode.getResults();

    // Create results overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
    overlay.setDepth(200);

    // Results panel
    const panelWidth = 500;
    const panelHeight = 450;
    const panelX = (GAME_CONFIG.WIDTH - panelWidth) / 2;
    const panelY = (GAME_CONFIG.HEIGHT - panelHeight) / 2;

    const panel = this.add.graphics();
    const panelColor = success ? 0x2a5a2a : 0x5a2a2a;
    panel.fillStyle(panelColor, 1);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
    panel.lineStyle(4, success ? 0x44ff44 : 0xff4444, 1);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
    panel.setDepth(201);

    // Title
    const title = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      panelY + 40,
      success ? '🎉 Success!' : '💀 Game Over',
      {
        fontSize: '42px',
        color: success ? '#44ff44' : '#ff4444',
        fontStyle: 'bold',
        fontFamily: 'Arial',
      }
    ).setOrigin(0.5).setDepth(202);

    // Mode name
    const modeName = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      panelY + 90,
      this.gameMode.getConfig().name,
      {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial',
      }
    ).setOrigin(0.5).setDepth(202);

    // Score
    const scoreText = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      panelY + 140,
      `Score: ${results.score}`,
      {
        fontSize: '32px',
        color: '#ffaa00',
        fontStyle: 'bold',
        fontFamily: 'Arial',
      }
    ).setOrigin(0.5).setDepth(202);

    // Stars
    if (results.stars !== undefined) {
      const starsText = '⭐'.repeat(results.stars) + '☆'.repeat(3 - results.stars);
      this.add.text(
        GAME_CONFIG.WIDTH / 2,
        panelY + 190,
        starsText,
        {
          fontSize: '36px',
        }
      ).setOrigin(0.5).setDepth(202);
    }

    // Rewards
    let rewardY = panelY + 250;

    this.add.text(
      GAME_CONFIG.WIDTH / 2,
      rewardY,
      'Rewards:',
      {
        fontSize: '20px',
        color: '#aaaaaa',
        fontFamily: 'Arial',
      }
    ).setOrigin(0.5).setDepth(202);

    rewardY += 35;

    if (results.rewards.experience > 0) {
      this.add.text(
        GAME_CONFIG.WIDTH / 2,
        rewardY,
        `+${results.rewards.experience} XP`,
        {
          fontSize: '24px',
          color: '#88ff88',
          fontStyle: 'bold',
          fontFamily: 'Arial',
        }
      ).setOrigin(0.5).setDepth(202);
      rewardY += 35;
    }

    if (results.rewards.currency > 0) {
      this.add.text(
        GAME_CONFIG.WIDTH / 2,
        rewardY,
        `+${results.rewards.currency} 🐟`,
        {
          fontSize: '24px',
          color: '#ffff44',
          fontStyle: 'bold',
          fontFamily: 'Arial',
        }
      ).setOrigin(0.5).setDepth(202);
      rewardY += 35;
    }

    // Continue button
    const continueBtn = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      panelY + panelHeight - 50,
      'Continue',
      {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
        fontFamily: 'Arial',
        backgroundColor: '#4488ff',
        padding: { x: 30, y: 10 },
      }
    ).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });

    continueBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });

    // Animate results in
    this.tweens.add({
      targets: [panel, title, modeName, scoreText],
      alpha: { from: 0, to: 1 },
      y: { from: '-=20', to: '+=20' },
      duration: 500,
      ease: 'Cubic.easeOut',
    });
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
    this.gameMode?.destroy();
    this.modeUI.forEach(ui => ui.destroy());
    this.events.removeAllListeners();
    this.input.removeAllListeners();
  }
}
