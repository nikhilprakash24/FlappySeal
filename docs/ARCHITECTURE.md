# FlappySeal - Architecture Documentation

## System Architecture Overview

### Technology Stack

```
┌─────────────────────────────────────────┐
│         User Interface Layer            │
│  (HTML5 Canvas via Phaser Renderer)     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Game Framework Layer            │
│           (Phaser 3.80+)                │
│  - Scene Management                     │
│  - Physics Engine (Arcade)              │
│  - Asset Management                     │
│  - Input Handling                       │
│  - Animation System                     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│        Application Layer                │
│         (TypeScript)                    │
│  - Game Logic                           │
│  - State Management                     │
│  - Scoring System                       │
│  - Collision Detection                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Build Layer                     │
│          (Vite)                         │
│  - TypeScript Compilation               │
│  - Asset Bundling                       │
│  - Hot Module Replacement               │
│  - Production Optimization              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       Deployment Layer                  │
│  Web: Netlify/Vercel/Static Hosting     │
│  Mobile: Capacitor → iOS/Android        │
└─────────────────────────────────────────┘
```

---

## Project Structure

```
FlappySeal/
├── docs/                    # All documentation
│   ├── PROJECT_PLAN.md      # Master plan
│   ├── PROGRESS_LOG.md      # Task completion log
│   ├── DECISIONS_LOG.md     # Technical decisions
│   ├── TESTING_LOG.md       # Testing activities
│   └── ARCHITECTURE.md      # This file
├── src/
│   ├── main.ts              # Application entry point
│   ├── config/              # Game configuration
│   │   ├── gameConfig.ts    # Phaser configuration
│   │   └── constants.ts     # Game constants
│   ├── scenes/              # Phaser scenes
│   │   ├── BootScene.ts     # Asset loading
│   │   ├── MenuScene.ts     # Main menu
│   │   ├── GameScene.ts     # Main gameplay
│   │   ├── GameOverScene.ts # Game over screen
│   │   └── PauseScene.ts    # Pause overlay
│   ├── entities/            # Game objects
│   │   ├── Seal.ts          # Player character
│   │   ├── Obstacle.ts      # Obstacle base class
│   │   └── Collectible.ts   # Collectible items
│   ├── systems/             # Game systems
│   │   ├── ObstacleManager.ts    # Obstacle spawning
│   │   ├── CollisionManager.ts   # Collision detection
│   │   ├── ScoreManager.ts       # Score tracking
│   │   ├── AudioManager.ts       # Sound management
│   │   └── ParticleManager.ts    # Visual effects
│   ├── utils/               # Utility functions
│   │   ├── storage.ts       # LocalStorage wrapper
│   │   └── helpers.ts       # Helper functions
│   └── types/               # TypeScript types
│       └── index.ts         # Type definitions
├── public/                  # Static assets
│   ├── assets/
│   │   ├── images/          # Image files
│   │   ├── audio/           # Sound files
│   │   └── fonts/           # Font files
│   └── favicon.ico
├── tests/                   # Test files
│   ├── unit/                # Unit tests
│   └── integration/         # Integration tests
├── index.html               # Entry HTML
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Scene Flow

```
┌──────────────┐
│  BootScene   │ (Asset loading)
└──────┬───────┘
       ↓
┌──────────────┐
│  MenuScene   │ ← ─ ─ ─ ─ ─ ─ ─ ┐
└──────┬───────┘                  │
       ↓                           │
┌──────────────┐                  │
│  GameScene   │ ← ─ ─ ┐          │
└──────┬───────┘       │          │
       ↓                │          │
┌──────────────┐       │          │
│ PauseScene   │ ─ ─ ─ ┘          │
└──────────────┘                  │
       ↓                           │
┌──────────────┐                  │
│GameOverScene │ ─ ─ ─ ─ ─ ─ ─ ─ ┘
└──────────────┘
```

---

## Core Game Loop

```typescript
// Simplified game loop pseudocode

update(time, delta) {
  // 1. Update player physics
  seal.velocity += gravity
  seal.y += seal.velocity

  // 2. Update obstacles
  obstacles.forEach(obstacle => {
    obstacle.x -= scrollSpeed
    if (obstacle.x < -obstacle.width) {
      obstacle.destroy()
    }
  })

  // 3. Spawn new obstacles
  if (shouldSpawnObstacle()) {
    spawnObstacle()
  }

  // 4. Check collisions
  if (checkCollisions()) {
    gameOver()
  }

  // 5. Update score
  if (passedObstacle()) {
    score++
  }

  // 6. Update UI
  updateScoreDisplay()
}
```

---

## Data Flow

### Score Management
```
User passes obstacle
      ↓
GameScene detects passage
      ↓
ScoreManager.increment()
      ↓
Update UI display
      ↓
Check if high score
      ↓
Save to localStorage
```

### Collision Detection
```
Phaser physics update
      ↓
CollisionManager checks overlaps
      ↓
If collision detected
      ↓
Trigger collision effects
      ↓
Transition to GameOver state
```

### Audio Playback
```
Game event occurs
      ↓
AudioManager.play(soundId)
      ↓
Check if muted
      ↓
