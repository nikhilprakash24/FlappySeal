/**
 * Audio Manager System
 *
 * Manages all game audio including sound effects and background music.
 * Provides volume controls, muting, and audio resource management.
 */

import Phaser from 'phaser';
import { AUDIO_CONFIG } from '../config/constants';
import { storage } from '../utils/storage';
import type { GameSettings } from '../types';

export class AudioManager {
  private scene: Phaser.Scene;
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  private music?: Phaser.Sound.BaseSound;
  private settings: GameSettings;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.settings = storage.getSettings();
    this.initializePlaceholderSounds();
  }

  /**
   * Initialize placeholder sounds (procedural audio)
   * In production, these would be loaded audio files
   */
  private initializePlaceholderSounds(): void {
    // For now, we'll use procedural sound generation
    // In v0.2, we'll load actual audio files
    console.log('AudioManager: Initialized with placeholder sounds');
  }

  /**
   * Play sound effect
   */
  playSFX(soundId: string, volume?: number): void {
    if (!this.settings.sfxEnabled) {
      return;
    }

    // For now, just log (would play actual sound in production)
    const effectiveVolume = volume ?? this.settings.sfxVolume;

    // Create a simple tone for placeholder
    this.createProceduralSound(soundId, effectiveVolume);
  }

  /**
   * Create procedural sound effect (placeholder)
   * TODO: Replace with actual audio files in v0.2
   */
  private createProceduralSound(soundId: string, volume: number): void {
    // Create a simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different sounds
      const frequencies: { [key: string]: number } = {
        [AUDIO_CONFIG.SOUNDS.SWIM_UP]: 440,
        [AUDIO_CONFIG.SOUNDS.DIVE_DOWN]: 330,
        [AUDIO_CONFIG.SOUNDS.SCORE]: 523,
        [AUDIO_CONFIG.SOUNDS.COLLISION]: 110,
        [AUDIO_CONFIG.SOUNDS.GAME_OVER]: 220,
        [AUDIO_CONFIG.SOUNDS.BUTTON_CLICK]: 880,
      };

      oscillator.frequency.value = frequencies[soundId] || 440;
      oscillator.type = soundId === AUDIO_CONFIG.SOUNDS.COLLISION ? 'sawtooth' : 'sine';

      gainNode.gain.value = volume * AUDIO_CONFIG.MASTER_VOLUME * 0.1; // Keep it quiet

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);

      // Cleanup
      setTimeout(() => {
        oscillator.disconnect();
        gainNode.disconnect();
      }, 200);
    } catch (error) {
      console.warn('Audio playback not available:', error);
    }
  }

  /**
   * Play background music
   */
  playMusic(): void {
    if (!this.settings.musicEnabled || this.music?.isPlaying) {
      return;
    }

    // Placeholder for music
    console.log('AudioManager: Music would start playing');
  }

  /**
   * Stop background music
   */
  stopMusic(): void {
    if (this.music?.isPlaying) {
      this.music.stop();
    }
  }

  /**
   * Pause all audio
   */
  pauseAll(): void {
    this.scene.sound.pauseAll();
  }

  /**
   * Resume all audio
   */
  resumeAll(): void {
    this.scene.sound.resumeAll();
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this.scene.sound.volume = volume;
    this.settings.musicVolume = volume;
    this.settings.sfxVolume = volume;
    storage.setSettings(this.settings);
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume: number): void {
    this.settings.musicVolume = volume;
    storage.setSettings(this.settings);
    if (this.music) {
      this.music.setVolume(volume * AUDIO_CONFIG.MASTER_VOLUME);
    }
  }

  /**
   * Set SFX volume
   */
  setSFXVolume(volume: number): void {
    this.settings.sfxVolume = volume;
    storage.setSettings(this.settings);
  }

  /**
   * Toggle music on/off
   */
  toggleMusic(): boolean {
    this.settings.musicEnabled = !this.settings.musicEnabled;
    storage.setSettings(this.settings);

    if (this.settings.musicEnabled) {
      this.playMusic();
    } else {
      this.stopMusic();
    }

    return this.settings.musicEnabled;
  }

  /**
   * Toggle SFX on/off
   */
  toggleSFX(): boolean {
    this.settings.sfxEnabled = !this.settings.sfxEnabled;
    storage.setSettings(this.settings);
    return this.settings.sfxEnabled;
  }

  /**
   * Get current settings
   */
  getSettings(): GameSettings {
    return { ...this.settings };
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.stopMusic();
    this.sounds.clear();
  }
}
