/**
 * Achievement System
 *
 * Tracks player achievements and milestones.
 * Provides progression goals and rewards.
 */

export enum AchievementCategory {
  DISTANCE = 'distance',
  SCORE = 'score',
  COLLECTION = 'collection',
  CHALLENGE = 'challenge',
  MASTERY = 'mastery',
  SPECIAL = 'special',
}

export interface Achievement {
  id: string;
  category: AchievementCategory;
  name: string;
  description: string;
  icon?: string;
  requirement: {
    type: string;
    target: number;
    current?: number;
  };
  reward?: {
    experience?: number;
    currency?: number;
    premiumCurrency?: number;
    unlock?: string;
  };
  hidden?: boolean; // Secret achievement
}

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  completed: boolean;
  completedAt?: Date;
}

const STORAGE_KEY = 'flappyseal_achievements';

// Define all achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Distance achievements
  {
    id: 'distance_1km',
    category: AchievementCategory.DISTANCE,
    name: 'First Kilometer',
    description: 'Swim a total of 1 kilometer',
    requirement: { type: 'distance', target: 1000 },
    reward: { experience: 100, currency: 50 },
  },
  {
    id: 'distance_10km',
    category: AchievementCategory.DISTANCE,
    name: 'Marathon Swimmer',
    description: 'Swim a total of 10 kilometers',
    requirement: { type: 'distance', target: 10000 },
    reward: { experience: 500, currency: 200 },
  },
  {
    id: 'distance_100km',
    category: AchievementCategory.DISTANCE,
    name: 'Ocean Voyager',
    description: 'Swim a total of 100 kilometers',
    requirement: { type: 'distance', target: 100000 },
    reward: { experience: 2000, currency: 1000, unlock: 'seal_voyager' },
  },

  // Score achievements
  {
    id: 'score_10',
    category: AchievementCategory.SCORE,
    name: 'Getting Started',
    description: 'Score 10 points in a single run',
    requirement: { type: 'score_single', target: 10 },
    reward: { experience: 50 },
  },
  {
    id: 'score_50',
    category: AchievementCategory.SCORE,
    name: 'Skilled Swimmer',
    description: 'Score 50 points in a single run',
    requirement: { type: 'score_single', target: 50 },
    reward: { experience: 200, currency: 100 },
  },
  {
    id: 'score_100',
    category: AchievementCategory.SCORE,
    name: 'Century Club',
    description: 'Score 100 points in a single run',
    requirement: { type: 'score_single', target: 100 },
    reward: { experience: 500, currency: 300 },
  },
  {
    id: 'score_500',
    category: AchievementCategory.SCORE,
    name: 'Elite Seal',
    description: 'Score 500 points in a single run',
    requirement: { type: 'score_single', target: 500 },
    reward: { experience: 2000, currency: 1000, premiumCurrency: 10 },
  },

  // Collection achievements
  {
    id: 'collect_100',
    category: AchievementCategory.COLLECTION,
    name: 'Fish Collector',
    description: 'Collect 100 fish total',
    requirement: { type: 'collect_total', target: 100 },
    reward: { experience: 100 },
  },
  {
    id: 'collect_1000',
    category: AchievementCategory.COLLECTION,
    name: 'Fish Hoarder',
    description: 'Collect 1000 fish total',
    requirement: { type: 'collect_total', target: 1000 },
    reward: { experience: 500, currency: 200 },
  },
  {
    id: 'collect_10000',
    category: AchievementCategory.COLLECTION,
    name: 'Fish Tycoon',
    description: 'Collect 10,000 fish total',
    requirement: { type: 'collect_total', target: 10000 },
    reward: { experience: 2000, premiumCurrency: 50 },
  },

  // Challenge achievements
  {
    id: 'challenge_60s_no_swim',
    category: AchievementCategory.CHALLENGE,
    name: 'Dive Master',
    description: 'Survive 60 seconds without swimming up',
    requirement: { type: 'time_no_swim', target: 60 },
    reward: { experience: 300, currency: 150 },
  },
  {
    id: 'challenge_no_powerup',
    category: AchievementCategory.CHALLENGE,
    name: 'Purist',
    description: 'Score 50 without using any power-ups',
    requirement: { type: 'score_no_powerup', target: 50 },
    reward: { experience: 400, currency: 200 },
  },

  // Mastery achievements
  {
    id: 'mastery_perfect_50',
    category: AchievementCategory.MASTERY,
    name: 'Perfect Run',
    description: 'Pass 50 obstacles without touching them',
    requirement: { type: 'perfect_obstacles', target: 50 },
    reward: { experience: 800, currency: 500 },
  },
  {
    id: 'mastery_perfect_100',
    category: AchievementCategory.MASTERY,
    name: 'Flawless Victory',
    description: 'Pass 100 obstacles without touching them',
    requirement: { type: 'perfect_obstacles', target: 100 },
    reward: { experience: 2000, currency: 1000, unlock: 'seal_golden' },
  },
  {
    id: 'mastery_all_powerups',
    category: AchievementCategory.MASTERY,
    name: 'Power User',
    description: 'Use all 8 power-ups in a single run',
    requirement: { type: 'use_all_powerups', target: 8 },
    reward: { experience: 500, premiumCurrency: 20 },
  },

  // Special/Hidden achievements
  {
    id: 'special_secret_path',
    category: AchievementCategory.SPECIAL,
    name: '???',
    description: 'Discover the secret passage',
    requirement: { type: 'secret_path', target: 1 },
    reward: { premiumCurrency: 100, unlock: 'seal_mystic' },
    hidden: true,
  },
  {
    id: 'special_dev_tribute',
    category: AchievementCategory.SPECIAL,
    name: 'Meta Gamer',
    description: 'Find the developer\'s easter egg',
    requirement: { type: 'easter_egg', target: 1 },
    reward: { premiumCurrency: 50 },
    hidden: true,
  },
];

