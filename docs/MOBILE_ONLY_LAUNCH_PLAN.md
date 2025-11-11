# Mobile-Only Launch Plan

**Target:** iOS App Store + Google Play Store
**Timeline:** 3-4 weeks to beta, 5-6 weeks to production
**Current Status:** 45% ready → Need mobile conversion + testing

---

## Executive Summary

**Mobile-First Strategy Benefits:**
- ✅ Better monetization (ads, IAP)
- ✅ App store discovery and organic downloads
- ✅ Push notifications (future feature)
- ✅ Premium positioning vs web games
- ✅ Native performance and feel
- ✅ Offline play capability

**Skip Web Version (For Now):**
- Can add later if needed
- Focus all effort on mobile quality
- Simpler testing and support
- Single codebase with Capacitor

---

## Phase Breakdown (Mobile-Only)

### Phase 1: Pre-Mobile Prep (Week 1) - 45% → 65%
**Goal:** Game ready for mobile conversion

#### Day 1-2: Character Balance & Audio
**Tasks:**
- [ ] Play 50+ games with each character
- [ ] Record data: Average score, death rate, feel
- [ ] Adjust physics if needed using debug mode
- [ ] Source 5 core sound effects:
  - swim_up.mp3
  - dive_down.mp3
  - collision.mp3
  - game_over.mp3
  - score_point.mp3
- [ ] Integrate sounds (uncomment TODO points)
- [ ] Test audio in browser first

**Deliverables:**
- Balanced game feel for all 3 characters
- 5 working sound effects
- Updated physics config (if needed)

#### Day 3: Account Setup & Requirements
**Tasks:**
- [ ] Sign up for Apple Developer Program ($99/year)
  - URL: https://developer.apple.com/programs/
  - Approval time: 24-48 hours
- [ ] Sign up for Google Play Console ($25 one-time)
  - URL: https://play.google.com/console/signup
  - Instant access
- [ ] Decide app name (e.g., "FlappySeal: Ocean Adventure")
- [ ] Decide bundle ID (e.g., com.yourname.flappyseal)
- [ ] Read app store guidelines:
  - iOS: https://developer.apple.com/app-store/review/guidelines/
  - Android: https://support.google.com/googleplay/android-developer/answer/9904549

**Deliverables:**
- Developer accounts active
- App metadata decided
- Guidelines reviewed

#### Day 4-5: Asset Creation
**Tasks:**
- [ ] Design app icon (1024×1024 base)
  - Export iOS sizes: 20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024
  - Export Android sizes: 48, 72, 96, 144, 192, 512
  - Tool: Use online generator or Figma
- [ ] Create splash screen (2732×2732 base, centered content)
- [ ] Take gameplay screenshots (5-10):
  - Character selection screen
  - Gameplay with Seal
  - Gameplay with Otter
  - Gameplay with Sea Lion
  - High score/game over screen
- [ ] Record 30-second gameplay video (optional but recommended)

**Deliverables:**
- App icon in all required sizes
- Splash screen image
- 5-10 screenshots ready for stores
- Gameplay video (optional)

**End of Week 1: 65% Ready**

---

### Phase 2: Mobile Conversion (Week 2) - 65% → 80%

#### Day 6: Capacitor Setup
**Tasks:**
1. **Install Capacitor:**
   ```bash
   npm install @capacitor/core @capacitor/cli
   npm install @capacitor/ios @capacitor/android
   ```

2. **Initialize Capacitor:**
   ```bash
   npx cap init
   ```
   - App name: FlappySeal
   - App ID: com.yourname.flappyseal
   - Web dir: dist

3. **Add platforms:**
   ```bash
   npx cap add ios
   npx cap add android
   ```

4. **Configure capacitor.config.ts:**
   ```typescript
   import { CapacitorConfig } from '@capacitor/cli';

   const config: CapacitorConfig = {
     appId: 'com.yourname.flappyseal',
     appName: 'FlappySeal',
     webDir: 'dist',
     server: {
       androidScheme: 'https'
     },
     ios: {
       contentInset: 'always',
     },
     android: {
       buildOptions: {
         keystorePath: undefined, // Add later for release builds
       }
     }
   };

   export default config;
   ```

