/**
 * Game Constants
 *
 * All magic numbers and configuration values are defined here
 * for easy tuning and maintenance.
 */

export const GAME_CONFIG = {
  // Canvas dimensions
  WIDTH: 800,
  HEIGHT: 600,

  // Performance
  TARGET_FPS: 60,
} as const;

export const SEAL_CONFIG = {
  // Starting position
  START_X: 200,
  START_Y: 300,

  // Physics (IMPROVED: More responsive, balanced)
  GRAVITY: 1.0,              // Increased from 0.5 - more responsive feel
  SWIM_UP_FORCE: -10,        // Balanced with dive (was -8)
  DIVE_DOWN_FORCE: 10,       // Balanced with swim (was 12)
  MAX_VELOCITY: 10,          // Reduced from 15 - more controlled
  DRAG: 0.95,                // NEW: Air resistance (0.95 = 5% drag per frame)

  // Dimensions (IMPROVED: Larger for visibility)
  WIDTH: 80,                 // Increased from 60 (33% larger)
  HEIGHT: 47,                // Increased from 35 (33% larger)

  // Rotation (IMPROVED: Smoother, more natural)
  MAX_ROTATION: 25,          // Reduced from 30 - less extreme
  ROTATION_SPEED: 2.5,       // Increased from 2 - faster response
} as const;

export const OBSTACLE_CONFIG = {
  // Spawning (IMPROVED: More forgiving, better pacing)
  SPAWN_INTERVAL: 2500,      // milliseconds
  MIN_GAP: 220,              // Increased from 200 (easier)
  MAX_GAP: 280,              // Increased from 240 (easier)
  STARTING_GAP: 350,         // NEW: First obstacles very easy
  GAP_REDUCTION_RATE: 3,     // NEW: Reduce gap by 3px per obstacle passed

  // Movement (IMPROVED: Slower start, smoother progression)
  SCROLL_SPEED: 2.5,         // Reduced from 3 (slower start)
  MIN_SCROLL_SPEED: 2.5,     // NEW: Never go below this
  MAX_SCROLL_SPEED: 5,       // NEW: Never go above this

  // Dimensions
  WIDTH: 60,
  MIN_HEIGHT: 100,
  MAX_HEIGHT: 300,

  // Types
  CORAL_CHANCE: 0.7,         // 70% coral, 30% jellyfish
} as const;

export const SCORE_CONFIG = {
  // Points
  POINTS_PER_OBSTACLE: 1,
  POINTS_PER_COLLECTIBLE: 5,

  // Difficulty scaling (IMPROVED: Gentler progression)
  SPEED_INCREASE_INTERVAL: 15, // Every 15 points (was 10)
  SPEED_INCREASE_AMOUNT: 0.15, // Smaller increase (was 0.2)
  MAX_SPEED: 5,                 // Reduced from 6 (less extreme)

  // NEW: Grace period
  GRACE_PERIOD_TIME: 5000,     // 5 seconds before first obstacle
  GRACE_PERIOD_OBSTACLES: 3,   // First 3 obstacles are extra easy
} as const;

export const AUDIO_CONFIG = {
  // Volume (0-1)
  MASTER_VOLUME: 0.7,
  MUSIC_VOLUME: 0.5,
  SFX_VOLUME: 0.8,

  // Sound IDs
  SOUNDS: {
    SWIM_UP: 'swim_up',
    DIVE_DOWN: 'dive_down',
    SCORE: 'score',
    COLLISION: 'collision',
    GAME_OVER: 'game_over',
    BUTTON_CLICK: 'button_click',
  },

  MUSIC: {
    MAIN_THEME: 'main_theme',
  },
} as const;

export const UI_CONFIG = {
  // Colors (IMPROVED: Better contrast, more vibrant)
  COLORS: {
    PRIMARY: '#ffffff',
    SECONDARY: '#00d4ff',
    DANGER: '#ff4444',
    SUCCESS: '#44ff44',
    WARNING: '#ffaa00',
    BACKGROUND: '#0a4f6e',
    SEAL_GLOW: '#aaffff', // NEW: Seal glow color
  },

  // Fonts (IMPROVED: Larger, more readable)
  FONTS: {
    TITLE: {
      SIZE: '48px',
      FAMILY: 'Arial, sans-serif',
      STYLE: 'bold',
    },
    SCORE: {
      SIZE: '42px',          // Increased from 32px
      FAMILY: 'Arial, sans-serif',
      STYLE: 'bold',
    },
    BUTTON: {
      SIZE: '24px',
      FAMILY: 'Arial, sans-serif',
      STYLE: 'normal',
    },
  },
} as const;

export const STORAGE_KEYS = {
  HIGH_SCORE: 'flappyseal_high_score',
  SETTINGS: 'flappyseal_settings',
  TUTORIAL_SEEN: 'flappyseal_tutorial_seen',
} as const;

export const SCENE_KEYS = {
  BOOT: 'BootScene',
  MENU: 'MenuScene',
  GAME: 'GameScene',
  PAUSE: 'PauseScene',
  GAME_OVER: 'GameOverScene',
} as const;
