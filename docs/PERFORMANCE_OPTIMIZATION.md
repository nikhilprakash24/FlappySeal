# Performance Optimization Guide (v0.2)

Target: 60fps on 3-year-old devices with <100MB memory usage.

---

## Current Status

### Metrics (Web Build)
- Build size: 1.55MB (gzipped: ~359KB)
- Initial load: <2 seconds
- Memory usage: ~80MB (estimated)
- Frame rate: 60fps on desktop

### Known Issues
- Bundle size warning (>500KB)
- No texture atlasing yet
- All assets loaded upfront
- No device-specific quality tiers

---

## Optimization Strategies

### 1. Asset Optimization

#### Current State
All graphics are procedural (no image assets yet).

#### When Professional Assets Added:

**Texture Atlasing**:
```typescript
// Create atlas from multiple images
scene.load.atlas('gameAtlas', 'atlas.png', 'atlas.json');

// Instead of individual images:
// scene.load.image('seal', 'seal.png');
// scene.load.image('obstacle1', 'obstacle1.png');
// ...
```

**Benefits**:
- Reduces draw calls by 80%
- Smaller file size (combined atlas)
- Faster loading

**Image Compression**:
- Use WebP format (30% smaller than PNG)
- Fallback to PNG for older devices
- Target: 512x512 or 1024x1024 atlas max

**Audio Compression**:
- Use Web Audio API (already implemented)
- Compress to AAC/OGG (not WAV)
- Lower bitrate for SFX (64kbps sufficient)
- Streaming for music (don't load all at once)

---

### 2. Code Splitting

#### Current Issue
Single 1.55MB bundle loads everything upfront.

#### Solution

**Lazy Loading Scenes**:
```typescript
// main.ts - only load MenuScene initially
scene: [MenuScene]

// Dynamically import others when needed
async function loadGameScene() {
  const { GameScene } = await import('./scenes/GameScene');
  game.scene.add('GameScene', GameScene);
}
```

**Phaser Scene Splitting**:
```typescript
// Load heavy assets only when scene starts
class GameScene extends Phaser.Scene {
  preload() {
    this.load.atlas('game', 'game-atlas.png', 'game-atlas.json');
  }

  create() {
    // Scene is ready, assets loaded
  }
}
```

**Target**:
- Initial bundle: <300KB
- Additional chunks: Load on demand
- 50% faster initial load

---

### 3. Object Pooling

#### Current Implementation
✅ Already implemented for:
- Obstacles (ObstacleManager)
- Particles (ParticleManager)
- Power-ups (PowerUpSystem)

#### Best Practices
```typescript
// Good - reuse objects
const particle = particlePool.get();
particle.reset(x, y);

// Bad - create new each time
const particle = new Particle(x, y); // Garbage collection!
```

**Pool Sizes** (tune based on device):
- Obstacles: 20 (sufficient for scrolling)
- Particles: 100 (50 for low-end)
- Power-ups: 10

---

### 4. Render Optimization

#### Draw Call Reduction

**Current**: Each obstacle/particle = separate draw call

**Optimize**:
```typescript
// Use sprite batching
const obstacles = scene.add.group();
obstacles.runChildUpdate = true; // Batch render

// Or manual batching
const batchSprite = scene.add.renderTexture(0, 0, 800, 600);
obstacles.forEach(obs => {
  batchSprite.draw(obs, obs.x, obs.y);
});
```

**Target**: <50 draw calls per frame

#### Culling
Only render what's visible:

```typescript
update() {
  if (sprite.x < -100 || sprite.x > GAME_CONFIG.WIDTH + 100) {
    sprite.setVisible(false); // Don't render off-screen
  } else {
    sprite.setVisible(true);
  }
}
```

**Current**: No culling (but small game area, not critical)

---

### 5. Memory Management

#### Prevent Memory Leaks

**Current Risks**:
- Event listeners not cleaned up
- Tweens not stopped on scene change
- Graphics objects not destroyed

**Solution**:
```typescript
shutdown() {
  // Clean up ALL resources
  this.events.removeAllListeners();
  this.tweens.killAll();
  this.children.removeAll(true); // destroy=true
  this.sound.stopAll();
}
```

**Monitor**:
```typescript
// Check memory usage
console.log(performance.memory.usedJSHeapSize / 1048576); // MB
```

#### Garbage Collection

**Avoid**:
```typescript
// Bad - creates new array every frame
update() {
  const temp = [1, 2, 3]; // GC pressure!
}
```

**Instead**:
```typescript
// Good - reuse
private temp: number[] = [0, 0, 0];
update() {
  this.temp[0] = 1; // No allocation
}
```

---

### 6. Device-Specific Quality Tiers

Detect device capabilities and adjust:

```typescript
// Device detection
class PerformanceManager {
  private tier: 'low' | 'medium' | 'high';

  constructor() {
    this.tier = this.detectTier();
  }

  private detectTier(): 'low' | 'medium' | 'high' {
    const memory = (performance as any).memory?.jsHeapSizeLimit || 0;
    const cores = navigator.hardwareConcurrency || 2;

    if (memory > 4000000000 && cores >= 8) return 'high';
    if (memory > 2000000000 && cores >= 4) return 'medium';
    return 'low';
  }

  getParticleLimit(): number {
    return this.tier === 'low' ? 50 :
           this.tier === 'medium' ? 100 : 200;
  }

  shouldEnablePostFX(): boolean {
    return this.tier !== 'low';
  }
}
```

**Tier Adjustments**:
- **Low**: 30fps cap, half particles, no shaders
- **Medium**: 60fps, normal particles, basic FX
- **High**: 60fps, max particles, all FX

---

### 7. Frame Rate Management

#### Frame Budget
60fps = 16.67ms per frame

**Measure**:
```typescript
update(time: number, delta: number) {
  const start = performance.now();

  // Game logic here

  const duration = performance.now() - start;
  if (duration > 16) {
    console.warn(`Frame took ${duration}ms - budget exceeded!`);
  }
}
```

#### Optimization Targets
- Update logic: <5ms
- Rendering: <8ms
- Physics: <3ms
- Total: <16ms

#### Throttling
```typescript
// Run expensive operations less frequently
private frameCount = 0;

update() {
  this.frameCount++;

  // Only every 5th frame
  if (this.frameCount % 5 === 0) {
    this.updateBackgroundParallax();
  }
}
```

---

### 8. Mobile-Specific Optimizations

#### Touch Input
```typescript
// Passive listeners (allows browser scrolling optimization)
this.input.addPointer(1); // Single touch sufficient
this.input.touch.capture = true; // Prevent browser gestures
```

#### Battery Optimization
```typescript
// Pause when not visible
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    this.scene.pause();
    this.sound.pauseAll();
  } else {
    this.scene.resume();
    this.sound.resumeAll();
  }
});
```

#### Network
```typescript
// Preload assets on WiFi only (if online features added)
if (navigator.connection?.effectiveType === '4g') {
  preloadAssets();
}
```

---

### 9. Build Optimization

#### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
          scenes: [
            './src/scenes/MenuScene',
            './src/scenes/GameScene'
          ],
          modes: [
            './src/modes/EndlessMode',
            './src/modes/ChallengeMode'
          ]
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs
        passes: 2
      }
    }
  }
});
```

#### Tree Shaking
Ensure imports are optimized:
```typescript
// Bad - imports entire library
import * as Phaser from 'phaser';