export class AchievementSystem {
  private progress: Map<string, AchievementProgress> = new Map();
  private listeners: Array<(achievement: Achievement) => void> = [];

  constructor() {
    this.loadProgress();
  }

  /**
   * Load progress from storage
   */
  private loadProgress(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.progress = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Failed to load achievement progress:', error);
    }
  }

  /**
   * Save progress to storage
   */
  private saveProgress(): void {
    try {
      const data = Object.fromEntries(this.progress);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save achievement progress:', error);
    }
  }

  /**
   * Track progress for an achievement
   */
  trackProgress(achievementId: string, amount: number = 1): void {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    let progress = this.progress.get(achievementId) || {
      achievementId,
      progress: 0,
      completed: false,
    };

    if (progress.completed) return; // Already completed

    progress.progress = Math.min(progress.progress + amount, achievement.requirement.target);

    // Check if completed
    if (progress.progress >= achievement.requirement.target) {
      progress.completed = true;
      progress.completedAt = new Date();
      this.onAchievementUnlocked(achievement);
    }

    this.progress.set(achievementId, progress);
    this.saveProgress();
  }

  /**
   * Set progress directly (for certain achievement types)
   */
  setProgress(achievementId: string, value: number): void {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    let progress = this.progress.get(achievementId) || {
      achievementId,
      progress: 0,
      completed: false,
    };

    if (progress.completed) return;

    progress.progress = Math.min(value, achievement.requirement.target);

    if (progress.progress >= achievement.requirement.target) {
      progress.completed = true;
      progress.completedAt = new Date();
      this.onAchievementUnlocked(achievement);
    }

    this.progress.set(achievementId, progress);
    this.saveProgress();
  }

  /**
   * Check if achievement is completed
   */
  isCompleted(achievementId: string): boolean {
    const progress = this.progress.get(achievementId);
    return progress?.completed ?? false;
  }

  /**
   * Get progress for achievement
   */
  getProgress(achievementId: string): AchievementProgress | null {
    return this.progress.get(achievementId) ?? null;
  }

  /**
   * Get all achievements with progress
   */
  getAllAchievements(): Array<Achievement & { progress?: AchievementProgress }> {
    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      progress: this.progress.get(achievement.id),
    }));
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: AchievementCategory): Array<Achievement & { progress?: AchievementProgress }> {
    return ACHIEVEMENTS.filter(a => a.category === category).map(achievement => ({
      ...achievement,
      progress: this.progress.get(achievement.id),
    }));
  }

  /**
   * Get completion percentage
   */
  getCompletionPercentage(): number {
    const completed = Array.from(this.progress.values()).filter(p => p.completed).length;
    return (completed / ACHIEVEMENTS.length) * 100;
  }

  /**
   * Called when achievement is unlocked
   */
  private onAchievementUnlocked(achievement: Achievement): void {
    console.log(`Achievement unlocked: ${achievement.name}`);

    // Notify listeners
    this.listeners.forEach(listener => listener(achievement));

    // Apply rewards (would integrate with UnlockSystem)
    if (achievement.reward) {
      // Add experience, currency, etc.
      console.log('Rewards:', achievement.reward);
    }
  }

  /**
   * Register listener for achievement unlocks
   */
  onAchievementUnlock(listener: (achievement: Achievement) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Reset all progress (for testing)
   */
  reset(): void {
    this.progress.clear();
    this.saveProgress();
  }
}

// Export singleton instance
export const achievementSystem = new AchievementSystem();
