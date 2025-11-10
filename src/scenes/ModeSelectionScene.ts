/**
 * Mode Selection Scene (v0.2)
 *
 * Allows players to choose between different game modes.
 */

import Phaser from 'phaser';
import { GAME_CONFIG, UI_CONFIG } from '../config/constants';
import { GameModeType } from '../modes/GameMode';
import { CHALLENGES } from '../modes/ChallengeMode';

interface ModeOption {
  type: GameModeType | 'challenge';
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  bestScore?: number;
}

export class ModeSelectionScene extends Phaser.Scene {
  private modes: ModeOption[] = [];
  private selectedChallengeId?: string;

  constructor() {
    super({ key: 'ModeSelectionScene' });
  }

  create(): void {
    // Define available modes
    this.modes = [
      {
        type: GameModeType.ENDLESS,
        name: 'Endless',
        description: 'Classic mode - survive as long as possible!',
        icon: '∞',
        unlocked: true,
        bestScore: 0, // TODO: Load from storage
      },
      {
        type: GameModeType.TIME_TRIAL,
        name: 'Time Trial',
        description: '60 seconds to score as much as possible',
        icon: '⏱️',
        unlocked: true,
        bestScore: 0, // TODO: Load from storage
      },
      {
        type: 'challenge',
        name: 'Challenges',
        description: 'Complete specific objectives',
        icon: '🎯',
        unlocked: true,
      },
      {
        type: GameModeType.ZEN,
        name: 'Zen Mode',
        description: 'Peaceful swimming with no obstacles',
        icon: '🧘',
        unlocked: true,
      },
    ];

    // Background
    this.createBackground();

    // Header
    this.createHeader();

    // Mode cards
    this.createModeCards();

    // Back button
    this.createBackButton();
  }