5. **First sync:**
   ```bash
   npm run build
   npx cap sync
   ```

**Deliverables:**
- Capacitor installed and configured
- iOS project in `/ios` folder
- Android project in `/android` folder

#### Day 7: iOS Configuration
**Tasks:**
1. **Install Xcode** (Mac required)
   - Download from Mac App Store
   - Install iOS simulators

2. **Open iOS project:**
   ```bash
   npx cap open ios
   ```

3. **Configure in Xcode:**
   - Set Bundle Identifier: com.yourname.flappyseal
   - Set Display Name: FlappySeal
   - Set Version: 1.0
   - Set Build: 1
   - Add app icons to Assets.xcassets
   - Configure Launch Screen with splash image
   - Set Deployment Target: iOS 13.0+
   - Set Supported Orientations: Portrait only (recommended)

4. **Configure Info.plist:**
   ```xml
   <key>UIRequiresFullScreen</key>
   <true/>
   <key>UIStatusBarStyle</key>
   <string>UIStatusBarStyleLightContent</string>
   ```

5. **Test in Simulator:**
   ```bash
   npx cap run ios
   ```
   - Select iPhone 14 or similar
   - Verify game loads
   - Test touch controls
   - Check audio playback

**Deliverables:**
- iOS app running in Simulator
- App icons and splash screen configured
- Basic functionality verified

#### Day 8: Android Configuration
**Tasks:**
1. **Install Android Studio**
   - Download from https://developer.android.com/studio
   - Install Android SDK and emulator

2. **Open Android project:**
   ```bash
   npx cap open android
   ```

3. **Configure in Android Studio:**
   - Set applicationId: com.yourname.flappyseal
   - Set versionName: 1.0
   - Set versionCode: 1
   - Add app icons to res/mipmap folders
   - Configure splash screen (res/drawable)
   - Set minSdkVersion: 22 (Android 5.1+)
   - Set targetSdkVersion: 34 (Android 14)

4. **Configure AndroidManifest.xml:**
   ```xml
   <application
     android:label="FlappySeal"
     android:icon="@mipmap/ic_launcher"
     android:roundIcon="@mipmap/ic_launcher_round"
     android:theme="@style/AppTheme"
     android:screenOrientation="portrait"
     android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale">
   </application>
   ```

5. **Test in Emulator:**
   ```bash
   npx cap run android
   ```
   - Select Pixel 5 or similar
   - Verify game loads
   - Test touch controls
   - Check audio playback

**Deliverables:**
- Android app running in Emulator
- App icons and splash screen configured
- Basic functionality verified

#### Day 9-10: Mobile Optimizations & Testing
**Tasks:**
- [ ] **Touch Control Optimization:**
  - Test tap zones (left/right split)
  - Ensure responsive touch feedback
  - Add haptic feedback (optional)

- [ ] **Performance Testing:**
  - Monitor FPS in debug mode
  - Check memory usage
  - Test on low-end emulators
  - Optimize if needed

- [ ] **Audio Testing:**
  - Test sound playback on mobile
  - Check volume levels
  - Handle audio interruptions (calls, notifications)
  - Test with device muted

- [ ] **Orientation Lock:**
  - Lock to portrait mode
  - Handle safe area insets (iPhone notch)
  - Test on various screen sizes

- [ ] **Physical Device Testing:**
  - iOS: Connect iPhone via USB, run from Xcode
  - Android: Enable USB debugging, run from Android Studio
  - Test real touch feel
  - Check performance on device
  - Test audio on speakers

**Deliverables:**
- Optimized touch controls
- 60 FPS on physical devices
- Audio working correctly
- No visual glitches

**End of Week 2: 80% Ready**

---

### Phase 3: Legal & Store Prep (Week 3) - 80% → 90%

#### Day 11-12: Legal Documents
**Tasks:**
1. **Privacy Policy:**
   - Use template generator: https://www.privacypolicygenerator.info/
   - Sections needed:
     - What data we collect (scores, preferences)
     - How we use it (improve game, analytics)
     - Third-party services (if using ads/analytics)
     - User rights (delete data, contact)
   - Host on: Google Sites, GitHub Pages, or your domain
   - URL needed for app stores

