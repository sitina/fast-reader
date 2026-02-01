# Fast Reader

Speed reading using RSVP (Rapid Serial Visual Presentation) with ORP (Optimal Recognition Point) alignment. Available as a Chrome extension and mobile app.

## Features

- **RSVP Display**: Shows words one at a time at a fixed position, eliminating eye movement
- **ORP Highlighting**: The optimal recognition point (~1/3 of each word) is highlighted in red and aligned to center
- **Adjustable Speed**: 100-800 WPM with default of 300 WPM
- **Smart Pauses**: Longer pauses for long words and after punctuation
- **Dark Theme**: Easy on the eyes for extended reading

## Platforms

### Chrome Extension
- Read full articles or selected text from any webpage
- Keyboard controls: Space (play/pause), arrows (navigate), Esc (close)

### Mobile App (iOS/Android)
- Share articles from any app via iOS Share Extension or Android Intent
- Automatic article extraction from shared URLs
- EPUB book reader with chapter navigation
- Reading speed persists across sessions
- Gesture controls: tap to play/pause, swipe to navigate

## Project Structure

This is a monorepo with three packages:

```
fast-reader/
├── packages/
│   ├── core/                    # Shared RSVP engine (TypeScript)
│   │   └── src/
│   │       ├── rsvp-engine.ts   # Core RSVP logic
│   │       ├── types.ts         # TypeScript types
│   │       └── __tests__/       # Unit tests (48 tests)
│   │
│   ├── extension/               # Chrome Extension
│   │   ├── manifest.json
│   │   ├── popup/               # Extension popup UI
│   │   ├── content/             # Content script
│   │   ├── reader/              # RSVP reader overlay
│   │   └── lib/                 # Libraries (Readability)
│   │
│   └── mobile/                  # React Native App
│       ├── src/
│       │   ├── screens/         # App screens
│       │   ├── components/      # UI components
│       │   ├── hooks/           # Custom hooks (useShareIntent, useSettings, etc.)
│       │   ├── services/        # EPUB parser, etc.
│       │   └── __tests__/       # Unit tests (26 tests)
│       ├── ios/
│       │   ├── FastReader/      # Main app
│       │   └── ShareExtension/  # iOS Share Extension
│       └── android/             # Android native code
│
├── patches/                     # pnpm patches for dependencies
├── package.json                 # Workspace root
└── pnpm-workspace.yaml
```

## Installation

### Chrome Extension

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the `packages/extension` folder
6. The extension icon will appear in your toolbar

### Mobile App

```bash
# Install dependencies
pnpm install

# Build core package
pnpm build:core

# iOS
cd packages/mobile
npx pod-install
pnpm ios

# Android
pnpm android
```

## Usage

### Chrome Extension

1. Navigate to any article or webpage
2. Click the Fast Reader extension icon
3. Adjust reading speed if desired (default: 300 WPM)
4. Click **Read This Page** to read the full article, or select text first and click **Read Selection**
5. Use controls or keyboard shortcuts during reading:
   - `Space` - Play/Pause
   - `←` / `→` - Previous/Next word
   - `Shift + ←` / `Shift + →` - Skip 10 words
   - `↑` / `↓` - Increase/Decrease speed
   - `Esc` - Close reader

### Mobile App

1. **Share from any app**: Use the share button in Safari, Chrome, or any app to send content to Fast Reader
2. **Import EPUB books**: Go to Library tab and tap "Import EPUB"
3. **Read**: Tap the display to play/pause, swipe left/right to navigate words

## Share Functionality

The mobile app can receive shared content (URLs and text) from other apps:

| Platform | Implementation | Details |
|----------|---------------|---------|
| **iOS** | Share Extension | Separate process in `ios/ShareExtension/` that communicates with main app via App Groups |
| **Android** | Intent Filter | Receives `ACTION_SEND` intents for `text/plain` content |

