# Contributing to FlappySeal

Thank you for your interest in contributing to FlappySeal! This document provides guidelines and instructions for setting up your development environment and contributing to the project.

## Table of Contents
1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Submitting Changes](#submitting-changes)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

---

## Development Setup

### Prerequisites

**Required Software**:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Latest version
- **Code Editor**: VS Code recommended (with extensions)

**Recommended VS Code Extensions**:
- ESLint
- TypeScript Vue Plugin (Volar)
- Prettier - Code formatter
- Path Intellisense
- GitLens

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/FlappySeal.git
   cd FlappySeal
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

   This will install:
   - Phaser 3 (game engine)
   - TypeScript (language)
   - Vite (build tool)
   - Vitest (testing)
   - ESLint (linting)

3. **Verify Installation**
   ```bash
   # Check Node version
   node --version  # Should be v18+

   # Check npm version
   npm --version   # Should be v9+

   # Run type checking
   npm run type-check
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   The game should open at `http://localhost:3000` (or next available port).

5. **Verify Game Runs**
   - Menu should appear
   - Click "Play" button
   - Select a game mode
   - Game should start without errors
   - Check browser console for errors

### Environment Configuration

**Optional: Create `.env.local`** (for local overrides):
```bash
# .env.local
VITE_DEBUG_MODE=true
VITE_SKIP_ANIMATIONS=false
```

---

## Project Structure

Understanding the project structure helps you find the right place to make changes.

```
FlappySeal/
├── src/
│   ├── main.ts              # Entry point
│   ├── config/              # Game configuration
│   ├── scenes/              # Phaser scenes (game states)
│   ├── entities/            # Game objects (Seal, Obstacle)
│   ├── systems/             # Game systems (managers)
│   ├── modes/               # Game mode implementations
│   ├── ui/                  # UI components
│   ├── utils/               # Helper functions
│   └── types/               # TypeScript types
├── public/                  # Static assets
├── tests/                   # Test files
├── docs/                    # Documentation
├── .claude/                 # Claude Code configuration
├── ARCHITECTURE.md          # Technical documentation
├── BUGFIXES.md             # Bug tracking
├── CONTRIBUTING.md         # This file
└── README.md               # Project overview
```

### Key Files

- **main.ts**: Phaser game configuration, scene registration
- **constants.ts**: All tunable game values (physics, scoring, etc.)
- **GameScene.ts**: Core gameplay loop
- **Seal.ts**: Player character logic
- **ObstacleManager.ts**: Obstacle spawning and collision

---

## Development Workflow

### Branch Strategy

```
main
  ↓
feature/your-feature-name
  ↓
(PR) → main
```

**Branch Naming Conventions**:
- `feature/add-boss-mode` - New features
- `bugfix/fix-collision-detection` - Bug fixes
- `refactor/improve-obstacle-pooling` - Code improvements
- `docs/update-architecture` - Documentation
- `test/add-seal-tests` - Test additions

### Typical Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code
   - Test locally
   - Check types: `npm run type-check`
   - Run tests: `npm test`

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "Add feature: your feature description"
   ```

4. **Push to Remote**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Describe changes
   - Request review

---

## Coding Standards

### TypeScript Guidelines

**Use Explicit Types**:
```typescript
// ✅ Good
function calculateScore(points: number, multiplier: number): number {
  return points * multiplier;
}

// ❌ Bad
function calculateScore(points, multiplier) {
  return points * multiplier;
}
```

**Avoid `any`**:
```typescript
// ✅ Good
interface PlayerStats {
  score: number;
  health: number;
}

function updateStats(stats: PlayerStats): void { ... }

// ❌ Bad
function updateStats(stats: any): void { ... }
```

**Use Enums for Constants**:
```typescript
// ✅ Good
enum GameState {
  MENU,
  PLAYING,
  PAUSED,
  GAME_OVER
}

// ❌ Bad
const STATE_MENU = 0;
const STATE_PLAYING = 1;
```

### Code Style

**Indentation**: 2 spaces (configured in .editorconfig)

**Naming Conventions**:
- **Classes**: PascalCase (`GameScene`, `ObstacleManager`)
- **Functions/Methods**: camelCase (`swimUp`, `checkCollision`)
- **Constants**: UPPER_SNAKE_CASE (`GAME_CONFIG`, `MAX_VELOCITY`)
- **Private Members**: prefix with `_` or use `private` keyword
- **Interfaces**: PascalCase (`GameConfig`, `Bounds`)
- **Types**: PascalCase (`GameState`, `ObstacleType`)

**File Naming**:
- **Components**: PascalCase (`GameScene.ts`, `Seal.ts`)
- **Utilities**: camelCase (`helpers.ts`, `storage.ts`)
- **Tests**: Match source + `.test.ts` (`helpers.test.ts`)

### Documentation

**JSDoc for Public APIs**:
```typescript
/**
 * Checks collision between seal and obstacles
 *
 * @param sealX - Seal's X position
 * @param sealY - Seal's Y position
 * @param sealWidth - Seal's collision width
 * @param sealHeight - Seal's collision height
 * @returns True if collision detected, false otherwise
 */
checkCollision(
  sealX: number,
  sealY: number,
  sealWidth: number,
  sealHeight: number
): boolean {
  // ...
}
```

**Inline Comments for Complex Logic**:
```typescript
// Calculate seal's rotation based on velocity
// Positive velocity (falling) = rotate down
// Negative velocity (rising) = rotate up
this.rotation = clamp(
  this.velocity * SEAL_CONFIG.ROTATION_SPEED,
  -SEAL_CONFIG.MAX_ROTATION,
  SEAL_CONFIG.MAX_ROTATION
);
```

### Constants Management

**Always use `constants.ts`** for tunable values:

```typescript
// ✅ Good - in constants.ts
export const SEAL_CONFIG = {
  GRAVITY: 0.5,
  SWIM_UP_FORCE: -8,
  MAX_VELOCITY: 15,
};

// In code:
this.velocity += SEAL_CONFIG.GRAVITY;

// ❌ Bad - magic numbers
this.velocity += 0.5;
```

---

## Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check
```

### Writing Tests

**Unit Test Example**:
```typescript
// src/utils/__tests__/helpers.test.ts
import { describe, it, expect } from 'vitest';
import { clamp, randomInt } from '../helpers';

describe('clamp', () => {
  it('should clamp value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('randomInt', () => {
  it('should return integer within range', () => {
    const result = randomInt(1, 10);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(10);
    expect(Number.isInteger(result)).toBe(true);
  });
});
```

**Integration Test Example** (to be added):
```typescript
// src/scenes/__tests__/GameScene.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { GameScene } from '../GameScene';

describe('GameScene', () => {
  let scene: GameScene;

  beforeEach(() => {
    // Setup scene
    scene = new GameScene();
  });

  it('should initialize correctly', () => {
    expect(scene).toBeDefined();
  });

  it('should spawn seal at correct position', () => {
    // Test logic
  });
});
```

### Test Coverage Goals

- **Utilities**: 100% coverage (pure functions)
- **Systems**: 80%+ coverage (managers)
- **Entities**: 70%+ coverage (game objects)
- **Scenes**: 50%+ coverage (integration)

---

## Submitting Changes

### Before Submitting

**Pre-Submission Checklist**:
- [ ] Code follows style guidelines
- [ ] Types are explicit (no `any`)
- [ ] Tests pass: `npm test`
- [ ] Type check passes: `npm run type-check`
- [ ] Game runs without errors: `npm run dev`
- [ ] No console errors/warnings
- [ ] Documentation updated if needed
- [ ] Commit message is clear

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation change
- `refactor`: Code refactoring
- `test`: Test addition/update
- `chore`: Build/tooling change
- `perf`: Performance improvement

**Examples**:
```
feat(seal): add dash ability for seal

Implement dash ability that allows seal to quickly move forward.
- Add DASH_FORCE constant
- Add dashCooldown timer
- Add visual dash effect
- Update controls to include dash (spacebar)

Closes #123
```

```
fix(collision): prevent false positives in obstacle detection

Added validation for obstacle bounds before checking collision.
- Check if bounds.height > 0
- Add buffer zones (10px) to skip logic
- Validate seal position before collision check

This fixes the random death issue reported in #45.
```

### Pull Request Guidelines

**PR Title**:
- Clear and descriptive
- Include issue number if applicable
- Example: `Add boss mode functionality (#42)`

**PR Description Template**:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
How to test these changes:
1. Step 1
2. Step 2
3. Expected result

## Screenshots
(if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] Tests pass locally
```

---

## Common Tasks

### Adding a New Game Mode

1. **Create Mode File**: `src/modes/YourMode.ts`
   ```typescript
   export class YourMode extends GameMode {
     init(): void { /* Setup */ }
     update(time: number, delta: number): void { /* Update logic */ }
     isComplete(): boolean { /* Win condition */ }
     isFailed(): boolean { /* Loss condition */ }
     getResults(): GameResults { /* Results */ }
   }
   ```

2. **Add to GameModeType Enum**: `src/modes/GameMode.ts`
   ```typescript
   export enum GameModeType {
     // ... existing
     YOUR_MODE = 'YOUR_MODE',
   }
   ```

3. **Register in GameScene**: `src/scenes/GameScene.ts`
   ```typescript
   case GameModeType.YOUR_MODE:
     this.gameMode = new YourMode(this);
     break;
   ```

4. **Add UI Card**: `src/scenes/ModeSelectionScene.ts`
   ```typescript
   {
     type: GameModeType.YOUR_MODE,
     name: 'Your Mode',
     description: 'Mode description',
     icon: '🎮',
     unlocked: true,
   }
   ```

5. **Test**:
   - Start game
   - Select your mode
   - Verify it works

### Adding a New Obstacle Type

1. **Add to ObstacleType Enum**: `src/types/index.ts`
   ```typescript
   export enum ObstacleType {
     CORAL,
     JELLYFISH,
     YOUR_TYPE,
   }
   ```

2. **Implement Drawing Logic**: `src/entities/Obstacle.ts`
   ```typescript
   private draw(): void {
     // ...
     if (this.type === ObstacleType.YOUR_TYPE) {
       this.drawYourType(/* ... */);
     }
   }

   private drawYourType(...) {
     // Implement rendering
   }
   ```

3. **Update Spawn Logic**: `src/systems/ObstacleManager.ts`
   ```typescript
   private spawnObstacle(): void {
     const random = Math.random();
     let type: ObstacleType;

     if (random < 0.4) {
       type = ObstacleType.CORAL;
     } else if (random < 0.7) {
       type = ObstacleType.JELLYFISH;
     } else {
       type = ObstacleType.YOUR_TYPE;
     }
   }
   ```

4. **Test**:
   - Play game
   - Verify new obstacle spawns
   - Check rendering
   - Test collision

### Adjusting Game Difficulty

**All difficulty values are in `src/config/constants.ts`**:

```typescript
export const SEAL_CONFIG = {
  GRAVITY: 0.5,           // ↑ Higher = falls faster
  SWIM_UP_FORCE: -8,      // ↓ More negative = stronger
  MAX_VELOCITY: 15,       // ↑ Higher = faster max speed
};

export const OBSTACLE_CONFIG = {
  SPAWN_INTERVAL: 2500,   // ↓ Lower = more frequent
  MIN_GAP: 200,           // ↓ Smaller = harder
  MAX_GAP: 240,           // ↓ Smaller = harder
  SCROLL_SPEED: 3,        // ↑ Higher = faster
};

export const SCORE_CONFIG = {
  SPEED_INCREASE_INTERVAL: 10,  // ↓ Lower = faster progression
  SPEED_INCREASE_AMOUNT: 0.2,   // ↑ Higher = faster acceleration
  MAX_SPEED: 6,                  // ↑ Higher = higher max difficulty
};
```

**Testing Process**:
1. Adjust values
2. Reload game
3. Play for 1-2 minutes
4. Assess difficulty
5. Iterate

### Adding Error Handling

**Wrap risky operations**:
```typescript
// Example: Obstacle spawning
try {
  const obstacle = this.spawnObstacle();
  this.obstacles.push(obstacle);
} catch (error) {
  console.error('Failed to spawn obstacle:', error);
  // Graceful degradation: continue without obstacle
}
```

**Validate inputs**:
```typescript
function calculateScore(points: number, multiplier: number): number {
  if (points < 0 || multiplier < 0) {
    console.warn('Invalid score calculation:', { points, multiplier });
    return 0;
  }
  return points * multiplier;
}
```

---

## Troubleshooting

### Common Issues

**Issue: "Port 3000 is already in use"**
```bash
# Vite will automatically find next available port
# Or kill process using port:
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

**Issue: "Module not found" errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue: TypeScript errors after pulling changes**
```bash
# Rebuild TypeScript
npm run type-check

# If still issues, restart TS server in VS Code
# Cmd+Shift+P > "TypeScript: Restart TS Server"
```

**Issue: Game shows blank screen**
1. Check browser console for errors
2. Verify `npm run dev` shows no errors
3. Check browser compatibility (Chrome/Firefox recommended)
4. Clear cache (Ctrl+Shift+R)
5. Check Phaser initialization in main.ts

**Issue: Changes not reflecting**
1. Hard refresh browser (Ctrl+Shift+R)
2. Check Vite HMR in console
3. Restart dev server
4. Clear localStorage: `localStorage.clear()`

### Debug Mode

**Enable Phaser Debug Mode**: (shows collision boxes)
```typescript
// src/main.ts
physics: {
  arcade: {
    debug: true  // Set to true
  }
}
```

**Enable Console Logging**:
```typescript
// Add to any file
console.log('Debug:', variableName);
console.table(objectName);
console.trace('Execution path');
```

**Performance Monitoring**:
```typescript
// Add to GameScene.update()
if (frameCount % 60 === 0) {
  console.log({
    fps: this.game.loop.actualFps,
    obstacles: this.obstacleManager?.['obstacles'].length,
    particles: this.particleManager?.['particles'].length,
  });
}
```

### Getting Help

1. **Check Documentation**:
   - ARCHITECTURE.md - Technical details
   - BUGFIXES.md - Known issues
   - README.md - Project overview

2. **Search Existing Issues**:
   - GitHub Issues tab
   - Check if already reported

3. **Ask Questions**:
   - Create GitHub Discussion
   - Tag with appropriate labels

4. **Report Bugs**:
   - Use bug report template
   - Include reproduction steps
   - Attach screenshots/console logs

---

## Code Review Guidelines

### For Authors

- Keep PRs small and focused
- Write clear PR description
- Add tests for new features
- Update documentation
- Respond to feedback promptly

### For Reviewers

- Be constructive and respectful
- Focus on code quality, not style
- Test changes locally
- Check for edge cases
- Approve when ready

**Review Checklist**:
- [ ] Code follows style guidelines
- [ ] Logic is clear and correct
- [ ] Edge cases handled
- [ ] Tests are adequate
- [ ] Documentation updated
- [ ] No performance regressions
- [ ] Accessible (if UI changes)

---

## Resources

### Phaser 3
- [Official Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Examples](https://labs.phaser.io/)
- [Community Forum](https://phaser.discourse.group/)

### TypeScript
- [Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

### Testing
- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://testingjavascript.com/)

### Game Development
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)
- [Phaser News](https://phaser.io/news)

---

## License

By contributing to FlappySeal, you agree that your contributions will be licensed under the project's license.

---

## Thank You!

Thank you for contributing to FlappySeal! Your efforts help make the game better for everyone.

**Happy Coding! 🦭**

---

**Last Updated**: 2024-11-12
**Maintained By**: Development Team
**Version**: 0.2.0-alpha
