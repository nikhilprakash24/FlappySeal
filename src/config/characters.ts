/**
 * Character Configuration System
 *
 * Defines all playable animal characters with their unique stats,
 * physics, visuals, and gameplay properties.
 */

// ============================================================================
// ENUMS & TYPES
// ============================================================================

export enum CharacterType {
  SEAL = 'seal',
  OTTER = 'otter',
  SEALION = 'sealion',
}

export enum BodyShape {
  ROUND = 'round',     // Seal - classic rounded body
  SLEEK = 'sleek',     // Otter - elongated, streamlined
  BULKY = 'bulky',     // Sea Lion - wide, heavy
}

export interface VisualFeatures {
  hasEarFlaps: boolean;         // External ear flaps (sea lions have them)
  whiskerLength: 'short' | 'medium' | 'long' | 'thick';
  tailStyle: 'flipper' | 'tapered' | 'thick_flipper';
}

export interface UnlockCondition {
  type: 'score' | 'level' | 'achievement';
  value: number | string;
}

// ============================================================================
// CHARACTER CONFIG INTERFACE
// ============================================================================

export interface CharacterConfig {
  // Identity
  id: string;
  name: string;
  type: CharacterType;
  description: string;

  // Physical Properties (relative to baseline)
  stats: {
    weight: number;      // 100 = baseline (seal)
    power: number;       // 100 = baseline
    agility: number;     // 100 = baseline
  };

  // Dimensions
  size: {
    width: number;       // Collision width (pixels)
    height: number;      // Collision height (pixels)
    renderScale: number; // Visual size multiplier
  };

  // Physics Parameters
  physics: {
    gravity: number;         // Downward acceleration per frame
    swimUpForce: number;     // Upward velocity (negative value)
    diveDownForce: number;   // Downward velocity (positive value)
    maxVelocityY: number;    // Terminal velocity
    drag: number;            // Velocity damping (0.98 = 2% per frame)
    rotationSpeed: number;   // Visual tilt response to velocity
    maxRotation: number;     // Max tilt angle (degrees)
  };

  // Visual Properties
  visuals: {
    bodyColor: number;       // Primary body color (hex)
    bellyColor?: number;     // Belly color (optional)
    flipperColor: number;    // Flipper/limb color
    eyeColor: number;        // Eye color
    noseColor: number;       // Nose color
    bodyShape: BodyShape;    // Determines rendering style
    features: VisualFeatures; // Ears, whiskers, tail, etc.
  };

  // Gameplay Properties
  gameplay: {
    difficulty: 'easy' | 'medium' | 'hard';
    hitboxScale: number;           // Collision size multiplier
    unlockCondition?: UnlockCondition;
  };
}

// ============================================================================
// CHARACTER CONFIGURATIONS
// ============================================================================

/**
 * SEAL - Baseline/Balanced Character
 *
 * The classic Harbor Seal. Medium everything, no advantages or disadvantages.
 * Perfect for learning the game.
 */
export const SEAL_CHARACTER_CONFIG: CharacterConfig = {
  id: 'seal',
  name: 'Harbor Seal',
  type: CharacterType.SEAL,
  description: 'Balanced and friendly - perfect for beginners',

  stats: {
    weight: 100,     // Baseline
    power: 100,      // Baseline
    agility: 100,    // Baseline
  },

  size: {
    width: 60,
    height: 35,
    renderScale: 1.0,
  },

  physics: {
    gravity: 0.5,           // Standard gravity
    swimUpForce: -8,        // Standard upward force
    diveDownForce: 12,      // Standard downward force
    maxVelocityY: 15,       // Standard terminal velocity
    drag: 0.98,             // Standard drag
    rotationSpeed: 2,       // Standard rotation
    maxRotation: 30,        // Standard max rotation
  },

  visuals: {
    bodyColor: 0x3a3a3a,    // Gray
    flipperColor: 0x2a2a2a, // Dark gray
    eyeColor: 0xffffff,     // White
    noseColor: 0x000000,    // Black
    bodyShape: BodyShape.ROUND,
    features: {
      hasEarFlaps: false,
      whiskerLength: 'medium',
      tailStyle: 'flipper',
    },
  },

  gameplay: {
    difficulty: 'medium',
    hitboxScale: 1.0,       // Exact size collision
    // No unlock condition - always available
  },
};

/**
 * OTTER - Light & Agile Character (Hard Mode)
 *
 * River Otter - 35% lighter and less powerful than seal.
 * Smaller size makes dodging easier, but weak jumps make it challenging.
 * Higher skill ceiling.
 */
export const OTTER_CHARACTER_CONFIG: CharacterConfig = {
  id: 'otter',
  name: 'River Otter',
  type: CharacterType.OTTER,
  description: 'Fast and nimble, but fragile - for expert players',

  stats: {
    weight: 65,      // 35% lighter
    power: 65,       // 35% less powerful
    agility: 130,    // 30% more agile
  },

  size: {
    width: 45,       // 25% smaller
    height: 26,      // 25% smaller
    renderScale: 0.85,
  },

  physics: {
    gravity: 0.33,          // Falls slower (lighter weight)
    swimUpForce: -5.2,      // Weaker jump (35% less)
    diveDownForce: 7.8,     // Gentler dive (35% less)
    maxVelocityY: 12,       // Lower terminal velocity
    drag: 0.96,             // More drag (smaller, more resistance)
    rotationSpeed: 2.5,     // More responsive tilt
    maxRotation: 35,        // Slightly more rotation
  },

  visuals: {
    bodyColor: 0x8B4513,    // Saddle brown
    bellyColor: 0xD2B48C,   // Tan
    flipperColor: 0x654321, // Dark brown
    eyeColor: 0x000000,     // Black
    noseColor: 0xFF69B4,    // Pink
    bodyShape: BodyShape.SLEEK,
    features: {
      hasEarFlaps: false,
      whiskerLength: 'long',
      tailStyle: 'tapered',
    },
  },

  gameplay: {
    difficulty: 'hard',
    hitboxScale: 0.85,      // 15% smaller hitbox (advantage)
    unlockCondition: {
      type: 'score',
      value: 500,           // Unlock at 500 total score
    },
  },
};

