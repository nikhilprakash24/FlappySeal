/**
 * Achievement Scene (v0.2)
 *
 * Displays all achievements with progress tracking and completion status.
 */

import Phaser from 'phaser';
import { GAME_CONFIG, UI_CONFIG } from '../config/constants';
import {
  AchievementSystem,
  ACHIEVEMENTS,
  Achievement,
  AchievementCategory,
} from '../systems/AchievementSystem';

export class AchievementScene extends Phaser.Scene {
  private achievementSystem?: AchievementSystem;
  private currentCategory: AchievementCategory | 'ALL' = 'ALL';
  private scrollY: number = 0;
  private achievementCards: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'AchievementScene' });
  }

  create(): void {
    // Initialize achievement system
    this.achievementSystem = new AchievementSystem();

    // Background
    this.createBackground();

    // Header with stats
    this.createHeader();

    // Category filters
    this.createCategoryFilters();

    // Achievement list
    this.createAchievementList();

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
    graphics.fillGradientStyle(0x331a00, 0x331a00, 0x663300, 0x663300, 1);
    graphics.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
  }

  /**
   * Create header with stats
   */
  private createHeader(): void {
    // Title
    this.add.text(
      GAME_CONFIG.WIDTH / 2,
      40,
      '🏆 Achievements',
      {
        fontSize: '48px',
        color: UI_CONFIG.COLORS.WARNING,
        fontStyle: 'bold',
        fontFamily: 'Arial',
        stroke: UI_CONFIG.COLORS.BACKGROUND,
        strokeThickness: 6,
      }
    ).setOrigin(0.5);

    // Stats
    const totalAchievements = ACHIEVEMENTS.length;
    const completedAchievements = ACHIEVEMENTS.filter(a =>
      this.achievementSystem!.isCompleted(a.id)
    ).length;
    const completionPercentage = Math.floor(
      (completedAchievements / totalAchievements) * 100
    );

    const statsContainer = this.add.container(GAME_CONFIG.WIDTH / 2, 90);

    // Progress bar background
    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x333333, 0.8);
    progressBg.fillRoundedRect(-200, 0, 400, 20, 10);

    // Progress bar fill
    const progressFill = this.add.graphics();
    progressFill.fillStyle(0xffaa00, 1);
    const fillWidth = (completedAchievements / totalAchievements) * 400;
    progressFill.fillRoundedRect(-200, 0, fillWidth, 20, 10);

    // Stats text
    const statsText = this.add.text(
      0,
      30,
      `${completedAchievements}/${totalAchievements} Completed (${completionPercentage}%)`,
      {
        fontSize: '18px',
        color: '#ffaa00',
        fontFamily: 'Arial',
      }
    ).setOrigin(0.5);

    statsContainer.add([progressBg, progressFill, statsText]);
  }

  /**
   * Create category filters
   */
  private createCategoryFilters(): void {
    const categories: Array<{ label: string; category: AchievementCategory | 'ALL' }> = [
      { label: 'All', category: 'ALL' },
      { label: 'Score', category: AchievementCategory.SCORE },
      { label: 'Distance', category: AchievementCategory.DISTANCE },
      { label: 'Collection', category: AchievementCategory.COLLECTION },
      { label: 'Skill', category: AchievementCategory.SKILL },
      { label: 'Mastery', category: AchievementCategory.MASTERY },
      { label: 'Special', category: AchievementCategory.SPECIAL },
    ];

    const startY = 140;
    const buttonWidth = 100;
    const buttonHeight = 35;
    const padding = 10;
    const totalWidth = categories.length * (buttonWidth + padding) - padding;
    const startX = (GAME_CONFIG.WIDTH - totalWidth) / 2;

    categories.forEach((cat, index) => {
      const x = startX + index * (buttonWidth + padding);
      const y = startY;

      const container = this.add.container(x, y);
      const isActive = this.currentCategory === cat.category;

      // Button background
      const bg = this.add.graphics();
      bg.fillStyle(isActive ? 0xffaa00 : 0x553300, 0.8);
      bg.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
      if (isActive) {
        bg.lineStyle(2, 0xffff00, 1);
        bg.strokeRoundedRect(0, 0, buttonWidth, buttonHeight, 5);
      }

      // Button text
      const text = this.add.text(
        buttonWidth / 2,
        buttonHeight / 2,
        cat.label,
        {
          fontSize: '14px',
          color: '#ffffff',
          fontFamily: 'Arial',
        }
      ).setOrigin(0.5);

      container.add([bg, text]);
      container.setSize(buttonWidth, buttonHeight);
      container.setInteractive({ useHandCursor: true });

      container.on('pointerdown', () => {
        this.currentCategory = cat.category;
        this.scene.restart();
      });
    });
  }

  /**
   * Create achievement list
   */
  private createAchievementList(): void {
    const startY = 200;
    const cardHeight = 100;
    const padding = 10;

    // Filter achievements
    const filteredAchievements = ACHIEVEMENTS.filter(
      a => this.currentCategory === 'ALL' || a.category === this.currentCategory
    );

    filteredAchievements.forEach((achievement, index) => {
      const y = startY + index * (cardHeight + padding) + this.scrollY;
      const card = this.createAchievementCard(50, y, GAME_CONFIG.WIDTH - 100, cardHeight, achievement);
      this.achievementCards.push(card);
    });
  }

  /**
   * Create an achievement card
   */
  private createAchievementCard(
    x: number,
    y: number,
    width: number,
    height: number,
    achievement: Achievement
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Check completion status
    const isCompleted = this.achievementSystem!.isCompleted(achievement.id);
    const progress = this.achievementSystem!.getProgress(achievement.id);

    // Card background
    const bg = this.add.graphics();
    if (isCompleted) {
      bg.fillStyle(0x554400, 0.9);
      bg.lineStyle(3, 0xffaa00, 1);
    } else {
      bg.fillStyle(0x333333, 0.7);
      bg.lineStyle(2, 0x666666, 1);
    }
    bg.fillRoundedRect(0, 0, width, height, 10);
    bg.strokeRoundedRect(0, 0, width, height, 10);

    // Trophy icon
    const icon = this.add.text(
      20,
      height / 2,
      isCompleted ? '🏆' : '🔓',
      {
        fontSize: '36px',
      }
    ).setOrigin(0, 0.5);

    // Achievement name
    const name = this.add.text(
      70,
      25,
      achievement.name,
      {
        fontSize: '20px',
        color: isCompleted ? '#ffaa00' : '#cccccc',
        fontStyle: 'bold',
        fontFamily: 'Arial',
      }
    );

    // Achievement description
    const description = this.add.text(
      70,
      50,
      achievement.description,
      {
        fontSize: '14px',
        color: isCompleted ? '#ffcc88' : '#888888',
        fontFamily: 'Arial',
        wordWrap: { width: width - 250 },
      }
    );

    // Progress bar (if not completed)
    if (!isCompleted && progress) {
      const progressBarX = 70;
      const progressBarY = 75;
      const progressBarWidth = width - 250;

      const progressBg = this.add.graphics();
      progressBg.fillStyle(0x222222, 0.8);
      progressBg.fillRoundedRect(progressBarX, progressBarY, progressBarWidth, 8, 4);

      const progressFill = this.add.graphics();
      progressFill.fillStyle(0x4488ff, 1);
      const progressPercent = progress.current / progress.target;
      progressFill.fillRoundedRect(
        progressBarX,
        progressBarY,
        progressBarWidth * progressPercent,
        8,
        4
      );

      const progressText = this.add.text(
        progressBarX + progressBarWidth / 2,
        progressBarY + 4,
        `${progress.current}/${progress.target}`,
        {
          fontSize: '12px',
          color: '#ffffff',
          fontFamily: 'Arial',
        }
      ).setOrigin(0.5);

      container.add([progressBg, progressFill, progressText]);
    }

    // Reward display
    const rewardX = width - 170;
    const rewardY = height / 2;

    if (achievement.reward.experience > 0) {
      const expText = this.add.text(
        rewardX,
        rewardY - 15,
        `+${achievement.reward.experience} XP`,
        {
          fontSize: '14px',
          color: '#88ff88',
          fontFamily: 'Arial',
        }
      );
      container.add(expText);
    }

    if (achievement.reward.currency > 0) {
      const currencyText = this.add.text(
        rewardX,
        rewardY + 5,
        `+${achievement.reward.currency} 🐟`,
        {
          fontSize: '14px',
          color: '#ffff88',
          fontFamily: 'Arial',
        }
      );
      container.add(currencyText);
    }

    if (achievement.reward.unlock) {
      const unlockText = this.add.text(
        rewardX,
        rewardY + 25,
        `Unlock: ${achievement.reward.unlock}`,
        {
          fontSize: '12px',
          color: '#ff88ff',
          fontFamily: 'Arial',
        }
      );
      container.add(unlockText);
    }

    // Completion checkmark
    if (isCompleted) {
      const checkmark = this.add.text(
        width - 30,
        height / 2,
        '✓',
        {
          fontSize: '32px',
          color: '#44ff44',
          fontStyle: 'bold',
        }
      ).setOrigin(0.5);
      container.add(checkmark);
    }

    container.add([bg, icon, name, description]);

    return container;
  }

  /**
   * Create back button
   */
  private createBackButton(): void {
    const button = this.add.container(50, GAME_CONFIG.HEIGHT - 50);

    const bg = this.add.graphics();
    bg.fillStyle(0x553300, 0.8);
    bg.fillRoundedRect(0, 0, 120, 40, 10);
    bg.lineStyle(2, 0xffaa00, 1);
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
   * Setup scrolling
   */
  private setupScrolling(): void {
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
      this.scrollY -= deltaY * 0.5;

      // Clamp scroll
      const maxScroll = Math.max(0, this.achievementCards.length * 110 - GAME_CONFIG.HEIGHT + 300);
      this.scrollY = Phaser.Math.Clamp(this.scrollY, -maxScroll, 0);

      // Update card positions
      this.achievementCards.forEach((card, index) => {
        const y = 200 + index * 110 + this.scrollY;
        card.setY(y);
      });
    });
  }
}
