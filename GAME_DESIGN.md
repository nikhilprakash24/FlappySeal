# FlappySeal - Game Design Document

## Current Implementation Status

✅ **Completed**:
- Phaser 3 + TypeScript + Vite setup
- Basic seal character with graphics
- Dual-control mechanics (left tap = swim up, right tap = dive down)
- Underwater visual effects (bubbles, light rays, depth layers)
- Responsive canvas that adapts to screen size
- Ready for mobile conversion

## Key Questions for You

### 1. Game Mechanics

**Obstacle System**:
- Should obstacles come from the right (like Flappy Bird)?
- What type of obstacles fit the underwater theme?
  - Rocks/coral formations?
  - Jellyfish or other sea creatures?
  - Underwater mines?
  - Kelp/seaweed?
- Should there be top AND bottom obstacles, or just one side?
- How much gap should be between obstacles?

**Difficulty Progression**:
- Should the game get progressively harder?
  - Obstacles move faster?
  - Gaps get smaller?
  - More obstacles appear?
- Should difficulty increase based on score or time?

**Power-ups/Features**:
- Should there be collectible items? (fish, stars, bubbles?)
- Any special abilities for the seal?
- Should there be different seal skins/unlockables?

### 2. Visual Design

**Art Style**:
- Current: Simple geometric shapes (programmer art)
- Should we upgrade to:
  - Hand-drawn cartoon style?
  - Pixel art retro style?
  - Realistic underwater photography style?
  - Minimalist flat design?

**Underwater Environment**:
- Multiple background layers for parallax scrolling?
- Animated elements (swimming fish, floating particles)?
- Different depth zones with color changes?
- Day/night cycle or different underwater biomes?

**Seal Character**:
- Current: Simple gray seal
- Should the seal have:
  - Animations (swimming, diving, idle)?
  - Facial expressions?
  - Trail effects when moving?
  - Different colors/patterns?

### 3. Audio

**Sound Effects Needed**:
- Tap/control sounds
- Collision/hit sound
- Score pickup sound
- Background ambient underwater sounds
- Game over sound
- Menu/button clicks

**Music**:
- Background music style preference?
  - Calm, relaxing underwater theme?
  - Upbeat, energetic game music?
  - Ambient ocean sounds only?

### 4. Game Flow

**Screens**:
- Main menu design?
- Tutorial/how to play?
- Pause menu?
- Game over screen with stats?
- High score/leaderboard?

**Scoring System**:
- Points for passing obstacles?
- Bonus points for collecting items?
- Distance-based scoring?
- Combo system?

### 5. Mobile Features

**Controls**:
- Current: Left/right tap for up/down
- Alternative control schemes?
- Sensitivity adjustments needed?

**Mobile-Specific**:
- Vibration feedback on collisions?
- Portrait or landscape orientation?
- Both orientations supported?

### 6. Social/Monetization (Future)

**Social Features**:
- Share scores on social media?
- Friend leaderboards?
- Achievements/trophies?

**Monetization** (if applicable):
- Free with ads?
- Premium version?
- In-app purchases (skins, power-ups)?

## Technical Stack Justification

### Why Phaser 3?
- ✅ Production-tested framework (used by 1000s of games)
- ✅ Excellent performance on mobile devices
- ✅ Built-in physics, sprites, animations
- ✅ Large community and extensive documentation
- ✅ No need for Unity - pure web technology

### Why Capacitor for Mobile?
- ✅ Official Ionic framework for native conversion
- ✅ Direct web-to-native conversion (no rewrites)
- ✅ Access to native APIs (camera, haptics, etc.)
- ✅ Single codebase for iOS + Android
- ✅ Live updates without app store approval

### Alternative Considered: Unity
- ❌ Heavier learning curve
- ❌ Larger file sizes
- ❌ Different codebase from web
- ✅ Better for 3D or very complex games

**Verdict**: For a 2D game like FlappySeal, Phaser + Capacitor is the optimal choice.

## Development Phases

### Phase 1: Core Gameplay (Current)
- [x] Basic scene and character
- [x] Control mechanics
- [ ] Obstacle generation system
- [ ] Collision detection
- [ ] Scoring system
- [ ] Game over state

### Phase 2: Polish
- [ ] Visual improvements (art assets)
- [ ] Sound effects and music
- [ ] Particle effects and animations
- [ ] UI/menus
- [ ] Tutorial

### Phase 3: Mobile Conversion
- [ ] Capacitor setup
- [ ] iOS build and testing
- [ ] Android build and testing
- [ ] Touch controls optimization
- [ ] Performance optimization

### Phase 4: Launch
- [ ] App store assets (icons, screenshots)
- [ ] Store listings
- [ ] Testing on various devices
- [ ] Submission to App Store & Google Play

## Next Steps

Please answer the questions above so I can:
1. Implement the obstacle system
2. Add collision detection and scoring
3. Create proper art assets or find suitable graphics
4. Add sound effects and music
5. Build out the complete game loop

The hello world demo is ready to run! To test it locally:
```bash
npm install
npm run dev
```

For live deployment, you can:
- Push to GitHub and connect to Netlify/Vercel (auto-deploys)
- Use GitHub Pages
- Any static hosting service

Let me know your preferences and I'll continue building!
