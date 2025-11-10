# UI Testing & Usage Guide
**Created:** 2025-11-10
**For:** Manual testing and app conversion
**Status:** Ready for Testing

---

## Overview

This guide provides complete instructions for testing the newly implemented UI polish features, including the character selection system, UI components, and animations.

---

## Quick Start

### Running the Game

```bash
# Install dependencies (if not already done)
npm install

# Run development server
npm run dev

# Open browser to http://localhost:5173
```

### Testing Flow

1. **Menu** → See "Select Animal" button
2. **Character Select** → Choose your animal
3. **Play** → Game uses selected character
4. **Verify** → All animals work correctly

---

## Feature Testing Checklist

### ✅ Character Selection UI

#### Access
- [ ] Start game and reach MenuScene
- [ ] Click "🐾 Select Animal" button
- [ ] Character Selection screen appears with fade transition
- [ ] All 3 animals visible

#### Layout
- [ ] Title "Choose Your Animal" centered at top
- [ ] 3 character cards displayed horizontally
- [ ] Stat panel below cards
- [ ] PLAY and BACK buttons at bottom
- [ ] No overlap or layout issues

#### Character Cards

**Seal Card:**
- [ ] Shows seal preview (gray color)
- [ ] Name: "Harbor Seal"
- [ ] Difficulty badge: "MEDIUM" (orange)
- [ ] Always available (no lock icon)
- [ ] Hover effect works (scale, color change)
- [ ] Click selects seal

**Otter Card:**
- [ ] Shows otter preview (brown/tan color)
- [ ] Name: "River Otter"
- [ ] Difficulty badge: "HARD" (red)
- [ ] Lock icon "🔒" if score < 500
- [ ] Shows unlock requirement "500"
- [ ] Click shows unlock message if locked
- [ ] Click selects otter if unlocked
- [ ] Hover effect works

**Sea Lion Card:**
- [ ] Shows sea lion preview (dark brown)
- [ ] Name: "California Sea Lion"
- [ ] Difficulty badge: "EASY" (green)
- [ ] **Visible ear flaps on preview!**
- [ ] Lock icon "🔒" if score < 1000
- [ ] Shows unlock requirement "1000"
- [ ] Click shows unlock message if locked
- [ ] Click selects sea lion if unlocked
- [ ] Hover effect works

#### Selection Behavior
- [ ] Click on available animal selects it
- [ ] Selected card shows golden border
- [ ] Selected card has pulsing glow effect
- [ ] Stat bars update when selecting different animals
- [ ] Selection persists after clicking BACK and returning

#### Stat Bars
- [ ] Three bars: Weight, Power, Agility
- [ ] Bars animate smoothly when switching animals
- [ ] Values display correctly (Seal: 100/100/100)
- [ ] Bar colors change based on value:
  - Above 100: Green
  - Below 100: Red
  - Exactly 100: Yellow/Orange

**Seal Stats:**
- [ ] Weight: 100 (yellow bar)
- [ ] Power: 100 (green bar)
- [ ] Agility: 100 (cyan bar)

**Otter Stats:**
- [ ] Weight: 65 (green - lighter)
- [ ] Power: 65 (red - weaker)
- [ ] Agility: 130 (green - more agile)

**Sea Lion Stats:**
- [ ] Weight: 135 (red - heavier)
- [ ] Power: 135 (green - stronger)
- [ ] Agility: 75 (red - less agile)

#### Buttons
- [ ] PLAY button hover effect works
- [ ] PLAY button click starts game with selected animal
- [ ] BACK button hover effect works
- [ ] BACK button returns to MenuScene
- [ ] Buttons slide in from bottom on screen load

#### Animations
- [ ] Character cards pop in sequentially (0ms, 100ms, 200ms delay)
- [ ] Title pulses gently
- [ ] Stat bars fill smoothly (500ms animation)
- [ ] Selected card border pulses
- [ ] Buttons slide in from bottom
- [ ] Screen fades in on entry
- [ ] Screen fades out on exit

#### Unlock Messages
- [ ] Click locked otter shows: "🔒 Unlock at 500 total score!"
- [ ] Message includes current score
- [ ] Message fades in and out
- [ ] Message disappears after 2 seconds