Play sound via Phaser Audio
```

---

## State Management

### Game States
```typescript
enum GameState {
  MENU,      // Main menu
  PLAYING,   // Active gameplay
  PAUSED,    // Game paused
  GAME_OVER  // Game ended
}
```

### State Transitions
- MENU → PLAYING: User clicks "Start"
- PLAYING → PAUSED: User presses pause
- PAUSED → PLAYING: User resumes
- PLAYING → GAME_OVER: Collision occurs
- GAME_OVER → MENU: User clicks "Menu"
- GAME_OVER → PLAYING: User clicks "Retry"

---

## Physics System

Using Phaser Arcade Physics (lightweight, perfect for 2D)

```typescript
// Physics configuration
physics: {
  default: 'arcade',
  arcade: {
    gravity: { x: 0, y: 0 },  // Custom gravity in game logic
    debug: false
  }
}
```

**Custom Physics**:
- Manual gravity implementation for seal
- Left tap: Apply upward force
- Right tap: Apply downward force
- Continuous gravity pull
- Boundary constraints

---

## Asset Management Strategy

### Asset Loading
1. **Boot Scene**: Load critical assets
2. **Lazy Loading**: Load optional assets in background
3. **Asset Bundling**: Vite bundles and optimizes

### Asset Organization
```
assets/
├── images/
│   ├── seal/
│   │   ├── seal-idle.png
│   │   ├── seal-swim.png
│   │   └── seal-dive.png
│   ├── obstacles/
│   │   ├── coral-1.png
│   │   ├── coral-2.png
│   │   └── jellyfish.png
│   ├── ui/
│   │   ├── button-start.png
│   │   └── button-pause.png
│   └── backgrounds/
│       ├── layer-1.png
│       ├── layer-2.png
│       └── layer-3.png
├── audio/
│   ├── sfx/
│   │   ├── swim-up.mp3
│   │   ├── dive-down.mp3
│   │   ├── collision.mp3
│   │   └── score.mp3
│   └── music/
│       └── underwater-theme.mp3
└── fonts/
    └── game-font.woff2
```

---

## Performance Optimization Strategies

### Rendering
- Object pooling for obstacles (reuse instead of create/destroy)
- Sprite atlases to reduce draw calls
- Particle system limits
- Cull off-screen objects

### Memory
- Destroy unused objects properly
- Clear event listeners on scene shutdown
- Limit simultaneous audio playback
- Compress assets

### Loading
- Code splitting for larger features
- Progressive asset loading
- Preload critical assets only
- Cache static assets

---

## Mobile Conversion Architecture

### Capacitor Integration

```
Web Build (dist/)
      ↓
Capacitor CLI
      ↓
┌─────────┴─────────┐
│                   │
iOS App         Android App
(Xcode)         (Android Studio)
│                   │
└─────────┬─────────┘
          ↓
    App Stores
```

### Native Features Available
- Haptic feedback
- Status bar control
- Splash screen
- App icons
- Push notifications (future)
- In-app purchases (future)

---

## Testing Architecture

### Test Structure
```
tests/
├── unit/
│   ├── ScoreManager.test.ts
│   ├── CollisionManager.test.ts
│   └── ObstacleManager.test.ts
├── integration/
│   ├── GameFlow.test.ts
│   └── SceneTransitions.test.ts
└── e2e/
    └── Gameplay.test.ts
```

### Testing Tools
- **Vitest**: Unit and integration tests
- **Testing Library**: Component testing
- **Playwright** (optional): E2E tests
- **Manual QA**: User experience testing

---

## Deployment Architecture

### Web Deployment (Netlify/Vercel)
```
Git Push
    ↓
Webhook triggers build
    ↓
npm install && npm run build
    ↓
Deploy dist/ to CDN
    ↓
Live URL updated
```

### Mobile Deployment
```
npm run build
    ↓
npx cap sync
    ↓
Open native IDE
    ↓
Test on simulator/device
    ↓
Archive and upload
    ↓
App Store submission
```

---

## Security Considerations

### Web
- No sensitive data storage
- Sanitize any user input
- HTTPS only in production
- Content Security Policy headers

### Mobile
- Secure local storage for high scores
- No external API calls (currently)
- Privacy policy (required for stores)
- Age-appropriate content

---

## Future Architecture Considerations

### Multiplayer (Potential)
- WebSocket connection for real-time
- Shared leaderboard backend
- Ghost player mode

### Backend Services (Potential)
- User accounts
- Cloud save
- Global leaderboards
- Analytics

### Monetization (Potential)
- Ad integration points
- IAP for cosmetics
- Premium version

---

## Design Patterns Used

### Singleton Pattern
- AudioManager
- ScoreManager
- Game configuration

### Object Pool Pattern
- Obstacles
- Particles
- Collectibles

### State Pattern
- Game state machine
- Scene management

### Observer Pattern
- Event system
- Score updates
- Achievement triggers

---

## Code Quality Standards

### TypeScript
- Strict mode enabled
- No implicit any
- Explicit return types
- Interface over type when possible

### Naming Conventions
- PascalCase for classes/interfaces
- camelCase for functions/variables
- UPPER_SNAKE_CASE for constants
- Descriptive, not abbreviated

### Code Organization
- Single responsibility principle
- Max 200 lines per file (guideline)
- Comprehensive comments for complex logic
- JSDoc for public APIs

---

*Last Updated: 2025-11-10*
*Current Version: v0.1.0 (Initial Setup)*
