# Character System Architecture
**Created:** 2025-11-10
**Phase:** 3 - Animal System Design
**Status:** Design Complete

---

## Overview

The Character System enables multiple playable animals with distinct physics, visuals, and gameplay feel. This document outlines the architecture for implementing Seal, Otter, and Sea Lion as unique playable characters.

---

## Design Goals

### Primary
- **Distinct Gameplay** - Each animal feels significantly different
- **Fair Balance** - No animal is objectively better
- **Code Reusability** - Shared systems where appropriate
- **Easy Extension** - Adding new animals should be straightforward
- **Backward Compatibility** - Existing Seal functionality preserved

### Secondary
- Performance - No significant overhead from abstraction
- Debugging - Easy to tune individual animal parameters
- Maintainability - Clear separation of concerns

---

## Architecture Decision: Composition over Inheritance

**Chosen Approach:** Config-driven composition

**Rationale:**
- More flexible than deep inheritance hierarchies
- Easier to balance (change config vs. code)
- Better for debugging (expose all configs)
- Simpler to add new animals

**Alternative Considered:** Class inheritance (Seal extends Character)
- Rejected: Too rigid, harder to balance, code duplication

---

## Core Components

### 1. CharacterConfig Interface

Defines all properties that make an animal unique:

```typescript
export interface CharacterConfig {
  // Identity
  id: string;                // 'seal', 'otter', 'sealion'
  name: string;              // 'Harbor Seal'
  type: CharacterType;       // Enum for type safety
  description?: string;      // For UI display

  // Physical Properties
  stats: {
    weight: number;          // Relative weight (100 = baseline)
    power: number;           // Relative power (100 = baseline)
    agility: number;         // Control responsiveness (100 = baseline)
  };

  // Dimensions
  size: {
    width: number;           // Collision width (pixels)
    height: number;          // Collision height (pixels)
    renderScale: number;     // Visual size multiplier
  };

  // Physics Parameters
  physics: {
    gravity: number;         // Downward acceleration
    swimUpForce: number;     // Upward velocity (negative)
    diveDownForce: number;   // Downward velocity (positive)
    maxVelocityY: number;    // Terminal velocity
    drag: number;            // Air/water resistance
    rotationSpeed: number;   // Visual tilt response
    maxRotation: number;     // Max tilt angle
  };

  // Visual Properties
  visuals: {
    bodyColor: number;       // Primary color
    bellyColor?: number;     // Belly color (optional)
    flipperColor: number;    // Flipper/limb color
    eyeColor: number;        // Eye color
    noseColor: number;       // Nose color
    bodyShape: BodyShape;    // 'round' | 'sleek' | 'bulky'
    features: VisualFeatures; // Ears, whiskers, etc.
  };

  // Gameplay Properties
  gameplay: {
    difficulty: 'easy' | 'medium' | 'hard';
    hitboxScale: number;     // Collision size multiplier (1.0 = exact size)
    unlockCondition?: UnlockCondition;
  };
}
```

### 2. Character Class (Refactored from Seal)

The main character entity that uses a config:

```typescript
export class Character {
  protected scene: Phaser.Scene;
  protected graphics: Phaser.GameObjects.Graphics;
  protected config: CharacterConfig;

  // State
  public x: number;
  public y: number;
  protected velocity: number = 0;
  protected rotation: number = 0;

  // Animation
  protected flipperOffset: number = 0;
  protected flipperDirection: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, config: CharacterConfig) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.config = config;

    this.graphics = scene.add.graphics();
    this.draw();
  }

  // Physics (uses config values)
  update(): void {
    this.velocity += this.config.physics.gravity;
    this.velocity = Phaser.Math.Clamp(
      this.velocity,
      -this.config.physics.maxVelocityY,
      this.config.physics.maxVelocityY
    );
    this.y += this.velocity;
    this.updateRotation();
    this.animateFlippers();
    this.draw();
  }

  swimUp(): void {
    this.velocity = this.config.physics.swimUpForce;
  }

  dive(): void {
    this.velocity = this.config.physics.diveDownForce;
  }

  // Rendering (delegated to specific renderer)
  protected draw(): void {
    this.graphics.clear();
    this.graphics.setPosition(this.x, this.y);
    this.graphics.setRotation(Phaser.Math.DegToRad(this.rotation));

    // Render based on body shape
    switch (this.config.visuals.bodyShape) {
      case BodyShape.SLEEK:
        this.drawSleekBody();
        break;
      case BodyShape.BULKY:
        this.drawBulkyBody();
        break;
      case BodyShape.ROUND:
      default:
        this.drawRoundBody();
        break;
    }

    this.drawFeatures();
  }

  // Shape-specific rendering
  protected drawSleekBody(): void { /* Otter */ }
  protected drawBulkyBody(): void { /* Sea Lion */ }
  protected drawRoundBody(): void { /* Seal */ }

  // Feature rendering
  protected drawFeatures(): void {
    // Eyes, nose, whiskers, ears, etc.
  }
}
```