#### Persistence
- [ ] Select otter, click BACK
- [ ] Return to character select
- [ ] Otter still selected
- [ ] Restart game
- [ ] Character selection remembered

---

### ✅ MenuScene Integration

#### Layout
- [ ] Title "🦭 FlappySeal" at top
- [ ] Subtitle "Master the Depths"
- [ ] Current character indicator below title
- [ ] 5 menu buttons vertically aligned
- [ ] Background bubbles floating upward
- [ ] Version number in bottom-right

#### Character Indicator
- [ ] Shows "Current: 🦭 Seal" (or Otter/Sea Lion)
- [ ] Pulses gently (alpha animation)
- [ ] Updates when returning from character select

#### Buttons
1. **▶ Play** (green)
   - [ ] Hover effect works
   - [ ] Launches ModeSelectionScene

2. **🐾 Select Animal** (cyan)
   - [ ] Hover effect works
   - [ ] Launches CharacterSelectScene

3. **🎨 Unlocks** (cyan)
   - [ ] Hover effect works
   - [ ] Launches UnlockScene (if exists)

4. **🏆 Achievements** (orange)
   - [ ] Hover effect works
   - [ ] Launches AchievementScene (if exists)

5. **⚙️ Settings** (white)
   - [ ] Hover effect works
   - [ ] Shows "not implemented" message

#### Animations
- [ ] Title floats up and down
- [ ] Buttons pop in sequentially
- [ ] Buttons scale on hover (1.05x)
- [ ] Background bubbles rise continuously
- [ ] Character indicator pulses

---

### ✅ In-Game Testing

#### Seal Gameplay
- [ ] Select Seal from character select
- [ ] Start game
- [ ] Seal appears (gray color)
- [ ] Medium-sized
- [ ] Balanced physics (normal fall speed)
- [ ] Normal jump power
- [ ] Responsive controls

