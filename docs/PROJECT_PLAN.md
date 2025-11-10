# FlappySeal - Master Project Plan
## Autonomous Development Track

**Start Date**: 2025-11-10
**Branch**: `claude/autonomous-dev-main`
**Mode**: Fully autonomous development (no human input)

---

## Executive Summary

Building a complete, production-ready underwater seal game for web, iOS, and Android. Starting from a basic hello world demo, implementing all core features, polish, and mobile conversion.

## Development Philosophy

1. **One task at a time** - Complete, test, document, commit
2. **Test everything** - No feature ships without tests
3. **Document constantly** - Update docs after every task
4. **Branch for experiments** - New mechanics get their own branches
5. **Quality over speed** - Do it right, not fast

---

## Phase 1: Core Game Mechanics (Priority: CRITICAL)

### 1.1 Obstacle System
**Status**: Not Started
**Priority**: P0 (Blocker)
**Estimated Effort**: 4 hours

**Tasks**:
- [ ] Design obstacle generation algorithm
- [ ] Implement obstacle spawning system
- [ ] Create obstacle graphics (coral/rocks)
- [ ] Add obstacle movement
- [ ] Test obstacle timing and gaps
- [ ] Document obstacle system

**Acceptance Criteria**:
- Obstacles spawn at consistent intervals
- Gaps are fair and passable
- Obstacles move smoothly
- Performance: 60fps maintained

### 1.2 Collision Detection
**Status**: Not Started
**Priority**: P0 (Blocker)
**Estimated Effort**: 2 hours

**Tasks**:
- [ ] Implement seal-obstacle collision
- [ ] Implement seal-boundary collision
- [ ] Add collision visual feedback
- [ ] Test collision accuracy
- [ ] Optimize collision performance
- [ ] Document collision system

**Acceptance Criteria**:
- Accurate collision detection (no false positives/negatives)
- Visual feedback on collision
- Game over triggers correctly

### 1.3 Scoring System
**Status**: Not Started
**Priority**: P0 (Blocker)
**Estimated Effort**: 2 hours

**Tasks**:
- [ ] Implement score tracking
- [ ] Add score display UI
- [ ] Score increases when passing obstacles
- [ ] High score persistence (localStorage)
- [ ] Test scoring logic
- [ ] Document scoring system

**Acceptance Criteria**:
- Score updates correctly
- High score saves between sessions
- UI is clear and readable

### 1.4 Game States & Flow
**Status**: Not Started
**Priority**: P0 (Blocker)
**Estimated Effort**: 3 hours

**Tasks**:
- [ ] Implement game state machine (menu, playing, paused, game over)
- [ ] Create main menu scene
- [ ] Create game over scene
- [ ] Add restart functionality
- [ ] Test state transitions
- [ ] Document game flow

**Acceptance Criteria**:
- All states work correctly
- Smooth transitions
- No memory leaks on restart

---

## Phase 2: Polish & User Experience (Priority: HIGH)

### 2.1 Visual Improvements
**Status**: Not Started
**Priority**: P1
**Estimated Effort**: 6 hours

**Tasks**:
- [ ] Improve seal graphics (sprite or better procedural)
- [ ] Add seal animations (swimming, diving, idle)
- [ ] Enhanced underwater background (parallax layers)
- [ ] Particle effects (bubbles, splash, trails)
- [ ] Better obstacle graphics
- [ ] UI/UX polish (buttons, fonts, layout)
- [ ] Test visual performance
- [ ] Document visual system

**Acceptance Criteria**:
- Professional-looking graphics
- Smooth animations at 60fps
- Consistent art style
- Accessible UI

### 2.2 Sound & Music
**Status**: Not Started
**Priority**: P1
**Estimated Effort**: 3 hours

**Tasks**:
- [ ] Find/create sound effects (tap, score, collision, game over)
- [ ] Find/create background music
- [ ] Implement audio system
- [ ] Add volume controls
- [ ] Add mute toggle
- [ ] Test audio on different devices
- [ ] Document audio system

**Acceptance Criteria**:
- All key actions have audio feedback
- Background music loops smoothly
- Volume controls work
- Audio doesn't block gameplay

### 2.3 Tutorial & Onboarding
**Status**: Not Started
**Priority**: P1
**Estimated Effort**: 2 hours

**Tasks**:
- [ ] Create tutorial overlay
- [ ] First-time user detection
- [ ] Interactive tutorial
- [ ] Skip tutorial option
- [ ] Test tutorial flow
- [ ] Document tutorial system

**Acceptance Criteria**:
- New users understand controls
- Tutorial is skippable
- Only shows once (unless reset)

---

## Phase 3: Advanced Features (Priority: MEDIUM)

### 3.1 Difficulty Progression
**Status**: Not Started
**Priority**: P2
**Estimated Effort**: 2 hours

**Tasks**:
- [ ] Design difficulty curve
- [ ] Implement progressive speed increase
- [ ] Implement progressive gap decrease
- [ ] Test difficulty balance
- [ ] Document difficulty system

### 3.2 Power-ups & Collectibles
**Status**: Not Started
**Priority**: P2
**Estimated Effort**: 4 hours

**Tasks**:
- [ ] Design power-up types (shield, slow-motion, magnet?)
- [ ] Implement collectible fish for bonus points
- [ ] Implement power-up spawning
- [ ] Implement power-up effects
- [ ] Test power-up balance
- [ ] Document power-up system

