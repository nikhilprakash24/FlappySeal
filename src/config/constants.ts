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

  // Physics
  GRAVITY: 0.5,
  SWIM_UP_FORCE: -8,
  DIVE_DOWN_FORCE: 12,
  MAX_VELOCITY: 15,

  // Dimensions (for collision)
  WIDTH: 60,
  HEIGHT: 35,

  // Rotation
  MAX_ROTATION: 30, // degrees
  ROTATION_SPEED: 2,
} as const;

export const OBSTACLE_CONFIG = {
  // Spawning
  SPAWN_INTERVAL: 2500, // milliseconds
  MIN_GAP: 180,
  MAX_GAP: 220,

  // Movement
  SCROLL_SPEED: 3,

  // Dimensions
  WIDTH: 60,
  MIN_HEIGHT: 100,
  MAX_HEIGHT: 300,

  // Types
  CORAL_CHANCE: 0.7, // 70% coral, 30% jellyfish
} as const;

export const SCORE_CONFIG = {
  // Points
  POINTS_PER_OBSTACLE: 1,
  POINTS_PER_COLLECTIBLE: 5,

  // Difficulty scaling
  SPEED_INCREASE_INTERVAL: 10, // Every 10 points
  SPEED_INCREASE_AMOUNT: 0.2,
  MAX_SPEED: 6,
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
  // Colors
  COLORS: {
    PRIMARY: '#ffffff',
    SECONDARY: '#00d4ff',
    DANGER: '#ff4444',
    SUCCESS: '#44ff44',
    BACKGROUND: '#0a4f6e',
  },

  // Fonts
  FONTS: {
    TITLE: {
      SIZE: '48px',
      FAMILY: 'Arial, sans-serif',
      STYLE: 'bold',
    },
    SCORE: {
      SIZE: '32px',
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