  /**
   * Create background
   */
  private createBackground(): void {
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x001a33, 0x001a33, 0x003366, 0x003366, 1);
    graphics.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
  }

  /**
   * Create header
   */
  private createHeader(): void {
    this.add.text(
      GAME_CONFIG.WIDTH / 2,
      40,
      '🎮 Select Game Mode',
      {
        fontSize: '48px',
        color: UI_CONFIG.COLORS.PRIMARY,
        fontStyle: 'bold',
        fontFamily: 'Arial',
        stroke: UI_CONFIG.COLORS.BACKGROUND,
        strokeThickness: 6,
      }
    ).setOrigin(0.5);
  }

  /**
   * Create mode selection cards
   */
  private createModeCards(): void {
    const cardWidth = 350;
    const cardHeight = 150;
    const columns = 2;
    const padding = 20;
    const startX = (GAME_CONFIG.WIDTH - (columns * cardWidth + (columns - 1) * padding)) / 2;
    const startY = 120;

    this.modes.forEach((mode, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = startX + col * (cardWidth + padding);
      const y = startY + row * (cardHeight + padding);

      this.createModeCard(x, y, cardWidth, cardHeight, mode);
    });
  }

  /**
   * Create a mode card
   */
  private createModeCard(
    x: number,
    y: number,
    width: number,
    height: number,
    mode: ModeOption
  ): void {
    const container = this.add.container(x, y);

    // Card background
    const bg = this.add.graphics();
    if (mode.unlocked) {
      bg.fillStyle(0x1a3a5a, 0.9);
      bg.lineStyle(3, 0x4488ff, 1);
    } else {
      bg.fillStyle(0x2a2a2a, 0.5);
      bg.lineStyle(2, 0x666666, 1);
    }
    bg.fillRoundedRect(0, 0, width, height, 15);
    bg.strokeRoundedRect(0, 0, width, height, 15);

    // Lock icon if locked
    if (!mode.unlocked) {
      const lockIcon = this.add.text(width / 2, height / 2, '🔒', {
        fontSize: '48px',
      }).setOrigin(0.5);
      container.add([bg, lockIcon]);
      return;
    }

    // Mode icon
    const icon = this.add.text(30, 30, mode.icon, {
      fontSize: '48px',
    });

    // Mode name
    const name = this.add.text(100, 35, mode.name, {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial',
    });

    // Mode description
    const description = this.add.text(100, 70, mode.description, {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'Arial',
      wordWrap: { width: width - 120 },
    });

    // Best score (if applicable)
    if (mode.bestScore !== undefined) {
      const scoreText = this.add.text(
        width - 20,
        height - 20,
        `Best: ${mode.bestScore}`,
        {
          fontSize: '16px',
          color: '#ffaa00',
          fontFamily: 'Arial',
        }
      ).setOrigin(1);
      container.add(scoreText);
    }

    container.add([bg, icon, name, description]);

    // Make interactive
    container.setSize(width, height);
    container.setInteractive({ useHandCursor: true });

    // Hover effect
    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x2a4a6a, 1);
      bg.fillRoundedRect(0, 0, width, height, 15);
      bg.lineStyle(4, 0x66aaff, 1);
      bg.strokeRoundedRect(0, 0, width, height, 15);

      this.tweens.add({
        targets: container,
        scaleX: 1.02,
        scaleY: 1.02,
        duration: 100,
        ease: 'Back.easeOut',
      });
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x1a3a5a, 0.9);
      bg.fillRoundedRect(0, 0, width, height, 15);
      bg.lineStyle(3, 0x4488ff, 1);
      bg.strokeRoundedRect(0, 0, width, height, 15);

      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Back.easeIn',
      });
    });

    container.on('pointerdown', () => {
      this.onModeSelect(mode);
    });

    // Entrance animation
    container.setAlpha(0);
    container.setY(y + 20);
    this.tweens.add({
      targets: container,
      alpha: 1,
      y: y,
      duration: 300,
      delay: index * 100,
      ease: 'Cubic.easeOut',
    });
  }

  /**
   * Handle mode selection
   */
  private onModeSelect(mode: ModeOption): void {
    if (mode.type === 'challenge') {
      // Show challenge selection
      this.showChallengeSelection();
    } else {
      // Start the selected mode
      this.startMode(mode.type as GameModeType);
    }
  }

  /**
   * Show challenge selection submenu
   */
  private showChallengeSelection(): void {
    // Create overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
    overlay.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT),
      Phaser.Geom.Rectangle.Contains
    );
    overlay.setDepth(100);

    // Challenge panel
    const panelWidth = 600;
    const panelHeight = 500;
    const panelX = (GAME_CONFIG.WIDTH - panelWidth) / 2;
    const panelY = (GAME_CONFIG.HEIGHT - panelHeight) / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x1a3a5a, 1);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
    panel.lineStyle(4, 0x4488ff, 1);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
    panel.setDepth(101);

    // Title
    const title = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      panelY + 30,
      'Select Challenge',
      {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold',
        fontFamily: 'Arial',
      }
    ).setOrigin(0.5).setDepth(101);

    // Challenge list
    const listStartY = panelY + 80;
    const challengeHeight = 35;

    CHALLENGES.forEach((challenge, index) => {
      const challengeY = listStartY + index * challengeHeight;

      const challengeText = this.add.text(
        panelX + 20,
        challengeY,
        `${index + 1}. ${challenge.name} - ${challenge.objective}`,
        {
          fontSize: '16px',
          color: '#ffffff',
          fontFamily: 'Arial',
        }
      ).setDepth(101).setInteractive({ useHandCursor: true });

      challengeText.on('pointerover', () => {
        challengeText.setColor('#ffff44');
      });

      challengeText.on('pointerout', () => {
        challengeText.setColor('#ffffff');
      });

      challengeText.on('pointerdown', () => {
        this.selectedChallengeId = challenge.id;
        overlay.destroy();
        panel.destroy();
        title.destroy();
        this.startChallenge(challenge.id);
      });
    });

    // Close button
    const closeButton = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      panelY + panelHeight - 40,
      'Close',
      {
        fontSize: '18px',
        color: '#ff4444',
        fontFamily: 'Arial',
      }
    ).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

    closeButton.on('pointerdown', () => {
      overlay.destroy();
      panel.destroy();
      title.destroy();
      closeButton.destroy();
    });
  }

  /**
   * Start a game mode
   */
  private startMode(mode: GameModeType): void {
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Pass mode to GameScene via registry
      this.registry.set('gameMode', mode);
      this.scene.start('GameScene');
    });
  }

  /**
   * Start a challenge
   */
  private startChallenge(challengeId: string): void {
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Pass challenge to GameScene via registry
      this.registry.set('gameMode', GameModeType.CHALLENGE);
      this.registry.set('challengeId', challengeId);
      this.scene.start('GameScene');
    });
  }

  /**
   * Create back button
   */
  private createBackButton(): void {
    const button = this.add.container(50, GAME_CONFIG.HEIGHT - 50);

    const bg = this.add.graphics();
    bg.fillStyle(0x333333, 0.8);
    bg.fillRoundedRect(0, 0, 120, 40, 10);
    bg.lineStyle(2, 0xffffff, 1);
    bg.strokeRoundedRect(0, 0, 120, 40, 10);

    const text = this.add.text(60, 20, '← Back', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    button.add([bg, text]);
    button.setSize(120, 40);
    button.setInteractive({ useHandCursor: true });

    button.on('pointerdown', () => {
      this.cameras.main.fadeOut(200);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });
  }
}
