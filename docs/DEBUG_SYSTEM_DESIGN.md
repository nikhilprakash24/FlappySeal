# Debug System Design Document
**Created:** 2025-11-10
**Status:** Design Phase
**Implementation:** Phase 2 of Autonomous Development

---

## Overview

The Debug System provides real-time variable exposure and adjustment for rapid gameplay iteration and testing. It enables testers to tune physics, difficulty, and visual parameters without code changes.

---

## Goals

### Primary
- **Expose gameplay variables** for real-time adjustment
- **Performance monitoring** (FPS, memory, object counts)
- **Configuration persistence** (save/load test settings)
- **Minimal performance impact** when hidden
- **Zero code changes** required for testing new values

### Secondary
- Keyboard shortcuts for quick access
- Visual feedback for adjusted variables
- Export/import configurations
- Testing mode indicators

---

## Architecture

### System Components

```
DebugManager (orchestrator)
  ├─ VariableRegistry (storage)
  │   ├─ DebugVariable (individual var)
  │   └─ VariableGroup (categorized)
  │
  ├─ DebugUI (visual interface)
  │   ├─ Panel rendering
  │   ├─ Variable controls
  │   └─ Performance display
  │
  ├─ InputHandler (keyboard/mouse)
  │   ├─ Toggle visibility
  │   ├─ Navigate variables
  │   └─ Adjust values
  │
  ├─ PerformanceMonitor
  │   ├─ FPS tracking
  │   ├─ Memory monitoring
  │   └─ Object counting
  │
  └─ ConfigManager
      ├─ Save to localStorage
      ├─ Load configurations
      └─ Export/Import JSON
```

---

## Data Structures

### DebugVariable

```typescript
interface DebugVariable {
  name: string;           // Display name (e.g., "Gravity")
  key: string;            // Unique identifier
  category: string;       // Group (e.g., "Physics", "Obstacles")

  // Value access
  getter: () => number;   // Read current value
  setter: (val: number) => void;  // Write new value

  // Constraints
  min: number;
  max: number;
  step: number;           // Increment size

  // Metadata
  defaultValue: number;
  unit?: string;          // Display unit (e.g., "px/s", "%")
  description?: string;   // Tooltip/help text
}
```

### VariableGroup

```typescript
interface VariableGroup {
  name: string;
  collapsed: boolean;
  variables: DebugVariable[];
}
```

### PerformanceMetrics

```typescript
interface PerformanceMetrics {
  fps: {
    current: number;
    average: number;
    min: number;
    max: number;
  };
  memory: {
    used: number;
    limit: number;
    percentage: number;
  };
  objects: {
    total: number;
    active: number;
    pooled: number;
  };
}
```

---

## Variables to Expose

### Category: Player Physics

| Variable | Key | Default | Min | Max | Step | Unit |
|----------|-----|---------|-----|-----|------|------|
| Gravity | `player.gravity` | 1500 | 0 | 3000 | 50 | px/s² |
| Jump Power | `player.jumpPower` | 600 | 100 | 1200 | 25 | px/s |
| Max Velocity Y | `player.maxVelocityY` | 1000 | 200 | 2000 | 50 | px/s |
| Flap Cooldown | `player.flapCooldown` | 150 | 50 | 500 | 25 | ms |

### Category: Obstacles

| Variable | Key | Default | Min | Max | Step | Unit |
|----------|-----|---------|-----|-----|------|------|
| Spawn Interval | `obstacles.spawnInterval` | 2000 | 500 | 5000 | 100 | ms |
| Speed | `obstacles.speed` | 200 | 50 | 500 | 10 | px/s |
| Gap Size | `obstacles.gapSize` | 180 | 100 | 400 | 10 | px |
| Width | `obstacles.width` | 80 | 40 | 150 | 5 | px |

### Category: Game Settings

| Variable | Key | Default | Min | Max | Step | Unit |
|----------|-----|---------|-----|-----|------|------|
| Time Scale | `game.timeScale` | 1.0 | 0.1 | 3.0 | 0.1 | x |
| Difficulty Ramp | `game.difficultyRamp` | 0.02 | 0.0 | 0.1 | 0.005 | /score |
| Score Multiplier | `game.scoreMultiplier` | 1.0 | 0.5 | 5.0 | 0.1 | x |

### Category: Visuals

| Variable | Key | Default | Min | Max | Step | Unit |
|----------|-----|---------|-----|-----|------|------|
| Particle Count | `visuals.particleCount` | 100 | 0 | 300 | 10 | count |
| Show Hitboxes | `visuals.showHitboxes` | 0 | 0 | 1 | 1 | bool |
| Show Grid | `visuals.showGrid` | 0 | 0 | 1 | 1 | bool |
| Camera Shake | `visuals.cameraShake` | 1 | 0 | 1 | 1 | bool |