2. **Terms of Service:**
   - Use template: https://www.termsofservicegenerator.net/
   - Cover:
     - Age restrictions (COPPA compliance if under 13)
     - User conduct
     - Intellectual property
     - Disclaimer of warranties
   - Host alongside privacy policy

3. **Age Rating:**
   - Determine content rating (likely E for Everyone)
   - Fill out questionnaires:
     - iOS: In App Store Connect
     - Android: In Play Console
   - FlappySeal likely qualifies as E (Everyone) or 4+ (iOS)

**Deliverables:**
- Privacy policy live at URL
- Terms of service live at URL
- Age rating determined

#### Day 13: App Store Listings Setup
**Tasks:**
1. **App Store Connect (iOS):**
   - Log in: https://appstoreconnect.apple.com/
   - Create new app
   - Fill in metadata:
     - App name: FlappySeal
     - Subtitle: Ocean Adventure (30 chars)
     - Description: (Write compelling 4000 char description)
     - Keywords: seal, ocean, endless, flying, casual, arcade
     - Category: Games → Arcade
     - Age rating: 4+
   - Upload screenshots (required sizes):
     - 6.5" display (iPhone 14 Pro Max): 1284×2778
     - 5.5" display (iPhone 8 Plus): 1242×2208
   - Add privacy policy URL
   - Set price: Free

2. **Google Play Console (Android):**
   - Log in: https://play.google.com/console/
   - Create new app
   - Fill in metadata:
     - App name: FlappySeal
     - Short description: 80 chars max
     - Full description: 4000 chars max
     - Category: Games → Arcade
     - Content rating: Everyone
   - Upload screenshots:
     - Phone: 16:9 aspect ratio (1920×1080)
     - 7" tablet: (optional)
     - 10" tablet: (optional)
   - Add feature graphic: 1024×500
   - Add privacy policy URL
   - Set price: Free

**Deliverables:**
- App Store Connect listing drafted
- Play Console listing drafted
- All assets uploaded

#### Day 14: Analytics & Monitoring Setup
**Tasks:**
1. **Install Firebase (recommended for mobile):**
   ```bash
   npm install firebase @capacitor-firebase/analytics
   ```

2. **Configure Firebase:**
   - Create project: https://console.firebase.google.com/
   - Add iOS app (bundle ID: com.yourname.flappyseal)
   - Download GoogleService-Info.plist → add to iOS project
   - Add Android app (package name: com.yourname.flappyseal)
   - Download google-services.json → add to Android project

3. **Track key events:**
   ```typescript
   // In GameScene.ts
   import { FirebaseAnalytics } from '@capacitor-firebase/analytics';

   // Game start
   await FirebaseAnalytics.logEvent({
     name: 'game_start',
     params: { character: this.player.getType() }
   });

   // Game over
   await FirebaseAnalytics.logEvent({
     name: 'game_over',
     params: {
       score: this.scoreManager.getScore(),
       character: this.player.getType()
     }
   });
   ```

4. **Test analytics:**
   - Install app on device
   - Play a few games
   - Check Firebase Console for events (24hr delay)

**Deliverables:**
- Firebase integrated
- Analytics tracking 4-5 key events
- Verified in Firebase Console

**End of Week 3: 90% Ready**

---

### Phase 4: Beta Testing (Week 4) - 90% → 95%

#### Day 15-16: Beta Build Preparation
**Tasks:**
1. **iOS Beta Build:**
   - Open Xcode
   - Select "Any iOS Device (arm64)"
   - Product → Archive
   - Upload to App Store Connect
   - Configure TestFlight:
     - Set beta app description
     - Add what to test notes
     - Enable automatic distribution

2. **Android Beta Build:**
   - Open Android Studio
   - Build → Generate Signed Bundle/APK
   - Create keystore (save securely!)
   - Build App Bundle (.aab)
   - Upload to Play Console
   - Create Internal Testing track
   - Set up testers (email list)

3. **Disable Debug Mode:**
   ```typescript
   // In config/constants.ts
   export const DEBUG_CONFIG = {
     ENABLED: false,  // Disable for beta
     SHOW_FPS: false,
   };
   ```

4. **Version management:**
   - iOS: Version 1.0 (1)
   - Android: versionName "1.0", versionCode 1

