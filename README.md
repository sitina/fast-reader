# Fast Reader

A Chrome extension for speed reading using RSVP (Rapid Serial Visual Presentation) with ORP (Optimal Recognition Point) alignment.

## Features

- **RSVP Display**: Shows words one at a time at a fixed position, eliminating eye movement
- **ORP Highlighting**: The optimal recognition point (~1/3 of each word) is highlighted in red and aligned to center
- **Adjustable Speed**: 100-800 WPM with default of 300 WPM
- **Smart Pauses**: Longer pauses for long words and after punctuation
- **Two Reading Modes**: Read full article or selected text
- **Keyboard Controls**: Space (play/pause), arrows (navigate), Esc (close)
- **Dark Theme**: Easy on the eyes for extended reading

## Installation

### From Source (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the `fast-reader` folder
6. The extension icon will appear in your toolbar

## Usage

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

## File Structure

```
fast-reader/
├── manifest.json         # Chrome extension manifest (V3)
├── popup/
│   ├── popup.html        # Extension popup UI
│   ├── popup.css         # Popup styles
│   └── popup.js          # Popup logic
├── content/
│   └── content.js        # Content script for text extraction
├── reader/
│   ├── reader.html       # Reader overlay (for testing)
│   ├── reader.css        # Reader styles
│   └── reader.js         # RSVP display engine
├── lib/
│   └── readability.js    # Mozilla Readability library
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## License

MIT