**Total: ~20 variables across 4 categories**

---

## UI Design

### Layout

```
┌─────────────────────────────────────┐
│ DEBUG PANEL [Press D to toggle]    │
├─────────────────────────────────────┤
│                                     │
│ ▼ Player Physics                    │
│   Gravity:        1500 ◀─▶         │
│   Jump Power:      600 ◀─▶         │
│   Max Velocity:   1000 ◀─▶         │
│                                     │
│ ▼ Obstacles                         │
│   Spawn Interval: 2000 ◀─▶         │
│   Speed:           200 ◀─▶         │
│   Gap Size:        180 ◀─▶         │
│                                     │
│ ▶ Game Settings (collapsed)        │
│                                     │
│ ▶ Visuals (collapsed)               │
│                                     │
├─────────────────────────────────────┤
│ PERFORMANCE                         │
│ FPS: 60.0 (avg: 59.8)              │
│ Memory: 78MB / 4096MB (2%)         │
│ Objects: 245 active                │
├─────────────────────────────────────┤
│ [Save Config] [Load] [Reset]       │
└─────────────────────────────────────┘
```

### Visual Style

- **Background:** Semi-transparent dark panel (rgba(0, 0, 0, 0.85))
- **Position:** Top-right corner, 20px margin
- **Size:** 350px wide, auto height
- **Font:** Monospace, 12px
- **Colors:**
  - Headers: #00FFFF (cyan)
  - Values: #FFFF00 (yellow)
  - Controls: #FFFFFF (white)
  - Modified values: #FF8800 (orange)

### Interaction

**Keyboard Shortcuts:**
- `D`: Toggle debug panel visibility
- `↑/↓`: Navigate variables
- `←/→`: Decrease/increase selected value
- `R`: Reset selected variable to default
- `Shift+R`: Reset all to defaults
- `S`: Save current configuration
- `L`: Load saved configuration
- `G`: Toggle grid overlay
- `H`: Toggle hitbox display

**Mouse:**
- Click category header to collapse/expand
- Click arrow buttons to adjust value
- Click value to type directly (future enhancement)

---

## Implementation Strategy

### Phase 2.2: DebugManager Core

**File:** `src/managers/DebugManager.ts`

```typescript
export class DebugManager {
  private scene: Phaser.Scene;
  private variables: Map<string, DebugVariable> = new Map();
  private groups: Map<string, VariableGroup> = new Map();
  private isVisible: boolean = false;
  private selectedIndex: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeyboardShortcuts();
  }

  // Variable registration
  public expose(
    category: string,
    name: string,
    key: string,
    getter: () => number,
    setter: (val: number) => void,
    options: {
      min: number;
      max: number;
      step: number;
      defaultValue: number;
      unit?: string;
      description?: string;
    }
  ): void {
    const variable: DebugVariable = {
      name,
      key,
      category,
      getter,
      setter,
      ...options
    };

    this.variables.set(key, variable);

    // Add to group
    if (!this.groups.has(category)) {
      this.groups.set(category, {
        name: category,
        collapsed: false,
        variables: []
      });
    }
    this.groups.get(category)!.variables.push(variable);
  }

  // Value access
  public getValue(key: string): number {
    const variable = this.variables.get(key);
    return variable ? variable.getter() : 0;
  }

  public setValue(key: string, value: number): void {
    const variable = this.variables.get(key);
    if (variable) {
      const clamped = Phaser.Math.Clamp(value, variable.min, variable.max);
      variable.setter(clamped);
    }
  }

  // UI control
  public toggle(): void {
    this.isVisible = !this.isVisible;
  }

  public show(): void {
    this.isVisible = true;
  }

  public hide(): void {
    this.isVisible = false;
  }

  // Update and render (called from scene.update)
  public update(): void {
    if (!this.isVisible) return;

    // Handle keyboard input for navigation and adjustment
    this.handleInput();
  }

  public render(graphics: Phaser.GameObjects.Graphics): void {
    if (!this.isVisible) return;

    // Render UI panel (delegated to DebugUI)
  }

  // Configuration
  public saveConfig(): void {
    const config: Record<string, number> = {};
    this.variables.forEach((variable, key) => {
      config[key] = variable.getter();
    });
    localStorage.setItem('flappyseal_debug_config', JSON.stringify(config));
  }

  public loadConfig(): void {
    const configJson = localStorage.getItem('flappyseal_debug_config');
    if (configJson) {
      const config = JSON.parse(configJson);
      Object.entries(config).forEach(([key, value]) => {
        this.setValue(key, value as number);
      });
    }
  }

  public resetAll(): void {
    this.variables.forEach(variable => {
      variable.setter(variable.defaultValue);
    });
  }
}
```

