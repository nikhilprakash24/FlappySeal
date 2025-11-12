/**
 * Biome System (v0.2)
 *
 * Defines different underwater environments with unique visuals.
 */

export interface Biome {
  id: string;
  name: string;
  colors: {
    background: {
      top: number;
      bottom: number;
    };
    ambient: number; // Overlay tint
    particles: number; // Bubble/particle color
  };
  parallax: {
    layer1: number; // Darkest background
    layer2: number;
    layer3: number;
    layer4: number; // Lightest foreground
  };
  obstacles: {
    primary: number;
    secondary: number;
  };
}

export const BIOMES: Record<string, Biome> = {
  // Coral Reef (bright, colorful)
  biome_coral: {
    id: 'biome_coral',
    name: 'Coral Reef',
    colors: {
      background: {
        top: 0x4488ff,
        bottom: 0x0066cc,
      },
      ambient: 0x88ccff,
      particles: 0xaaddff,
    },
    parallax: {
      layer1: 0x003366,
      layer2: 0x004488,
      layer3: 0x0066aa,
      layer4: 0x0088cc,
    },
    obstacles: {
      primary: 0xff8844,   // Coral orange
      secondary: 0xffaa44, // Jellyfish yellow
    },
  },

  // Deep Ocean (dark, mysterious)
  biome_deep: {
    id: 'biome_deep',
    name: 'Deep Ocean',
    colors: {
      background: {
        top: 0x001144,
        bottom: 0x000022,
      },
      ambient: 0x112244,
      particles: 0x3344aa,
    },
    parallax: {
      layer1: 0x000011,
      layer2: 0x000822,
      layer3: 0x001133,
      layer4: 0x001a44,
    },
    obstacles: {
      primary: 0x444444,   // Dark rocks
      secondary: 0x6633cc, // Bioluminescent jellyfish
    },
  },

  // Arctic Waters (icy, cold)
  biome_arctic: {
    id: 'biome_arctic',
    name: 'Arctic Waters',
    colors: {
      background: {
        top: 0xccffff,
        bottom: 0x88ddff,
      },
      ambient: 0xeeffff,
      particles: 0xffffff,
    },
    parallax: {
      layer1: 0x6699cc,
      layer2: 0x88bbdd,
      layer3: 0xaaddee,
      layer4: 0xccffff,
    },
    obstacles: {
      primary: 0xaaccff,   // Ice chunks
      secondary: 0xffffff, // Icebergs
    },
  },

  // Tropical Lagoon (vibrant, warm)
  biome_tropical: {
    id: 'biome_tropical',
    name: 'Tropical Lagoon',
    colors: {
      background: {
        top: 0x44ddff,
        bottom: 0x00aacc,
      },
      ambient: 0x66eeff,
      particles: 0x88ffff,
    },
    parallax: {
      layer1: 0x008899,
      layer2: 0x00aaaa,
      layer3: 0x00ccbb,
      layer4: 0x00eedd,
    },
    obstacles: {
      primary: 0xff6644,   // Tropical coral
      secondary: 0xffcc44, // Tropical fish schools
    },
  },
};

/**
 * Get biome by ID
 */
export function getBiome(id: string): Biome {
  return BIOMES[id] || BIOMES.biome_coral;
}

/**
 * Get all biomes
 */
export function getAllBiomes(): Biome[] {
  return Object.values(BIOMES);
}
