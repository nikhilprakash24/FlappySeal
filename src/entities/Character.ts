/**
 * Character Entity (Base Class)
 *
 * Abstract character class that supports multiple animals through configuration.
 * Handles physics, rendering, and input response for any CharacterConfig.
 *
 * Refactored from Seal.ts to support Seal, Otter, and Sea Lion.
 */

import Phaser from 'phaser';
import { clamp } from '../utils/helpers';
import { CharacterConfig, BodyShape } from '../config/characters';
import type { Bounds } from '../types';

export class Character {
  protected scene: Phaser.Scene;
  protected graphics: Phaser.GameObjects.Graphics;
  protected config: CharacterConfig;

  // Position and physics state
  public x: number;
  public y: number;
  protected velocity: number = 0;
  protected rotation: number = 0;

  // Animation state
  protected flipperOffset: number = 0;
  protected flipperDirection: number = 1;

  // Physics parameters (can be overridden via debug system)
  protected gravity: number;
  protected swimUpForce: number;
  protected diveDownForce: number;
  protected maxVelocity: number;

  constructor(scene: Phaser.Scene, x: number, y: number, config: CharacterConfig) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.config = config;

    // Initialize physics from config
    this.gravity = config.physics.gravity;
    this.swimUpForce = config.physics.swimUpForce;
    this.diveDownForce = config.physics.diveDownForce;
    this.maxVelocity = config.physics.maxVelocityY;

