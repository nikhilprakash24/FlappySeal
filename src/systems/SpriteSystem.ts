/**
 * Sprite System
 *
 * Manages sprite loading, texture atlases, and sprite rendering.
 * Foundation for replacing procedural graphics with professional art.
 */

import Phaser from 'phaser';

export interface SpriteConfig {
  key: string;
  path: string;
  frameWidth?: number;
  frameHeight?: number;
  frames?: number;
}

export interface AtlasConfig {
  key: string;
  textureURL: string;
  atlasURL: string;
}

export class SpriteSystem {
  private scene: Phaser.Scene;
  private loadedSprites: Set<string> = new Set();
  private loadedAtlases: Set<string> = new Set();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Load sprite sheet
   */
  loadSpriteSheet(config: SpriteConfig): void {
    if (this.loadedSprites.has(config.key)) {
      return;
    }

    this.scene.load.spritesheet(config.key, config.path, {
      frameWidth: config.frameWidth || 64,
      frameHeight: config.frameHeight || 64,
    });

    this.loadedSprites.add(config.key);
  }

  /**
   * Load texture atlas (more efficient for many sprites)
   */
  loadAtlas(config: AtlasConfig): void {
    if (this.loadedAtlases.has(config.key)) {
      return;
    }

    this.scene.load.atlas(config.key, config.textureURL, config.atlasURL);
    this.loadedAtlases.add(config.key);
  }

  /**
   * Create animated sprite
   */
  createAnimatedSprite(
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ): Phaser.GameObjects.Sprite {
    return this.scene.add.sprite(x, y, texture, frame);
  }

  /**
   * Preload common game sprites
   * In production, these would be actual asset files
   * For now, we'll use procedurally generated placeholder textures
   */
  preloadPlaceholderAssets(): void {
    // Create placeholder textures until real art is commissioned
    this.createPlaceholderTexture('seal-idle', 64, 64, 0x3a3a3a);
    this.createPlaceholderTexture('seal-swim', 64, 64, 0x4a4a4a);
    this.createPlaceholderTexture('seal-dive', 64, 64, 0x2a2a2a);
    this.createPlaceholderTexture('obstacle-coral', 60, 120, 0xd54062);
    this.createPlaceholderTexture('obstacle-jellyfish', 60, 120, 0x9b5de5);
  }

  /**
   * Create procedural placeholder texture
   * TODO: Replace with actual sprite loading in production
   */
  private createPlaceholderTexture(
    key: string,
    width: number,
    height: number,
    color: number
  ): void {
    if (this.scene.textures.exists(key)) {
      return;
    }

    const graphics = this.scene.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, width, height);

    // Add some visual interest to placeholder
    graphics.fillStyle(color + 0x111111, 0.5);
    graphics.fillCircle(width / 2, height / 2, width / 3);

    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  /**
   * Check if sprite is loaded
   */
  isLoaded(key: string): boolean {
    return this.loadedSprites.has(key) || this.loadedAtlases.has(key);
  }

  /**
   * Destroy all loaded sprites
   */
  destroy(): void {
    this.loadedSprites.clear();
    this.loadedAtlases.clear();
  }
}
