/**
 * Storage Utility
 *
 * Wrapper around localStorage with error handling and type safety.
 */

import { STORAGE_KEYS } from '../config/constants';
import type { GameSettings } from '../types';

class StorageManager {
  /**
   * Get high score from storage
   */
  getHighScore(): number {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
      return stored ? parseInt(stored, 10) : 0;
    } catch (error) {
      console.error('Error reading high score:', error);
      return 0;
    }
  }

  /**
   * Save high score to storage
   */
  setHighScore(score: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
    } catch (error) {
      console.error('Error saving high score:', error);
    }
  }

  /**
   * Get game settings from storage
   */
  getSettings(): GameSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading settings:', error);
    }

    // Return default settings
    return {
      musicEnabled: true,
      sfxEnabled: true,
      musicVolume: 0.5,
      sfxVolume: 0.8,
    };
  }

  /**
   * Save game settings to storage
   */
  setSettings(settings: GameSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  /**
   * Check if tutorial has been seen
   */
  getTutorialSeen(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TUTORIAL_SEEN);
      return stored === 'true';
    } catch (error) {
      console.error('Error reading tutorial status:', error);
      return false;
    }
  }

  /**
   * Mark tutorial as seen
   */
  setTutorialSeen(seen: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TUTORIAL_SEEN, seen.toString());
    } catch (error) {
      console.error('Error saving tutorial status:', error);
    }
  }

  /**
   * Clear all stored data (for testing/reset)
   */
  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

// Export singleton instance
export const storage = new StorageManager();
