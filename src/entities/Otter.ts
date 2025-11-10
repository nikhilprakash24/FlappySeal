/**
 * Otter Entity
 *
 * River Otter character - light, agile, and challenging.
 * 35% lighter and less powerful than seal.
 * Hard difficulty - high skill ceiling.
 */

import Phaser from 'phaser';
import { Character } from './Character';
import { OTTER_CHARACTER_CONFIG } from '../config/characters';

/**
 * Otter class
 *
 * Characteristics:
 * - Smaller hitbox (easier to dodge obstacles)
 * - Weaker jumps (harder to reach high gaps)
 * - Falls slower (floaty feel)
 * - More responsive controls (agile)
 *
 * Best for: Expert players who want precision gameplay
 */
export class Otter extends Character {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, OTTER_CHARACTER_CONFIG);
  }
}
