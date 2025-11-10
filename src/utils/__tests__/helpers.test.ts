import { describe, it, expect } from 'vitest';
import {
  clamp,
  lerp,
  randomInt,
  randomFloat,
  rectanglesOverlap,
  distance,
  formatNumber,
} from '../helpers';

describe('helpers', () => {
  describe('clamp', () => {
    it('should clamp value to min', () => {
      expect(clamp(5, 10, 20)).toBe(10);
    });

    it('should clamp value to max', () => {
      expect(clamp(25, 10, 20)).toBe(20);
    });

    it('should return value if within range', () => {
      expect(clamp(15, 10, 20)).toBe(15);
    });
  });

  describe('lerp', () => {
    it('should interpolate at t=0', () => {
      expect(lerp(0, 10, 0)).toBe(0);
    });

    it('should interpolate at t=1', () => {
      expect(lerp(0, 10, 1)).toBe(10);
    });

    it('should interpolate at t=0.5', () => {
      expect(lerp(0, 10, 0.5)).toBe(5);
    });
  });

  describe('randomInt', () => {
    it('should return value within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomInt(10, 20);
        expect(result).toBeGreaterThanOrEqual(10);
        expect(result).toBeLessThanOrEqual(20);
        expect(Number.isInteger(result)).toBe(true);
      }
    });
  });

  describe('randomFloat', () => {
    it('should return value within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomFloat(10.5, 20.5);
        expect(result).toBeGreaterThanOrEqual(10.5);
        expect(result).toBeLessThan(20.5);
      }
    });
  });

  describe('rectanglesOverlap', () => {
    it('should detect overlap', () => {
      const a = { x: 0, y: 0, width: 10, height: 10 };
      const b = { x: 5, y: 5, width: 10, height: 10 };
      expect(rectanglesOverlap(a, b)).toBe(true);
    });

    it('should detect no overlap', () => {
      const a = { x: 0, y: 0, width: 10, height: 10 };
      const b = { x: 20, y: 20, width: 10, height: 10 };
      expect(rectanglesOverlap(a, b)).toBe(false);
    });

    it('should detect edge touching as overlap', () => {
      const a = { x: 0, y: 0, width: 10, height: 10 };
      const b = { x: 10, y: 0, width: 10, height: 10 };
      expect(rectanglesOverlap(a, b)).toBe(false);
    });
  });

  describe('distance', () => {
    it('should calculate distance between points', () => {
      const a = { x: 0, y: 0 };
      const b = { x: 3, y: 4 };
      expect(distance(a, b)).toBe(5);
    });

    it('should return 0 for same point', () => {
      const a = { x: 5, y: 5 };
      expect(distance(a, a)).toBe(0);
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('should not add commas for small numbers', () => {
      expect(formatNumber(100)).toBe('100');
    });
  });
});
