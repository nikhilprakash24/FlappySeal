/**
 * Unlock System
 *
 * Manages progression, unlockables, and player inventory.
 * Foundation for meta-progression in v0.2.
 */

import { storage } from '../utils/storage';

export enum UnlockType {
  SEAL_SKIN = 'seal_skin',
  POWER_UP = 'power_up',
  GAME_MODE = 'game_mode',
  BIOME = 'biome',
}

export enum UnlockConditionType {
  SCORE = 'score',
  ACHIEVEMENT = 'achievement',
  LEVEL = 'level',
  CURRENCY = 'currency',
  PREMIUM = 'premium',
}

export interface UnlockCondition {
  type: UnlockConditionType;
  value: number | string;
  description: string;
}

export interface Unlockable {
  id: string;
  type: UnlockType;
  name: string;
  description: string;
  icon?: string;
  condition: UnlockCondition;
  cost?: number; // In-game currency cost
  premiumCost?: number; // Premium currency cost
}

export interface PlayerProgress {
  level: number;
  experience: number;
  currency: number; // Fish collected
  premiumCurrency: number; // Pearls
  unlockedItems: string[];
  equippedSkin: string;
}

const STORAGE_KEY = 'flappyseal_progress';

// Experience required for each level
const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, // 1-10
  3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450, // 11-20
  // ... continues to level 100
];

// Define unlockables
export const UNLOCKABLES: Unlockable[] = [
  // Starter seal (always unlocked)
  {
    id: 'seal_default',
    type: UnlockType.SEAL_SKIN,
    name: 'Harbor Seal',
    description: 'Classic harbor seal',
    condition: { type: UnlockConditionType.LEVEL, value: 0, description: 'Default' },
  },

  // Early unlocks
  {
    id: 'seal_spotted',
    type: UnlockType.SEAL_SKIN,
    name: 'Spotted Seal',
    description: 'Adorable spotted pattern',
    condition: { type: UnlockConditionType.LEVEL, value: 5, description: 'Reach level 5' },
    cost: 500,
  },
  {
    id: 'seal_arctic',
    type: UnlockType.SEAL_SKIN,
    name: 'Arctic Seal',
    description: 'Hardy seal from cold waters',
    condition: { type: UnlockConditionType.LEVEL, value: 10, description: 'Reach level 10' },
    cost: 1000,
  },
  {
    id: 'seal_leopard',
    type: UnlockType.SEAL_SKIN,
    name: 'Leopard Seal',
    description: 'Fierce Antarctic predator',
    condition: { type: UnlockConditionType.SCORE, value: 100, description: 'Score 100 points' },
    cost: 2000,
  },

  // Achievement-based unlocks
  {
    id: 'seal_golden',
    type: UnlockType.SEAL_SKIN,
    name: 'Golden Seal',
    description: 'Legendary golden seal',
    condition: {
      type: UnlockConditionType.ACHIEVEMENT,
      value: 'perfect_100',
      description: 'Complete "Perfect 100" achievement',
    },
  },

  // Premium unlocks
  {
    id: 'seal_rainbow',
    type: UnlockType.SEAL_SKIN,
    name: 'Rainbow Seal',
    description: 'Mystical rainbow-colored seal',
    condition: { type: UnlockConditionType.PREMIUM, value: 0, description: 'Premium only' },
    premiumCost: 100,
  },

  // Power-ups (unlock for permanent availability)
  {
    id: 'powerup_shield',
    type: UnlockType.POWER_UP,
    name: 'Shield',
    description: 'Survive one collision',
    condition: { type: UnlockConditionType.LEVEL, value: 3, description: 'Reach level 3' },
  },
  {
    id: 'powerup_magnet',
    type: UnlockType.POWER_UP,
    name: 'Magnet',
    description: 'Auto-collect fish',
    condition: { type: UnlockConditionType.LEVEL, value: 7, description: 'Reach level 7' },
  },

  // Game modes
  {
    id: 'mode_challenge',
    type: UnlockType.GAME_MODE,
    name: 'Challenge Mode',
    description: 'Special challenge runs',
    condition: { type: UnlockConditionType.SCORE, value: 50, description: 'Score 50 points' },
  },

  // Biomes
  {
    id: 'biome_deep_ocean',
    type: UnlockType.BIOME,
    name: 'Deep Ocean',
    description: 'Dark, mysterious depths',
    condition: { type: UnlockConditionType.LEVEL, value: 15, description: 'Reach level 15' },
  },
];

export class UnlockSystem {
  private progress: PlayerProgress;

  constructor() {
    this.progress = this.loadProgress();
    this.ensureDefaults();
  }

  /**
   * Load player progress from storage
   */
  private loadProgress(): PlayerProgress {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }

