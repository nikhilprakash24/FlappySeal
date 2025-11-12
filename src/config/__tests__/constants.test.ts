import { describe, it, expect } from 'vitest';
import {
  GAME_CONFIG,
  SEAL_CONFIG,
  OBSTACLE_CONFIG,
  SCORE_CONFIG,
} from '../constants';

describe('constants', () => {
  describe('GAME_CONFIG', () => {
    it('should have valid dimensions', () => {
      expect(GAME_CONFIG.WIDTH).toBeGreaterThan(0);
      expect(GAME_CONFIG.HEIGHT).toBeGreaterThan(0);
      expect(GAME_CONFIG.TARGET_FPS).toBe(60);
    });
  });

  describe('SEAL_CONFIG', () => {
    it('should have valid physics values', () => {
      expect(SEAL_CONFIG.GRAVITY).toBeGreaterThan(0);
      expect(SEAL_CONFIG.SWIM_UP_FORCE).toBeLessThan(0);
      expect(SEAL_CONFIG.DIVE_DOWN_FORCE).toBeGreaterThan(0);
      expect(SEAL_CONFIG.MAX_VELOCITY).toBeGreaterThan(0);
    });

    it('should have valid starting position', () => {
      expect(SEAL_CONFIG.START_X).toBeGreaterThan(0);
      expect(SEAL_CONFIG.START_Y).toBeGreaterThan(0);
    });

    it('should have balanced forces', () => {
      // Swim up force should be stronger than gravity to allow upward movement
      expect(Math.abs(SEAL_CONFIG.SWIM_UP_FORCE)).toBeGreaterThan(SEAL_CONFIG.GRAVITY);
    });
  });

  describe('OBSTACLE_CONFIG', () => {
    it('should have valid spawn settings', () => {
      expect(OBSTACLE_CONFIG.SPAWN_INTERVAL).toBeGreaterThan(0);
      expect(OBSTACLE_CONFIG.MIN_GAP).toBeLessThan(OBSTACLE_CONFIG.MAX_GAP);
      expect(OBSTACLE_CONFIG.SCROLL_SPEED).toBeGreaterThan(0);
    });

    it('should have fair gap sizes', () => {
      // Gaps should be larger than seal height for fair gameplay
      expect(OBSTACLE_CONFIG.MIN_GAP).toBeGreaterThan(SEAL_CONFIG.HEIGHT * 3);
    });
  });

  describe('SCORE_CONFIG', () => {
    it('should have valid difficulty progression', () => {
      expect(SCORE_CONFIG.SPEED_INCREASE_INTERVAL).toBeGreaterThan(0);
      expect(SCORE_CONFIG.SPEED_INCREASE_AMOUNT).toBeGreaterThan(0);
      expect(SCORE_CONFIG.MAX_SPEED).toBeGreaterThan(OBSTACLE_CONFIG.SCROLL_SPEED);
    });

    it('should have positive point values', () => {
      expect(SCORE_CONFIG.POINTS_PER_OBSTACLE).toBeGreaterThan(0);
      expect(SCORE_CONFIG.POINTS_PER_COLLECTIBLE).toBeGreaterThan(0);
    });
  });
});