### 3. Animal Configurations

**Seal (Baseline):**
```typescript
export const SEAL_CONFIG: CharacterConfig = {
  id: 'seal',
  name: 'Harbor Seal',
  type: CharacterType.SEAL,
  description: 'Balanced and friendly',

  stats: {
    weight: 100,
    power: 100,
    agility: 100,
  },

  size: {
    width: 60,
    height: 35,
    renderScale: 1.0,
  },

  physics: {
    gravity: 0.5,
    swimUpForce: -8,
    diveDownForce: 12,
    maxVelocityY: 15,
    drag: 0.98,
    rotationSpeed: 2,
    maxRotation: 30,
  },

  visuals: {
    bodyColor: 0x3a3a3a,
    flipperColor: 0x2a2a2a,
    eyeColor: 0xffffff,
    noseColor: 0x000000,
    bodyShape: BodyShape.ROUND,
    features: {
      hasEarFlaps: false,
      whiskerLength: 'medium',
      tailStyle: 'flipper',
    },
  },

  gameplay: {
    difficulty: 'medium',
    hitboxScale: 1.0,
  },
};
```

**Otter (Light & Agile):**
```typescript
export const OTTER_CONFIG: CharacterConfig = {
  id: 'otter',
  name: 'River Otter',
  type: CharacterType.OTTER,
  description: 'Fast and nimble, but fragile',

  stats: {
    weight: 65,        // 35% lighter
    power: 65,         // 35% less powerful
    agility: 130,      // 30% more agile
  },

  size: {
    width: 45,         // 25% smaller
    height: 26,
    renderScale: 0.85,
  },

  physics: {
    gravity: 0.33,     // Falls slower (lighter)
    swimUpForce: -5.2, // Lower jump
    diveDownForce: 7.8, // Less forceful dive
    maxVelocityY: 12,  // Lower terminal velocity
    drag: 0.96,        // More drag (smaller)
    rotationSpeed: 2.5, // More responsive tilt
    maxRotation: 35,
  },

  visuals: {
    bodyColor: 0x8B4513,     // Brown
    bellyColor: 0xD2B48C,    // Tan
    flipperColor: 0x654321,
    eyeColor: 0x000000,
    noseColor: 0xFF69B4,     // Pink
    bodyShape: BodyShape.SLEEK,
    features: {
      hasEarFlaps: false,
      whiskerLength: 'long',
      tailStyle: 'tapered',
    },
  },

  gameplay: {
    difficulty: 'hard',
    hitboxScale: 0.85,  // Smaller hitbox (advantage)
    unlockCondition: {
      type: 'score',
      value: 500,
    },
  },
};
```

