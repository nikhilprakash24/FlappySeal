/**
 * Tutorial Overlay System
 *
 * Provides first-time player onboarding with interactive visual cues.
 * Shows controls, demonstrates mechanics, and tracks tutorial completion.
 */

import Phaser from 'phaser';
import { storage } from '../utils/storage';
import { UI_CONFIG, GAME_CONFIG } from '../config/constants';

export enum TutorialStep {
  WELCOME = 'welcome',
  SWIM_UP = 'swim_up',
  DIVE_DOWN = 'dive_down',
  AVOID_OBSTACLES = 'avoid_obstacles',
  SCORE_POINTS = 'score_points',
  COMPLETE = 'complete',
}

interface TutorialStepConfig {
  title: string;
  description: string;
  action: string;
  position: { x: number; y: number };
  arrow?: 'up' | 'down' | 'left' | 'right';
  highlight?: { x: number; y: number; width: number; height: number };
}

export class TutorialOverlay {
  private scene: Phaser.Scene;
  private container?: Phaser.GameObjects.Container;
  private currentStep: TutorialStep = TutorialStep.WELCOME;
  private isActive: boolean = false;
  private isComplete: boolean = false;
  private actionCount: number = 0;

  // UI elements
  private overlay?: Phaser.GameObjects.Graphics;
  private panel?: Phaser.GameObjects.Graphics;
  private titleText?: Phaser.GameObjects.Text;
  private descriptionText?: Phaser.GameObjects.Text;
  private actionText?: Phaser.GameObjects.Text;
  private arrow?: Phaser.GameObjects.Graphics;
  private skipButton?: Phaser.GameObjects.Container;

  // Tutorial step configurations
  private stepConfigs: Record<TutorialStep, TutorialStepConfig> = {
    [TutorialStep.WELCOME]: {
      title: 'Welcome to FlappySeal! 🦭',
      description: 'Navigate through obstacles to score points.\nAvoid hitting pipes or boundaries!',
      action: 'Tap anywhere to continue',
      position: { x: GAME_CONFIG.WIDTH / 2, y: GAME_CONFIG.HEIGHT / 2 },
    },
    [TutorialStep.SWIM_UP]: {
      title: 'Swim Up ⬆️',
      description: 'Tap the LEFT side of the screen to swim upward.',
      action: 'Try it! Tap the left side 3 times',
      position: { x: GAME_CONFIG.WIDTH / 4, y: GAME_CONFIG.HEIGHT / 2 },
      arrow: 'up',
      highlight: { x: 0, y: 0, width: GAME_CONFIG.WIDTH / 2, height: GAME_CONFIG.HEIGHT },
    },
    [TutorialStep.DIVE_DOWN]: {
      title: 'Dive Down ⬇️',
      description: 'Tap the RIGHT side of the screen to dive downward.',
      action: 'Try it! Tap the right side 3 times',
      position: { x: (GAME_CONFIG.WIDTH / 4) * 3, y: GAME_CONFIG.HEIGHT / 2 },
      arrow: 'down',
      highlight: { x: GAME_CONFIG.WIDTH / 2, y: 0, width: GAME_CONFIG.WIDTH / 2, height: GAME_CONFIG.HEIGHT },
    },
    [TutorialStep.AVOID_OBSTACLES]: {
      title: 'Avoid Obstacles 🚧',
      description: 'Navigate through the gaps in the pipes.\nColliding with anything ends the game!',
      action: 'Stay alert and keep moving!',
      position: { x: GAME_CONFIG.WIDTH / 2, y: GAME_CONFIG.HEIGHT / 3 },
      arrow: 'right',
    },
    [TutorialStep.SCORE_POINTS]: {
      title: 'Score Points 🏆',
      description: 'You earn points by passing through obstacles.\nThe higher your score, the better!',
      action: 'Good luck!',
      position: { x: GAME_CONFIG.WIDTH / 2, y: GAME_CONFIG.HEIGHT / 4 },
    },
    [TutorialStep.COMPLETE]: {
      title: 'Ready to Play! 🎮',
      description: 'You\'ve completed the tutorial.\nPress D to toggle debug controls anytime.',
      action: 'Tap to start your first game!',
      position: { x: GAME_CONFIG.WIDTH / 2, y: GAME_CONFIG.HEIGHT / 2 },
    },
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.isComplete = storage.getTutorialComplete();
  }

  /**
   * Check if tutorial should be shown
   */
  public shouldShow(): boolean {
    return !this.isComplete;
  }

  /**
   * Start the tutorial
   */
  public start(): void {
    if (this.isComplete || this.isActive) return;

    this.isActive = true;
    this.currentStep = TutorialStep.WELCOME;
    this.actionCount = 0;

    this.createUI();
    this.showStep(this.currentStep);

    // Setup input listeners
    this.setupInputListeners();
  }