**Deliverables:**
- iOS build uploaded to TestFlight
- Android build uploaded to Internal Testing
- Debug mode disabled
- Beta ready to distribute

#### Day 17: Recruit Beta Testers
**Tasks:**
- [ ] Recruit 10-20 testers:
  - Friends and family (5-10 people)
  - Reddit: r/androidapps, r/iosgaming (ask for testers)
  - Discord gaming communities
  - Twitter/X announcement
- [ ] Create tester instructions doc:
  - How to install (TestFlight/Play Store links)
  - What to test (all 3 characters, tutorial, unlock system)
  - How to report bugs (Google Form or email)
  - Timeline (1-2 weeks of testing)
- [ ] Share beta links:
  - iOS: TestFlight public link
  - Android: Add testers to Internal Testing

**Deliverables:**
- 10-20 beta testers recruited
- Testing instructions shared
- Beta links distributed

#### Day 18-21: Beta Testing Phase (4 days)
**Tasks:**
- [ ] Monitor Firebase Analytics daily
- [ ] Check for crashes (Firebase Crashlytics)
- [ ] Read tester feedback
- [ ] Respond to questions
- [ ] Keep bug list (Priority: Critical, High, Medium, Low)
- [ ] Daily check-ins with testers

**Key Metrics to Watch:**
- Crash rate (target: <1%)
- Tutorial completion rate (target: >70%)
- Average session length (target: >3 min)
- Character unlock rate (Otter: ~30%, Sea Lion: ~10%)
- Retention Day 1 (target: >40%)

**Deliverables:**
- Bug list compiled
- Analytics data reviewed
- Tester feedback collected

**End of Week 4: 95% Ready**

---

### Phase 5: Bug Fixes & Polish (Week 5) - 95% → 98%

#### Day 22-24: Critical Bug Fixes
**Tasks:**
- [ ] Fix all Critical priority bugs
- [ ] Fix all High priority bugs
- [ ] Address Medium priority bugs if time allows
- [ ] Test fixes thoroughly
- [ ] Update beta build (version 1.0.1)
- [ ] Re-test with beta testers

**Focus Areas:**
- Crash fixes (highest priority)
- Game-breaking bugs
- Tutorial issues
- Audio problems
- Performance issues

**Deliverables:**
- All critical bugs fixed
- Updated beta build (1.0.1)
- Re-tested by beta testers

#### Day 25-26: Final Polish
**Tasks:**
- [ ] Character balance adjustments (if needed)
- [ ] Unlock threshold tuning (if needed)
- [ ] Audio level balancing
- [ ] Visual polish (if needed)
- [ ] Performance optimizations
- [ ] Final QA pass

**Deliverables:**
- Polished game experience
- All systems working smoothly
- Beta testers satisfied

**End of Week 5: 98% Ready**

---

### Phase 6: Production Launch (Week 6) - 98% → 100%

#### Day 27-28: Production Build
**Tasks:**
1. **Final version bump:**
   - iOS: Version 1.0 (Production Build 1)
   - Android: versionName "1.0", versionCode 1

2. **Final build checklist:**
   - [ ] Debug mode disabled
   - [ ] All TODO comments removed or addressed
   - [ ] Analytics working
   - [ ] Privacy policy linked
   - [ ] All assets included
   - [ ] Performance targets met (60 FPS)
   - [ ] No console errors/warnings

3. **Build production versions:**
   - iOS: Archive and upload to App Store
   - Android: Generate signed App Bundle

4. **Store listing final review:**
   - Double-check all metadata
   - Verify screenshots look good
   - Test all links (privacy policy, support email)
   - Review app description for typos

**Deliverables:**
- Production builds uploaded
- Store listings finalized
- Pre-submission checklist complete

#### Day 29: Submit for Review
**Tasks:**
1. **iOS Submission:**
   - App Store Connect → Submit for Review
   - Answer questionnaires:
     - Export compliance: No
     - Content rights: Yes, I own all rights
     - Advertising identifier: No (if no ads)
   - Review time: 24-48 hours typically

2. **Android Submission:**
   - Play Console → Production track
   - Review release
   - Submit for review
   - Review time: Few hours to 1-2 days

3. **Prepare for launch:**
   - Draft social media posts
   - Prepare launch announcement
   - Plan marketing activities