    // Default progress
    return {
      level: 1,
      experience: 0,
      currency: 0,
      premiumCurrency: 0,
      unlockedItems: ['seal_default'], // Default seal always unlocked
      equippedSkin: 'seal_default',
    };
  }

  /**
   * Save progress to storage
   */
  private saveProgress(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  /**
   * Ensure default items are unlocked
   */
  private ensureDefaults(): void {
    if (!this.progress.unlockedItems.includes('seal_default')) {
      this.progress.unlockedItems.push('seal_default');
      this.saveProgress();
    }
  }

  /**
   * Add experience and check for level up
   */
  addExperience(amount: number): { leveledUp: boolean; newLevel?: number } {
    this.progress.experience += amount;

    // Check for level up
    const newLevel = this.calculateLevel(this.progress.experience);
    const leveledUp = newLevel > this.progress.level;

    if (leveledUp) {
      this.progress.level = newLevel;
      this.saveProgress();
      return { leveledUp: true, newLevel };
    }

    this.saveProgress();
    return { leveledUp: false };
  }

  /**
   * Calculate level from experience
   */
  private calculateLevel(exp: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (exp >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  /**
   * Add currency (fish)
   */
  addCurrency(amount: number): void {
    this.progress.currency += amount;
    this.saveProgress();
  }

  /**
   * Add premium currency (pearls)
   */
  addPremiumCurrency(amount: number): void {
    this.progress.premiumCurrency += amount;
    this.saveProgress();
  }

  /**
   * Check if item is unlocked
   */
  isUnlocked(itemId: string): boolean {
    return this.progress.unlockedItems.includes(itemId);
  }

  /**
   * Check if item can be unlocked
   */
  canUnlock(itemId: string): { canUnlock: boolean; reason?: string } {
    const item = UNLOCKABLES.find(u => u.id === itemId);
    if (!item) {
      return { canUnlock: false, reason: 'Item not found' };
    }

    if (this.isUnlocked(itemId)) {
      return { canUnlock: false, reason: 'Already unlocked' };
    }

    // Check condition
    switch (item.condition.type) {
      case UnlockConditionType.LEVEL:
        if (this.progress.level < (item.condition.value as number)) {
          return { canUnlock: false, reason: `Requires level ${item.condition.value}` };
        }
        break;

      case UnlockConditionType.CURRENCY:
        if (this.progress.currency < (item.cost || 0)) {
          return { canUnlock: false, reason: `Requires ${item.cost} fish` };
        }
        break;

      case UnlockConditionType.PREMIUM:
        if (this.progress.premiumCurrency < (item.premiumCost || 0)) {
          return { canUnlock: false, reason: `Requires ${item.premiumCost} pearls` };
        }
        break;

      case UnlockConditionType.ACHIEVEMENT:
        // Would check achievement system
        return { canUnlock: false, reason: 'Achievement required' };

      case UnlockConditionType.SCORE:
        // Check high score
        const highScore = storage.getHighScore();
        if (highScore < (item.condition.value as number)) {
          return { canUnlock: false, reason: `Requires high score of ${item.condition.value}` };
        }
        break;
    }

    // Check cost
    if (item.cost && this.progress.currency < item.cost) {
      return { canUnlock: false, reason: `Requires ${item.cost} fish` };
    }

    if (item.premiumCost && this.progress.premiumCurrency < item.premiumCost) {
      return { canUnlock: false, reason: `Requires ${item.premiumCost} pearls` };
    }

    return { canUnlock: true };
  }

  /**
   * Unlock item
   */
  unlock(itemId: string): boolean {
    const check = this.canUnlock(itemId);
    if (!check.canUnlock) {
      return false;
    }

    const item = UNLOCKABLES.find(u => u.id === itemId);
    if (!item) {
      return false;
    }

    // Deduct cost
    if (item.cost) {
      this.progress.currency -= item.cost;
    }
    if (item.premiumCost) {
      this.progress.premiumCurrency -= item.premiumCost;
    }

    // Add to unlocked items
    this.progress.unlockedItems.push(itemId);
    this.saveProgress();

    return true;
  }

  /**
   * Equip seal skin
   */
  equipSkin(skinId: string): boolean {
    if (!this.isUnlocked(skinId)) {
      return false;
    }

    const item = UNLOCKABLES.find(u => u.id === skinId);
    if (!item || item.type !== UnlockType.SEAL_SKIN) {
      return false;
    }

    this.progress.equippedSkin = skinId;
    this.saveProgress();
    return true;
  }

  /**
   * Get current progress
   */
  getProgress(): PlayerProgress {
    return { ...this.progress };
  }

  /**
   * Get all unlockable items
   */
  getAllUnlockables(): Unlockable[] {
    return [...UNLOCKABLES];
  }

  /**
   * Get unlockables by type
   */
  getUnlockablesByType(type: UnlockType): Unlockable[] {
    return UNLOCKABLES.filter(u => u.type === type);
  }

  /**
   * Reset all progress (for testing)
   */
  reset(): void {
    this.progress = {
      level: 1,
      experience: 0,
      currency: 0,
      premiumCurrency: 0,
      unlockedItems: ['seal_default'],
      equippedSkin: 'seal_default',
    };
    this.saveProgress();
  }
}

// Export singleton instance
export const unlockSystem = new UnlockSystem();