    // Create graphics object for rendering
    this.graphics = scene.add.graphics();
    this.draw();
  }

  /**
   * Get character configuration
   */
  public getConfig(): CharacterConfig {
    return this.config;
  }

  /**
   * Get character name
   */
  public getName(): string {
    return this.config.name;
  }

  /**
   * Get character type
   */
  public getType(): string {
    return this.config.type;
  }

  /**
   * Apply upward force (swim up)
   */
  public swimUp(): void {
    this.velocity = this.swimUpForce;
  }

  /**
   * Apply downward force (dive)
   */
  public dive(): void {
    this.velocity = this.diveDownForce;
  }

  /**
   * Update physics and position
   */
  public update(): void {
    // Apply gravity
    this.velocity += this.gravity;

    // Clamp velocity to max
    this.velocity = clamp(this.velocity, -this.maxVelocity, this.maxVelocity);

    // Update position
    this.y += this.velocity;

    // Update rotation based on velocity and config
    this.rotation = clamp(
      this.velocity * this.config.physics.rotationSpeed,
      -this.config.physics.maxRotation,
      this.config.physics.maxRotation
    );

    // Animate flippers/limbs
    this.animateFlippers();

    // Redraw at new position and rotation
    this.draw();
  }

  /**
   * Animate flippers/limbs
   */
  protected animateFlippers(): void {
    this.flipperOffset += this.flipperDirection * 0.5;
    if (this.flipperOffset > 3 || this.flipperOffset < -3) {
      this.flipperDirection *= -1;
    }
  }

  /**
   * Get collision bounds (with hitbox scaling)
   */
  public getBounds(): Bounds {
    const width = this.config.size.width * this.config.gameplay.hitboxScale;
    const height = this.config.size.height * this.config.gameplay.hitboxScale;

    return {
      x: this.x - width / 2,
      y: this.y - height / 2,
      width: width,
      height: height,
    };
  }

  /**
   * Check if character hit top boundary
   */
  public isHittingTop(): boolean {
    const bounds = this.getBounds();
    return this.y - bounds.height / 2 <= 0;
  }

  /**
   * Check if character hit bottom boundary
   */
  public isHittingBottom(): boolean {
    const bounds = this.getBounds();
    return this.y + bounds.height / 2 >= this.scene.cameras.main.height;
  }

  /**
   * Get current position
   */
  public getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Get current velocity
   */
  public getVelocity(): number {
    return this.velocity;
  }

  /**
   * Reset to starting position
   */
  public reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.velocity = 0;
    this.rotation = 0;
    this.draw();
  }

  /**
   * Clean up
   */
  public destroy(): void {
    this.graphics.destroy();
  }

  // ========================================================================
  // RENDERING
  // ========================================================================

  /**
   * Main draw method - dispatches to body-shape-specific rendering
   */
  protected draw(): void {
    this.graphics.clear();

    // Set position and rotation of graphics object
    this.graphics.setPosition(this.x, this.y);
    this.graphics.setRotation(Phaser.Math.DegToRad(this.rotation));

    // Draw based on body shape
    switch (this.config.visuals.bodyShape) {
      case BodyShape.SLEEK:
        this.drawSleekBody();
        break;
      case BodyShape.BULKY:
        this.drawBulkyBody();
        break;
      case BodyShape.ROUND:
      default:
        this.drawRoundBody();
        break;
    }

    // Draw common features
    this.drawFeatures();
  }

  /**
   * Draw ROUND body (Seal)
   */
  protected drawRoundBody(): void {
    const g = this.graphics;
    const v = this.config.visuals;
    const s = this.config.size;

    // Main body (ellipse)
    g.fillStyle(v.bodyColor, 1);
    g.fillEllipse(0, 0, s.width, s.height);

    // Head
    g.fillEllipse(40, -5, 35, 30);

    // Belly (if defined)
    if (v.bellyColor) {
      g.fillStyle(v.bellyColor, 1);
      g.fillEllipse(0, 8, s.width * 0.7, s.height * 0.6);
    }

    // Flippers (animated)
    g.fillStyle(v.flipperColor, 1);
    g.fillEllipse(-20, 15 + this.flipperOffset, 25, 15);
    g.fillEllipse(10, 15 + this.flipperOffset, 25, 15);

    // Tail (flipper style)
    g.fillTriangle(
      -35, -10,
      -35, 10,
      -50, 0
    );
  }

  /**
   * Draw SLEEK body (Otter)
   */
  protected drawSleekBody(): void {
    const g = this.graphics;
    const v = this.config.visuals;
    const s = this.config.size;

    // Elongated body (2:1 ratio for sleekness)
    g.fillStyle(v.bodyColor, 1);
    g.fillEllipse(0, 0, s.width * 1.1, s.height * 0.8); // More elongated

    // Head (smaller, pointier)
    g.fillEllipse(35, -3, 28, 22);

    // Belly (tan/lighter color)
    if (v.bellyColor) {
      g.fillStyle(v.bellyColor, 1);
      g.fillEllipse(5, 6, s.width * 0.8, s.height * 0.5);
    }

    // Paws instead of flippers (smaller, more delicate)
    g.fillStyle(v.flipperColor, 1);
    g.fillCircle(-18, 12 + this.flipperOffset, 8);
    g.fillCircle(8, 12 + this.flipperOffset, 8);

    // Tapered tail
    g.fillStyle(v.flipperColor, 1);
    g.beginPath();
    g.moveTo(-30, -8);
    g.lineTo(-30, 8);
    g.lineTo(-48, 3);
    g.lineTo(-48, -3);
    g.closePath();
    g.fillPath();
  }

  /**
   * Draw BULKY body (Sea Lion)
   */
  protected drawBulkyBody(): void {
    const g = this.graphics;
    const v = this.config.visuals;
    const s = this.config.size;

    // Wide, barrel-shaped body
    g.fillStyle(v.bodyColor, 1);
    g.fillEllipse(0, 0, s.width * 0.95, s.height * 1.1); // Wider, rounder

    // Larger head
    g.fillEllipse(42, -6, 40, 35);

    // Belly
    if (v.bellyColor) {
      g.fillStyle(v.bellyColor, 1);
      g.fillEllipse(0, 10, s.width * 0.75, s.height * 0.65);
    }

    // Thick flippers
    g.fillStyle(v.flipperColor, 1);
    g.fillEllipse(-22, 18 + this.flipperOffset, 30, 18);
    g.fillEllipse(12, 18 + this.flipperOffset, 30, 18);

    // Thick tail flipper
    g.fillTriangle(
      -38, -12,
      -38, 12,
      -55, 0
    );

    // EAR FLAPS (key sea lion feature!)
    if (v.features.hasEarFlaps) {
      g.fillStyle(v.flipperColor, 1);
      // Small triangular ear flaps on head
      g.fillTriangle(48, -18, 52, -14, 48, -12); // Right ear
      g.fillTriangle(48, 2, 52, 6, 48, 8); // Left ear (if visible from side)
    }
  }

  /**
   * Draw common features (eyes, nose, whiskers)
   */
  protected drawFeatures(): void {
    const g = this.graphics;
    const v = this.config.visuals;

    // Determine feature positions based on body shape
    let eyeX = 45;
    let eyeY = -10;
    let noseX = 58;
    let noseY = 0;
    let whiskerStartX = 55;

    if (this.config.visuals.bodyShape === BodyShape.SLEEK) {
      // Otter - features closer, smaller head
      eyeX = 38;
      eyeY = -8;
      noseX = 50;
      noseY = 0;
      whiskerStartX = 48;
    } else if (this.config.visuals.bodyShape === BodyShape.BULKY) {
      // Sea Lion - features further, larger head
      eyeX = 50;
      eyeY = -12;
      noseX = 64;
      noseY = -2;
      whiskerStartX = 60;
    }

    // Eyes
    g.fillStyle(v.eyeColor, 1);
    const eyeSize = this.config.visuals.bodyShape === BodyShape.SLEEK ? 4 : 5;
    g.fillCircle(eyeX, eyeY, eyeSize);

    // Pupil
    g.fillStyle(0x000000, 1);
    const pupilSize = this.config.visuals.bodyShape === BodyShape.SLEEK ? 2.5 : 3;
    g.fillCircle(eyeX + 2, eyeY, pupilSize);

    // Nose
    g.fillStyle(v.noseColor, 1);
    const noseSize = this.config.visuals.bodyShape === BodyShape.BULKY ? 4 : 3;
    g.fillCircle(noseX, noseY, noseSize);

    // Whiskers
    this.drawWhiskers(whiskerStartX);
  }

  /**
   * Draw whiskers based on whisker length feature
   */
  protected drawWhiskers(startX: number): void {
    const g = this.graphics;
    const whiskerType = this.config.visuals.features.whiskerLength;

    let whiskerCount = 3;
    let whiskerLength = 15;
    let whiskerThickness = 1;

    switch (whiskerType) {
      case 'short':
        whiskerCount = 2;
        whiskerLength = 10;
        break;
      case 'medium':
        whiskerCount = 3;
        whiskerLength = 15;
        break;
      case 'long':
        whiskerCount = 4;
        whiskerLength = 20;
        break;
      case 'thick':
        whiskerCount = 3;
        whiskerLength = 15;
        whiskerThickness = 2;
        break;
    }

    g.lineStyle(whiskerThickness, 0x000000, 0.5);

    for (let i = 0; i < whiskerCount; i++) {
      const yOffset = (i - Math.floor(whiskerCount / 2)) * 5;
      const endYOffset = (i - Math.floor(whiskerCount / 2)) * 7;

      g.lineBetween(
        startX,
        yOffset,
        startX + whiskerLength,
        endYOffset
      );
    }
  }

  // ========================================================================
  // DEBUG/TESTING ACCESSORS
  // ========================================================================

  public getGravity(): number {
    return this.gravity;
  }

  public setGravity(value: number): void {
    this.gravity = value;
  }

  public getSwimUpForce(): number {
    return Math.abs(this.swimUpForce); // Return as positive for UI
  }

  public setSwimUpForce(value: number): void {
    this.swimUpForce = -Math.abs(value); // Store as negative (upward)
  }

  public getDiveDownForce(): number {
    return this.diveDownForce;
  }

  public setDiveDownForce(value: number): void {
    this.diveDownForce = value;
  }

  public getMaxVelocity(): number {
    return this.maxVelocity;
  }

  public setMaxVelocity(value: number): void {
    this.maxVelocity = value;
  }
}
