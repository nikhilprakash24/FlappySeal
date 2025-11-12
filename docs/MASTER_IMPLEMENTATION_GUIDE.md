# FlappySeal: Complete Implementation Guide & Technical Specification

**Version:** 1.0 | **Target Platform:** Mobile (iOS + Android) | **Engine:** Phaser 3 + TypeScript + Capacitor | **Status:** Pre-Launch (45% complete)

---

## PROJECT OVERVIEW & VISION

FlappySeal is a mobile-first Flappy Bird-inspired endless arcade game featuring three playable marine animals (Seal, Otter, Sea Lion) with distinct physics properties, multiple game modes, power-ups, and a comprehensive debug system. The game prioritizes accessibility over difficulty (lower gravity than Flappy Bird's realistic 9.8 m/s²), features dual-control mechanics (swim up + dive down), and includes an interactive tutorial for first-time players. Built with TypeScript/Phaser 3 for web, converted to native iOS/Android via Capacitor.

**Core Philosophy:** Config-driven architecture over hard-coded values. All game parameters exposed via debug system for rapid iteration. Composition over inheritance. Mobile-first design with portrait orientation lock.

---

## TECHNICAL STACK & ARCHITECTURE

**Frontend Framework:**
- Phaser 3 (2D game engine)
- TypeScript (strict mode enabled)
- Vite (build tool, fast HMR)

**Mobile Conversion:**
- Capacitor 5+ (native wrapper for iOS/Android)
- NOT using Cordova or React Native

**State Management:**
- Phaser's Scene system + Registry for cross-scene data
- localStorage for persistence (high scores, tutorial completion, character selection, settings)

**Asset Management:**
- Programmatic graphics rendering (Phaser Graphics API) - NO sprite sheets currently
- Audio via Phaser Sound Manager + Capacitor native audio plugins

**Analytics & Monitoring:**
- Firebase Analytics (mobile)
- Firebase Crashlytics (crash reporting)

**Project Structure:**
```
src/
├── config/
│   ├── constants.ts          // Game constants, UI config, audio config
│   └── characters.ts          // CharacterConfig definitions for all 3 animals
├── entities/
│   ├── Character.ts           // Abstract base class (540 lines)
│   ├── Seal.ts                // Extends Character (24 lines)
│   ├── Otter.ts               // Extends Character (30 lines)
│   └── SeaLion.ts             // Extends Character (30 lines)
├── scenes/
│   ├── MenuScene.ts           // Main menu with mode selection
│   ├── CharacterSelectScene.ts // Character selection UI with stat bars
│   ├── ModeSelectionScene.ts  // Game mode picker
│   └── GameScene.ts           // Core gameplay (700+ lines)
├── systems/
│   ├── ObstacleManager.ts     // Procedural obstacle generation
│   ├── ScoreManager.ts        // Scoring, high scores, persistence
│   ├── ParticleManager.ts     // Splash, bubbles, explosions
│   ├── BackgroundManager.ts   // Parallax ocean background
│   ├── AudioManager.ts        // Sound effect and music playback
│   ├── PowerUpSystem.ts       // 8 power-up types (shield, magnet, etc.)
│   └── TutorialOverlay.ts     // 5-step interactive tutorial (540 lines)
├── managers/
│   └── DebugManager.ts        // Real-time physics tuning UI (670 lines)
├── modes/
│   ├── EndlessMode.ts         // Classic endless gameplay
│   ├── ChallengeMode.ts       // Objective-based challenges
│   ├── TimeTrialMode.ts       // Time-limited mode
│   └── ZenMode.ts             // Relaxed, no obstacles
├── ui/
│   └── UIComponents.ts        // Reusable UI library (680 lines)
└── utils/
    ├── storage.ts             // localStorage wrapper
    └── helpers.ts             // Utility functions
```

---

## CORE GAME MECHANICS

### Physics System (Inspired by Flappy Bird)
**Model:** Continuous gravity + instant velocity reset on input (NOT additive forces)
```typescript
// Character.ts update loop
update() {
  this.velocity += this.gravity;  // Apply gravity every frame
  this.velocity = clamp(this.velocity, -this.maxVelocity, this.maxVelocity);
  this.y += this.velocity;
  this.rotation = clamp(this.velocity * rotationSpeed, -maxRotation, maxRotation);
}

// Input handling (NOT additive, sets velocity directly)
swimUp() {
  this.velocity = this.swimUpForce;  // e.g., -8 (instant upward velocity)
}
dive() {
  this.velocity = this.diveDownForce;  // e.g., +12 (instant downward velocity)
}
```

**Key Physics Values (Seal Baseline):**
- Gravity: 0.5 (more accessible than Flappy Bird's 9.8 m/s² equivalent)
- Swim Up Force: -8 (negative = upward)
- Dive Down Force: 12 (positive = downward)
- Max Velocity: 15 (terminal velocity cap)
- Rotation Speed: 2 (visual tilt multiplier)
- Max Rotation: 30° (prevents extreme angles)

**Controls:**
- Left side tap/click: Swim up
- Right side tap/click: Dive down
- Keyboard: Arrow Up (swim), Arrow Down (dive), Space (start/restart), D (toggle debug)

---

## CHARACTER SYSTEM (Config-Driven Architecture)

### CharacterConfig Interface
```typescript
interface CharacterConfig {
  id: string;                    // 'seal', 'otter', 'sealion'
  name: string;                  // Display name
  type: CharacterType;           // Enum for type safety
  stats: {
    weight: number;              // 100 = baseline, affects gravity multiplier
    power: number;               // 100 = baseline, affects jump force
    agility: number;             // 100 = baseline, affects handling
  };
  size: { width, height, renderScale };
  physics: {
    gravity, swimUpForce, diveDownForce, maxVelocityY,
    drag, rotationSpeed, maxRotation
  };
  visuals: {
    bodyColor, bellyColor?, flipperColor, eyeColor, noseColor,
    bodyShape: BodyShape,        // ROUND | SLEEK | BULKY
    features: {
      hasEarFlaps: boolean,      // Sea lions have external ears
      whiskerLength: 'short' | 'medium' | 'long' | 'thick',
      tailStyle: 'flipper' | 'tapered' | 'thick_flipper'
    }
  };
  gameplay: {
    difficulty: 'easy' | 'medium' | 'hard',
    hitboxScale: number,         // Collision box size multiplier
    unlockCondition?: { type: 'score', value: number }
  };
}
```

### Three Characters (35% Stat Variance)

**1. SEAL (Baseline - Medium Difficulty)**
- Stats: Weight 100, Power 100, Agility 100
- Physics: Gravity 0.5, Swim -8, Dive 12, MaxVel 15
- Visual: Round body, gray, classic seal look
- Unlock: Always available
- Hitbox: 1.0x (exact size)

**2. OTTER (Light/Agile - Hard Mode)**
- Stats: Weight 65 (-35%), Power 65 (-35%), Agility 130 (+30%)
- Physics: Gravity 0.33, Swim -5.2, Dive 7.8, MaxVel 12
- Visual: Sleek elongated body, brown/tan, long whiskers, tapered tail
- Unlock: Score 500 points
- Hitbox: 0.85x (smaller collision)
- Feel: Floaty, requires precise control, higher skill ceiling

**3. SEA LION (Heavy/Powerful - Easy Mode)**
- Stats: Weight 135 (+35%), Power 135 (+35%), Agility 75 (-25%)
- Physics: Gravity 0.68, Swim -10.8, Dive 16.2, MaxVel 18
- Visual: Bulky wide body, dark brown, ear flaps (key feature), thick whiskers
- Unlock: Score 1000 points
- Hitbox: 1.15x (larger collision)
- Feel: Heavy, momentum-based, forgiving for beginners

**Visual Differentiation (Programmatic Rendering):**
```typescript
// Character.ts draw method dispatches to body-shape-specific rendering
draw() {
  switch (this.config.visuals.bodyShape) {
    case BodyShape.ROUND:  this.drawRoundBody(); break;   // Seal
    case BodyShape.SLEEK:  this.drawSleekBody(); break;   // Otter - elongated 2:1 ratio
    case BodyShape.BULKY:  this.drawBulkyBody(); break;   // Sea Lion - wide, barrel-shaped
  }
  this.drawFeatures();  // Eyes, nose, whiskers (count varies by config)
}
```

### Character Implementation Pattern
```typescript
// Character.ts - Base class (550+ lines)
export class Character {
  protected config: CharacterConfig;
  protected gravity, swimUpForce, diveDownForce, maxVelocity;  // Physics properties

  constructor(scene, x, y, config: CharacterConfig) {
    this.config = config;
    this.gravity = config.physics.gravity;  // Initialize from config
    // ... all physics from config, NOT hard-coded
  }

  // Getters/setters for debug system exposure
  getGravity(): number { return this.gravity; }
  setGravity(value: number): void { this.gravity = value; }
}

// Seal.ts - Concrete implementation (24 lines)
export class Seal extends Character {
  constructor(scene, x, y) {
    super(scene, x, y, SEAL_CHARACTER_CONFIG);  // Just pass config, that's it!
  }
}
```

---

## DEBUG/TESTING SYSTEM (Press D to Toggle)

### Purpose
Real-time physics tuning, performance monitoring, config persistence for rapid iteration and balance testing. Critical for character balance work.

### Implementation (DebugManager.ts - 670 lines)
```typescript
export class DebugManager {
  private variables: Map<string, DebugVariable> = new Map();

  // Expose any game variable for real-time editing
  expose(category: string, name: string, key: string,
         getter: () => number, setter: (val: number) => void,
         options: { min, max, step, defaultValue, unit?, description? }) {
    this.variables.set(key, { category, name, getter, setter, ...options });
  }

  // Save current config to localStorage
  saveConfig(): void {
    const config = {};
    this.variables.forEach((v, key) => { config[key] = v.getter(); });
    localStorage.setItem('debug_config', JSON.stringify(config));
  }

  // Load saved config
  loadConfig(): void { /* ... */ }
}
```

**Exposed Variables (GameScene.ts):**
```typescript
exposeDebugVariables() {
  this.debugManager.expose('Player Physics', 'Gravity', 'player.gravity',
    () => this.player.getGravity(),
    (val) => this.player.setGravity(val),
    { min: 0, max: 3, step: 0.1, defaultValue: 0.5, description: 'Downward acceleration' }
  );
  // + Swim Up Force, Dive Down Force, Max Velocity
}
```

**UI Features:**
- Arrow keys to navigate variables and adjust values
- R = Reset to defaults
- S = Save config (localStorage)
- L = Load config
- Performance metrics (FPS, memory, frame time)

**Production Strategy:** Hidden in production builds, accessible via secret unlock (tap version number 7x in menu).

---

## TUTORIAL SYSTEM (TutorialOverlay.ts - 540 lines)

### 5-Step Interactive Flow
1. **Welcome:** Game explanation + tap to continue
2. **Swim Up:** Practice tapping left side (requires 3 successful taps)
3. **Dive Down:** Practice tapping right side (requires 3 successful taps)
4. **Avoid Obstacles:** Explanation of collision + tap to continue
5. **Score Points:** Explanation of scoring + tap to start game

**Features:**
- Semi-transparent overlay (0.6 alpha black background)
- Highlight zones (lighter overlay on interactive areas)
- Animated directional arrows (pulse effect)
- Skip button (top-right, always accessible)
- Completion persistence (localStorage: 'flappyseal_tutorial_seen')
- Auto-shows for first-time players only
- Events: `tutorial:complete`, `tutorial:skipped` → both trigger game start

**Integration (GameScene.ts):**
```typescript
create() {
  // ... initialize all systems
  this.tutorialOverlay = new TutorialOverlay(this);

  this.events.on('tutorial:complete', () => {
    if (!this.isGameStarted) this.startGame();
  });
}

startGame() {
  if (this.tutorialOverlay && this.tutorialOverlay.shouldShow()) {
    this.tutorialOverlay.start();  // Show tutorial, it will call startGame again after
    return;
  }
  // ... actual game start
}
```

---

## SOUND EFFECTS INTEGRATION (Ready for Assets)

### Current Status
- AudioManager exists and functional
- 5 sounds already wired in GameScene (swim_up, dive_down, collision, game_over, shield_break)
- 11 additional integration points added with TODO comments

### Integration Points (All Documented in SOUND_EFFECTS_GUIDE.md)
```typescript
// Character.ts
swimUp() {
  this.velocity = this.swimUpForce;
  // TODO: this.scene.events.emit('character:swim', this.config.type);
}

// ScoreManager.ts
addPoints(points: number) {
  this.currentScore += points;
  // TODO: this.scene.events.emit('score:increase', points, this.currentScore);
  if (this.currentScore > this.highScore) {
    // TODO: this.scene.events.emit('score:newrecord', this.highScore);
  }
}

// PowerUpSystem.ts
collectPowerUp(spawn) {
  // TODO: Sound via 'powerup-collected' event (GameScene should listen)
  this.scene.events.emit('powerup-collected', { x, y, type });
}
```

**Required Audio Assets (Priority 1):**
1. `swim_up.mp3` - Splash/whoosh upward (0.2-0.4s)
2. `dive_down.mp3` - Splash/whoosh downward (0.2-0.4s)
3. `collision.mp3` - Impact/crash (0.3-0.5s)
4. `game_over.mp3` - Game over jingle (1-2s)
5. `score_point.mp3` - Ding/chime (0.1-0.2s)

**Character-Specific Sounds (Priority 2):**
- `character_swim_seal.mp3`, `character_dive_seal.mp3`
- `character_swim_otter.mp3`, `character_dive_otter.mp3` (higher pitch)
- `character_swim_sealion.mp3`, `character_dive_sealion.mp3` (lower pitch)

**Activation:** Uncomment TODO lines, add event listeners in GameScene, drop audio files in `public/assets/audio/`.

---

## UI/UX SYSTEM (UIComponents.ts - 680 lines)

### Design System
```typescript
export const UI_COLORS = {
  primary: 0x00d4ff,      // Cyan blue (ocean theme)
  primaryDark: 0x0a4f6e,
  accent: 0xffaa00,       // Orange (highlights)
  success: 0x44ff44,      // Green (positive feedback)
  danger: 0xff4444,       // Red (game over)
};

export const UI_SPACING = { xs: 5, sm: 10, md: 20, lg: 40, xl: 80 };
export const UI_FONTS = {
  TITLE: { SIZE: '72px', FAMILY: 'Arial Black', STYLE: 'bold' },
  BUTTON: { SIZE: '24px', FAMILY: 'Arial', STYLE: 'normal' },
  SCORE: { SIZE: '48px', FAMILY: 'Impact', STYLE: 'bold' },
};
```

### Reusable Components
**UIButton:** Hover (scale 1.05x), press (scale 0.95x), click callback
**UIPanel:** Rounded rectangles with borders and optional titles
**UIStatBar:** Animated progress bars for character stats (weight, power, agility)
**UIBadge:** Pill-shaped badges for difficulty/status
**UIAnimations:** Helper functions (fadeIn, fadeOut, popIn, slideInFromBottom, scalePulse)

### Character Selection UI (CharacterSelectScene.ts - 550 lines)
- 3 character cards with mini character preview
- Stat comparison bars (weight, power, agility) - color-coded by character
- Difficulty badges (Easy/Medium/Hard) with color coding
- Lock indicators with unlock requirements shown
- Selection glow effect + sound feedback (when audio ready)
- Selection persistence: `localStorage.setItem('flappyseal_selected_character', characterId)`
- Registry passing: `this.registry.set('characterType', CharacterType.OTTER)`

---

## GAME MODES (4 Modes Implemented)

**1. Endless Mode (EndlessMode.ts)** - Classic Flappy Bird style
- Obstacles spawn continuously, difficulty scales with score
- No time limit, no objectives
- Power-ups enabled

**2. Challenge Mode (ChallengeMode.ts)** - Objective-based
- Specific challenges (e.g., "Score 50 with Otter", "Collect 10 power-ups")
- Completion rewards (cosmetics, currency)
- No power-ups

**3. Time Trial Mode (TimeTrialMode.ts)** - Race against clock
- 60-second timer, score as much as possible
- Obstacle speed increased 1.5x
- Power-ups enabled

**4. Zen Mode (ZenMode.ts)** - Relaxed practice
- No obstacles, no death
- Practice controls and character feel
- No scoring

**Mode Selection Flow:**
MenuScene → ModeSelectionScene → (optional) CharacterSelectScene → GameScene

---

## MOBILE-ONLY LAUNCH STRATEGY

### Technical Approach
**Tech Stack:** Phaser 3 (TypeScript) → Vite Build → Capacitor → Native iOS/Android Apps

**NOT Using:**
- Web version (skipped for now)
- Cordova (deprecated)
- React Native (different paradigm)

### Capacitor Setup (Week 2 of Launch Plan)
```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init  # App name: FlappySeal, ID: com.yourname.flappyseal, webDir: dist
npx cap add ios
npx cap add android
npm run build && npx cap sync  # Build web assets → copy to native projects
npx cap open ios     # Opens Xcode
npx cap open android # Opens Android Studio
```

**iOS Configuration (Xcode):**
- Bundle ID: com.yourname.flappyseal
- Display Name: FlappySeal
- Version: 1.0, Build: 1
- Deployment Target: iOS 13.0+
- Orientation: Portrait only (lock landscape out)
- Status Bar: Light content style
- Add app icons to Assets.xcassets (1024×1024 base, Xcode auto-generates sizes)
- Splash screen: LaunchScreen.storyboard with 2732×2732 centered image

**Android Configuration (Android Studio):**
- applicationId: com.yourname.flappyseal
- versionName: "1.0", versionCode: 1
- minSdkVersion: 22 (Android 5.1+)
- targetSdkVersion: 34 (Android 14)
- Orientation: portrait in AndroidManifest.xml
- App icons: res/mipmap folders (48, 72, 96, 144, 192, 512 sizes)
- Splash: res/drawable/splash.png

**Build Commands:**
```bash
# Development
npm run build && npx cap sync && npx cap run ios
npm run build && npx cap sync && npx cap run android

# Production
# iOS: Xcode → Product → Archive → Upload to App Store Connect
# Android: Build → Generate Signed Bundle → Upload to Play Console
```

### Mobile-Specific Optimizations
- **Touch zones:** Left 50% = swim up, Right 50% = dive down (no need for buttons)
- **Safe area insets:** Handle iPhone notch/Dynamic Island via CSS safe-area-inset-*
- **Haptic feedback:** (Optional) Use Capacitor Haptics plugin for button presses
- **Audio:** Test autoplay restrictions, may need user interaction to enable
- **Performance target:** Solid 60 FPS on iPhone 11 / Pixel 5 equivalent
- **Orientation lock:** Portrait only (less confusion, better for one-handed play)

### Debug Mode in Production (Secret Unlock)
```typescript
// In MenuScene.ts - add invisible tap counter to version text
const versionText = this.add.text(10, 10, 'v1.0', { fontSize: '12px' });
versionText.setInteractive();
let tapCount = 0;
versionText.on('pointerdown', () => {
  tapCount++;
  if (tapCount >= 7) {
    localStorage.setItem('flappyseal_debug_enabled', 'true');
    // Show "Debug Mode Unlocked!" message
  }
});

// In GameScene.ts - check flag before showing debug UI
if (localStorage.getItem('flappyseal_debug_enabled') === 'true') {
  this.debugManager.show();
}
```

---

## 6-WEEK LAUNCH TIMELINE (MOBILE-ONLY)

**Week 1 (45% → 65%):** Character balance testing (50+ games each), source 5 sound effects, create app icon (1024×1024), sign up for Apple Developer ($99) + Google Play ($25), take 5-10 screenshots

**Week 2 (65% → 80%):** Install Capacitor, add iOS/Android platforms, configure Xcode/Android Studio, add app icons/splash screens, test in simulators, test on physical devices, optimize touch controls

**Week 3 (80% → 90%):** Write privacy policy + terms of service (host on GitHub Pages or domain), create App Store Connect listing, create Play Console listing, upload screenshots + metadata, set up Firebase Analytics, integrate crashlytics

**Week 4 (90% → 95%):** Build beta versions (TestFlight + Play Internal Testing), recruit 10-20 beta testers, distribute beta links, monitor analytics + crashes, collect feedback via form, compile bug list

**Week 5 (95% → 98%):** Fix critical bugs, fix high-priority bugs, update beta build (v1.0.1), performance optimizations, re-test with beta testers, character balance adjustments if needed, final QA pass

**Week 6 (98% → 100%):** Bump to v1.0 production, final build checklist, submit to App Store (review time: 24-48hrs), submit to Google Play (review time: hours to 1-2 days), once approved → press "Release", post launch announcements, monitor reviews/crashes

**Cost:** $124 minimum (Apple $99 + Google $25)
**Time Commitment:** 10-15 hours/week
**Target Month 1 Metrics:** 500-1,000 downloads, 100-200 DAU, >40% Day 1 retention, >4.0 star rating

---

## CRITICAL IMPLEMENTATION NOTES

### Storage Pattern (storage.ts)
```typescript
export class StorageManager {
  getHighScore(): number { return parseInt(localStorage.getItem('high_score') || '0'); }
  setHighScore(score: number): void { localStorage.setItem('high_score', score.toString()); }
  getTutorialComplete(): boolean { return localStorage.getItem('tutorial_seen') === 'true'; }
  setTutorialComplete(val: boolean): void { localStorage.setItem('tutorial_seen', val.toString()); }
}
export const storage = new StorageManager();  // Singleton
```

### Scene Communication (Registry Pattern)
```typescript
// MenuScene → CharacterSelectScene
this.scene.start('CharacterSelectScene', { playerTotalScore: storage.getHighScore() });

// CharacterSelectScene → GameScene
this.registry.set('characterType', CharacterType.OTTER);
this.scene.start('GameScene');

// GameScene reads registry
const characterType = this.registry.get('characterType') || CharacterType.SEAL;
```

### Collision Detection (GameScene.ts)
```typescript
update() {
  // Boundary checks
  if (this.player.isHittingTop() || this.player.isHittingBottom()) {
    this.handleCollision();
  }

  // Obstacle collision (with hitbox scaling from character config)
  const bounds = this.player.getBounds();  // Returns scaled bounds
  const collision = this.obstacleManager.checkCollision(bounds);
  if (collision) {
    this.handleCollision();  // Check for shield power-up first
  }
}
```

### Power-Up System (8 Types)
Shield, Magnet, Slow Motion, Invincibility, Double Points, Speed Boost, Size Change (Small), Time Freeze
**Spawning:** Every 8 seconds, max 2 active, random type based on rarity weights
**Collection:** Distance-based (40px radius)
**Duration:** 5-15 seconds depending on type
**Visual:** Indicators in top-right corner with countdown timers

---

## BUILD CONFIGURATION & ENVIRONMENT VARIABLES

**Environment Files:**
```bash
# .env.development (local dev)
VITE_DEBUG_ENABLED=true
VITE_UNLOCK_ALL_CHARACTERS=true

# .env.production (app stores)
VITE_DEBUG_ENABLED=false
VITE_UNLOCK_ALL_CHARACTERS=false
VITE_ANALYTICS_ID=your-firebase-id
```

**Usage in Code:**
```typescript
export const APP_CONFIG = {
  DEBUG_ENABLED: import.meta.env.VITE_DEBUG_ENABLED === 'true',
  VERSION: '1.0.0',
};
```

**Build Commands:**
```bash
npm run dev                    # Local development with HMR
npm run build                  # Production build (uses .env.production)
npm run build:mobile           # Build + sync to Capacitor
npm run preview                # Preview production build locally
```

---

## KNOWN ISSUES & SOLUTIONS

**Issue 1: Audio Autoplay Blocked (Mobile)**
- **Cause:** Browser/native restrictions on autoplay
- **Solution:** User must interact first (tutorial tap counts), or use Capacitor NativeAudio plugin

**Issue 2: Performance Drops on Low-End Devices**
- **Cause:** Particle system + graphics redraw every frame
- **Solution:** Reduce particle count, implement sprite caching, or lower frame rate to 30 FPS for old devices

**Issue 3: SafeArea Issues on iPhone Notch**
- **Cause:** Game rendered behind notch/Dynamic Island
- **Solution:** Use CSS safe-area-inset or Capacitor SafeArea plugin, add padding to UI elements

**Issue 4: Character Unlock Progression Too Grindy**
- **Cause:** 500/1000 score thresholds too high for casual players
- **Solution:** Monitor analytics (unlock rate should be ~30% for Otter, ~10% for Sea Lion in first week), adjust thresholds in `characters.ts` if needed

---

## PROMPT FOR REBUILDING FROM SCRATCH

**Context:** You are building FlappySeal, a mobile-first Flappy Bird clone with 3 playable marine animals (Seal, Otter, Sea Lion), each with 35% stat variance. The game features dual controls (swim up + dive down), an interactive 5-step tutorial, a real-time debug system (Press D), character selection UI with unlock progression, 4 game modes (Endless, Challenge, Time Trial, Zen), power-ups (8 types), and programmatic graphics rendering (no sprites). Target platform is iOS + Android via Capacitor. Physics model uses instant velocity reset (not additive forces) with lower gravity (0.5) than Flappy Bird for accessibility.

**Setup:**
1. Initialize Vite + TypeScript + Phaser 3 project
2. Install Capacitor: `npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android`
3. Create folder structure: `src/{config,entities,scenes,systems,managers,modes,ui,utils}`
4. Set up strict TypeScript config with ES2020 target

**Core Implementation Order:**
1. Create `constants.ts` (GAME_CONFIG, UI_CONFIG, SEAL_CONFIG)
2. Create `characters.ts` with CharacterConfig interface + 3 character configs (Seal baseline, Otter -35% weight/power, Sea Lion +35%)
3. Implement `Character.ts` base class with config-driven physics, programmatic rendering (3 body shapes: Round/Sleek/Bulky), and getters/setters for debug exposure
4. Implement concrete classes: `Seal.ts`, `Otter.ts`, `SeaLion.ts` (each ~24-30 lines, just pass config to super)
5. Create `GameScene.ts` with character factory pattern, obstacle manager integration, score manager, and input handling (pointer.x < centerX ? swimUp : dive)
6. Implement `DebugManager.ts` with variable registry, keyboard controls (D toggle, arrows adjust, R reset, S save, L load), and localStorage persistence
7. Create `TutorialOverlay.ts` with 5 steps, semi-transparent overlay, highlight zones, animated arrows, skip button, and completion persistence
8. Implement `CharacterSelectScene.ts` with 3 character cards, stat bars (weight/power/agility), lock indicators, selection persistence, and registry passing
9. Create `UIComponents.ts` library with UIButton, UIPanel, UIStatBar, UIBadge, UIAnimations
10. Implement `storage.ts` singleton with getHighScore, setHighScore, getTutorialComplete, setTutorialComplete
11. Create obstacle manager with procedural generation, scoring system with persistence, particle manager with splash/bubble effects
12. Add sound integration points (11 TODO comments) in Character.ts, ScoreManager.ts, PowerUpSystem.ts
13. Initialize Capacitor, add iOS/Android platforms, configure app icons/splash screens, test in simulators
14. Set up Firebase Analytics + Crashlytics
15. Build beta versions, test on physical devices, gather feedback, fix bugs, submit to app stores

**Key Technical Decisions:**
- Config-driven architecture (NO hard-coded values)
- Composition over inheritance (Character base class + CharacterConfig)
- Programmatic rendering (Phaser Graphics API, not sprites)
- localStorage for all persistence
- Registry pattern for scene communication
- Portrait orientation lock (mobile)
- Secret debug unlock in production (tap version 7x)
- Free at launch, ads in Update 1.1

**Critical Dependencies:**
- Phaser 3.60+
- TypeScript 5.0+
- Vite 5.0+
- Capacitor 5.0+
- Firebase SDK (analytics + crashlytics)

**Build Target:**
- Web: `npm run build` → `dist/` folder
- iOS: `npx cap sync && npx cap open ios` → Xcode archive
- Android: `npx cap sync && npx cap open android` → Generate signed bundle

**Success Criteria:**
- 60 FPS on iPhone 11 / Pixel 5
- Tutorial completion rate >70%
- Crash rate <1%
- All 3 characters feel distinct and balanced
- Unlock thresholds achievable (500, 1000 points)
- Debug system functional (expose 4+ physics variables)
- Build size <2MB (gzipped)

This document contains all critical information for rebuilding FlappySeal from scratch or debugging the existing codebase. All architectural decisions, technical specifications, and implementation details from our discussions are captured here.
