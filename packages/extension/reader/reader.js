// Fast Reader - RSVP Engine
(function() {
  // Prevent multiple initializations
  if (window.FastReader) return;

  class FastReaderEngine {
    constructor() {
      this.words = [];
      this.currentIndex = 0;
      this.wpm = 300;
      this.smartPauses = true;
      this.isPlaying = false;
      this.timer = null;
      this.overlay = null;
    }

    /**
     * Calculate the Optimal Recognition Point (ORP) for a word
     * ORP is approximately at 1/3 of the word, adjusted for length
     */
    calculateORP(word) {
      const len = word.length;
      if (len <= 1) return 0;
      if (len <= 5) return Math.floor(len / 3);
      if (len <= 9) return Math.floor(len / 3);
      return Math.floor(len / 3) + 1;
    }

    /**
     * Tokenize text into words, preserving punctuation
     */
    tokenize(text) {
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
      return normalized.split(/\s+/).filter(word => word.length > 0);
    }

    /**
     * Calculate display time for a word based on length and punctuation
     */
    getWordDelay(word) {
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
     * Create the reader overlay UI
     */
    createOverlay() {
      // Remove existing overlay if any
      this.removeOverlay();

      const overlay = document.createElement('div');
      overlay.id = 'fast-reader-overlay';
      overlay.innerHTML = `
        <div id="fast-reader-header">
          <span id="fast-reader-title">Fast Reader</span>
          <button id="fast-reader-close">&times;</button>
        </div>

        <div id="fast-reader-display">
          <div id="fast-reader-guides">
            <div id="fast-reader-vertical-line"></div>
            <div id="fast-reader-horizontal-line"></div>
          </div>

          <div id="fast-reader-word-container">
            <div id="fast-reader-word">
              <span class="left"></span><span class="orp"></span><span class="right"></span>
            </div>
          </div>

          <div id="fast-reader-finished">
            <h2>Finished!</h2>
            <p id="fast-reader-stats"></p>
            <button class="fast-reader-btn primary" id="fast-reader-restart">Read Again</button>
          </div>

          <div id="fast-reader-progress-container">
            <div id="fast-reader-progress">
              <div id="fast-reader-progress-bar"></div>
            </div>
            <div id="fast-reader-progress-text">0 / 0 words</div>
          </div>

          <div id="fast-reader-hints">
            <span class="fast-reader-hint"><kbd>Space</kbd> Play/Pause</span>
            <span class="fast-reader-hint"><kbd>&larr;</kbd> Back</span>
            <span class="fast-reader-hint"><kbd>&rarr;</kbd> Forward</span>
            <span class="fast-reader-hint"><kbd>Esc</kbd> Close</span>
          </div>
        </div>

        <div id="fast-reader-controls">
          <button class="fast-reader-btn" id="fast-reader-back-10">&laquo; 10</button>
          <button class="fast-reader-btn" id="fast-reader-back">&larr;</button>
          <button class="fast-reader-btn primary" id="fast-reader-play">Play</button>
          <button class="fast-reader-btn" id="fast-reader-forward">&rarr;</button>
          <button class="fast-reader-btn" id="fast-reader-forward-10">10 &raquo;</button>

          <div id="fast-reader-speed-control">
            <label>Speed:</label>
            <input type="range" id="fast-reader-speed-slider" min="100" max="800" value="${this.wpm}" step="25">
            <span id="fast-reader-speed-value">${this.wpm} WPM</span>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      this.overlay = overlay;

      this.bindEvents();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
      // Close button
      document.getElementById('fast-reader-close').addEventListener('click', () => {
        this.stop();
        this.removeOverlay();
      });

      // Play/Pause
      document.getElementById('fast-reader-play').addEventListener('click', () => {
        this.togglePlay();
      });

      // Navigation
      document.getElementById('fast-reader-back').addEventListener('click', () => {
        this.navigate(-1);
      });

      document.getElementById('fast-reader-forward').addEventListener('click', () => {
        this.navigate(1);
      });

      document.getElementById('fast-reader-back-10').addEventListener('click', () => {
        this.navigate(-10);
      });

      document.getElementById('fast-reader-forward-10').addEventListener('click', () => {
        this.navigate(10);
      });

      // Speed slider
      const speedSlider = document.getElementById('fast-reader-speed-slider');
      const speedValue = document.getElementById('fast-reader-speed-value');

      speedSlider.addEventListener('input', () => {
        this.wpm = parseInt(speedSlider.value);
        speedValue.textContent = `${this.wpm} WPM`;
        // Save to storage
        chrome.storage.local.set({ wpm: this.wpm });
      });

      // Restart button
      document.getElementById('fast-reader-restart').addEventListener('click', () => {
        this.overlay.classList.remove('finished');
        this.currentIndex = 0;
        this.displayWord();
        this.play();
      });

      // Keyboard shortcuts
      document.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeydown(e) {
      if (!this.overlay) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          this.togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.navigate(e.shiftKey ? -10 : -1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.navigate(e.shiftKey ? 10 : 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.adjustSpeed(25);
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.adjustSpeed(-25);
          break;
        case 'Escape':
          e.preventDefault();
          this.stop();
          this.removeOverlay();
          break;
      }
    }

    /**
     * Adjust reading speed
     */
    adjustSpeed(delta) {
      const slider = document.getElementById('fast-reader-speed-slider');
      const newValue = Math.max(100, Math.min(800, this.wpm + delta));
      this.wpm = newValue;
      slider.value = newValue;
      document.getElementById('fast-reader-speed-value').textContent = `${newValue} WPM`;
      chrome.storage.local.set({ wpm: newValue });
    }

    /**
     * Display the current word with ORP highlighting
     */
    displayWord() {
      if (this.currentIndex >= this.words.length) {
        this.finish();
        return;
      }

      const word = this.words[this.currentIndex];
      const orpIndex = this.calculateORP(word);

      const leftPart = word.slice(0, orpIndex);
      const orpChar = word.charAt(orpIndex);
      const rightPart = word.slice(orpIndex + 1);

      const wordEl = document.getElementById('fast-reader-word');
      wordEl.querySelector('.left').textContent = leftPart;
      wordEl.querySelector('.orp').textContent = orpChar;
      wordEl.querySelector('.right').textContent = rightPart;

      // Position the word so ORP aligns with center
      // Calculate offset based on left part width
      const charWidth = 38.4; // Approximate width per character at 64px font
      const offset = leftPart.length * charWidth + (charWidth / 2);
      wordEl.style.left = `calc(50% - ${offset}px)`;

      // Update progress
      this.updateProgress();
    }

    /**
     * Update progress bar and text
     */
    updateProgress() {
      const progress = (this.currentIndex / this.words.length) * 100;
      document.getElementById('fast-reader-progress-bar').style.width = `${progress}%`;
      document.getElementById('fast-reader-progress-text').textContent =
        `${this.currentIndex + 1} / ${this.words.length} words`;
    }

    /**
     * Navigate forward or backward
     */
    navigate(delta) {
      this.currentIndex = Math.max(0, Math.min(this.words.length - 1, this.currentIndex + delta));
      this.displayWord();

      // If finished, go back to reading mode
      if (this.overlay.classList.contains('finished')) {
        this.overlay.classList.remove('finished');
      }
    }

    /**
     * Toggle play/pause
     */
    togglePlay() {
      if (this.isPlaying) {
        this.pause();
      } else {
        // If at the end, restart
        if (this.currentIndex >= this.words.length) {
          this.currentIndex = 0;
          this.overlay.classList.remove('finished');
        }
        this.play();
      }
    }

    /**
     * Start playing
     */
    play() {
      if (this.isPlaying) return;

      this.isPlaying = true;
      document.getElementById('fast-reader-play').textContent = 'Pause';
      this.scheduleNextWord();
    }

    /**
     * Pause playback
     */
    pause() {
      this.isPlaying = false;
      document.getElementById('fast-reader-play').textContent = 'Play';
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }

    /**
     * Stop playback
     */
    stop() {
      this.pause();
      document.removeEventListener('keydown', this.handleKeydown);
    }

    /**
     * Schedule the next word display
     */
    scheduleNextWord() {
      if (!this.isPlaying || this.currentIndex >= this.words.length) {
        if (this.currentIndex >= this.words.length) {
          this.finish();
        }
        return;
      }

      const word = this.words[this.currentIndex];
      const delay = this.getWordDelay(word);

      this.displayWord();

      this.timer = setTimeout(() => {
        this.currentIndex++;
        this.scheduleNextWord();
      }, delay);
    }

    /**
     * Handle completion
     */
    finish() {
      this.pause();
      this.overlay.classList.add('finished');

      // Show stats
      const totalWords = this.words.length;
      const avgWPM = this.wpm;
      const estimatedMinutes = Math.round(totalWords / avgWPM);

      document.getElementById('fast-reader-stats').textContent =
        `${totalWords} words at ~${avgWPM} WPM`;
    }

    /**
     * Remove the overlay
     */
    removeOverlay() {
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
      }
      document.removeEventListener('keydown', this.handleKeydown);
    }

    /**
     * Start reading with given text
     */
    start(text, wpm = 300, smartPauses = true) {
      this.words = this.tokenize(text);
      this.currentIndex = 0;
      this.wpm = wpm;
      this.smartPauses = smartPauses;

      if (this.words.length === 0) {
        alert('No text to read!');
        return;
      }

      this.createOverlay();
      this.displayWord();

      // Auto-play after a brief delay
      setTimeout(() => {
        this.play();
      }, 500);
    }
  }

  // Create global instance
  window.FastReader = new FastReaderEngine();
})();
