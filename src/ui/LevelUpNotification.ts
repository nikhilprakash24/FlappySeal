/**
 * Level-Up Notification (v0.2)
 *
 * Displays celebratory notification when player levels up.
 */

import Phaser from 'phaser';
import { GAME_CONFIG, UI_CONFIG } from '../config/constants';

export interface LevelUpData {
  newLevel: number;
  rewards: {
    currency?: number;
    unlock?: string;
  };
}

export class LevelUpNotification {
  private scene: Phaser.Scene;
  private container?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Show level-up notification
   */
  show(data: LevelUpData): void {
    // Create container
    this.container = this.scene.add.container(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2
    );
    this.container.setDepth(1000);

    // Background overlay
    const overlay = this.scene.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(
      -GAME_CONFIG.WIDTH / 2,
      -GAME_CONFIG.HEIGHT / 2,
      GAME_CONFIG.WIDTH,
      GAME_CONFIG.HEIGHT
    );

    // Notification panel
    const panelWidth = 400;
    const panelHeight = 300;
    const panel = this.scene.add.graphics();

    // Gradient background
    panel.fillGradientStyle(0x4488ff, 0x4488ff, 0x2244aa, 0x2244aa, 1);
    panel.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 20);

    // Border
    panel.lineStyle(4, 0xffffff, 1);
    panel.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 20);

    // Glow effect
    panel.lineStyle(8, 0x88bbff, 0.3);
    panel.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 20);

    // "Level Up!" text
    const levelUpText = this.scene.add.text(
      0,
      -100,
      'LEVEL UP!',
      {
        fontSize: '48px',
        color: '#ffff00',
        fontStyle: 'bold',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 6,
      }
    ).setOrigin(0.5);

    // Star particles around text
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const distance = 80;
      const star = this.scene.add.text(
        Math.cos(angle) * distance,
        -100 + Math.sin(angle) * distance,
        '✨',
        { fontSize: '24px' }
      ).setOrigin(0.5);

      // Rotate animation
      this.scene.tweens.add({
        targets: star,
        angle: 360,
        duration: 2000,
        repeat: -1,
        ease: 'Linear',
      });

      this.container!.add(star);
    }

    // New level number
    const levelText = this.scene.add.text(
      0,
      -30,
      `Level ${data.newLevel}`,
      {
        fontSize: '36px',
        color: '#ffffff',
        fontStyle: 'bold',
        fontFamily: 'Arial',
      }
    ).setOrigin(0.5);

    // Rewards section
    let rewardY = 30;

    if (data.rewards.currency && data.rewards.currency > 0) {
      const currencyText = this.scene.add.text(
        0,
        rewardY,
        `+${data.rewards.currency} 🐟`,
        {
          fontSize: '24px',
          color: '#ffff44',
          fontStyle: 'bold',
          fontFamily: 'Arial',
        }
      ).setOrigin(0.5);
      this.container!.add(currencyText);
      rewardY += 40;
    }

    if (data.rewards.unlock) {
      const unlockText = this.scene.add.text(
        0,
        rewardY,
        `Unlocked: ${data.rewards.unlock}`,
        {
          fontSize: '20px',
          color: '#ff88ff',
          fontStyle: 'bold',
          fontFamily: 'Arial',
        }
      ).setOrigin(0.5);
      this.container!.add(unlockText);
      rewardY += 40;
    }

    // Continue prompt
    const continueText = this.scene.add.text(
      0,
      110,
      'Click to Continue',
      {
        fontSize: '18px',
        color: '#cccccc',
        fontFamily: 'Arial',
      }
    ).setOrigin(0.5);

    // Pulse animation
    this.scene.tweens.add({
      targets: continueText,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Add all elements to container
    this.container.add([
      overlay,
      panel,
      levelUpText,
      levelText,
      continueText,
    ]);

    // Entrance animation
    this.container.setScale(0);
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut',
    });

    // Celebratory particles
    this.createParticleEffect();

    // Make interactive to dismiss
    overlay.setInteractive(
      new Phaser.Geom.Rectangle(
        -GAME_CONFIG.WIDTH / 2,
        -GAME_CONFIG.HEIGHT / 2,
        GAME_CONFIG.WIDTH,
        GAME_CONFIG.HEIGHT
      ),
      Phaser.Geom.Rectangle.Contains
    );

    overlay.once('pointerdown', () => {
      this.hide();
    });

    // Auto-dismiss after 5 seconds
    this.scene.time.delayedCall(5000, () => {
      if (this.container) {
        this.hide();
      }
    });
  }

  /**
   * Create particle celebration effect
   */
  private createParticleEffect(): void {
    // Create star burst effect
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 300 + 200;
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;

      const star = this.scene.add.text(0, 0, ['⭐', '✨', '💫'][Math.floor(Math.random() * 3)], {
        fontSize: '20px',
      }).setOrigin(0.5);

      this.container!.add(star);

      // Burst animation
      this.scene.tweens.add({
        targets: star,
        x: velocityX * 0.5,
        y: velocityY * 0.5,
        alpha: 0,
        scale: 0.5,
        duration: 1000,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          star.destroy();
        },
      });
    }
  }

  /**
   * Hide notification
   */
  hide(): void {
    if (!this.container) return;

    // Exit animation
    this.scene.tweens.add({
      targets: this.container,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 300,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.container?.destroy();
        this.container = undefined;
      },
    });
  }

  /**
   * Clean up
   */
  destroy(): void {
    if (this.container) {
      this.container.destroy();
      this.container = undefined;
    }
  }
}