### 3.3 Achievements & Unlockables
**Status**: Not Started
**Priority**: P2
**Estimated Effort**: 4 hours

**Tasks**:
- [ ] Design achievement system
- [ ] Implement achievement tracking
- [ ] Create unlockable seal skins
- [ ] Implement skin selection
- [ ] Test achievement triggers
- [ ] Document achievements

---

## Phase 4: Mobile Conversion (Priority: HIGH)

### 4.1 Touch Optimization
**Status**: Not Started
**Priority**: P1
**Estimated Effort**: 2 hours

**Tasks**:
- [ ] Optimize touch controls for mobile
- [ ] Test on various screen sizes
- [ ] Add haptic feedback
- [ ] Test landscape/portrait modes
- [ ] Document mobile controls

### 4.2 Capacitor Setup
**Status**: Not Started
**Priority**: P1
**Estimated Effort**: 3 hours

**Tasks**:
- [ ] Install Capacitor
- [ ] Configure iOS project
- [ ] Configure Android project
- [ ] Test native builds
- [ ] Document mobile build process

### 4.3 Performance Optimization
**Status**: Not Started
**Priority**: P1
**Estimated Effort**: 3 hours

**Tasks**:
- [ ] Profile performance
- [ ] Optimize asset loading
- [ ] Implement asset compression
- [ ] Test on low-end devices
- [ ] Document optimization techniques

---

## Phase 5: Testing & Quality Assurance (Priority: CRITICAL)

### 5.1 Automated Testing
**Status**: Not Started
**Priority**: P0
**Estimated Effort**: 4 hours

**Tasks**:
- [ ] Set up testing framework (Jest/Vitest)
- [ ] Write unit tests for game logic
- [ ] Write integration tests for scenes
- [ ] Set up CI/CD for tests
- [ ] Document testing approach

### 5.2 Manual QA
**Status**: Not Started
**Priority**: P0
**Estimated Effort**: 6 hours

**Tasks**:
- [ ] Test all game features
- [ ] Test on multiple browsers
- [ ] Test on multiple devices
- [ ] Bug fixing pass
- [ ] Performance testing
- [ ] Document QA results

---

## Phase 6: Deployment & Distribution (Priority: HIGH)

### 6.1 Web Deployment
**Status**: Partially Complete (Netlify/Vercel configs exist)
**Priority**: P1
**Estimated Effort**: 1 hour

**Tasks**:
- [x] Create deployment configs
- [ ] Set up actual deployment
- [ ] Configure custom domain (optional)
- [ ] Test production build
- [ ] Document deployment process

### 6.2 App Store Preparation
**Status**: Not Started
**Priority**: P1
**Estimated Effort**: 6 hours

**Tasks**:
- [ ] Create app icons (multiple sizes)
- [ ] Create screenshots for App Store
- [ ] Create screenshots for Google Play
- [ ] Write store descriptions
- [ ] Prepare promotional materials
- [ ] Document store submission process

---

## Technical Decisions to Make

### Art Style Decision
**Options**:
1. Simple geometric (current) - Fast, clean, accessible
2. Pixel art - Retro, charming, easier to create
3. Hand-drawn cartoon - Professional, appealing, time-intensive
4. Minimalist flat - Modern, clean, moderate effort

**Decision**: Start with improved geometric/flat design, can upgrade later

### Obstacle Type Decision
**Options**:
1. Coral/rock formations (static)
2. Jellyfish (animated enemies)
3. Underwater mines (thematic)
4. Kelp forests (organic movement)

**Decision**: Coral formations (simpler) + jellyfish (more interesting) hybrid

### Mobile Orientation Decision
**Options**:
1. Portrait only - One-handed play, easier UI
2. Landscape only - More screen space, better visibility
3. Both - Maximum accessibility, more work

**Decision**: Landscape primary, portrait as stretch goal

### Sound Design Decision
**Options**:
1. Realistic ocean sounds - Immersive
2. Upbeat game music - Energetic
3. Minimal/ambient - Relaxing
4. Hybrid - Mix of all

**Decision**: Ambient underwater sounds + subtle background music + clear UI sounds

---

## Success Metrics

### Technical Metrics
- [ ] 60 FPS on mid-range devices
- [ ] < 3 second load time
- [ ] < 10MB total size
- [ ] Zero critical bugs
- [ ] 90%+ code coverage

### Game Metrics
- [ ] Fair difficulty curve
- [ ] Clear game mechanics
- [ ] Intuitive controls
- [ ] Engaging gameplay loop
- [ ] High replay value

---

## Timeline Estimate

**Phase 1 (Core)**: 11 hours
**Phase 2 (Polish)**: 11 hours
**Phase 3 (Advanced)**: 10 hours
**Phase 4 (Mobile)**: 8 hours
**Phase 5 (Testing)**: 10 hours
**Phase 6 (Deploy)**: 7 hours

**Total**: ~57 hours of development time

---

## Current Status

**Overall Progress**: 5% (Basic demo complete)
**Current Phase**: Phase 1 - Core Game Mechanics
**Next Task**: Obstacle System Design & Implementation
**Last Updated**: 2025-11-10

---

## Notes

This is the master plan. It will be updated as development progresses. Each completed task will be documented in PROGRESS_LOG.md with details, learnings, and any changes to the plan.