**Deliverables:**
- Apps submitted to stores
- Awaiting approval
- Launch materials ready

#### Day 30+: Approval & Launch
**Tasks:**
- [ ] Monitor review status daily
- [ ] Respond to review questions (if any)
- [ ] Once approved:
  - Press "Release" button (if manual release)
  - Post social media announcements
  - Share on Reddit, Discord, Twitter
  - Email beta testers (thank you + launch news)
- [ ] Monitor:
  - Crash reports
  - User reviews
  - Analytics data
  - Download numbers

**Deliverables:**
- ✅ Apps live on App Store and Google Play
- ✅ Launch announcement posted
- ✅ 100% READY! 🎉

---

## Debug Mode Strategy (Mobile)

### Recommendation: **Secret Unlock Code**

Since you're going mobile-only, here's the best debug strategy:

**Production Builds (Public Release):**
```typescript
// In config/constants.ts
export const DEBUG_CONFIG = {
  ENABLED: false,           // Hidden from regular users
  SECRET_UNLOCK: true,      // Can be enabled via code
  UNLOCK_CODE: 'DEBUG2024', // Secret code
};
```

**How to Enable Debug in Production:**
```typescript
// In MenuScene.ts
create() {
  // Add secret tap counter
  let tapCount = 0;
  let tapTimer: any;

  // Tap version number 7 times to unlock debug
  const versionText = this.add.text(10, 10, 'v1.0', { fontSize: '12px' });
  versionText.setInteractive();

  versionText.on('pointerdown', () => {
    tapCount++;

    if (tapTimer) clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { tapCount = 0; }, 2000);

    if (tapCount >= 7) {
      localStorage.setItem('flappyseal_debug_enabled', 'true');
      this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        'Debug Mode Unlocked! Press D during gameplay',
        { fontSize: '20px', color: '#00ff00' }
      ).setOrigin(0.5);
      tapCount = 0;
    }
  });
}
```

**Benefits:**
- Regular users have clean UI
- Beta testers can enable debug easily
- YouTubers/streamers can showcase mechanics
- Support can ask users to enable for bug reports
- You can tune physics remotely by guiding users

---

## Monetization Strategy (Mobile-Only)

### Phase 1: Launch Free (Recommended)
- No ads initially
- Focus on user acquisition
- Gather 5-star reviews
- Build user base (target: 1,000+ downloads)

### Phase 2: Add Ads (Week 2-4 post-launch)
```bash
npm install @capacitor-community/admob
```

**Ad Placements:**
- Banner ad at bottom (during gameplay) OR
- Interstitial ad after game over (every 3-5 games)
- Rewarded video for extra life (optional)

**Expected Revenue:**
- eCPM: $0.50 - $2.00
- 1000 users × 10 sessions/day × 3 ads/session = 30,000 impressions/day
- Revenue: $15-60/day at scale

### Phase 3: Add IAP (Month 2-3)
**Options:**
- Remove Ads ($1.99)
- Unlock All Characters ($0.99)
- Pro Bundle ($2.99) - No ads + all characters + exclusive skins

**Expected Revenue:**
- Conversion rate: 2-5% of users
- 1000 users × 3% × $1.99 = $60/month

---

## Timeline Summary (Mobile-Only)

```
Week 1: Game Polish + Account Setup
  └─ Character balance, audio, assets, developer accounts

Week 2: Mobile Conversion
  └─ Capacitor setup, iOS/Android config, emulator testing

Week 3: Legal & Prep
  └─ Privacy policy, store listings, analytics setup

Week 4: Beta Testing
  └─ TestFlight/Play beta, recruit testers, gather feedback

Week 5: Bug Fixes & Polish
  └─ Fix critical bugs, performance optimization, final polish

Week 6: Production Launch
  └─ Submit to stores, await approval, LAUNCH! 🚀
```

**Total Time:** 6 weeks from today to live on both app stores

---

## Cost Breakdown

### Required Costs:
- Apple Developer Program: $99/year
- Google Play Developer: $25 one-time
- **Total: $124**

### Optional Costs:
- Domain for privacy policy: $10-15/year (or use free GitHub Pages)
- Icon design (if outsourced): $50-200 (or DIY with Figma)
- Sound effects (if custom): $100-500 (or use free Freesound.org)
- Paid marketing: $0-$500+ (optional)

