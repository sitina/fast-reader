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
- Share articles from any app via Share Sheet / Intent
- EPUB book reader with progress saving
- Gesture controls: tap to play/pause, swipe to navigate

## Project Structure

This is a monorepo with three packages:

```
fast-reader/
├── packages/
│   ├── core/                    # Shared RSVP engine (TypeScript)
│   │   └── src/
│   │       ├── rsvp-engine.ts   # Core RSVP logic
│   │       └── types.ts         # TypeScript types
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
│       │   ├── hooks/           # Custom hooks
│       │   └── services/        # EPUB parser, etc.
│       ├── ios/                 # iOS native code
│       └── android/             # Android native code
│
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
```

## Privacy

Fast Reader does not collect, store, or transmit any personal data. See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for details.

## Source Code

This project is open source and available on GitHub: https://github.com/sitina/fast-reader

## License

MIT
