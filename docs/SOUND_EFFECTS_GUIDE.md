# Sound Effects Integration Guide

**Created:** 2025-11-10
**Purpose:** Document all sound effect integration points and required audio assets

---

## Current State

### ✅ Already Integrated Sound Effects

The following sound effects are already wired up in `GameScene.ts` via `AudioManager`:

1. **Swim Up** (`GameScene.ts:311`)
   ```typescript
   this.audioManager?.playSFX(AUDIO_CONFIG.SOUNDS.SWIM_UP);
   ```

2. **Dive Down** (`GameScene.ts:317`)
   ```typescript
   this.audioManager?.playSFX(AUDIO_CONFIG.SOUNDS.DIVE_DOWN);
   ```

3. **Collision** (`GameScene.ts:400`)
   ```typescript
   this.audioManager?.playSFX(AUDIO_CONFIG.SOUNDS.COLLISION);
   ```

4. **Game Over** (`GameScene.ts:409`)
   ```typescript
   this.audioManager?.playSFX(AUDIO_CONFIG.SOUNDS.GAME_OVER);
   ```

5. **Shield Break** (`GameScene.ts:644`)
   ```typescript
   this.audioManager?.playSFX('shield_break');
   ```

### ⏳ Integration Points Ready (TODO)

The following areas have integration points marked with TODO comments and event emissions, ready for audio assets:

#### Character Actions
**Location:** `src/entities/Character.ts`

6. **Character Swim** (Lines 80-82)
   ```typescript
   // this.scene.events.emit('character:swim', this.config.type);
   // Suggested sound: Splash/whoosh up (pitch varies by character)
   ```
   - **Trigger:** When character swims upward
   - **Variations:** Different pitch/timbre for Seal, Otter, Sea Lion
   - **Format:** `character_swim_{type}.mp3` (e.g., `character_swim_seal.mp3`)

7. **Character Dive** (Lines 91-93)
   ```typescript
   // this.scene.events.emit('character:dive', this.config.type);
   // Suggested sound: Splash/whoosh down (pitch varies by character)
   ```
   - **Trigger:** When character dives downward
   - **Variations:** Different pitch/timbre for Seal, Otter, Sea Lion
   - **Format:** `character_dive_{type}.mp3`

#### Scoring
**Location:** `src/systems/ScoreManager.ts`

8. **Score Increase** (Lines 67-69)
   ```typescript
   // this.scene.events.emit('score:increase', points, this.currentScore);
   // Suggested sound: Ding/chime (pitch increases with combo/multiplier)
   ```
   - **Trigger:** When player earns points
   - **Variations:** Pitch increases with score multiplier/combo
   - **Format:** `score_point.mp3`
   - **Enhancement:** Dynamic pitch shift based on multiplier

9. **New High Score** (Lines 76-78)
   ```typescript
   // this.scene.events.emit('score:newrecord', this.highScore);
   // Suggested sound: Fanfare/celebration
   ```
   - **Trigger:** When player beats high score
   - **Format:** `score_highscore.mp3`
   - **Note:** Should be celebratory and distinct

#### Power-Ups
**Location:** `src/systems/PowerUpSystem.ts`

10. **Power-Up Collected** (Lines 312-315)
    ```typescript
    // GameScene should listen to 'powerup-collected' event and play sound
    // Suggested sound: Sparkle/pickup sound (varies by power-up type)
    ```
    - **Trigger:** When player collects a power-up
    - **Variations:** Different sounds for each power-up type
    - **Format:** `powerup_collect_{type}.mp3`
    - **Types:** shield, magnet, slow_motion, invincibility, double_points, speed_boost, size_change, time_freeze

11. **Power-Up Activated** (Lines 339-342)
    ```typescript
    // GameScene should listen to 'powerup-activated' event and play sound
    // Suggested sound: Woosh/activation sound (varies by power-up type)
    ```
    - **Trigger:** When power-up effect begins
    - **Variations:** Different sounds for each power-up type
    - **Format:** `powerup_activate_{type}.mp3`

---

## Required Audio Assets

### Priority 1: Core Gameplay (Essential)
These sounds are critical for basic game feel:

| Asset Name | Description | Duration | Notes |
|------------|-------------|----------|-------|
| `swim_up.mp3` | Splash/whoosh upward | 0.2-0.4s | Already wired |
| `dive_down.mp3` | Splash/whoosh downward | 0.2-0.4s | Already wired |
| `collision.mp3` | Impact/crash | 0.3-0.5s | Already wired |
| `game_over.mp3` | Game over jingle | 1-2s | Already wired |
| `score_point.mp3` | Ding/chime | 0.1-0.2s | Event ready |

### Priority 2: Character Variety (Polish)
Character-specific sounds for personality:

