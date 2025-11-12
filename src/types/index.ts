/**
 * Type Definitions
 *
 * All TypeScript interfaces and types used throughout the application.
 */

export interface GameSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
}

export interface ScoreData {
  current: number;
  high: number;
}

export interface ObstacleConfig {
  x: number;
  y: number;
  height: number;
  gap: number;
  type: ObstacleType;
}

export enum ObstacleType {
  CORAL = 'coral',
  JELLYFISH = 'jellyfish',
}

export enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game_over',
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
