/**
 * Seal Skin System (v0.2)
 *
 * Manages different seal appearances/skins.
 */

export interface SealSkin {
  id: string;
  name: string;
  colors: {
    body: number;
    belly?: number;
    flippers: number;
    eyes: number;
    nose: number;
  };
  pattern?: 'spots' | 'stripes' | 'gradient';
  size: {
    width: number;
    height: number;
  };
}

export const SEAL_SKINS: Record<string, SealSkin> = {
  // Default seal (dark gray)
  seal_default: {
    id: 'seal_default',
    name: 'Harbor Seal',
    colors: {
      body: 0x3a3a3a,
      flippers: 0x2a2a2a,
      eyes: 0xffffff,
      nose: 0x000000,
    },
    size: { width: 60, height: 35 },
  },

  // Golden seal (achievement unlock)
  seal_golden: {
    id: 'seal_golden',
    name: 'Golden Seal',
    colors: {
      body: 0xffaa00,
      belly: 0xffdd44,
      flippers: 0xff8800,
      eyes: 0xffff00,
      nose: 0xff6600,
    },
    size: { width: 60, height: 35 },
  },

  // Arctic seal (white with blue tint)
  seal_arctic: {
    id: 'seal_arctic',
    name: 'Arctic Seal',
    colors: {
      body: 0xccddff,
      belly: 0xffffff,
      flippers: 0xaaccee,
      eyes: 0x4488ff,
      nose: 0x336699,
    },
    size: { width: 60, height: 35 },
  },

  // Leopard seal (spotted pattern)
  seal_leopard: {
    id: 'seal_leopard',
    name: 'Leopard Seal',
    colors: {
      body: 0x888888,
      belly: 0xcccccc,
      flippers: 0x666666,
      eyes: 0x000000,
      nose: 0x333333,
    },
    pattern: 'spots',
    size: { width: 65, height: 38 },
  },

  // Monk seal (brown)
  seal_monk: {
    id: 'seal_monk',
    name: 'Monk Seal',
    colors: {
      body: 0x8b4513,
      belly: 0xd2691e,
      flippers: 0x654321,
      eyes: 0x000000,
      nose: 0x2d1b0e,
    },
    size: { width: 58, height: 33 },
  },

  // Rainbow seal (pride colors)
  seal_rainbow: {
    id: 'seal_rainbow',
    name: 'Rainbow Seal',
    colors: {
      body: 0xff0000, // Will be overridden by gradient
      flippers: 0xff0000,
      eyes: 0xffffff,
      nose: 0xff00ff,
    },
    pattern: 'gradient',
    size: { width: 60, height: 35 },
  },

  // Ghost seal (translucent white)
  seal_ghost: {
    id: 'seal_ghost',
    name: 'Ghost Seal',
    colors: {
      body: 0xeeeeee,
      belly: 0xffffff,
      flippers: 0xdddddd,
      eyes: 0x8888ff,
      nose: 0xcccccc,
    },
    size: { width: 60, height: 35 },
  },

  // Fire seal (red/orange)
  seal_fire: {
    id: 'seal_fire',
    name: 'Fire Seal',
    colors: {
      body: 0xff4400,
      belly: 0xff8800,
      flippers: 0xcc2200,
      eyes: 0xffff00,
      nose: 0xff0000,
    },
    pattern: 'gradient',
    size: { width: 60, height: 35 },
  },

  // Ice seal (crystal blue)
  seal_ice: {
    id: 'seal_ice',
    name: 'Ice Seal',
    colors: {
      body: 0x88ccff,
      belly: 0xccffff,
      flippers: 0x4499dd,
      eyes: 0xffffff,
      nose: 0x3366aa,
    },
    size: { width: 60, height: 35 },
  },

  // Shadow seal (dark purple/black)
  seal_shadow: {
    id: 'seal_shadow',
    name: 'Shadow Seal',
    colors: {
      body: 0x1a001a,
      belly: 0x330033,
      flippers: 0x000000,
      eyes: 0xff00ff,
      nose: 0x660066,
    },
    size: { width: 60, height: 35 },
  },

  // Emerald seal (green)
  seal_emerald: {
    id: 'seal_emerald',
    name: 'Emerald Seal',
    colors: {
      body: 0x00aa44,
      belly: 0x44ff88,
      flippers: 0x008833,
      eyes: 0x88ffaa,
      nose: 0x005522,
    },
    size: { width: 60, height: 35 },
  },

  // Ruby seal (red gem)
  seal_ruby: {
    id: 'seal_ruby',
    name: 'Ruby Seal',
    colors: {
      body: 0xaa0044,
      belly: 0xff4488,
      flippers: 0x880033,
      eyes: 0xff8888,
      nose: 0x550022,
    },
    size: { width: 60, height: 35 },
  },

  // Sapphire seal (blue gem)
  seal_sapphire: {
    id: 'seal_sapphire',
    name: 'Sapphire Seal',
    colors: {
      body: 0x0044aa,
      belly: 0x4488ff,
      flippers: 0x003388,
      eyes: 0x88aaff,
      nose: 0x002255,
    },
    size: { width: 60, height: 35 },
  },

  // Cosmic seal (stars and space)
  seal_cosmic: {
    id: 'seal_cosmic',
    name: 'Cosmic Seal',
    colors: {
      body: 0x110044,
      belly: 0x220088,
      flippers: 0x000022,
      eyes: 0xffff00,
      nose: 0x440088,
    },
    pattern: 'spots', // Will render as stars
    size: { width: 60, height: 35 },
  },

  // Candy seal (pink and stripes)
  seal_candy: {
    id: 'seal_candy',
    name: 'Candy Seal',
    colors: {
      body: 0xff88cc,
      belly: 0xffccee,
      flippers: 0xff44aa,
      eyes: 0xffffff,
      nose: 0xff0088,
    },
    pattern: 'stripes',
    size: { width: 60, height: 35 },
  },

  // Zombie seal (greenish)
  seal_zombie: {
    id: 'seal_zombie',
    name: 'Zombie Seal',
    colors: {
      body: 0x668866,
      belly: 0x889988,
      flippers: 0x446644,
      eyes: 0xff0000,
      nose: 0x223322,
    },
    size: { width: 60, height: 35 },
  },

  // Robot seal (metallic)
  seal_robot: {
    id: 'seal_robot',
    name: 'Robot Seal',
    colors: {
      body: 0x888888,
      belly: 0xaaaaaa,
      flippers: 0x666666,
      eyes: 0x00ff00,
      nose: 0x444444,
    },
    size: { width: 60, height: 35 },
  },

  // Ninja seal (black with red accents)
  seal_ninja: {
    id: 'seal_ninja',
    name: 'Ninja Seal',
    colors: {
      body: 0x111111,
      belly: 0x222222,
      flippers: 0x000000,
      eyes: 0xff0000,
      nose: 0x330000,
    },
    size: { width: 55, height: 32 }, // Slightly smaller/stealthier
  },

  // Royal seal (purple and gold)
  seal_royal: {
    id: 'seal_royal',
    name: 'Royal Seal',
    colors: {
      body: 0x6600cc,
      belly: 0x9944ff,
      flippers: 0x4400aa,
      eyes: 0xffaa00,
      nose: 0x220055,
    },
    size: { width: 65, height: 38 }, // Slightly larger/regal
  },

  // Neon seal (bright colors)
  seal_neon: {
    id: 'seal_neon',
    name: 'Neon Seal',
    colors: {
      body: 0x00ffff,
      belly: 0xff00ff,
      flippers: 0x00ff00,
      eyes: 0xffff00,
      nose: 0xff0000,
    },
    pattern: 'gradient',
    size: { width: 60, height: 35 },
  },
};

/**
 * Get seal skin by ID
 */
export function getSealSkin(id: string): SealSkin {
  return SEAL_SKINS[id] || SEAL_SKINS.seal_default;
}

/**
 * Get all available seal skins
 */
export function getAllSealSkins(): SealSkin[] {
  return Object.values(SEAL_SKINS);
}