### Phase 2.3: DebugUI

**File:** `src/ui/DebugUI.ts`

Handles all rendering logic:
- Panel background
- Group headers with collapse indicators
- Variable rows with current values
- Adjustment controls (arrows)
- Modified value highlighting

### Phase 2.4: PerformanceMonitor

**File:** `src/managers/PerformanceMonitor.ts`

Tracks metrics:
- FPS: Using Phaser's time.fps + running average
- Memory: Using `performance.memory` API (Chrome only)
- Objects: Count from scene children

### Phase 2.5: ConfigManager

**File:** `src/managers/ConfigManager.ts`

Persistence layer:
- Save/load from localStorage
- Export to JSON file
- Import from JSON file
- Validation of loaded values

---

## Usage Example

### In GameScene

```typescript
// In create()
private debugManager!: DebugManager;

create() {
  // ... existing setup ...

  // Create debug manager
  this.debugManager = new DebugManager(this);

  // Expose player physics
  this.debugManager.expose(
    'Player Physics',
    'Gravity',
    'player.gravity',
    () => this.player.getGravity(),
    (val) => this.player.setGravity(val),
    {
      min: 0,
      max: 3000,
      step: 50,
      defaultValue: 1500,
      unit: 'px/s²',
      description: 'Downward acceleration'
    }
  );

  this.debugManager.expose(
    'Player Physics',
    'Jump Power',
    'player.jumpPower',
    () => this.player.getJumpPower(),
    (val) => this.player.setJumpPower(val),
    {
      min: 100,
      max: 1200,
      step: 25,
      defaultValue: 600,
      unit: 'px/s',
      description: 'Upward velocity on flap'
    }
  );

  // Expose obstacle settings
  this.debugManager.expose(
    'Obstacles',
    'Spawn Interval',
    'obstacles.spawnInterval',
    () => this.obstacleManager.getSpawnInterval(),
    (val) => this.obstacleManager.setSpawnInterval(val),
    {
      min: 500,
      max: 5000,
      step: 100,
      defaultValue: 2000,
      unit: 'ms'
    }
  );

  // ... expose more variables ...

  // Try to load saved config
  this.debugManager.loadConfig();
}

// In update()
update(time: number, delta: number) {
  // ... existing game logic ...

  // Update debug system
  if (this.debugManager) {
    this.debugManager.update();
  }
}

// In render/postUpdate
postUpdate() {
  if (this.debugManager) {
    const graphics = this.add.graphics();
    this.debugManager.render(graphics);
  }
}
```

---

## Testing Plan

### Unit Tests
- [ ] DebugVariable creation and constraints
- [ ] getValue/setValue clamping
- [ ] Group organization
- [ ] Config save/load roundtrip

### Integration Tests
- [ ] Expose 20+ variables from GameScene
- [ ] Adjust each variable and verify effect
- [ ] Save config, reload scene, verify persistence
- [ ] Performance: No FPS drop when hidden
- [ ] Performance: <5% FPS drop when visible

### User Testing
- [ ] Testers can find and understand all variables
- [ ] Adjustment controls feel responsive
- [ ] Saved configs work across sessions
- [ ] No confusion about which variable does what

---

## Performance Considerations

### When Hidden (isVisible = false)
- **Zero rendering cost** (early return from render())
- **Minimal update cost** (only check for toggle key)
- **Target overhead:** <0.1ms per frame

### When Visible
- **Rendering budget:** <2ms per frame
- **UI updates:** Only redraw when values change
- **Input handling:** Debounce rapid adjustments
- **Memory:** <5MB for all UI elements

### Optimizations
- Cache rendered text
- Batch graphics drawing
- Update performance metrics every 500ms (not every frame)
- Lazy load PerformanceMonitor API only when visible

---

## Future Enhancements (Out of Scope)

- [ ] Graphical timeline for variable changes
- [ ] Record/playback of variable adjustments
- [ ] Network sync for remote debugging
- [ ] Mobile touch controls
- [ ] Visual variable linking (e.g., gravity affects terminal velocity)
- [ ] Presets library (e.g., "Easy Mode", "Hard Mode")
- [ ] A/B testing mode (compare two configs)

---

## Success Criteria

- [ ] All 20+ gameplay variables exposed
- [ ] Real-time adjustment with immediate feedback
- [ ] Configuration save/load working
- [ ] Performance monitoring accurate
- [ ] No performance regression
- [ ] Clean, intuitive UI
- [ ] Comprehensive documentation for testers

---

**Design Status:** ✅ Complete
**Next Step:** Implementation (Task 2.2 - DebugManager Core)

---

*This design will be refined during implementation as needed*