**Sea Lion (Heavy & Powerful):**
```typescript
export const SEALION_CONFIG: CharacterConfig = {
  id: 'sealion',
  name: 'California Sea Lion',
  type: CharacterType.SEALION,
  description: 'Powerful but sluggish',

  stats: {
    weight: 135,       // 35% heavier
    power: 135,        // 35% more powerful
    agility: 75,       // 25% less agile
  },

  size: {
    width: 75,         // 25% larger
    height: 44,
    renderScale: 1.25,
  },

  physics: {
    gravity: 0.68,     // Falls faster (heavier)
    swimUpForce: -10.8, // Higher jump
    diveDownForce: 16.2, // More forceful dive
    maxVelocityY: 18,  // Higher terminal velocity
    drag: 0.99,        // Less drag (massive)
    rotationSpeed: 1.5, // Slower tilt response
    maxRotation: 25,   // Less rotation
  },

  visuals: {
    bodyColor: 0x654321,     // Dark brown
    bellyColor: 0x8B6914,    // Lighter brown
    flipperColor: 0x4A3218,
    eyeColor: 0xFFFFFF,
    noseColor: 0x000000,
    bodyShape: BodyShape.BULKY,
    features: {
      hasEarFlaps: true,   // Distinguishing feature
      whiskerLength: 'thick',
      tailStyle: 'thick_flipper',
    },
  },

  gameplay: {
    difficulty: 'easy',
    hitboxScale: 1.15,  // Larger hitbox (disadvantage)
    unlockCondition: {
      type: 'score',
      value: 1000,
    },
  },
};
```

---

## Physics Balance Model

### Weight-to-Physics Mapping

**Gravity (fall speed):**
- Formula: `base_gravity * (weight / 100)`
- Lighter animals fall slower, heavier fall faster
- Otter: 0.33 (slow fall, floaty)
- Seal: 0.50 (balanced)
- Sea Lion: 0.68 (fast fall, heavy)

**Jump Power:**
- Formula: `base_jump * (power / 100)`
- More power = higher jumps
- Otter: -5.2 (weak jumps)
- Seal: -8.0 (balanced)
- Sea Lion: -10.8 (powerful jumps)

**Terminal Velocity:**
- Formula: `base_velocity * (weight / 100)`
- Heavier animals fall faster at terminal velocity
- Otter: 12 (gentle falls)
- Seal: 15 (balanced)
- Sea Lion: 18 (heavy falls)

**Control Responsiveness (agility):**
- Affects rotation speed and drag
- Otter: Snappy, responsive (high agility)
- Seal: Balanced
- Sea Lion: Sluggish, momentum-based (low agility)

### Balance Philosophy

**Otter (Hard Mode):**
- **Advantage:** Small hitbox, responsive controls
- **Disadvantage:** Weak jumps, can't reach high obstacles easily
- **Playstyle:** Precision and timing, high skill ceiling

**Seal (Normal Mode):**
- **Advantage:** Balanced, forgiving
- **Disadvantage:** None (baseline)
- **Playstyle:** Standard Flappy mechanics

**Sea Lion (Easy Mode):**
- **Advantage:** Powerful jumps, can recover from mistakes
- **Disadvantage:** Large hitbox, sluggish controls
- **Playstyle:** Momentum-based, beginner-friendly

---

## Visual Differentiation Strategy

### Body Shapes

**Sleek (Otter):**
- Elongated ellipse (2:1 ratio)
- Smaller overall
- Tapered tail
- Visible paws instead of flippers

**Round (Seal):**
- Standard ellipse (1.7:1 ratio)
- Medium size
- Flipper tail
- Classic seal look

**Bulky (Sea Lion):**
- Wide ellipse (1.5:1 ratio)
- Larger overall
- Thick flipper tail
- Visible ear flaps (key visual difference)

### Color Palettes

**Otter:** Earth tones (browns, tans)
**Seal:** Grays and whites
**Sea Lion:** Dark browns

### Distinguishing Features

| Feature | Otter | Seal | Sea Lion |
|---------|-------|------|----------|
| Ear Flaps | ❌ | ❌ | ✅ (triangles) |
| Whisker Length | Long | Medium | Thick |
| Tail Style | Tapered | Flipper | Thick Flipper |
| Belly | Tan | Light gray | Light brown |
| Size | Small | Medium | Large |

---

## Implementation Plan

### Phase 3.1: Create CharacterConfig System ✅

**File:** `src/config/characters.ts`

- Define all interfaces
- Create SEAL_CONFIG
- Create OTTER_CONFIG
- Create SEALION_CONFIG
- Export character registry

**Estimated Time:** 2 hours

### Phase 3.2: Refactor Seal → Character

**File:** `src/entities/Character.ts`

