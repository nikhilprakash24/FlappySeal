/**
 * Seal Entity
 *
 * Harbor Seal character - the classic balanced animal.
 * Now a thin wrapper around the Character base class.
 */

import Phaser from 'phaser';
import { Character } from './Character';
import { SEAL_CHARACTER_CONFIG } from '../config/characters';

/**
 * Seal class - maintains backward compatibility while using new Character system
 */
export class Seal extends Character {
  constructor(scene: Phaser.Scene, x: number, y: number, skinId: string = 'seal_default') {
    // Use SEAL_CHARACTER_CONFIG for all properties
    super(scene, x, y, SEAL_CHARACTER_CONFIG);

    // Note: skinId parameter kept for backward compatibility
    // In the future, this could apply color variations from the skin system
    // For now, character config colors are used
  }
}
