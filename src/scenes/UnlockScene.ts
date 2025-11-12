/**
 * Unlock/Skin Selection Scene (v0.2)
 *
 * Displays all unlockable content with status and allows selection.
 */

import Phaser from 'phaser';
import { GAME_CONFIG, UI_CONFIG } from '../config/constants';
import { UnlockSystem, UNLOCKABLES, UnlockType, Unlockable } from '../systems/UnlockSystem';

export class UnlockScene extends Phaser.Scene {
  private unlockSystem?: UnlockSystem;
  private currentFilter: UnlockType | 'ALL' = 'ALL';
  private scrollY: number = 0;
  private unlockCards: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'UnlockScene' });
  }

  create(): void {
    // Initialize unlock system
    this.unlockSystem = new UnlockSystem();

    // Background
    this.createBackground();

    // Header
    this.createHeader();

    // Filter tabs
    this.createFilterTabs();

    // Unlock grid
    this.createUnlockGrid();

    // Currency display
    this.createCurrencyDisplay();

    // Back button
    this.createBackButton();

    // Scroll handling
    this.setupScrolling();
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
      '🎨 Unlockables',
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
   * Create filter tabs
   */
  private createFilterTabs(): void {
    const filters: Array<{ label: string; type: UnlockType | 'ALL' }> = [
      { label: 'All', type: 'ALL' },
      { label: 'Skins', type: UnlockType.SEAL_SKIN },
      { label: 'Power-Ups', type: UnlockType.POWER_UP },
      { label: 'Modes', type: UnlockType.GAME_MODE },
      { label: 'Biomes', type: UnlockType.BIOME },
    ];

    const startX = 50;
    const tabWidth = (GAME_CONFIG.WIDTH - 100) / filters.length;

    filters.forEach((filter, index) => {
      const x = startX + index * tabWidth;
      const y = 100;

      const container = this.add.container(x, y);
      const isActive = this.currentFilter === filter.type;

      // Tab background
      const bg = this.add.graphics();
      bg.fillStyle(isActive ? 0x4488ff : 0x333333, 0.8);
      bg.fillRoundedRect(0, 0, tabWidth - 10, 40, 5);
      if (isActive) {
        bg.lineStyle(2, 0xffff00, 1);
        bg.strokeRoundedRect(0, 0, tabWidth - 10, 40, 5);
      }

      // Tab text
      const text = this.add.text(
        (tabWidth - 10) / 2,
        20,
        filter.label,
        {
          fontSize: '16px',
          color: '#ffffff',
          fontFamily: 'Arial',
        }
      ).setOrigin(0.5);

      container.add([bg, text]);
      container.setSize(tabWidth - 10, 40);
      container.setInteractive({ useHandCursor: true });

      container.on('pointerdown', () => {
        this.currentFilter = filter.type;
        this.scene.restart();
      });
    });
  }

  /**
   * Create unlock grid
   */
  private createUnlockGrid(): void {
    const startY = 160;
    const cardWidth = 180;
    const cardHeight = 220;
    const padding = 10;
    const columns = 4;

    // Filter unlockables
    const filteredUnlocks = UNLOCKABLES.filter(
      u => this.currentFilter === 'ALL' || u.type === this.currentFilter
    );

    filteredUnlocks.forEach((unlockable, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = 40 + col * (cardWidth + padding);
      const y = startY + row * (cardHeight + padding) + this.scrollY;

      const card = this.createUnlockCard(x, y, cardWidth, cardHeight, unlockable);
      this.unlockCards.push(card);
    });
  }

  /**
   * Create an unlock card
   */
  private createUnlockCard(
    x: number,
    y: number,
    width: number,
    height: number,
    unlockable: Unlockable
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Check unlock status
    const isUnlocked = this.unlockSystem!.isUnlocked(unlockable.id);
    const isOwned = this.unlockSystem!.isOwned(unlockable.id);

    // Card background
    const bg = this.add.graphics();
    if (isUnlocked) {
      bg.fillStyle(0x2a5a2a, 0.9);
    } else {
      bg.fillStyle(0x333333, 0.7);
    }
    bg.fillRoundedRect(0, 0, width, height, 10);
    bg.lineStyle(2, isUnlocked ? 0x44ff44 : 0x666666, 1);
    bg.strokeRoundedRect(0, 0, width, height, 10);

    // Lock icon if locked
    if (!isUnlocked) {
      const lockIcon = this.add.text(width / 2, 50, '🔒', {
        fontSize: '48px',
      }).setOrigin(0.5);
      container.add(lockIcon);
    }

    // Icon/Preview (placeholder for now)
    const icon = this.add.text(width / 2, 60, this.getIcon(unlockable.type), {
      fontSize: '36px',
    }).setOrigin(0.5);

    // Name
    const name = this.add.text(width / 2, 110, unlockable.name, {
      fontSize: '16px',
      color: isUnlocked ? '#ffffff' : '#888888',
      fontStyle: 'bold',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: width - 20 },
    }).setOrigin(0.5);

    // Condition text
    const conditionText = this.unlockSystem!.getConditionText(unlockable.id);
    const condition = this.add.text(width / 2, 150, conditionText, {
      fontSize: '12px',
      color: isUnlocked ? '#88ff88' : '#ffaa44',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: width - 20 },
    }).setOrigin(0.5);

    // Cost if purchasable
    if (unlockable.cost && unlockable.cost.currency > 0) {
      const canAfford = this.unlockSystem!.canAfford(unlockable.id);
      const costText = this.add.text(
        width / 2,
        190,
        `🐟 ${unlockable.cost.currency}`,
        {
          fontSize: '14px',
          color: canAfford ? '#ffff44' : '#ff4444',
          fontFamily: 'Arial',
        }
      ).setOrigin(0.5);
      container.add(costText);
    }

    // Selected indicator if owned and equipped
    if (isOwned && this.unlockSystem!.isEquipped(unlockable.id)) {
      const selectedBadge = this.add.text(width - 10, 10, '✓', {
        fontSize: '20px',
        color: '#44ff44',
        fontStyle: 'bold',
      }).setOrigin(1, 0);
      container.add(selectedBadge);
    }

    container.add([bg, icon, name, condition]);

    // Make interactive if unlocked
    if (isUnlocked) {
      container.setSize(width, height);
      container.setInteractive({ useHandCursor: true });

      container.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(0x3a7a3a, 1);
        bg.fillRoundedRect(0, 0, width, height, 10);
        bg.lineStyle(3, 0x88ff88, 1);
        bg.strokeRoundedRect(0, 0, width, height, 10);
      });

      container.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(0x2a5a2a, 0.9);
        bg.fillRoundedRect(0, 0, width, height, 10);
        bg.lineStyle(2, 0x44ff44, 1);
        bg.strokeRoundedRect(0, 0, width, height, 10);
      });

      container.on('pointerdown', () => {
        this.onUnlockSelect(unlockable);
      });
    }

    return container;
  }

  /**
   * Get icon for unlock type
   */
  private getIcon(type: UnlockType): string {
    switch (type) {
      case UnlockType.SEAL_SKIN:
        return '🦭';
      case UnlockType.POWER_UP:
        return '⚡';
      case UnlockType.GAME_MODE:
        return '🎮';
      case UnlockType.BIOME:
        return '🌊';
      default:
        return '❓';
    }
  }

  /**
   * Handle unlock selection
   */
  private onUnlockSelect(unlockable: Unlockable): void {
    // If it's a skin, equip it
    if (unlockable.type === UnlockType.SEAL_SKIN) {
      this.unlockSystem!.equipUnlock(unlockable.id);
      // Visual feedback
      this.cameras.main.flash(200, 100, 255, 100);
      // Refresh scene
      this.scene.restart();
    }
  }

  /**
   * Create currency display
   */
  private createCurrencyDisplay(): void {
    const container = this.add.container(GAME_CONFIG.WIDTH - 20, 20);

    // Fish currency
    const fishText = this.add.text(
      0,
      0,
      `🐟 ${this.unlockSystem!.getCurrency()}`,
      {
        fontSize: '20px',
        color: '#ffff44',
        fontStyle: 'bold',
        fontFamily: 'Arial',
      }
    ).setOrigin(1, 0);

    // Pearls (premium currency) - TODO when IAP is implemented
    const pearlText = this.add.text(
      0,
      30,
      `💎 0`,
      {
        fontSize: '20px',
        color: '#44ffff',
        fontStyle: 'bold',
        fontFamily: 'Arial',
      }
    ).setOrigin(1, 0);

    container.add([fishText, pearlText]);
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

  /**
   * Setup scrolling for unlock grid
   */
  private setupScrolling(): void {
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
      this.scrollY -= deltaY * 0.5;

      // Clamp scroll
      const maxScroll = Math.max(0, this.unlockCards.length * 60 - GAME_CONFIG.HEIGHT + 200);
      this.scrollY = Phaser.Math.Clamp(this.scrollY, -maxScroll, 0);

      // Update card positions
      this.unlockCards.forEach((card, index) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        const y = 160 + row * 230 + this.scrollY;
        card.setY(y);
      });
    });
  }
}