  /**
   * Create UI elements
   */
  private createUI(): void {
    // Main container
    this.container = this.scene.add.container(0, 0);
    this.container.setDepth(1000); // Above everything

    // Semi-transparent overlay
    this.overlay = this.scene.add.graphics();
    this.overlay.fillStyle(0x000000, 0.6);
    this.overlay.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
    this.container.add(this.overlay);

    // Panel background
    this.panel = this.scene.add.graphics();
    this.container.add(this.panel);

    // Title text
    this.titleText = this.scene.add.text(0, 0, '', {
      fontSize: '32px',
      color: UI_CONFIG.COLORS.PRIMARY,
      fontFamily: UI_CONFIG.FONTS.BUTTON.FAMILY,
      fontStyle: 'bold',
      stroke: UI_CONFIG.COLORS.BACKGROUND,
      strokeThickness: 6,
      align: 'center',
    }).setOrigin(0.5);
    this.container.add(this.titleText);

    // Description text
    this.descriptionText = this.scene.add.text(0, 0, '', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: UI_CONFIG.FONTS.BUTTON.FAMILY,
      stroke: UI_CONFIG.COLORS.BACKGROUND,
      strokeThickness: 4,
      align: 'center',
      wordWrap: { width: 400 },
    }).setOrigin(0.5);
    this.container.add(this.descriptionText);