- Copy Seal.ts → Character.ts
- Accept CharacterConfig in constructor
- Replace all hardcoded values with config references
- Make rendering methods body-shape aware
- Add feature rendering (ears, whiskers, etc.)
- Test with SEAL_CONFIG (should be identical to original)

**Estimated Time:** 3 hours

### Phase 3.3: Update Seal to Use Character

**File:** `src/entities/Seal.ts`

- Convert to thin wrapper around Character
- Pass SEAL_CONFIG to parent
- Verify backward compatibility
- Update all imports if needed

**Estimated Time:** 1 hour

### Phase 3.4: Implement Otter

**File:** `src/entities/Otter.ts`

- Extend Character with OTTER_CONFIG
- Implement drawSleekBody() override
- Test physics feel
- Initial balance tuning

**Estimated Time:** 2.5 hours

### Phase 3.5: Implement Sea Lion

**File:** `src/entities/SeaLion.ts`

- Extend Character with SEALION_CONFIG
- Implement drawBulkyBody() override
- Add ear flap rendering
- Test physics feel
- Initial balance tuning

**Estimated Time:** 2.5 hours

### Phase 3.6: Update GameScene for Character Selection

**File:** `src/scenes/GameScene.ts`

- Change `private seal: Seal` → `private player: Character`
- Add character factory method
- Read character type from registry
- Create appropriate character instance
- Update all references

**Estimated Time:** 2 hours

---

## Testing Strategy

### Unit Testing
- Each character config loads correctly
- Character class accepts any valid config
- Physics calculations use config values
- Rendering works for all body shapes

### Integration Testing
- All 3 characters playable in GameScene
- Character selection persists
- Debug manager works with all characters
- No performance regressions

### Balance Testing
- Play each character for 10 runs
- Record scores and survival times
- Identify imbalances
- Tune configs until balanced

---

## Debug Integration

All character physics will be exposed to DebugManager:

```typescript
// Per-character debug exposure
this.debugManager.expose(
  `${character.name} Physics`,
  'Gravity',
  `${character.id}.gravity`,
  () => character.getGravity(),
  (val) => character.setGravity(val),
  {
    min: 0,
    max: 2,
    step: 0.05,
    defaultValue: character.config.physics.gravity,
  }
);

// ... expose all physics params per animal
```

---

## Migration Path

### Backward Compatibility

1. **Seal.ts remains** - thin wrapper for existing code
2. **GameScene can still use Seal** - no breaking changes
3. **Character.ts is optional** - gradual migration
4. **Config-driven** - easy to experiment

### Migration Steps

1. Create Character.ts with SEAL_CONFIG
2. Test Character works identically to Seal
3. Add Otter and Sea Lion configs
4. Create Otter.ts and SeaLion.ts
5. Update GameScene to support character selection
6. Update MenuScene to allow choosing character

---

## Success Criteria

- [ ] All 3 animals implemented and playable
- [ ] Distinct physics feel for each
- [ ] Clear visual differentiation
- [ ] Balanced gameplay (scores within 20%)
- [ ] No performance regression
- [ ] Debug system exposes all animal configs
- [ ] Clean code architecture
- [ ] Comprehensive documentation

---

## Risks & Mitigation

### Risk: Animals feel too similar
**Mitigation:** Exaggerate differences, extensive playtesting

### Risk: Hard to balance
**Mitigation:** Config-driven tuning, debug system for rapid iteration

### Risk: Performance issues with multiple character types
**Mitigation:** Profile early, optimize rendering if needed

### Risk: Visual differences not clear enough
**Mitigation:** Add more distinguishing features (ears, tails, colors)

---

## Next Steps

1. ✅ Complete this architecture document
2. ⏳ Implement CharacterConfig system (Phase 3.1)
3. ⏳ Refactor Seal → Character (Phase 3.2)
4. ⏳ Implement Otter (Phase 3.4)
5. ⏳ Implement Sea Lion (Phase 3.5)
6. ⏳ Update GameScene (Phase 3.6)
7. ⏳ Balance and test

---

**Architecture Status:** ✅ Complete and ready for implementation

**Estimated Total Time:** ~13 hours for full character system implementation

---

*This architecture prioritizes flexibility, balance, and ease of extension while maintaining clean code and backward compatibility.*