| Asset Name | Description | Duration | Notes |
|------------|-------------|----------|-------|
| `character_swim_seal.mp3` | Seal swim sound | 0.2-0.4s | Medium pitch |
| `character_swim_otter.mp3` | Otter swim sound | 0.2-0.4s | Higher pitch, lighter |
| `character_swim_sealion.mp3` | Sea Lion swim sound | 0.2-0.4s | Lower pitch, heavier |
| `character_dive_seal.mp3` | Seal dive sound | 0.2-0.4s | Medium pitch |
| `character_dive_otter.mp3` | Otter dive sound | 0.2-0.4s | Higher pitch, lighter |
| `character_dive_sealion.mp3` | Sea Lion dive sound | 0.2-0.4s | Lower pitch, heavier |

### Priority 3: Power-Ups (Enhancement)
Power-up feedback sounds:

| Asset Name | Description | Duration | Notes |
|------------|-------------|----------|-------|
| `powerup_collect.mp3` | Generic pickup | 0.2-0.3s | Sparkle/chime |
| `powerup_activate_shield.mp3` | Shield activation | 0.3-0.5s | Protective whoosh |
| `powerup_activate_magnet.mp3` | Magnet activation | 0.3-0.5s | Magnetic hum |
| `powerup_activate_slow_motion.mp3` | Slow-mo activation | 0.5-0.8s | Time warp |
| `powerup_activate_invincibility.mp3` | Invincibility | 0.5-0.8s | Power-up jingle |
| `shield_break.mp3` | Shield breaking | 0.3-0.5s | Glass shatter |
| `score_highscore.mp3` | New record fanfare | 1-2s | Celebratory |

### Priority 4: UI & Ambience (Final Polish)
Menu and ambient sounds:

| Asset Name | Description | Duration | Notes |
|------------|-------------|----------|-------|
| `ui_button_click.mp3` | Button press | 0.1s | Click/tap |
| `ui_button_hover.mp3` | Button hover | 0.05s | Subtle tick |
| `menu_open.mp3` | Menu appears | 0.2-0.3s | Whoosh in |
| `menu_close.mp3` | Menu closes | 0.2-0.3s | Whoosh out |
| `character_select.mp3` | Character selected | 0.3-0.5s | Confirmation |
| `unlock.mp3` | Character unlocked | 1-2s | Achievement sound |

---

## Audio Configuration

### Current Audio Config
**Location:** `src/config/constants.ts` (assumed)

The `AUDIO_CONFIG` object should define all sound keys:

```typescript
export const AUDIO_CONFIG = {
  SOUNDS: {
    SWIM_UP: 'swim_up',
    DIVE_DOWN: 'dive_down',
    COLLISION: 'collision',
    GAME_OVER: 'game_over',
    SCORE_POINT: 'score_point',
    SCORE_HIGHSCORE: 'score_highscore',
    SHIELD_BREAK: 'shield_break',
    // Character-specific sounds
    CHARACTER_SWIM_SEAL: 'character_swim_seal',
    CHARACTER_SWIM_OTTER: 'character_swim_otter',
    CHARACTER_SWIM_SEALION: 'character_swim_sealion',
    CHARACTER_DIVE_SEAL: 'character_dive_seal',
    CHARACTER_DIVE_OTTER: 'character_dive_otter',
    CHARACTER_DIVE_SEALION: 'character_dive_sealion',
    // Power-up sounds
    POWERUP_COLLECT: 'powerup_collect',
    POWERUP_ACTIVATE_SHIELD: 'powerup_activate_shield',
    POWERUP_ACTIVATE_MAGNET: 'powerup_activate_magnet',
    // ... etc
  },
  MUSIC: {
    MENU: 'music_menu',
    GAME: 'music_game',
    GAME_OVER: 'music_gameover',
  },
  VOLUME: {
    MASTER: 0.7,
    SFX: 0.8,
    MUSIC: 0.5,
  }
};
```

---

## AudioManager Implementation

### Expected AudioManager Interface
**Location:** `src/systems/AudioManager.ts`

```typescript
export class AudioManager {
  private scene: Phaser.Scene;
  private sounds: Map<string, Phaser.Sound.BaseSound>;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.sounds = new Map();
  }

  // Load audio assets
  preload(): void {
    // Load all sound files defined in AUDIO_CONFIG
    Object.values(AUDIO_CONFIG.SOUNDS).forEach(key => {
      this.scene.load.audio(key, `assets/audio/sfx/${key}.mp3`);
    });
  }

  // Play sound effect
  playSFX(key: string, volume?: number): void {
    if (this.scene.sound.get(key)) {
      this.scene.sound.play(key, {
        volume: volume || AUDIO_CONFIG.VOLUME.SFX,
      });
    } else {
      console.warn(`[AudioManager] Sound not found: ${key}`);
    }
  }

  // Play music (looping)
  playMusic(key: string, volume?: number): void {
    this.stopMusic(); // Stop current music
    this.scene.sound.play(key, {
      volume: volume || AUDIO_CONFIG.VOLUME.MUSIC,
      loop: true,
    });
  }

  // Stop all music
  stopMusic(): void {
    this.scene.sound.stopByKey('music_menu');
    this.scene.sound.stopByKey('music_game');
    this.scene.sound.stopByKey('music_gameover');
  }

  // Mute/unmute
  setMuted(muted: boolean): void {
    this.scene.sound.setMute(muted);
  }

  // Set volume
  setVolume(type: 'master' | 'sfx' | 'music', volume: number): void {
    // Implementation depends on Phaser's API
  }
}
```

