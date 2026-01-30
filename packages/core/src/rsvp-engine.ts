/**
 * RSVP Engine - Core logic for Rapid Serial Visual Presentation
 * Extracted from the Chrome extension for cross-platform use
 */

import type {
  RSVPEngineOptions,
  RSVPEngineState,
  WordDisplay,
  ProgressInfo,
  RSVPEvent,
  RSVPEventType,
  RSVPEventListener,
} from './types';

export class RSVPEngine {
  private words: string[] = [];
  private currentIndex: number = 0;
  private wpm: number = 300;
  private smartPauses: boolean = true;
  private isPlaying: boolean = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<RSVPEventListener> = new Set();

  constructor(options: RSVPEngineOptions = {}) {
    if (options.wpm !== undefined) {
      this.wpm = Math.max(100, Math.min(800, options.wpm));
    }
    if (options.smartPauses !== undefined) {
      this.smartPauses = options.smartPauses;
    }
  }

  /**
   * Calculate the Optimal Recognition Point (ORP) for a word
   * ORP is approximately at 1/3 of the word, adjusted for length
   */
  calculateORP(word: string): number {
    const len = word.length;
    if (len <= 1) return 0;
    if (len <= 5) return Math.floor(len / 3);
    if (len <= 9) return Math.floor(len / 3);
    return Math.floor(len / 3) + 1;
  }

  /**
   * Tokenize text into words, preserving punctuation
   */
  tokenize(text: string): string[] {
    // Insert space after sentence-ending punctuation followed by uppercase letter
    // Handles: "ended.That" -> "ended. That"
    let normalized = text.replace(/([.!?])([A-Z])/g, '$1 $2');

    // Insert space after closing punctuation followed by letter
    // Handles: "(note)The" -> "(note) The"
    normalized = normalized.replace(/([)\]])([A-Za-z])/g, '$1 $2');

    // Split on em-dashes and double-hyphens
    // Handles: "word—another" and "word--another"
    normalized = normalized.replace(/—/g, ' ');
    normalized = normalized.replace(/--/g, ' ');

    // Split on whitespace, filter empty strings
    return normalized.split(/\s+/).filter((word) => word.length > 0);
  }

  /**
   * Calculate display time for a word based on length and punctuation
   */
  getWordDelay(word: string): number {
    const baseDelay = 60000 / this.wpm; // ms per word

    if (!this.smartPauses) {
      return baseDelay;
    }

    let multiplier = 1;

    // Longer words get more time
    if (word.length > 8) {
      multiplier += 0.3;
    } else if (word.length > 6) {
      multiplier += 0.15;
    }

    // Punctuation pauses
    const lastChar = word.slice(-1);
    if (['.', '!', '?'].includes(lastChar)) {
      multiplier += 0.5; // End of sentence
    } else if ([',', ';', ':'].includes(lastChar)) {
      multiplier += 0.25; // Clause break
    } else if (['"', "'", ')'].includes(lastChar)) {
      multiplier += 0.15;
    }

    // Paragraph indicators (usually after double newlines in source)
    if (word.includes('\n')) {
      multiplier += 0.3;
    }

    return baseDelay * multiplier;
  }

  /**
   * Get word display parts with ORP highlighting
   */
  getWordDisplay(word: string): WordDisplay {
    const orpIndex = this.calculateORP(word);
    return {
      word,
      leftPart: word.slice(0, orpIndex),
      orpChar: word.charAt(orpIndex),
      rightPart: word.slice(orpIndex + 1),
      orpIndex,
    };
  }

  /**
   * Get current progress information
   */
  getProgress(): ProgressInfo {
    return {
      currentIndex: this.currentIndex,
      totalWords: this.words.length,
      percentage:
        this.words.length > 0
          ? (this.currentIndex / this.words.length) * 100
          : 0,
    };
  }

  /**
   * Get current engine state
   */
  getState(): RSVPEngineState {
    return {
      words: [...this.words],
      currentIndex: this.currentIndex,
      wpm: this.wpm,
      smartPauses: this.smartPauses,
      isPlaying: this.isPlaying,
      isFinished: this.currentIndex >= this.words.length && this.words.length > 0,
    };
  }

  /**
   * Get current word display (or null if no words or finished)
   */
  getCurrentWordDisplay(): WordDisplay | null {
    if (this.words.length === 0 || this.currentIndex >= this.words.length) {
      return null;
    }
    return this.getWordDisplay(this.words[this.currentIndex]);
  }

  /**
   * Load text for reading
   */
  loadText(text: string): void {
    this.stop();
    this.words = this.tokenize(text);
    this.currentIndex = 0;
    this.emit('reset');
  }

  /**
   * Set reading speed (WPM)
   */
  setWPM(wpm: number): void {
    this.wpm = Math.max(100, Math.min(800, wpm));
    this.emit('speedChange');
  }

  /**
   * Get current WPM
   */
  getWPM(): number {
    return this.wpm;
  }

  /**
   * Set smart pauses on/off
   */
  setSmartPauses(enabled: boolean): void {
    this.smartPauses = enabled;
  }

  /**
   * Start playing
   */
  play(): void {
    if (this.isPlaying || this.words.length === 0) return;

    // If at the end, restart from beginning
    if (this.currentIndex >= this.words.length) {
      this.currentIndex = 0;
    }

    this.isPlaying = true;
    this.emit('play');
    this.scheduleNextWord();
  }

  /**
   * Pause playback
   */
  pause(): void {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.emit('pause');
  }

  /**
   * Stop playback (same as pause but more explicit)
   */
  stop(): void {
    this.pause();
  }

  /**
   * Toggle play/pause
   */
  togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Navigate forward or backward by delta words
   */
  navigate(delta: number): void {
    const wasPlaying = this.isPlaying;
    this.pause();

    this.currentIndex = Math.max(
      0,
      Math.min(this.words.length - 1, this.currentIndex + delta)
    );

    this.emit('navigate');

    if (wasPlaying) {
      this.play();
    }
  }

  /**
   * Jump to a specific word index
   */
  jumpTo(index: number): void {
    const wasPlaying = this.isPlaying;
    this.pause();

    this.currentIndex = Math.max(0, Math.min(this.words.length - 1, index));

    this.emit('navigate');

    if (wasPlaying) {
      this.play();
    }
  }

  /**
   * Jump to a percentage of progress (0-100)
   */
  jumpToPercentage(percentage: number): void {
    const index = Math.floor((percentage / 100) * this.words.length);
    this.jumpTo(index);
  }

  /**
   * Schedule the next word display
   */
  private scheduleNextWord(): void {
    if (!this.isPlaying || this.currentIndex >= this.words.length) {
      if (this.currentIndex >= this.words.length) {
        this.isPlaying = false;
        this.emit('finish');
      }
      return;
    }

    const word = this.words[this.currentIndex];
    const delay = this.getWordDelay(word);

    this.emit('word');

    this.timer = setTimeout(() => {
      this.currentIndex++;
      this.scheduleNextWord();
    }, delay);
  }

  /**
   * Subscribe to engine events
   */
  subscribe(listener: RSVPEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emit an event to all listeners
   */
  private emit(type: RSVPEventType): void {
    const event: RSVPEvent = {
      type,
      state: this.getState(),
      wordDisplay: this.getCurrentWordDisplay() ?? undefined,
      progress: this.getProgress(),
    };

    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (e) {
        console.error('Error in RSVP event listener:', e);
      }
    });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    this.listeners.clear();
    this.words = [];
  }
}