#### Otter Gameplay
- [ ] Select Otter from character select (if unlocked)
- [ ] Start game
- [ ] Otter appears (brown/tan color)
- [ ] **Smaller size than seal**
- [ ] **Falls slowly (floaty feel)**
- [ ] **Weak jumps (can't reach high)**
- [ ] **More responsive (agile)**
- [ ] Long whiskers visible
- [ ] Sleek, elongated body shape

#### Sea Lion Gameplay
- [ ] Select Sea Lion from character select (if unlocked)
- [ ] Start game
- [ ] Sea Lion appears (dark brown color)
- [ ] **Larger size than seal**
- [ ] **Falls fast (heavy feel)**
- [ ] **Powerful jumps (easy recovery)**
- [ ] **Sluggish controls (momentum)**
- [ ] **Ear flaps visible on head!**
- [ ] Bulky, wide body shape

#### Physics Comparison
Test each animal's feel:

| Test | Seal | Otter | Sea Lion |
|------|------|-------|----------|
| Fall speed | Medium | **Slow** | **Fast** |
| Jump height | Medium | **Low** | **High** |
| Control response | Medium | **Quick** | **Slow** |
| Hitbox | Medium | **Small** | **Large** |
| Overall feel | Balanced | Floaty, agile | Heavy, powerful |

---

### ✅ UI Components

#### UIButton
Test locations: Character select (PLAY/BACK buttons)

- [ ] Default state: cyan background, white text
- [ ] Hover: orange background, scale 1.05x
- [ ] Press: scale 0.95x
- [ ] Release: scale back to 1.0 or 1.05x
- [ ] Transitions smooth (100ms)
- [ ] Cursor changes to pointer on hover
- [ ] Click triggers callback

#### UIPanel
Test location: Character select (stat panel)

- [ ] Dark blue background (90% opacity)
- [ ] Cyan border (3px width)
- [ ] Rounded corners (16px radius)
- [ ] No visual glitches
- [ ] Renders correctly

#### UIStatBar
Test location: Character select (Weight/Power/Agility)

- [ ] Label on left
- [ ] Background bar (gray)
- [ ] Fill bar (colored, animated)
- [ ] Value text on right
- [ ] Animates smoothly when value changes (500ms)
- [ ] Colors match values correctly

#### UIBadge
Test location: Character select (difficulty badges)

- [ ] Pill-shaped (fully rounded)
- [ ] Text centered
- [ ] Correct colors:
  - Easy: Green
  - Medium: Orange
  - Hard: Red
- [ ] No layout issues

---

### ✅ Animations

#### Fade Transitions
- [ ] Character select fades in (300ms)
- [ ] Character select fades out to game (300ms)
- [ ] MenuScene fades out to character select (300ms)
- [ ] Smooth, no flicker

#### Pop In
- [ ] Character cards pop in with Back.easeOut
- [ ] Sequential delays (0ms, 100ms, 200ms)
- [ ] Start from scale 0
- [ ] End at scale 1
- [ ] Smooth animation

#### Scale Pulse
- [ ] Title text pulses (1.0 to 1.05)
- [ ] Continuous loop
- [ ] Sine.easeInOut easing
- [ ] Smooth, not jarring

#### Slide In From Bottom
- [ ] PLAY and BACK buttons slide up
- [ ] Start below screen
- [ ] End at correct position
- [ ] 400ms duration
- [ ] Delays (200ms, 250ms)

#### Stat Bar Fill
- [ ] Bars fill smoothly
- [ ] 500ms duration
- [ ] Power2 easing
- [ ] Values count up smoothly

---

## Debug Testing

### Debug UI (Press D in-game)

- [ ] Press 'D' to toggle debug panel
- [ ] Panel appears in top-right
- [ ] Shows 4 player physics variables
- [ ] Performance metrics display
- [ ] FPS counter accurate
- [ ] Memory usage shown (if Chrome)
- [ ] Frame time display

#### Debug Navigation
- [ ] ↑↓ keys navigate variables
- [ ] ←→ keys adjust values
- [ ] 'R' key resets variable
- [ ] 'S' key saves config
- [ ] 'L' key loads config
- [ ] Modified values highlighted in orange

#### Debug Functionality
- [ ] Adjust Gravity → seal falls faster/slower
- [ ] Adjust Swim Up Force → seal jumps higher/lower
- [ ] Adjust Dive Down Force → seal dives more/less
- [ ] Adjust Max Velocity → seal caps speed differently
- [ ] Changes apply immediately
- [ ] Save/load config works across sessions

---

## Common Issues & Solutions

### Issue: Character not changing
**Solution:**
1. Make sure you clicked PLAY after selecting
2. Check console for errors
3. Verify localStorage has 'flappyseal_selected_character'

### Issue: Otter/Sea Lion always locked
**Solution:**
1. This is expected if score < unlock requirement
2. To test: Modify `playerTotalScore` in MenuScene.onButtonClick
3. Set to 1500 to unlock all animals

### Issue: Animations stuttering
**Solution:**
1. Check FPS with debug panel (press D)
2. Verify FPS is 60
3. Close other browser tabs
4. Check performance monitor

### Issue: UI elements overlapping
**Solution:**
1. Check screen resolution (game is 800x600)
2. Verify browser zoom is 100%
3. Try fullscreen mode

### Issue: Character selection not persisting
**Solution:**
1. Check browser console for localStorage errors
2. Ensure cookies/localStorage enabled
3. Try clearing browser cache

---

## Testing Scenarios

### Scenario 1: First-Time Player
1. Launch game
2. See MenuScene with Seal selected
3. Click "Select Animal"
4. See all 3 animals, Otter/Sea Lion locked
5. Try clicking locked animals
6. See unlock messages
7. Select Seal
8. Click PLAY
9. Game starts with Seal

**Expected:** Smooth experience, clear feedback on locks

### Scenario 2: Returning Player (Score 500)
1. Launch game
2. Set score to 500 in code temporarily
3. Click "Select Animal"
4. Otter now unlocked, Sea Lion still locked
5. Select Otter
6. Stats update to show Otter's values
7. Click PLAY
8. Game starts with Otter
9. Verify floaty physics

**Expected:** Otter plays differently, feels agile

### Scenario 3: Expert Player (Score 1000+)
1. Launch game
2. Set score to 1000+ in code
3. Click "Select Animal"
4. All animals unlocked
5. Try each animal
6. Compare physics differences
7. Verify ear flaps on Sea Lion

**Expected:** Clear differences between all 3

### Scenario 4: Character Switching
1. Select Seal, play game
2. Exit, return to menu
3. Select Otter, play game
4. Exit, return to menu
5. Select Sea Lion, play game
6. Verify each time character changes

**Expected:** Selection changes correctly every time

### Scenario 5: Persistence
1. Select Otter
2. Close browser
3. Reopen game
4. Check MenuScene - should say "Current: Otter"
5. Start game
6. Should play as Otter

**Expected:** Selection persists across sessions

---

## Performance Benchmarks

### Target Metrics
- FPS: 60 (stable)
- Frame time: <16.67ms
- UI render: <2ms per frame
- Memory: <100MB total
- Character select load: <500ms

### How to Measure
1. Press F12 in browser
2. Go to Performance tab
3. Record while navigating UI
4. Check for long tasks (>50ms)
5. Verify 60fps maintained

### Acceptable Performance
- ✅ 60fps during character select
- ✅ 60fps during MenuScene
- ✅ 60fps during gameplay
- ✅ Smooth animations (no stutters)
- ✅ Instant button responses
- ✅ No layout shifts or flickers

---

## App Conversion Considerations

### Mobile Testing Priorities

**Touch Interactions:**
- [ ] Buttons respond to touch
- [ ] No hover issues (mobile has no hover)
- [ ] Touch targets large enough (min 44x44px)
- [ ] No accidental touches

**Screen Sizes:**
- [ ] Test on phone (portrait)
- [ ] Test on tablet (landscape)
- [ ] UI scales correctly
- [ ] No text cutoff
- [ ] Buttons accessible

**Performance:**
- [ ] 60fps on mobile device
- [ ] Animations smooth
- [ ] No lag when switching characters
- [ ] Battery usage acceptable

### iOS Testing (via Capacitor)
1. Build with `npx cap sync ios`
2. Open in Xcode
3. Run on simulator
4. Test all UI interactions
5. Verify touch responses
6. Check memory usage

### Android Testing (via Capacitor)
1. Build with `npx cap sync android`
2. Open in Android Studio
3. Run on emulator
4. Test all UI interactions
5. Verify touch responses
6. Check performance

---

## Sign-Off Checklist

Before considering UI polish complete:

**Functionality:**
- [ ] All 3 animals selectable
- [ ] Selection persists
- [ ] Unlocks work correctly
- [ ] Physics differences clear
- [ ] No crashes or errors

**Visual Polish:**
- [ ] All animations smooth
- [ ] No visual glitches
- [ ] Consistent styling
- [ ] Colors cohesive
- [ ] Typography clear

**User Experience:**
- [ ] Intuitive navigation
- [ ] Clear feedback
- [ ] Responsive controls
- [ ] No confusion points
- [ ] Satisfying to use

**Performance:**
- [ ] 60fps maintained
- [ ] No stutters
- [ ] Fast load times
- [ ] Memory efficient
- [ ] Battery friendly (mobile)

**Polish:**
- [ ] Animations add value
- [ ] Sounds appropriate (when added)
- [ ] Visual feedback clear
- [ ] Feels professional
- [ ] Ready for public testing

---

## Next Steps After Testing

1. **Fix Issues:** Address any bugs found
2. **Balance:** Tune character physics based on feedback
3. **Polish:** Add sound effects, more animations
4. **Optimize:** Improve performance if needed
5. **Document:** Update any changed behavior

---

## Feedback Template

When providing feedback, please include:

**Character Selection:**
- Which animals did you try?
- Were unlocks clear?
- Did selection persist?
- Were stats helpful?

**Physics Feel:**
- Which animal felt best?
- Were differences noticeable?
- Any balance concerns?
- Hitbox accuracy?

**UI/UX:**
- Was navigation intuitive?
- Were animations smooth?
- Any visual issues?
- Performance problems?

**Overall:**
- What worked well?
- What needs improvement?
- Any bugs?
- Additional features wanted?

---

**Ready for testing!** 🎮

All UI polish features are implemented and ready for manual testing before app conversion.
