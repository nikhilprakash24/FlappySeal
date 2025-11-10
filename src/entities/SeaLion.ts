/**
 * Sea Lion Entity
 *
 * California Sea Lion character - heavy, powerful, and forgiving.
 * 35% heavier and more powerful than seal.
 * Easy difficulty - great for beginners.
 */

import Phaser from 'phaser';
import { Character } from './Character';
import { SEALION_CHARACTER_CONFIG } from '../config/characters';

/**
 * Sea Lion class
 *
 * Characteristics:
 * - Larger hitbox (harder to dodge obstacles)
 * - Powerful jumps (easier to recover from mistakes)
 * - Falls faster (heavy feel)
 * - Sluggish controls (momentum-based)
 * - Distinctive ear flaps
 *
 * Best for: Beginners who want forgiving gameplay
 */
export class SeaLion extends Character {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, SEALION_CHARACTER_CONFIG);
  }
}