---

## Integration Steps

### Step 1: Prepare Audio Assets
1. Create or source all required audio files
2. Convert to MP3 format (web-compatible)
3. Normalize volume levels across all files
4. Place in `assets/audio/sfx/` directory

### Step 2: Configure Audio System
1. Update `AUDIO_CONFIG` in `constants.ts` with all sound keys
2. Verify `AudioManager` has `preload()` method implemented
3. Ensure `AudioManager` is initialized in all scenes that use sound

### Step 3: Activate Integration Points
1. **Score sounds:** Uncomment event emissions in `ScoreManager.ts` (lines 67-69, 76-78)
2. **Character sounds:** Uncomment event emissions in `Character.ts` (lines 80-82, 91-93)
3. **Power-up sounds:** Add event listeners in `GameScene.ts` for `powerup-collected` and `powerup-activated`

### Step 4: Add Event Listeners in GameScene
```typescript
// In GameScene.create()
this.events.on('score:increase', (points, totalScore) => {
  this.audioManager?.playSFX(AUDIO_CONFIG.SOUNDS.SCORE_POINT);
});

this.events.on('score:newrecord', (highScore) => {
  this.audioManager?.playSFX(AUDIO_CONFIG.SOUNDS.SCORE_HIGHSCORE);
});

this.events.on('character:swim', (characterType) => {
  const soundKey = `character_swim_${characterType}`;
  this.audioManager?.playSFX(soundKey);
});

this.events.on('character:dive', (characterType) => {
  const soundKey = `character_dive_${characterType}`;
  this.audioManager?.playSFX(soundKey);
});

this.events.on('powerup-collected', (data) => {
  this.audioManager?.playSFX(AUDIO_CONFIG.SOUNDS.POWERUP_COLLECT);
});

this.events.on('powerup-activated', (data) => {
  const soundKey = `powerup_activate_${data.type}`;
  this.audioManager?.playSFX(soundKey);
});
```

### Step 5: Test Audio System
1. Test with actual audio files
2. Verify volume levels are balanced
3. Test on mobile devices (audio autoplay restrictions)
4. Add user preference for mute/unmute
5. Test with multiple sounds playing simultaneously

---

## Audio Best Practices

### Performance
- **Limit concurrent sounds:** Max 3-5 simultaneous sound effects
- **Use audio sprites:** Combine multiple short sounds into one file (advanced)
- **Preload all assets:** Don't load sounds during gameplay
- **Use Web Audio API:** Phaser 3 uses this by default (good!)

### Mobile Considerations
- **Autoplay restrictions:** First sound must be triggered by user interaction
- **File size:** Keep individual sounds under 100KB
- **Format:** MP3 is widely supported (but also provide OGG for Firefox)
- **Mute by default:** Let user enable sound

### User Experience
- **Volume balance:** Sound effects should never overpower music
- **Feedback timing:** Sound should play within 50ms of action
- **Variety:** Use slight pitch/volume variations to prevent monotony
- **Settings:** Always provide mute/volume controls

---

## Placeholder/Temporary Solution

### Using Free Sound Effects
Until custom audio is ready, use free resources:

1. **Freesound.org** - Community sound library
2. **OpenGameArt.org** - Public domain game audio
3. **Zapsplat.com** - Free sound effects
4. **Sonniss.com** - Annual free GDC bundle
5. **YouTube Audio Library** - Royalty-free audio

### Text-to-Speech Fallback
For testing, use browser's Web Speech API:
```typescript
// Development only - for testing without audio assets
if (process.env.NODE_ENV === 'development') {
  const utterance = new SpeechSynthesisUtterance('Swim up!');
  utterance.rate = 2; // Fast playback
  utterance.volume = 0.3;
  speechSynthesis.speak(utterance);
}
```

---

## Testing Checklist

- [ ] All Priority 1 sounds play correctly
- [ ] Character-specific sounds have distinct feel
- [ ] Power-up sounds provide clear feedback
- [ ] Volume levels are balanced
- [ ] No audio pops/clicks between sounds
- [ ] Sounds work on mobile (iOS/Android)
- [ ] Mute toggle works correctly
- [ ] Volume slider works correctly
- [ ] No sounds play when game is paused
- [ ] Sounds don't clip when many play at once

---

## Future Enhancements

### Dynamic Audio
- **Pitch shifting:** Vary pitch based on velocity/combo
- **Reverb/echo:** Add depth based on environment
- **Doppler effect:** Simulate speed (advanced)
- **Adaptive music:** Music intensity changes with gameplay

### Accessibility
- **Visual indicators:** Show sound effects visually for hearing-impaired
- **Subtitle system:** Text-based audio descriptions
- **Configurable feedback:** Let users choose audio vs visual feedback

---

**Document Version:** 1.0
**Last Updated:** 2025-11-10
**Status:** ✅ Integration points documented, ready for audio assets
