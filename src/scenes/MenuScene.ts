/**
 * Main Menu Scene (v0.2)
 *
 * Central hub for navigation to game modes, unlocks, achievements, and settings.
 */

import Phaser from 'phaser';
import { GAME_CONFIG, UI_CONFIG } from '../config/constants';

export class MenuScene extends Phaser.Scene {
  private titleText?: Phaser.GameObjects.Text;
  private buttons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    // Background gradient effect
    this.createBackground();

    // Title
    this.createTitle();

    // Menu buttons
    this.createMenuButtons();

    // Player stats display
    this.createStatsDisplay();

    // Version info
    this.createVersionInfo();
  }

  /**
   * Create animated background
   */
  private createBackground(): void {
    const graphics = this.add.graphics();

    // Gradient background
    graphics.fillGradientStyle(0x001a33, 0x001a33, 0x003366, 0x003366, 1);
    graphics.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);

    // Add some ambient bubbles
    for (let i = 0; i < 20; i++) {
      const bubble = this.add.circle(
        Math.random() * GAME_CONFIG.WIDTH,
        Math.random() * GAME_CONFIG.HEIGHT,
        Math.random() * 10 + 5,
        0xffffff,
        0.1
      );

      // Floating animation
      this.tweens.add({
        targets: bubble,
        y: bubble.y - GAME_CONFIG.HEIGHT,
        duration: Math.random() * 5000 + 5000,
        repeat: -1,
        ease: 'Linear',
        onRepeat: () => {
          bubble.y = GAME_CONFIG.HEIGHT + 20;
          bubble.x = Math.random() * GAME_CONFIG.WIDTH;
        },
      });
    }
  }

  /**
   * Create title with animation
   */
  private createTitle(): void {
    this.titleText = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      120,
      '🦭 FlappySeal',
      {
        fontSize: '64px',
        color: UI_CONFIG.COLORS.PRIMARY,
        fontStyle: 'bold',
        fontFamily: 'Arial',
        stroke: UI_CONFIG.COLORS.BACKGROUND,
        strokeThickness: 8,
      }
    ).setOrigin(0.5).setDepth(10);

    // Floating animation
    this.tweens.add({
      targets: this.titleText,
      y: 110,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle
    this.add.text(
      GAME_CONFIG.WIDTH / 2,
      180,
      'Master the Depths',
      {
        fontSize: '20px',
        color: UI_CONFIG.COLORS.SECONDARY,
        fontFamily: 'Arial',
      }
    ).setOrigin(0.5);
  }

  /**
   * Create menu buttons
   */
  private createMenuButtons(): void {
    const buttonConfig = [
      { text: '▶ Play', key: 'play', color: UI_CONFIG.COLORS.SUCCESS },
      { text: '🐾 Select Animal', key: 'character', color: UI_CONFIG.COLORS.PRIMARY },
      { text: '🎨 Unlocks', key: 'unlocks', color: UI_CONFIG.COLORS.PRIMARY },
      { text: '🏆 Achievements', key: 'achievements', color: UI_CONFIG.COLORS.WARNING },
      { text: '⚙️ Settings', key: 'settings', color: UI_CONFIG.COLORS.SECONDARY },
    ];

    const startY = 260;
    const spacing = 70;

    buttonConfig.forEach((config, index) => {
      const button = this.createButton(
        GAME_CONFIG.WIDTH / 2,
        startY + index * spacing,
        config.text,
        config.color,
        () => this.onButtonClick(config.key)
      );
      this.buttons.push(button);
    });

    // Show currently selected character
    this.showSelectedCharacter();
  }

  /**
   * Create a button with hover effects
   */
  private createButton(
    x: number,
    y: number,
    text: string,
    color: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(parseInt(color.replace('#', '0x')), 0.8);
    bg.fillRoundedRect(-150, -25, 300, 50, 10);
    bg.lineStyle(3, 0xffffff, 1);
    bg.strokeRoundedRect(-150, -25, 300, 50, 10);

    // Text
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    container.add([bg, buttonText]);
    container.setSize(300, 50);
    container.setInteractive({ useHandCursor: true });

    // Hover effects
    container.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: 'Back.easeOut',
      });
      bg.clear();
      bg.fillStyle(parseInt(color.replace('#', '0x')), 1);
      bg.fillRoundedRect(-150, -25, 300, 50, 10);
      bg.lineStyle(4, 0xffff00, 1);
      bg.strokeRoundedRect(-150, -25, 300, 50, 10);
    });

    container.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Back.easeIn',
      });
      bg.clear();
      bg.fillStyle(parseInt(color.replace('#', '0x')), 0.8);
      bg.fillRoundedRect(-150, -25, 300, 50, 10);
      bg.lineStyle(3, 0xffffff, 1);
      bg.strokeRoundedRect(-150, -25, 300, 50, 10);
    });

    container.on('pointerdown', () => {
      this.cameras.main.shake(100, 0.005);
      callback();
    });

    // Entrance animation
    container.setScale(0);
    this.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      delay: index * 100,
      ease: 'Back.easeOut',
    });

    return container;
  }

  /**
   * Handle button clicks
   */
  private onButtonClick(key: string): void {
    // Fade out effect
    this.cameras.main.fadeOut(300, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      switch (key) {
        case 'play':
          this.scene.start('ModeSelectionScene');
          break;
        case 'character':
          // TODO: Get player's total score for unlock checks
          const playerScore = 0; // Replace with actual score from save system
          this.scene.start('CharacterSelectScene', { playerTotalScore: playerScore });
          break;
        case 'unlocks':
          this.scene.start('UnlockScene');
          break;
        case 'achievements':
          this.scene.start('AchievementScene');
          break;
        case 'settings':
          // TODO: Settings scene
          console.log('Settings not yet implemented');
          this.cameras.main.fadeIn(300);
          break;
      }
    });
  }

  /**
   * Show currently selected character
   */
  private showSelectedCharacter(): void {
    // Get selected character from localStorage
    const selectedId = localStorage.getItem('flappyseal_selected_character') || 'seal';

    // Create a small indicator showing current animal
    const indicator = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      210,
      `Current: ${this.getCharacterName(selectedId)}`,
      {
        fontSize: '18px',
        color: UI_CONFIG.COLORS.PRIMARY,
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 3,
      }
    ).setOrigin(0.5);

    // Pulse animation
    this.tweens.add({
      targets: indicator,
      alpha: 0.6,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Get character display name from ID
   */
  private getCharacterName(id: string): string {
    switch (id) {
      case 'otter': return '🦦 Otter';
      case 'sealion': return '🦭 Sea Lion';
      case 'seal':
      default: return '🦭 Seal';
    }
  }

  /**
   * Display player stats
   */
  private createStatsDisplay(): void {
    const container = this.add.container(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT - 100);

    // Stats background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.5);
    bg.fillRoundedRect(-200, -40, 400, 80, 10);
    bg.lineStyle(2, 0x4488ff, 1);
    bg.strokeRoundedRect(-200, -40, 400, 80, 10);

    // TODO: Load real stats from UnlockSystem
    const level = 1; // TODO: Get from UnlockSystem
    const unlocks = 5; // TODO: Get from UnlockSystem
    const achievements = 12; // TODO: Get from AchievementSystem

    const statsText = this.add.text(
      0,
      -15,
      `Level ${level}  |  ${unlocks}/20 Unlocked  |  ${achievements}/50 Achievements`,
      {
        fontSize: '18px',
        color: UI_CONFIG.COLORS.PRIMARY,
        fontFamily: 'Arial',
      }
    ).setOrigin(0.5);

    // Progress bar for level
    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x333333, 0.8);
    progressBg.fillRoundedRect(-180, 10, 360, 10, 5);

    const progressFill = this.add.graphics();
    progressFill.fillStyle(0x4488ff, 1);
    const progress = 0.35; // TODO: Get from UnlockSystem
    progressFill.fillRoundedRect(-180, 10, 360 * progress, 10, 5);

    container.add([bg, statsText, progressBg, progressFill]);
  }

  /**
   * Display version info
   */
  private createVersionInfo(): void {
    this.add.text(
      GAME_CONFIG.WIDTH - 10,
      GAME_CONFIG.HEIGHT - 10,
      'v0.2.0-alpha',
      {
        fontSize: '14px',
        color: '#666666',
        fontFamily: 'Arial',
      }
    ).setOrigin(1);
  }
}
