# FlappySeal Architecture Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Systems](#core-systems)
5. [Game Flow](#game-flow)
6. [Entity System](#entity-system)
7. [Scene Management](#scene-management)
8. [Data Flow](#data-flow)
9. [Performance Considerations](#performance-considerations)
10. [Known Issues & Technical Debt](#known-issues--technical-debt)

---

## Project Overview

FlappySeal is a browser-based game built with Phaser 3 and TypeScript. It features a dual-control seal character navigating through underwater obstacles with multiple game modes, achievements, and unlockable content.

### Key Features
- Dual-control mechanics (swim up / dive down)
- Multiple game modes (Endless, Time Trial, Challenge, Zen)
- Progression system with unlockables and achievements
- Particle effects and visual polish
- Audio system with music and SFX
- Power-up system
- Object pooling for performance

---

## Technology Stack

- **Game Engine**: Phaser 3 (v3.80.1)
- **Language**: TypeScript (v5.6.3)
- **Build Tool**: Vite (v5.4.21)
- **Testing**: Vitest (v2.1.8)
- **Package Manager**: npm

### Development Dependencies
- ESLint for code quality
- Prettier for code formatting (configured)
- TypeScript strict mode enabled

---

## Project Structure

```
FlappySeal/
├── src/
│   ├── main.ts                 # Entry point, Phaser config
│   ├── config/                 # Game configuration
│   │   ├── constants.ts        # All game constants (tuning values)
│   │   ├── biomes.ts          # Biome definitions
│   │   ├── gameConfig.ts      # Extended game configuration
│   │   └── sealSkins.ts       # Seal skin definitions
│   ├── scenes/                 # Phaser scenes
│   │   ├── MenuScene.ts       # Main menu
│   │   ├── ModeSelectionScene.ts  # Game mode selection
│   │   ├── GameScene.ts       # Main gameplay scene
│   │   ├── UnlockScene.ts     # Unlockables management
│   │   └── AchievementScene.ts  # Achievements display
│   ├── entities/              # Game entities
│   │   ├── Seal.ts           # Player character
│   │   ├── Obstacle.ts       # Obstacles (coral/jellyfish)
│   │   └── Boss.ts           # Boss entities
│   ├── systems/              # Game systems
│   │   ├── ObstacleManager.ts      # Obstacle spawning & pooling
│   │   ├── ScoreManager.ts         # Score tracking
│   │   ├── ParticleManager.ts      # Visual effects
│   │   ├── BackgroundManager.ts    # Parallax backgrounds
│   │   ├── AudioManager.ts         # Sound system
│   │   ├── PowerUpSystem.ts        # Power-up management
│   │   ├── UnlockSystem.ts         # Progression system
│   │   ├── AchievementSystem.ts    # Achievement tracking
│   │   ├── AnimationStateMachine.ts # Entity animations
│   │   └── SpriteSystem.ts         # Sprite management
│   ├── modes/                # Game mode implementations
│   │   ├── GameMode.ts       # Base game mode class
│   │   ├── EndlessMode.ts    # Endless mode
│   │   ├── TimeTrialMode.ts  # Time-limited mode
│   │   ├── ChallengeMode.ts  # Objective-based mode
│   │   └── ZenMode.ts        # Peaceful mode
│   ├── ui/                   # UI components
│   │   ├── ProgressHUD.ts    # Progress display
│   │   └── LevelUpNotification.ts  # Level up popup
│   ├── utils/               # Utility functions
│   │   ├── helpers.ts       # Math and general helpers
│   │   └── storage.ts       # LocalStorage wrapper
│   └── types/               # TypeScript types
│       └── index.ts         # Shared type definitions
├── public/                  # Static assets
│   └── index.html          # HTML entry point
├── tests/                  # Test files
└── docs/                   # Additional documentation

```

---

## Core Systems

### 1. Scene Management System

Phaser uses a scene-based architecture. Each scene represents a distinct state of the game.

**Scene Flow:**
```
MenuScene → ModeSelectionScene → GameScene → MenuScene (or restart)
         ↓                                      ↑
    UnlockScene                                 |
         ↓                                      |
    AchievementScene → → → → → → → → → → → → → →
```

**Scene Communication:**
- Uses Phaser's scene registry for data passing
- Example: `this.registry.set('gameMode', GameModeType.ENDLESS)`
- Scenes can be paused/resumed/stopped independently

### 2. Entity System

#### Seal Entity (src/entities/Seal.ts)
The player character with custom rendering.

**Key Properties:**
- Position: `{x, y}`
- Velocity: single number (vertical only)
- Rotation: calculated from velocity
- Skin: customizable appearance

**Key Methods:**
- `swimUp()`: Apply upward force
- `dive()`: Apply downward force
- `update()`: Physics update (gravity, position, rotation)
- `getBounds()`: Collision box
- `isHittingTop/Bottom()`: Boundary checks

**Collision Bounds:**
```
x: this.x - 30  (SEAL_CONFIG.WIDTH / 2)
y: this.y - 17.5 (SEAL_CONFIG.HEIGHT / 2)
width: 60
height: 35
```

**Physics:**
```typescript
// Each frame:
velocity += GRAVITY (0.5)
velocity = clamp(velocity, -15, +15)
y += velocity
rotation = clamp(velocity * ROTATION_SPEED, -30°, +30°)
```

#### Obstacle Entity (src/entities/Obstacle.ts)
Obstacles come in two types: Coral and Jellyfish.

**Key Properties:**
- `x`: Horizontal position
- `gapY`: Vertical center of safe gap
- `gapSize`: Height of safe gap (200-240px)
- `type`: CORAL or JELLYFISH
- `passed`: Boolean flag for scoring

**Rendering:**
- Two Graphics objects: `topObstacle`, `bottomObstacle`
- Coral: Solid pillars with decorative branches
- Jellyfish: Bell + animated tentacles

**Collision Detection:**
- Top bounds: `{x, y: 0, width: 60, height: gapY - gapSize/2}`
- Bottom bounds: `{x, y: gapY + gapSize/2, width: 60, height: remaining}`

### 3. Object Pooling System

To avoid garbage collection spikes, obstacles are pooled.

**Implementation (src/systems/ObstacleManager.ts):**

```typescript
// Initialization:
// - Create 5 obstacles
// - Call hide() to prepare for reuse
// - Add to obstaclePool[]

// When spawning:
// - Check if pool has obstacles
// - If yes: pop from pool, call reset()
// - If no: create new obstacle

// When removing:
// - Call hide() (don't destroy graphics)
// - Return to pool

// Important: hide() vs destroy()
// - hide(): Clear graphics, set invisible (reusable)
// - destroy(): Destroy graphics objects (for cleanup only)
```

**Benefits:**
- Reduced GC pauses
- Consistent frame timing
- Better performance on lower-end devices

### 4. Obstacle Manager System

Manages obstacle lifecycle, spawning, and collision detection.

**Key Responsibilities:**
1. **Spawning:**
   - Every 2500ms (SPAWN_INTERVAL)
   - Random gap position (100-500)
   - Random gap size (200-240)
   - Spawns at x = 850 (off-screen right)

2. **Movement:**
   - Scrolls left at `scrollSpeed` pixels/frame
   - Speed increases with score (difficulty progression)
   - Base speed: 3px, Max speed: 6px

3. **Collision Detection:**
   - AABB (Axis-Aligned Bounding Box) collision
   - Checks seal bounds against obstacle top/bottom
   - Validates bounds before checking
   - Includes buffer zones for edge cases

4. **Scoring:**
   - Tracks if seal passed each obstacle
   - Awards points when `sealX > obstacle.x + WIDTH`
   - Prevents double-counting with `passed` flag

**Critical Bug Fix (2024-11-12):**
```typescript
// Old: lastSpawnTime = 0, first spawn immediate
// New: Initialize lastSpawnTime = time on first update
if (this.lastSpawnTime === 0) {
  this.lastSpawnTime = time;
}
```

### 5. Score Manager System

Tracks score, high score, and updates display.

**Features:**
- Real-time score updates
- High score persistence (localStorage)
- Score multipliers (from power-ups)
- Visual score display with proper depth
- Hide/show functionality for different game states

### 6. Particle Manager System

Creates visual effects for game events.

**Particle Types:**
- **Bubbles**: Swim/dive actions, rising animation
- **Trail**: Continuous effect behind seal
- **Splash**: Water splash effects
- **Explosion**: Collision/collection effects
- **Score Pop**: Visual feedback for points

**Implementation:**
- Uses Phaser.GameObjects.Graphics for particles
- Custom particle lifecycle management
- Tweens for animation
- Automatic cleanup

### 7. Background Manager System

Handles parallax scrolling background layers.

**Layers:**
1. Far background (slowest)
2. Mid-layer decorations
3. Near-layer elements (fastest)

**Parallax Effect:**
```typescript
// Each layer scrolls at different speed
layer1.speed = scrollSpeed * 0.3
layer2.speed = scrollSpeed * 0.6
layer3.speed = scrollSpeed * 1.0
```

### 8. Power-Up System

Temporary abilities that modify gameplay.

**Power-Up Types:**
```typescript
enum PowerUpType {
  SHIELD,          // Survive one collision
  SLOW_MOTION,     // Reduce obstacle speed
  SCORE_MULTIPLIER, // 2x points
  SHRINK,          // Smaller hitbox
  GHOST_MODE       // Pass through obstacles
}
```

**State Management:**
- Tracks active power-ups
- Duration timers
- Visual indicators
- Effect application/removal

### 9. Audio Manager System

Centralized audio control.

**Features:**
- Music loop management
- SFX playback
- Volume control (master, music, SFX separate)
- Audio preloading
- Mute/unmute functionality

**Audio IDs:**
- `swim_up`, `dive_down`: Movement sounds
- `score`: Point collection
- `collision`: Impact sound
- `game_over`: Death sound
- `main_theme`: Background music

### 10. Achievement System

Tracks player accomplishments.

**Achievement Structure:**
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: GameStats) => boolean;
  rewards: { experience: number; currency: number };
  unlocked: boolean;
  progress?: number;
}
```

**Tracking:**
- Real-time progress updates
- Persistence via localStorage
- Visual notifications on unlock
- Reward distribution

### 11. Unlock System

Progression and content unlocking.

**Unlockables:**
- Seal skins (cosmetic)
- Game modes (gameplay)
- Special challenges
- Visual themes

**Progression:**
- Experience points from gameplay
- Level-based unlocks
- Currency system (fish coins)

---

## Game Flow

### Initialization (main.ts)

```typescript
1. Create Phaser game instance
2. Configure scenes: [MenuScene, ModeSelectionScene, GameScene, ...]
3. Set up physics (arcade, no gravity)
4. Configure scale mode (FIT, CENTER_BOTH)
5. Start MenuScene automatically
```

### MenuScene

**On Create:**
1. Render animated background (bubbles, gradient)
2. Show title with floating animation
3. Create interactive buttons (Play, Unlocks, Achievements, Settings)
4. Display player stats (level, unlocks, achievements)
5. Show version info

**On Play Click:**
1. Fade out transition
2. Start ModeSelectionScene

### ModeSelectionScene

**On Create:**
1. Load available modes
2. Display mode cards with icons, descriptions, best scores
3. Check unlock status for each mode
4. Create back button

**On Mode Select:**
1. If Challenge: Show challenge submenu
2. Otherwise: Set game mode in registry
3. Fade out and start GameScene

### GameScene - The Core Gameplay Loop

#### Initialization (create)

```typescript
1. Initialize game mode (from registry or default to Endless)
2. Create BackgroundManager (parallax layers)
3. Create ParticleManager (effects system)
4. Create AudioManager (sound system)
5. Create PowerUpSystem (if mode allows)
6. Create Seal entity at start position (200, 300)
7. Create ObstacleManager (if mode has obstacles)
8. Create ScoreManager (hidden initially)
9. Render start screen UI (title, instructions)
10. Setup input controls (mouse, touch, keyboard)
```

#### Game Start (startGame)

```typescript
1. Set isGameStarted = true
2. Set gameState = PLAYING
3. Reset seal to start position
4. Destroy start screen UI
5. Show score display (unless Zen mode)
6. Create mode-specific UI
7. Start background music
```

#### Update Loop (update)

**Every frame (60 FPS target):**

```typescript
// 1. Early exit if not playing
if (gameState !== PLAYING || !seal) return;

// 2. Update game mode
gameMode.update(time, delta);
if (gameMode.isComplete()) → onModeComplete();
if (gameMode.isFailed()) → gameOver();

// 3. Update power-ups
powerUpSystem.update(time, seal.x, seal.y, ...);

// 4. Update seal physics
seal.update();  // Applies gravity, updates position

// 5. Create visual trail
if (time % 100 < 16) particleManager.createTrail(seal.x, seal.y);

// 6. Check boundary collisions
if (shouldCheckCollision && isValidSealPosition) {
  if (seal.isHittingTop() || seal.isHittingBottom()) {
    handleCollision();
    return;
  }
}

// 7. Update obstacles
pointsEarned = obstacleManager.update(time, seal.x);
if (pointsEarned > 0) {
  // Apply multipliers
  // Update score
  // Create effects
  // Play sound
}

// 8. Update background parallax
backgroundManager.update(scrollSpeed);

// 9. Check obstacle collisions
collision = obstacleManager.checkCollision(
  sealBounds.x, sealBounds.y,
  scaledWidth, scaledHeight
);
if (collision && shouldCheckCollision) {
  handleCollision();
  return;
}
```

#### Collision Handling

```typescript
handleCollision():
  1. Check if shield power-up is active
     - If yes: Use shield, create explosion, shake camera, continue
  2. If no shield: gameOver()

gameOver():
  1. Set gameState = GAME_OVER
  2. Play collision sound
  3. Create explosion particle effect
  4. Delayed: Play game over sound (300ms)
  5. Delayed: Show results screen (800ms total)
  6. Display "Game Over" text with animation
  7. Show final score
  8. Show high score if new record
  9. Show restart instruction
```

#### Restart

```typescript
restartGame():
  1. Destroy all UI at depth 100
  2. Reset seal to start position
  3. Reset obstacle manager
  4. Reset score manager
  5. Reset power-up system
  6. Set gameState = PLAYING
  7. Set isGameStarted = true
```

---

## Data Flow

### Input → Action

```
User Input (Mouse/Touch/Keyboard)
  ↓
Input Event Handler (GameScene.setupControls)
  ↓
Check Game State (PLAYING? Started?)
  ↓
If not started: startGame()
If PLAYING: seal.swimUp() or seal.dive()
  ↓
Create particle effects
Play sound effects
```

### Physics Update

```
seal.update() called every frame
  ↓
velocity += GRAVITY (0.5)
  ↓
velocity = clamp(velocity, -15, +15)
  ↓
y += velocity
  ↓
rotation = f(velocity)
  ↓
Redraw seal at new position/rotation
```

### Collision Detection Flow

```
GameScene.update()
  ↓
Get seal bounds (x, y, width, height)
  ↓
Check boundary collisions
  ↓
obstacleManager.checkCollision(bounds)
  ↓
For each obstacle in range:
  - Get top bounds
  - Check AABB overlap with seal
  - Get bottom bounds
  - Check AABB overlap with seal
  ↓
Return true if any collision
  ↓
If collision: handleCollision()
```

### Score Update Flow

```
obstacleManager.update() returns pointsEarned
  ↓
if (pointsEarned > 0):
  - Apply score multiplier from power-ups
  - scoreManager.addPoints(points * multiplier)
  - Update gameMode score
  - Create visual effects
  - Play score sound
  ↓
scoreManager updates display
  ↓
Check for high score
  ↓
Save to localStorage
```

---

## Performance Considerations

### 1. Object Pooling
- **Why**: Avoid garbage collection pauses
- **What**: Obstacles are reused instead of destroyed/recreated
- **Impact**: Consistent 60 FPS even with many obstacles

### 2. Particle Management
- **Why**: Particles can accumulate quickly
- **What**: Automatic cleanup after animation completes
- **Impact**: Prevents memory leaks

### 3. Graphics Rendering
- **Why**: Canvas rendering can be expensive
- **What**: Only redraw when necessary
- **Impact**: Reduced CPU usage

### 4. Depth Management
- **Why**: Proper layering prevents z-fighting
- **What**: Each element has explicit depth value
  - Background: 0-10
  - Game entities: 20-50
  - UI: 100+
  - Overlays: 200+
- **Impact**: Correct visual ordering

### 5. Audio Preloading
- **Why**: Avoid loading delays during gameplay
- **What**: Load all audio assets in Boot scene
- **Impact**: Smooth audio playback

### 6. LocalStorage Optimization
- **Why**: Minimize read/write operations
- **What**: Batch updates, cache values in memory
- **Impact**: Reduced I/O overhead

---

## Known Issues & Technical Debt

### Fixed Issues (2024-11-12)
1. ✅ Object pooling crash - graphics destroyed but reused
2. ✅ Immediate obstacle spawn on game start
3. ✅ Random death from insufficient collision validation
4. ✅ Missing parameter in ModeSelectionScene

### Current Technical Debt

#### TODO Comments in Code
Multiple files contain `// TODO:` comments marking incomplete features:
- MenuScene.ts:260-263 - Load real stats from UnlockSystem
- ModeSelectionScene.ts:38-46 - Load best scores from storage
- GameScene.ts (various) - Settings scene, sound placeholders

#### Missing Implementations
1. **Settings Scene**: No settings UI exists
2. **Audio Assets**: Placeholder audio IDs, no actual files
3. **Boss Entities**: Boss.ts exists but not integrated
4. **Tutorial System**: TUTORIAL_SEEN key exists but unused

#### Error Handling
- Limited try/catch blocks
- No error boundary for Phaser crashes
- LocalStorage failures not handled
- Asset loading failures not handled

#### TypeScript Strict Mode
- Some `any` types remain
- Optional chaining used extensively (good, but masks issues)
- Type assertions in mode casting

#### Testing Coverage
- No integration tests
- Only unit tests for helpers and storage
- No scene testing
- No collision detection testing

### Recommended Improvements

1. **Add Comprehensive Error Handling**
   ```typescript
   // Wrap critical systems
   try {
     obstacleManager.update();
   } catch (error) {
     console.error('Obstacle update failed:', error);
     // Graceful degradation
   }
   ```

2. **Implement Proper Logging System**
   ```typescript
   class Logger {
     static debug(msg: string, data?: any) { ... }
     static error(msg: string, error: Error) { ... }
     static warn(msg: string) { ... }
   }
   ```

3. **Add Configuration Validation**
   ```typescript
   // Validate constants at startup
   function validateConfig() {
     assert(SEAL_CONFIG.START_Y > 0);
     assert(SEAL_CONFIG.START_Y < GAME_CONFIG.HEIGHT);
     assert(OBSTACLE_CONFIG.MIN_GAP > SEAL_CONFIG.HEIGHT * 2);
   }
   ```

4. **Create Debug Mode**
   ```typescript
   // Visual debug overlays
   if (DEBUG_MODE) {
     drawHitboxes();
     drawSpawnZones();
     showPerformanceStats();
   }
   ```

5. **Add Analytics/Telemetry**
   - Track game sessions
   - Monitor crash rates
   - Measure performance metrics
   - A/B test difficulty values

---

## Extending the Game

### Adding a New Game Mode

1. Create new mode class in `src/modes/`:
```typescript
export class MyNewMode extends GameMode {
  init(): void { ... }
  update(time: number, delta: number): void { ... }
  isComplete(): boolean { ... }
  isFailed(): boolean { ... }
  getResults(): GameResults { ... }
}
```

2. Add to GameModeType enum in `src/modes/GameMode.ts`
3. Add case in GameScene.initializeGameMode()
4. Add UI card in ModeSelectionScene

### Adding a New Power-Up

1. Add to PowerUpType enum in `src/systems/PowerUpSystem.ts`
2. Implement collection logic
3. Implement effect application
4. Implement effect removal
5. Add visual indicator
6. Add spawn logic

### Adding a New Obstacle Type

1. Add to ObstacleType enum in `src/types/index.ts`
2. Implement drawing logic in Obstacle.ts
3. Update ObstacleManager spawn logic
4. Adjust spawn probabilities in constants.ts

### Adding a New Achievement

1. Add to achievements array in AchievementSystem.ts
2. Define condition function
3. Set rewards
4. Add icon and description
5. Test unlock trigger

---

## Debugging Tips

### Common Issues

**Problem: Seal dies randomly**
- Check collision bounds visualization
- Verify obstacle gap sizes
- Check seal initial position
- Review collision validation logic

**Problem: Performance drops**
- Check particle count
- Verify object pooling is working
- Look for memory leaks (Chrome DevTools)
- Profile with Phaser Debug mode

**Problem: Obstacles not spawning**
- Check lastSpawnTime initialization
- Verify SPAWN_INTERVAL value
- Check gameState (must be PLAYING)
- Verify obstacleManager is created

### Debug Tools

**Phaser Debug Mode:**
```typescript
// In main.ts config:
physics: {
  default: 'arcade',
  arcade: {
    debug: true  // Shows collision boxes
  }
}
```

**Console Logging:**
```typescript
// In GameScene.update():
console.log('Seal:', seal.x, seal.y, seal.velocity);
console.log('Obstacles:', obstacles.length);
console.log('Score:', scoreManager.getScore());
```

**Performance Monitoring:**
```typescript
// Add FPS counter
this.add.text(10, 10, '', { fontSize: '16px' })
  .setScrollFactor(0)
  .setDepth(1000);

scene.sys.game.events.on('prestep', () => {
  fpsText.setText(`FPS: ${Math.round(game.loop.actualFps)}`);
});
```

---

## Version History

### v0.2.0-alpha (Current)
- Multiple game modes implemented
- Unlock and achievement systems
- Bug fixes: pooling, collision, spawning
- Improved code quality

### v0.1.0
- Initial prototype
- Basic endless mode
- Seal entity with dual controls
- Obstacle system

---

## Contributing Guidelines

When modifying the codebase:

1. **Follow TypeScript best practices**
   - Use explicit types, avoid `any`
   - Leverage interfaces and enums
   - Enable strict mode features

2. **Maintain consistent code style**
   - 2-space indentation
   - Clear variable names
   - JSDoc comments for public APIs

3. **Test changes thoroughly**
   - Run dev server and manual test
   - Write unit tests for utilities
   - Test on multiple browsers

4. **Document changes**
   - Update relevant .md files
   - Add comments for complex logic
   - Update ARCHITECTURE.md if structure changes

5. **Use meaningful commits**
   - Clear commit messages
   - Reference related issues
   - Group related changes

---

## References

- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Vite Guide](https://vitejs.dev/guide/)
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)

---

**Last Updated**: 2024-11-12
**Maintained By**: Development Team
**Version**: 0.2.0-alpha
