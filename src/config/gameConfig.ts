import Phaser from 'phaser';
import { GAME_CONFIG } from './constants';

/**
 * Phaser Game Configuration
 *
 * Main configuration object for Phaser game instance.
 * This will be imported and used when all scenes are ready.
 */

export const createGameConfig = (scenes: Phaser.Scene[]): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0a4f6e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // Custom gravity implementation
      debug: false,
    },
  },
  scene: scenes,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  fps: {
    target: GAME_CONFIG.TARGET_FPS,
    forceSetTimeOut: false,
  },
});
