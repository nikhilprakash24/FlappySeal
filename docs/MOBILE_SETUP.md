# Mobile Build Setup (v0.2)

Complete guide for building FlappySeal for iOS and Android using Capacitor.

---

## Prerequisites

### Required Software

**Node.js & npm**:
```bash
node --version  # v18+ required
npm --version   # v9+ required
```

**Capacitor CLI**:
```bash
npm install -g @capacitor/cli
```

**iOS Build** (macOS only):
- Xcode 14+ (from Mac App Store)
- CocoaPods: `sudo gem install cocoapods`
- iOS Developer Account

**Android Build**:
- Android Studio (latest version)
- JDK 11+
- Android SDK 33+

---

## Installation Steps

### 1. Install Capacitor

```bash
# In project root
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npm install @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard
```

### 2. Initialize Capacitor

Already configured in `capacitor.config.ts`. If starting fresh:

```bash
npx cap init
```

### 3. Build Web Assets

```bash
npm run build
```

This creates the `dist/` folder with optimized game files.

### 4. Add Platforms

**iOS**:
```bash
npx cap add ios
```

**Android**:
```bash
npx cap add android
```

### 5. Sync Assets

After every web build, sync to native projects:

```bash
npx cap sync
```

---

## iOS Build

### Open in Xcode

```bash
npx cap open ios
```

### Configuration Steps

1. **Select Team**:
   - In Xcode, select project → Signing & Capabilities
   - Choose your Apple Developer team

2. **Bundle Identifier**:
   - Set to: `com.flappyseal.game`
   - Must match App Store Connect

3. **App Icons**:
   - Assets.xcassets → AppIcon
   - Provide icons for all sizes (1024×1024 required)

4. **Splash Screen**:
   - Already configured via Capacitor plugin
   - Customize in `capacitor.config.ts`

5. **Permissions** (Info.plist):
   ```xml
   <key>NSPhotoLibraryUsageDescription</key>
   <string>To save game screenshots</string>
   ```

### Build & Run

**Simulator**:
- Select iPhone simulator from device dropdown
- Press ⌘R to run

**Device**:
- Connect iPhone via USB
- Select device from dropdown
- Trust computer on device if prompted
- Press ⌘R to build and install

### Archive for App Store

1. Product → Archive
2. Distribute App → App Store Connect
3. Upload build
4. Wait for processing (~15 mins)
5. Submit for review in App Store Connect

---

## Android Build

### Open in Android Studio

```bash
npx cap open android
```

### Configuration Steps

1. **Package Name**:
   - `build.gradle` → applicationId: "com.flappyseal.game"

2. **Version**:
   - versionCode: 1 (increment with each release)
   - versionName: "0.2.0"

3. **App Icons**:
   - res/mipmap-* folders
   - Use Android Asset Studio for generation

4. **Splash Screen**:
   - Configured via Capacitor
   - Edit colors in `capacitor.config.ts`

5. **Permissions** (AndroidManifest.xml):
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.VIBRATE" />
   ```

### Build & Run

**Emulator**:
- AVD Manager → Create Virtual Device
- Select Pixel 5 or similar
- API Level 33+
- Click Run ▶️

**Device**:
- Enable Developer Options on device
- Enable USB Debugging
- Connect via USB
- Click Run ▶️

### Generate Signed APK/AAB

1. **Generate Keystore** (first time only):
   ```bash
   keytool -genkey -v -keystore flappyseal-release.keystore \\
     -alias flappyseal -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure Signing**:
   - android/app/build.gradle:
   ```gradle
   android {
     signingConfigs {
       release {
         storeFile file('flappyseal-release.keystore')
         storePassword 'your-password'
         keyAlias 'flappyseal'
         keyPassword 'your-password'
       }
     }
     buildTypes {
       release {
         signingConfig signingConfigs.release
       }
     }
   }
   ```