// Good - only what's needed
import { Scene, GameObjects } from 'phaser';
```

---

### 10. Profiling & Monitoring

#### Chrome DevTools

**Performance Tab**:
1. Open DevTools (F12)
2. Performance tab
3. Record while playing
4. Look for:
   - Long tasks (>50ms)
   - Layout thrashing
   - GC pauses

**Memory Tab**:
1. Take heap snapshot
2. Play for 5 minutes
3. Take another snapshot
4. Compare - should be similar (no leak)

#### Phaser Debug

```typescript
// Enable FPS counter
const config = {
  fps: {
    target: 60,
    forceSetTimeOut: true
  },
  render: {
    pixelArt: false, // Smooth scaling
    antialias: true
  }
};
```

#### Custom Metrics
```typescript
class PerformanceMonitor {
  private samples: number[] = [];

  recordFrame(delta: number) {
    this.samples.push(delta);
    if (this.samples.length > 60) {
      const avg = this.samples.reduce((a,b) => a+b) / 60;
      console.log(`Avg frame time: ${avg.toFixed(2)}ms`);
      this.samples = [];
    }
  }
}
```

---

## Optimization Roadmap

### Phase 1 (Immediate)
- [ ] Implement code splitting
- [ ] Add device tier detection
- [ ] Reduce particle count on low-end
- [ ] Add visibility change pause

### Phase 2 (With Professional Assets)
- [ ] Create texture atlases
- [ ] Compress images to WebP
- [ ] Implement sprite batching
- [ ] Optimize audio files

### Phase 3 (Pre-Launch)
- [ ] Profile on 10+ devices
- [ ] A/B test quality tiers
- [ ] Optimize critical path
- [ ] Minimize bundle size

---

## Target Metrics (Post-Optimization)

### Bundle Size
- Initial: <300KB (gzipped)
- Total assets: <10MB
- Mobile install: <50MB

### Performance
- 60fps on iPhone SE 2020 / Galaxy A52
- 45fps minimum on 4-year-old devices
- <2s load time on 4G
- <100MB memory usage

### Battery
- <5% drain per hour on iPhone 13
- <8% drain per hour on mid-range Android

---

## Testing Checklist

- [ ] Run on iPhone SE (2020) - minimum iOS
- [ ] Run on Galaxy A52 - mid-range Android
- [ ] Run on iPad - tablet size
- [ ] Play for 30 minutes - check for slowdown
- [ ] Monitor memory with DevTools
- [ ] Test on throttled CPU (6x slowdown in Chrome)
- [ ] Test on slow 3G network

---

## Tools

- **Chrome DevTools**: Performance & Memory profiling
- **Lighthouse**: Performance audit
- **WebPageTest**: Load time analysis
- **BrowserStack**: Real device testing
- **Phaser Inspector**: Game object debugging

---

## Common Performance Issues

### Symptom: Frame drops after 5 minutes
**Cause**: Memory leak
**Fix**: Check `shutdown()` methods clean up properly

### Symptom: Stuttering every few seconds
**Cause**: Garbage collection pauses
**Fix**: Reduce object creation, use pools

### Symptom: Slow on mid-range devices
**Cause**: Too many draw calls
**Fix**: Use texture atlases and batching

### Symptom: High battery drain
**Cause**: Running at full speed when not visible
**Fix**: Pause on visibility change

---

## References

- [Phaser Performance Tips](https://phaser.io/tutorials/performance)
- [Web Performance Best Practices](https://web.dev/performance/)
- [Mobile Web Performance](https://developers.google.com/web/fundamentals/performance)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

---

*Last Updated: v0.2 Development - November 2025*
