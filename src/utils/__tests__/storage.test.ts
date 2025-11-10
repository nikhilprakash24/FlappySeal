import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '../storage';

describe('storage', () => {
  beforeEach(() => {
    // Clear all storage before each test
    storage.clearAll();
  });

  describe('high score', () => {
    it('should return 0 for new game', () => {
      expect(storage.getHighScore()).toBe(0);
    });

    it('should save and retrieve high score', () => {
      storage.setHighScore(100);
      expect(storage.getHighScore()).toBe(100);
    });

    it('should update high score', () => {
      storage.setHighScore(50);
      storage.setHighScore(150);
      expect(storage.getHighScore()).toBe(150);
    });
  });

  describe('settings', () => {
    it('should return default settings', () => {
      const settings = storage.getSettings();
      expect(settings.musicEnabled).toBe(true);
      expect(settings.sfxEnabled).toBe(true);
      expect(settings.musicVolume).toBe(0.5);
      expect(settings.sfxVolume).toBe(0.8);
    });

    it('should save and retrieve settings', () => {
      const newSettings = {
        musicEnabled: false,
        sfxEnabled: true,
        musicVolume: 0.3,
        sfxVolume: 0.6,
      };
      storage.setSettings(newSettings);
      const retrieved = storage.getSettings();
      expect(retrieved).toEqual(newSettings);
    });
  });

  describe('tutorial', () => {
    it('should return false for first time', () => {
      expect(storage.getTutorialSeen()).toBe(false);
    });

    it('should save and retrieve tutorial status', () => {
      storage.setTutorialSeen(true);
      expect(storage.getTutorialSeen()).toBe(true);
    });
  });

  describe('clearAll', () => {
    it('should clear all stored data', () => {
      storage.setHighScore(100);
      storage.setTutorialSeen(true);
      storage.clearAll();

      expect(storage.getHighScore()).toBe(0);
      expect(storage.getTutorialSeen()).toBe(false);
    });
  });
});