Both platforms use the same React Native code (`useShareIntent` hook) via `react-native-share-menu`, providing a unified API:
- When a URL is shared, the app fetches the article content and extracts readable text
- When plain text is shared, it's loaded directly into the reader

## How It Works

### RSVP (Rapid Serial Visual Presentation)
Words are displayed sequentially at a fixed location, eliminating the need for eye movements during reading. Research shows 30-40% improvement in reading speed for some users.

### ORP (Optimal Recognition Point)
The ORP is slightly left of center in each word - the point where the brain most efficiently deciphers letter combinations. This extension highlights the ORP letter in red and aligns all words on this point for optimal recognition.

## Scientific Background

- 30-40% reading speed improvement for patients with Friedrich's ataxia ([ARVO 2025](https://iovs.arvojournals.org/article.aspx?articleid=2808669))
- ~13% comprehension improvement for ADHD readers compared to traditional reading
- Beneficial for people with central vision loss
- Optimal speed range: 250-350 WPM for maintained comprehension

**Note**: Higher speeds (400+ WPM) may degrade comprehension. The default 300 WPM balances speed and understanding.

## Development

```bash
# Install dependencies
pnpm install

# Build core package
pnpm build:core

# Watch core package for changes
pnpm dev:core

# Run mobile app
pnpm mobile:start
pnpm mobile:ios
pnpm mobile:android

# Run tests
pnpm test              # Run all tests (74 total)
pnpm test:core         # Run core package tests (48 tests)
pnpm test:mobile       # Run mobile package tests (26 tests)
```

## Testing & Deployment

### Chrome Extension

**Local Testing:**
1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked** and select `packages/extension`
4. Test on various websites to ensure content extraction works
5. After making changes, click the refresh icon on the extension card

**Packaging for Chrome Web Store:**
```bash
# From repository root
./package.sh
```
This creates `fast-reader.zip` ready for Chrome Web Store submission.

**Chrome Web Store Submission:**
1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click "New Item" and upload `fast-reader.zip`
3. Fill in store listing details, screenshots, and privacy policy
4. Submit for review

### Mobile App

**iOS Simulator Testing:**
```bash
pnpm install
pnpm build:core
cd packages/mobile
npx pod-install
pnpm ios
```

**iOS Device Testing:**
1. Open `packages/mobile/ios/FastReader.xcworkspace` in Xcode
2. Select your development team in Signing & Capabilities
3. Connect your device and select it as the build target
4. Click Run (Cmd+R)

**Android Emulator Testing:**
```bash
pnpm install
pnpm build:core
cd packages/mobile
pnpm android
```

**Android Device Testing:**
1. Enable USB debugging on your Android device
2. Connect via USB and run `pnpm android`
3. Or generate an APK: `cd packages/mobile/android && ./gradlew assembleRelease`

**Share Extension Testing (iOS):**
1. Build and run the app on a device or simulator
2. Open Safari and navigate to any article
3. Tap the Share button and select "Fast Reader"
4. The app should open with the article content loaded

**Share Extension Testing (Android):**
1. Build and run the app on a device or emulator
2. Open Chrome and navigate to any article
3. Tap Share and select "Fast Reader"
4. The app should open with the article content loaded

**App Store Submission (iOS):**
1. Open Xcode and select Product > Archive
2. In the Organizer, click "Distribute App"
3. Follow the prompts to upload to App Store Connect
4. Complete app metadata in App Store Connect and submit for review

**Play Store Submission (Android):**
1. Generate a signed release bundle:
   ```bash
   cd packages/mobile/android
   ./gradlew bundleRelease
   ```
2. Upload the AAB from `app/build/outputs/bundle/release/` to Google Play Console
3. Complete store listing and submit for review

## Privacy

Fast Reader does not collect, store, or transmit any personal data. See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for details.

## Source Code

This project is open source and available on GitHub: https://github.com/sitina/fast-reader

## License

MIT