/**
 * SEA LION - Heavy & Powerful Character (Easy Mode)
 *
 * California Sea Lion - 35% heavier and more powerful than seal.
 * Larger size makes dodging harder, but powerful jumps are forgiving.
 * Good for beginners.
 */
export const SEALION_CHARACTER_CONFIG: CharacterConfig = {
  id: 'sealion',
  name: 'California Sea Lion',
  type: CharacterType.SEALION,
  description: 'Powerful but sluggish - great for beginners',

  stats: {
    weight: 135,     // 35% heavier
    power: 135,      // 35% more powerful
    agility: 75,     // 25% less agile
  },

  size: {
    width: 75,       // 25% larger
    height: 44,      // 25% larger
    renderScale: 1.25,
  },

  physics: {
    gravity: 0.68,          // Falls faster (heavier weight)
    swimUpForce: -10.8,     // Stronger jump (35% more)
    diveDownForce: 16.2,    // More forceful dive (35% more)
    maxVelocityY: 18,       // Higher terminal velocity
    drag: 0.99,             // Less drag (massive, more momentum)
    rotationSpeed: 1.5,     // Slower tilt response
    maxRotation: 25,        // Less rotation (more stable)
  },

  visuals: {
    bodyColor: 0x654321,    // Dark brown
    bellyColor: 0x8B6914,   // Goldenrod
    flipperColor: 0x4A3218, // Very dark brown
    eyeColor: 0xFFFFFF,     // White
    noseColor: 0x000000,    // Black
    bodyShape: BodyShape.BULKY,
    features: {
      hasEarFlaps: true,    // KEY VISUAL DIFFERENCE!
      whiskerLength: 'thick',
      tailStyle: 'thick_flipper',
    },
  },

  gameplay: {
    difficulty: 'easy',
    hitboxScale: 1.15,      // 15% larger hitbox (disadvantage)
    unlockCondition: {
      type: 'score',
      value: 1000,          // Unlock at 1000 total score
    },
  },
};

// ============================================================================
// CHARACTER REGISTRY
// ============================================================================

/**
 * Central registry of all character configurations
 */
export const CHARACTER_CONFIGS: Record<string, CharacterConfig> = {
  seal: SEAL_CHARACTER_CONFIG,
  otter: OTTER_CHARACTER_CONFIG,
  sealion: SEALION_CHARACTER_CONFIG,
};

/**
 * Get character configuration by ID
 */
export function getCharacterConfig(id: string): CharacterConfig {
  const config = CHARACTER_CONFIGS[id];

  if (!config) {
    console.warn(`[Characters] Unknown character ID: ${id}, falling back to seal`);
    return SEAL_CHARACTER_CONFIG;
  }

  return config;
}

/**
 * Get character configuration by type enum
 */
export function getCharacterConfigByType(type: CharacterType): CharacterConfig {
  return getCharacterConfig(type);
}

/**
 * Get all available character IDs
 */
export function getAllCharacterIds(): string[] {
  return Object.keys(CHARACTER_CONFIGS);
}

/**
 * Get all character configurations
 */
export function getAllCharacterConfigs(): CharacterConfig[] {
  return Object.values(CHARACTER_CONFIGS);
}

/**
 * Check if character is unlocked
 * (Simplified - actual unlock logic would check player progress)
 */
export function isCharacterUnlocked(characterId: string, playerTotalScore: number = 0): boolean {
  const config = getCharacterConfig(characterId);

  // No unlock condition = always available
  if (!config.gameplay.unlockCondition) {
    return true;
  }

  // Check unlock condition
  if (config.gameplay.unlockCondition.type === 'score') {
    return playerTotalScore >= (config.gameplay.unlockCondition.value as number);
  }

  // Other unlock types not implemented yet
  return false;
}

// ============================================================================
// PHYSICS BALANCE NOTES
// ============================================================================

/*
 * WEIGHT-TO-PHYSICS MAPPING:
 *
 * Gravity = base_gravity * (weight / 100)
 * - Lighter animals fall slower
 * - Heavier animals fall faster
 *
 * Jump Power = base_jump * (power / 100)
 * - More power = higher jumps
 * - Less power = weaker jumps
 *
 * Terminal Velocity = base_velocity * (weight / 100)
 * - Heavier = faster terminal velocity
 * - Lighter = slower terminal velocity
 *
 * BALANCE PHILOSOPHY:
 *
 * Otter (Hard):
 *   + Smaller hitbox (easier to dodge)
 *   + More responsive controls
 *   - Weak jumps (can't reach high gaps)
 *   - Falls slowly (less control)
 *
 * Seal (Medium):
 *   Balanced in all aspects
 *
 * Sea Lion (Easy):
 *   + Powerful jumps (easy recovery)
 *   + High terminal velocity (fast reactions)
 *   - Larger hitbox (harder to dodge)
 *   - Sluggish controls (momentum-based)
 */
