/**
 * Progress HUD (v0.2)
 *
 * Displays player progression info during gameplay (level, XP bar, active achievements).
 */

import Phaser from 'phaser';
import { GAME_CONFIG, UI_CONFIG } from '../config/constants';
import { UnlockSystem } from '../systems/UnlockSystem';
import { AchievementSystem } from '../systems/AchievementSystem';

export class ProgressHUD {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private unlockSystem: UnlockSystem;
  private achievementSystem: AchievementSystem;

  // UI elements
  private levelText?: Phaser.GameObjects.Text;
  private xpBarFill?: Phaser.GameObjects.Graphics;
  private achievementTrackers: Phaser.GameObjects.Container[] = [];

  constructor(
    scene: Phaser.Scene,
    unlockSystem: UnlockSystem,
    achievementSystem: AchievementSystem
  ) {
    this.scene = scene;
    this.unlockSystem = unlockSystem;
    this.achievementSystem = achievementSystem;

    this.container = scene.add.container(0, 0);
    this.container.setDepth(90); // Below UI but above game

    this.create();
  }

  /**
   * Create HUD elements
   */
  private create(): void {
    // Level and XP bar (top-left)
    this.createLevelDisplay();

    // Active achievement trackers (top-right)
    this.createAchievementTrackers();
  }

  /**
   * Create level display with XP bar
   */
  private createLevelDisplay(): void {
    const x = 20;
    const y = 20;

    // Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.5);
    bg.fillRoundedRect(x, y, 200, 60, 10);
    bg.lineStyle(2, 0x4488ff, 1);
    bg.strokeRoundedRect(x, y, 200, 60, 10);

    // Level icon and text
    const levelIcon = this.scene.add.text(x + 15, y + 15, '⭐', {
      fontSize: '24px',
    });

    this.levelText = this.scene.add.text(
      x + 50,
      y + 15,
      `Level ${this.unlockSystem.getLevel()}`,
      {
        fontSize: '18px',
        color: UI_CONFIG.COLORS.PRIMARY,
        fontStyle: 'bold',
        fontFamily: 'Arial',
      }
    );

    // XP bar background
    const xpBarBg = this.scene.add.graphics();
    xpBarBg.fillStyle(0x333333, 0.8);
    xpBarBg.fillRoundedRect(x + 10, y + 45, 180, 10, 5);

    // XP bar fill
    this.xpBarFill = this.scene.add.graphics();
    this.updateXPBar();

    this.container.add([bg, levelIcon, this.levelText, xpBarBg, this.xpBarFill]);
  }

  /**
   * Update XP bar fill
   */
  private updateXPBar(): void {
    if (!this.xpBarFill) return;

    this.xpBarFill.clear();

    const x = 30;
    const y = 65;
    const width = 180;

    // Get current level progress
    const currentLevel = this.unlockSystem.getLevel();
    const currentXP = this.unlockSystem.getExperience();
    const xpForCurrentLevel = this.unlockSystem['getXPForLevel'](currentLevel);
    const xpForNextLevel = this.unlockSystem['getXPForLevel'](currentLevel + 1);
    const xpIntoLevel = currentXP - xpForCurrentLevel;
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
    const progress = xpIntoLevel / xpNeededForLevel;

    // Draw fill
    this.xpBarFill.fillStyle(0x4488ff, 1);
    this.xpBarFill.fillRoundedRect(x, y, width * progress, 10, 5);

    // Shine effect
    this.xpBarFill.fillStyle(0xffffff, 0.3);
    this.xpBarFill.fillRoundedRect(x, y, width * progress, 4, 5);
  }

  /**
   * Create achievement trackers
   */
  private createAchievementTrackers(): void {
    // Get active/in-progress achievements (max 3)
    const activeAchievements = this.achievementSystem
      .getInProgress()
      .slice(0, 3);

    const startY = 20;
    const spacing = 50;

    activeAchievements.forEach((achievement, index) => {
      const y = startY + index * spacing;
      const tracker = this.createAchievementTracker(achievement.id, y);
      this.achievementTrackers.push(tracker);
      this.container.add(tracker);
    });
  }

  /**
   * Create a single achievement tracker
   */
  private createAchievementTracker(
    achievementId: string,
    y: number
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(GAME_CONFIG.WIDTH - 220, y);

    const progress = this.achievementSystem.getProgress(achievementId);
    if (!progress) return container;

    // Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.5);
    bg.fillRoundedRect(0, 0, 200, 40, 10);
    bg.lineStyle(2, 0xffaa00, 1);
    bg.strokeRoundedRect(0, 0, 200, 40, 10);

    // Achievement name (shortened)
    const achievement = this.achievementSystem['achievements'].find(a => a.id === achievementId);
    const name = achievement?.name || '';
    const shortName = name.length > 15 ? name.substring(0, 12) + '...' : name;

    const nameText = this.scene.add.text(
      10,
      8,
      shortName,
      {
        fontSize: '12px',
        color: '#ffaa00',
        fontStyle: 'bold',
        fontFamily: 'Arial',
      }
    );

    // Progress bar
    const progressBarBg = this.scene.add.graphics();
    progressBarBg.fillStyle(0x333333, 0.8);
    progressBarBg.fillRoundedRect(10, 24, 180, 8, 4);

    const progressBarFill = this.scene.add.graphics();
    progressBarFill.fillStyle(0xffaa00, 1);
    const fillWidth = (progress.current / progress.target) * 180;
    progressBarFill.fillRoundedRect(10, 24, fillWidth, 8, 4);

    // Progress text
    const progressText = this.scene.add.text(
      100,
      28,
      `${progress.current}/${progress.target}`,
      {
        fontSize: '10px',
        color: '#ffffff',
        fontFamily: 'Arial',
      }
    ).setOrigin(0.5);

    container.add([bg, nameText, progressBarBg, progressBarFill, progressText]);

    return container;
  }

  /**
   * Update HUD (call each frame or when values change)
   */
  update(): void {
    // Update level text
    if (this.levelText) {
      this.levelText.setText(`Level ${this.unlockSystem.getLevel()}`);
    }

    // Update XP bar
    this.updateXPBar();

    // Update achievement trackers
    this.updateAchievementTrackers();
  }

  /**
   * Update achievement trackers
   */
  private updateAchievementTrackers(): void {
    // For now, achievement trackers are static after creation
    // In a full implementation, we'd refresh them when progress changes
    // This is a hook for future dynamic updates
  }

  /**
   * Animate XP gain
   */
  animateXPGain(amount: number): void {
    // Create floating +XP text
    const floatingText = this.scene.add.text(
      120,
      40,
      `+${amount} XP`,
      {
        fontSize: '16px',
        color: '#44ff44',
        fontStyle: 'bold',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 3,
      }
    ).setOrigin(0.5);

    this.container.add(floatingText);

    // Animate up and fade
    this.scene.tweens.add({
      targets: floatingText,
      y: 20,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        floatingText.destroy();
      },
    });

    // Pulse XP bar
    if (this.xpBarFill) {
      this.scene.tweens.add({
        targets: this.xpBarFill,
        scaleY: 1.3,
        duration: 200,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
    }
  }

  /**
   * Show visibility
   */
  show(): void {
    this.container.setVisible(true);
  }

  /**
   * Hide HUD
   */
  hide(): void {
    this.container.setVisible(false);
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.container.destroy();
  }
}
