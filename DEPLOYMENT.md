# Deployment Guide

## Quick Deploy Options (No Local Setup Required!)

### Option 1: Netlify (Recommended - Easiest)

1. **Fork/Clone the repo** to your GitHub account
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub account
5. Select the FlappySeal repository
6. Netlify will auto-detect the build settings from `netlify.toml`
7. Click "Deploy site"
8. **Done!** You'll get a live URL like: `https://flappyseal-xxxxx.netlify.app`

**Auto-deployment**: Every push to your branch automatically deploys!

### Option 2: Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect settings from `vercel.json`
5. Click "Deploy"
6. **Done!** Live URL provided instantly

### Option 3: GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select branch: `claude/seal-game-web-setup-011CUrGG4Uf61BSmU8oZhHEZ`
4. Click Save
5. Build will run automatically
6. **Done!** URL: `https://[username].github.io/FlappySeal`

### Option 4: CodeSandbox (Instant Preview)

1. Go to [codesandbox.io](https://codesandbox.io)
2. Import from GitHub
3. Paste repository URL
4. **Done!** Edit and preview in browser

## Local Development

If you want to run locally:

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Mobile App Conversion (Future)

When ready to convert to iOS/Android:

### Install Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init
```

### Build and Add Platforms
```bash
npm run build
npx cap add ios
npx cap add android
```

### Open in Native IDEs
```bash
# iOS (requires Mac with Xcode)
npx cap open ios

# Android (requires Android Studio)
npx cap open android
```

### Sync Changes
```bash
npm run build
npx cap sync
```

## Environment Requirements

**Local Development**:
- Node.js 18+
- npm/yarn/pnpm

**iOS Build**:
- macOS
- Xcode 14+
- iOS Developer Account (for App Store)

**Android Build**:
- Android Studio
- Java Development Kit (JDK) 11+
- Google Play Developer Account (for Play Store)

## Performance Tips

**Web**:
- Vite automatically optimizes builds
- Use `npm run build` for production
- All assets are bundled and minified

**Mobile**:
- Capacitor wraps your web app in native WebView
- Performance is similar to native apps
- Can access native APIs when needed

## Current Status

✅ **Ready to deploy to web** right now!
⏳ **Mobile conversion** available when game is complete
🎮 **Hello world demo** is live and playable

## Recommended Workflow

1. **Deploy to Netlify/Vercel** now to get live URL
2. **Continue development** on feature branch
3. **Auto-deploys** happen on every push
4. **Share URL** with testers/stakeholders
5. **Convert to mobile** when web version is polished

No need to run anything locally if you don't want to - just push to GitHub and connect to a hosting service!
