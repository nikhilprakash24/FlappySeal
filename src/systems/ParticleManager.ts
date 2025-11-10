/**
 * Particle Manager System
 *
 * Manages visual effects like bubbles, splashes, trails, and explosions.
 * Uses object pooling for performance.
 */

import Phaser from 'phaser';

export class ParticleManager {
  private scene: Phaser.Scene;
  private particlePool: Phaser.GameObjects.Graphics[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Get a particle from the pool or create new one
   */
  private getParticle(): Phaser.GameObjects.Graphics {
    if (this.particlePool.length > 0) {
      const particle = this.particlePool.pop()!;
      particle.setVisible(true);
      particle.setAlpha(1);
      return particle;
    }
    return this.scene.add.graphics();
  }

  /**
   * Return particle to pool
   */
  private returnParticle(particle: Phaser.GameObjects.Graphics): void {
    particle.clear();
    particle.setVisible(false);
    this.particlePool.push(particle);
  }

  /**
   * Create splash effect when seal swims/dives
   */
  createSplash(x: number, y: number, isUp: boolean): void {
    const particleCount = 8;
    const angleStart = isUp ? 45 : 225;
    const angleEnd = isUp ? 135 : 315;

    for (let i = 0; i < particleCount; i++) {
      const particle = this.getParticle();
      const angle = Phaser.Math.Between(angleStart, angleEnd);
      const speed = Phaser.Math.Between(80, 150);
      const size = Phaser.Math.Between(3, 7);

      // Draw particle
      particle.fillStyle(0xffffff, 0.7);
      particle.fillCircle(0, 0, size);
      particle.setPosition(x, y);

      // Animate
      const radians = Phaser.Math.DegToRad(angle);
      const targetX = x + Math.cos(radians) * speed;
      const targetY = y + Math.sin(radians) * speed;

      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 600,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          this.returnParticle(particle);
        },
      });
    }
  }

  /**
   * Create bubble stream effect
   */
  createBubbleStream(x: number, y: number, count: number = 5): void {
    for (let i = 0; i < count; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        const particle = this.getParticle();
        const size = Phaser.Math.Between(4, 8);
        const offsetX = Phaser.Math.Between(-10, 10);

        // Draw bubble
        particle.fillStyle(0xffffff, 0.3);
        particle.lineStyle(2, 0xffffff, 0.5);
        particle.fillCircle(0, 0, size);
        particle.strokeCircle(0, 0, size);
        particle.setPosition(x + offsetX, y);

        // Animate upward
        this.scene.tweens.add({
          targets: particle,
          y: y - Phaser.Math.Between(100, 200),
          x: x + offsetX + Phaser.Math.Between(-20, 20),
          alpha: 0,
          duration: Phaser.Math.Between(1500, 2500),
          ease: 'Sine.easeInOut',
          onComplete: () => {
            this.returnParticle(particle);
          },
        });
      });
    }
  }

  /**
   * Create collision explosion effect
   */
  createExplosion(x: number, y: number): void {
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const particle = this.getParticle();
      const angle = (360 / particleCount) * i;
      const speed = Phaser.Math.Between(60, 120);
      const size = Phaser.Math.Between(4, 10);

      // Draw particle (white/cyan for water effect)
      const colors = [0xffffff, 0x00d4ff, 0x88ddff];
      const color = Phaser.Utils.Array.GetRandom(colors);
      particle.fillStyle(color, 0.8);
      particle.fillCircle(0, 0, size);
      particle.setPosition(x, y);

      // Animate outward
      const radians = Phaser.Math.DegToRad(angle);
      const targetX = x + Math.cos(radians) * speed;
      const targetY = y + Math.sin(radians) * speed;

      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 800,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          this.returnParticle(particle);
        },
      });
    }

    // Add flash effect
    const flash = this.scene.add.graphics();
    flash.fillStyle(0xffffff, 0.5);
    flash.fillCircle(x, y, 40);
    flash.setDepth(50);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 300,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        flash.destroy();
      },
    });
  }

  /**
   * Create swim trail effect
   */
  createTrail(x: number, y: number): void {
    const particle = this.getParticle();
    const size = Phaser.Math.Between(3, 6);

    // Draw trail particle
    particle.fillStyle(0x88ddff, 0.4);
    particle.fillCircle(0, 0, size);
    particle.setPosition(x, y);

    // Fade out
    this.scene.tweens.add({
      targets: particle,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 400,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.returnParticle(particle);
      },
    });
  }

  /**
   * Create score pop effect
   */
  createScorePop(x: number, y: number): void {
    const particleCount = 6;

    for (let i = 0; i < particleCount; i++) {
      const particle = this.getParticle();
      const angle = (360 / particleCount) * i;
      const distance = 30;
      const size = 4;

      // Draw particle (gold color)
      particle.fillStyle(0xffd700, 0.9);
      particle.fillCircle(0, 0, size);
      particle.setPosition(x, y);

      // Animate in circle
      const radians = Phaser.Math.DegToRad(angle);
      const targetX = x + Math.cos(radians) * distance;
      const targetY = y + Math.sin(radians) * distance;

      this.scene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        duration: 600,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.returnParticle(particle);
        },
      });
    }
  }

  /**
   * Clean up all particles
   */
  destroy(): void {
    for (const particle of this.particlePool) {
      particle.destroy();
    }
    this.particlePool = [];
  }
}