    // Action text (call to action)
    this.actionText = this.scene.add.text(0, 0, '', {
      fontSize: '18px',
      color: UI_CONFIG.COLORS.SUCCESS,
      fontFamily: UI_CONFIG.FONTS.BUTTON.FAMILY,
      fontStyle: 'italic',
      stroke: UI_CONFIG.COLORS.BACKGROUND,
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5);
    this.container.add(this.actionText);

    // Pulse animation for action text
    this.scene.tweens.add({
      targets: this.actionText,
      alpha: 0.6,
      scale: 0.95,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Arrow indicator
    this.arrow = this.scene.add.graphics();
    this.container.add(this.arrow);

    // Skip button
    this.createSkipButton();
  }

  /**
   * Create skip button
   */
  private createSkipButton(): void {
    const buttonWidth = 120;
    const buttonHeight = 40;
    const x = GAME_CONFIG.WIDTH - buttonWidth - 20;
    const y = 20;

    this.skipButton = this.scene.add.container(x, y);

    // Button background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x222222, 0.8);
    bg.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 8);
    bg.lineStyle(2, 0x666666, 1);
    bg.strokeRoundedRect(0, 0, buttonWidth, buttonHeight, 8);
    this.skipButton.add(bg);

    // Button text
    const text = this.scene.add.text(buttonWidth / 2, buttonHeight / 2, 'Skip Tutorial', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: UI_CONFIG.FONTS.BUTTON.FAMILY,
    }).setOrigin(0.5);
    this.skipButton.add(text);

    // Make interactive
    const hitArea = new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight);
    this.skipButton.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.skipButton.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x333333, 0.9);
      bg.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 8);
      bg.lineStyle(2, 0x888888, 1);
      bg.strokeRoundedRect(0, 0, buttonWidth, buttonHeight, 8);
    });

    this.skipButton.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x222222, 0.8);
      bg.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 8);
      bg.lineStyle(2, 0x666666, 1);
      bg.strokeRoundedRect(0, 0, buttonWidth, buttonHeight, 8);
    });

    this.skipButton.on('pointerdown', () => {
      this.skip();
    });

    this.container?.add(this.skipButton);
  }

  /**
   * Show a specific tutorial step
   */
  private showStep(step: TutorialStep): void {
    const config = this.stepConfigs[step];
    if (!config) return;

    // Update texts
    this.titleText?.setText(config.title);
    this.descriptionText?.setText(config.description);
    this.actionText?.setText(config.action);

    // Position elements
    const centerX = config.position.x;
    const centerY = config.position.y;

    this.titleText?.setPosition(centerX, centerY - 60);
    this.descriptionText?.setPosition(centerX, centerY);
    this.actionText?.setPosition(centerX, centerY + 60);

    // Draw panel
    this.panel?.clear();
    this.panel?.fillStyle(0x1a1a1a, 0.95);
    this.panel?.fillRoundedRect(centerX - 250, centerY - 120, 500, 200, 16);
    this.panel?.lineStyle(4, 0x00d4ff, 1);
    this.panel?.strokeRoundedRect(centerX - 250, centerY - 120, 500, 200, 16);

    // Draw arrow indicator
    this.drawArrow(config);

    // Draw highlight area
    this.drawHighlight(config);

    // Reset action count for new step
    this.actionCount = 0;
  }

  /**
   * Draw directional arrow
   */
  private drawArrow(config: TutorialStepConfig): void {
    this.arrow?.clear();
    if (!config.arrow) return;

    this.arrow?.lineStyle(4, 0xffaa00, 1);
    this.arrow?.fillStyle(0xffaa00, 1);

    const centerX = config.position.x;
    const centerY = config.position.y;

    switch (config.arrow) {
      case 'up':
        // Arrow pointing up
        this.arrow?.lineBetween(centerX, centerY + 140, centerX, centerY + 180);
        this.arrow?.fillTriangle(centerX, centerY + 130, centerX - 10, centerY + 150, centerX + 10, centerY + 150);
        break;
      case 'down':
        // Arrow pointing down
        this.arrow?.lineBetween(centerX, centerY + 140, centerX, centerY + 180);
        this.arrow?.fillTriangle(centerX, centerY + 190, centerX - 10, centerY + 170, centerX + 10, centerY + 170);
        break;
      case 'right':
        // Arrow pointing right
        this.arrow?.lineBetween(centerX + 260, centerY, centerX + 300, centerY);
        this.arrow?.fillTriangle(centerX + 310, centerY, centerX + 290, centerY - 10, centerX + 290, centerY + 10);
        break;
      case 'left':
        // Arrow pointing left
        this.arrow?.lineBetween(centerX - 260, centerY, centerX - 300, centerY);
        this.arrow?.fillTriangle(centerX - 310, centerY, centerX - 290, centerY - 10, centerX - 290, centerY + 10);
        break;
    }

    // Pulse animation
    this.scene.tweens.add({
      targets: this.arrow,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Draw highlight area (for interactive zones)
   */
  private drawHighlight(config: TutorialStepConfig): void {
    if (!config.highlight) return;

    // Clear previous overlay and redraw with cutout
    this.overlay?.clear();
    this.overlay?.fillStyle(0x000000, 0.6);

    const h = config.highlight;

    // Draw overlay with cutout (highlight area is less dark)
    this.overlay?.fillRect(0, 0, GAME_CONFIG.WIDTH, h.y); // Top
    this.overlay?.fillRect(0, h.y, h.x, h.height); // Left
    this.overlay?.fillRect(h.x + h.width, h.y, GAME_CONFIG.WIDTH - (h.x + h.width), h.height); // Right
    this.overlay?.fillRect(0, h.y + h.height, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT - (h.y + h.height)); // Bottom

    // Draw border around highlight
    this.overlay?.lineStyle(4, 0x00d4ff, 0.8);
    this.overlay?.strokeRect(h.x, h.y, h.width, h.height);
  }

  /**
   * Setup input listeners for tutorial progression
   */
  private setupInputListeners(): void {
    // Listen for pointer events
    this.scene.input.on('pointerdown', this.handleInput, this);
  }

  /**
   * Handle input during tutorial
   */
  private handleInput(pointer: Phaser.Input.Pointer): void {
    if (!this.isActive) return;

    const centerX = GAME_CONFIG.WIDTH / 2;

    switch (this.currentStep) {
      case TutorialStep.WELCOME:
        this.nextStep();
        break;

      case TutorialStep.SWIM_UP:
        // Check if tapped left side
        if (pointer.x < centerX) {
          this.actionCount++;
          if (this.actionCount >= 3) {
            this.nextStep();
          } else {
            this.actionText?.setText(`Try it! Tap the left side ${3 - this.actionCount} more times`);
          }
        }
        break;

      case TutorialStep.DIVE_DOWN:
        // Check if tapped right side
        if (pointer.x >= centerX) {
          this.actionCount++;
          if (this.actionCount >= 3) {
            this.nextStep();
          } else {
            this.actionText?.setText(`Try it! Tap the right side ${3 - this.actionCount} more times`);
          }
        }
        break;

      case TutorialStep.AVOID_OBSTACLES:
        this.nextStep();
        break;

      case TutorialStep.SCORE_POINTS:
        this.nextStep();
        break;

      case TutorialStep.COMPLETE:
        this.complete();
        break;
    }
  }

  /**
   * Move to next tutorial step
   */
  private nextStep(): void {
    const steps = Object.values(TutorialStep);
    const currentIndex = steps.indexOf(this.currentStep);

    if (currentIndex < steps.length - 1) {
      this.currentStep = steps[currentIndex + 1] as TutorialStep;
      this.showStep(this.currentStep);
    } else {
      this.complete();
    }
  }

  /**
   * Complete the tutorial
   */
  private complete(): void {
    storage.setTutorialComplete(true);
    this.isComplete = true;
    this.hide();

    // Emit completion event
    this.scene.events.emit('tutorial:complete');
  }

  /**
   * Skip the tutorial
   */
  public skip(): void {
    storage.setTutorialComplete(true);
    this.isComplete = true;
    this.hide();

    // Emit skip event
    this.scene.events.emit('tutorial:skipped');
  }

  /**
   * Hide the tutorial
   */
  public hide(): void {
    this.isActive = false;

    // Remove input listener
    this.scene.input.off('pointerdown', this.handleInput, this);

    // Fade out and destroy
    if (this.container) {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          this.container?.destroy();
          this.container = undefined;
        },
      });
    }
  }

  /**
   * Reset tutorial (for debugging/testing)
   */
  public reset(): void {
    storage.setTutorialComplete(false);
    this.isComplete = false;
    this.isActive = false;
    this.currentStep = TutorialStep.WELCOME;
    this.hide();
  }

  /**
   * Check if tutorial is currently active
   */
  public isShowing(): boolean {
    return this.isActive;
  }

  /**
   * Clean up
   */
  public destroy(): void {
    this.hide();
  }
}