3. **Build Release**:
   ```bash
   cd android
   ./gradlew assembleRelease  # For APK
   ./gradlew bundleRelease    # For AAB (Google Play)
   ```

4. **Output Location**:
   - APK: `android/app/build/outputs/apk/release/`
   - AAB: `android/app/build/outputs/bundle/release/`

---

## Testing Checklist

### Functionality
- [ ] Touch controls work properly
- [ ] No keyboard issues (should be disabled in game)
- [ ] Audio plays correctly
- [ ] Game saves progress
- [ ] No crashes on suspend/resume
- [ ] Proper back button handling (Android)

### Performance
- [ ] 60fps on target devices
- [ ] No memory leaks (play for 10+ minutes)
- [ ] Battery usage acceptable (<5% per hour)
- [ ] Quick load times (<2 seconds)

### UI/UX
- [ ] Safe areas respected (notch, status bar)
- [ ] Proper orientation lock (landscape/portrait)
- [ ] Touch targets appropriately sized (44×44 minimum)
- [ ] No UI cutoffs or overlaps

### Devices to Test

**iOS**:
- iPhone SE (2020) - minimum spec
- iPhone 13/14 - current gen
- iPad - tablet layout

**Android**:
- Samsung Galaxy A series - mid-range
- Pixel 4a/5 - pure Android
- Samsung S23 - high-end

---

## Troubleshooting

### iOS Build Fails

**"Xcode not found"**:
```bash
sudo xcode-select --switch /Applications/Xcode.app
```

**"Provisioning profile error"**:
- Xcode → Preferences → Accounts
- Download Manual Profiles

**"Pod install failed"**:
```bash
cd ios/App
pod repo update
pod install
```

### Android Build Fails

**"SDK not found"**:
- Android Studio → SDK Manager
- Install Android SDK 33+

**"Gradle build failed"**:
```bash
cd android
./gradlew clean
./gradlew build
```

**"AAPT2 error"**:
```gradle
// In android/gradle.properties
android.enableAapt2=false
```

---

## Performance Optimization

See `PERFORMANCE_OPTIMIZATION.md` for detailed strategies.

**Quick Wins**:
1. Enable production build: `npm run build`
2. Use texture atlases (reduce draw calls)
3. Object pooling (already implemented)
4. Limit particles on low-end devices
5. Reduce audio quality for mobile

---

## App Store Submission

### iOS App Store

**Requirements**:
- App icons (all sizes)
- Screenshots (6.5" and 5.5" displays)
- App description (max 4000 characters)
- Keywords (max 100 characters)
- Privacy policy URL
- Age rating

**Timeline**:
- Review time: 24-48 hours
- Rejections: Common first time
- Appeals: 1-2 days

### Google Play Store

**Requirements**:
- Feature graphic (1024×500)
- Screenshots (min 2, max 8)
- App description (max 4000 characters)
- Privacy policy URL
- Content rating questionnaire

**Timeline**:
- Review time: Usually same day
- Staged rollout recommended (10% → 50% → 100%)

---

## Update Workflow

1. **Make changes to web code**
2. **Bump version**:
   - package.json: version
   - iOS: CFBundleShortVersionString
   - Android: versionCode, versionName

3. **Build**:
   ```bash
   npm run build
   npx cap sync
   ```

4. **Test**:
   - Open native IDE
   - Test on simulators/emulators
   - Test on physical devices

5. **Submit**:
   - Archive/build signed release
   - Upload to stores
   - Submit for review

---

## Continuous Integration (Optional)

Use GitHub Actions or similar for automated builds:

```yaml
# .github/workflows/mobile-build.yml
name: Mobile Build
on: [push]
jobs:
  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run build
      - run: npx cap sync ios
      # Additional steps for signing and upload

  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run build
      - run: npx cap sync android
      # Additional steps for signing and upload
```

---

## Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design for Android](https://material.io/design)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)

---

*Last Updated: v0.2 Development - November 2025*
