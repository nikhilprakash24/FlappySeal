/**
 * Background Manager System
 *
 * Manages parallax scrolling background layers for visual depth.
 */

import Phaser from 'phaser';
import { GAME_CONFIG } from '../config/constants';

interface BackgroundLayer {
  graphics: Phaser.GameObjects.Graphics;
  scrollSpeed: number;
  offset: number;
}

export class BackgroundManager {
  private scene: Phaser.Scene;
  private layers: BackgroundLayer[] = [];
  private ambientBubbles: Phaser.GameObjects.Graphics[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createLayers();
    this.createAmbientEffects();
  }

  /**
   * Create parallax background layers
   */
  private createLayers(): void {
    // Layer 1: Far background (slowest)
    const layer1 = this.scene.add.graphics();
    layer1.fillStyle(0x0a4f6e, 0.4);
    layer1.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
    layer1.setDepth(-30);
    this.layers.push({ graphics: layer1, scrollSpeed: 0, offset: 0 });

    // Layer 2: Mid background with depth fog
    const layer2 = this.scene.add.graphics();
    layer2.fillStyle(0x0d5f7e, 0.3);
    layer2.fillRect(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);
    layer2.setDepth(-20);
    this.layers.push({ graphics: layer2, scrollSpeed: 0, offset: 0 });

    // Layer 3: Underwater plants (slow scroll)
    this.createPlantLayer();

    // Layer 4: Light rays (medium scroll)
    this.createLightRays();

    // Layer 5: Small fish school (faster scroll)
    this.createFishLayer();
  }

  /**
   * Create underwater plant layer
   */
  private createPlantLayer(): void {
    const plantsGraphics = this.scene.add.graphics();
    plantsGraphics.setDepth(-15);

    // Draw kelp/seaweed
    for (let i = 0; i < 8; i++) {
      const x = (GAME_CONFIG.WIDTH / 8) * i + 50;
      const height = Phaser.Math.Between(150, 300);
      const color = i % 2 === 0 ? 0x0a6e4a : 0x0d8a5f;

      // Draw wavy plant
      plantsGraphics.fillStyle(color, 0.3);

      const path = new Phaser.Curves.Path(x, GAME_CONFIG.HEIGHT);
      const segments = 6;
      const segmentHeight = height / segments;

      for (let j = 0; j < segments; j++) {
        const currentY = GAME_CONFIG.HEIGHT - segmentHeight * j;
        const nextY = GAME_CONFIG.HEIGHT - segmentHeight * (j + 1);
        const curveOffset = Math.sin((j + i) * 0.5) * 15;

        path.lineTo(x + curveOffset, (currentY + nextY) / 2);
        path.lineTo(x, nextY);
      }

      // Create polygon from path
      const points = path.getPoints(20);
      const shape = new Phaser.Geom.Polygon(points);
      plantsGraphics.fillPoints(shape.points, true);
    }

    // Gentle sway animation
    this.scene.tweens.add({
      targets: plantsGraphics,
      x: 5,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.layers.push({ graphics: plantsGraphics, scrollSpeed: 0.3, offset: 0 });
  }

  /**
   * Create light rays
   */
  private createLightRays(): void {
    for (let i = 0; i < 5; i++) {
      const ray = this.scene.add.graphics();
      ray.setDepth(-10);

      const x = 100 + i * 180;
      const width = 40;
      const height = 800;

      // Create gradient effect with multiple rectangles
      for (let j = 0; j < 3; j++) {
        const alpha = 0.08 - j * 0.02;
        ray.fillStyle(0xffffff, alpha);
        ray.fillRect(
          x + (width / 2) * j - width,
          -100,
          width - j * 5,
          height
        );
      }

      ray.setAngle(15);

      // Gentle pulsing animation
      this.scene.tweens.add({
        targets: ray,
        alpha: 0.6,
        duration: 3000 + i * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.layers.push({ graphics: ray, scrollSpeed: 0.5, offset: 0 });
    }
  }

  /**
   * Create small fish school layer
   */
  private createFishLayer(): void {
    const fishGraphics = this.scene.add.graphics();
    fishGraphics.setDepth(-5);

    // Draw small fish silhouettes
    for (let i = 0; i < 12; i++) {
      const x = Phaser.Math.Between(0, GAME_CONFIG.WIDTH);
      const y = Phaser.Math.Between(100, 500);
      const fishColor = 0x5a7a8a;

      // Simple fish shape
      fishGraphics.fillStyle(fishColor, 0.3);
      fishGraphics.fillEllipse(x, y, 15, 8);
      fishGraphics.fillTriangle(
        x - 8, y - 5,
        x - 8, y + 5,
        x - 15, y
      );
    }

    // Slow floating animation
    this.scene.tweens.add({
      targets: fishGraphics,
      y: '+=30',
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.layers.push({ graphics: fishGraphics, scrollSpeed: 1, offset: 0 });
  }

  /**
   * Create ambient bubble effects
   */
  private createAmbientEffects(): void {
    // Spawn ambient bubbles periodically
    this.scene.time.addEvent({
      delay: 800,
      callback: () => {
        const bubble = this.scene.add.graphics();
        bubble.setDepth(-8);

        const x = Phaser.Math.Between(0, GAME_CONFIG.WIDTH);
        const y = GAME_CONFIG.HEIGHT + 20;
        const size = Phaser.Math.Between(3, 12);

        bubble.fillStyle(0xffffff, 0.2);
        bubble.lineStyle(1, 0xffffff, 0.3);
        bubble.fillCircle(0, 0, size);
        bubble.strokeCircle(0, 0, size);
        bubble.setPosition(x, y);

        this.ambientBubbles.push(bubble);

        // Float upward
        this.scene.tweens.add({
          targets: bubble,
          y: -50,
          x: x + Phaser.Math.Between(-40, 40),
          alpha: 0,
          duration: Phaser.Math.Between(3000, 6000),
          ease: 'Sine.easeInOut',
          onComplete: () => {
            const index = this.ambientBubbles.indexOf(bubble);
            if (index > -1) {
              this.ambientBubbles.splice(index, 1);
            }
            bubble.destroy();
          },
        });
      },
      loop: true,
    });
  }

  /**
   * Update parallax scrolling
   */
  update(scrollSpeed: number): void {
    for (const layer of this.layers) {
      if (layer.scrollSpeed > 0) {
        layer.offset -= scrollSpeed * layer.scrollSpeed * 0.1;

        // Wrap around for infinite scroll
        if (layer.offset <= -GAME_CONFIG.WIDTH) {
          layer.offset += GAME_CONFIG.WIDTH;
        }

        layer.graphics.setX(layer.offset);
      }
    }
  }

  /**
   * Clean up
   */
  destroy(): void {
    for (const layer of this.layers) {
      layer.graphics.destroy();
    }
    for (const bubble of this.ambientBubbles) {
      bubble.destroy();
    }
    this.layers = [];
    this.ambientBubbles = [];
  }
}