**Minimum Budget: $124**

---

## Success Metrics (Mobile)

### Month 1 Targets:
- **Downloads:** 500-1,000
- **DAU:** 100-200
- **Retention Day 1:** >40%
- **Retention Day 7:** >20%
- **Average Session:** >3 minutes
- **Crash Rate:** <1%
- **App Store Rating:** >4.0 stars

### Month 3 Targets:
- **Downloads:** 5,000-10,000
- **DAU:** 1,000+
- **Retention Day 1:** >45%
- **Revenue:** $50-500/month (with ads)

### Month 6 Targets:
- **Downloads:** 25,000-50,000
- **DAU:** 5,000+
- **Revenue:** $500-2,000/month
- **App Store Rating:** >4.2 stars

---

## Critical Success Factors

1. **Tutorial Quality** ✅ (Already implemented!)
   - First impression is everything
   - Must be clear and quick (<2 minutes)

2. **Game Balance**
   - All 3 characters must feel fair
   - Unlock thresholds achievable (500, 1000)

3. **Performance**
   - Solid 60 FPS on mid-range devices
   - Fast app launch (<2 seconds)
   - No lag or stutter

4. **App Store Optimization (ASO)**
   - Great icon (stands out in search)
   - Compelling screenshots
   - Keyword optimization
   - Encourage 5-star reviews

5. **Post-Launch Support**
   - Respond to reviews
   - Fix bugs quickly
   - Regular updates (monthly)

---

## Next Steps (Immediate Actions)

### This Week:
1. ✅ **Sign up for developer accounts** ($124)
   - Apple Developer: https://developer.apple.com/programs/
   - Google Play Console: https://play.google.com/console/signup

2. ✅ **Test and balance characters**
   - Play 50+ games with each
   - Adjust if needed

3. ✅ **Source sound effects**
   - Find 5 free sounds on Freesound.org
   - Or create simple sounds

4. ✅ **Design app icon**
   - Use Figma or Canva
   - 1024×1024 base image

### Next Week:
5. **Install Capacitor**
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
   npx cap init
   npx cap add ios
   npx cap add android
   ```

6. **Test in simulators**
   - iOS Simulator (Xcode)
   - Android Emulator (Android Studio)

---

## Risk Mitigation

### High Risks:
1. **App Store Rejection**
   - *Mitigation:* Follow guidelines strictly, test thoroughly
   - *Backup:* Fix issues and resubmit (usually <48hrs)

2. **Performance Issues on Devices**
   - *Mitigation:* Test on physical devices early
   - *Backup:* Optimize rendering, reduce particles

3. **Poor Reviews at Launch**
   - *Mitigation:* Extensive beta testing, fix all critical bugs
   - *Backup:* Respond professionally, fix in updates

### Medium Risks:
4. **Low Download Numbers**
   - *Mitigation:* Strong ASO, social media marketing
   - *Backup:* Paid ads (small budget), influencer outreach

5. **Character Balance Issues**
   - *Mitigation:* Data-driven balancing during beta
   - *Backup:* Quick update with adjusted values

---

## Support Plan

### User Support Channels:
1. **Email:** support@flappyseal.com (or your email)
2. **In-App:** Feedback button → email or form
3. **App Store Reviews:** Respond to all reviews
4. **Reddit:** Create r/FlappySeal or use existing communities

### Support Response Time:
- Critical bugs: <24 hours
- General questions: <48 hours
- Feature requests: Acknowledge + add to roadmap

---

## Post-Launch Roadmap

### Update 1.1 (Month 1)
- Bug fixes from launch
- Performance optimizations
- Ad integration (if not in 1.0)

### Update 1.2 (Month 2)
- New character #4 (e.g., Dolphin)
- New game mode
- IAP for remove ads

### Update 1.3 (Month 3)
- Cosmetic skins system
- Daily challenges
- Leaderboards (online)

### Update 2.0 (Month 6)
- Multiplayer mode
- Seasonal events
- Battle pass system

---

**Ready to start?** Follow the weekly checklist and check off tasks as you go! 🚀

**End of Mobile-Only Launch Plan**
