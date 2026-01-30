document.addEventListener('DOMContentLoaded', async () => {
  const speedSlider = document.getElementById('speed-slider');
  const speedValue = document.getElementById('speed-value');
  const smartPauses = document.getElementById('smart-pauses');
  const readPageBtn = document.getElementById('read-page');
  const readSelectionBtn = document.getElementById('read-selection');
  const status = document.getElementById('status');

  // Load saved settings
  const settings = await chrome.storage.local.get({
    wpm: 300,
    smartPauses: true
  });

  speedSlider.value = settings.wpm;
  speedValue.textContent = settings.wpm;
  smartPauses.checked = settings.smartPauses;

  // Update speed display and save
  speedSlider.addEventListener('input', async () => {
    const wpm = parseInt(speedSlider.value);
    speedValue.textContent = wpm;
    await chrome.storage.local.set({ wpm });
  });

  // Save smart pauses setting
  smartPauses.addEventListener('change', async () => {
    await chrome.storage.local.set({ smartPauses: smartPauses.checked });
  });

  // Start reading the full page
  readPageBtn.addEventListener('click', async () => {
    await startReading('page');
  });

  // Start reading selection
  readSelectionBtn.addEventListener('click', async () => {
    await startReading('selection');
  });

  async function startReading(mode) {
    status.textContent = 'Extracting text...';
    status.className = 'status';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Inject the content script and libraries
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['lib/readability.js', 'content/content.js']
      });

      // Extract text based on mode
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractText,
        args: [mode]
      });

      const text = results[0]?.result;

      if (!text || text.trim().length === 0) {
        status.textContent = mode === 'selection'
          ? 'No text selected. Please select text first.'
          : 'Could not extract text from this page.';
        status.className = 'status error';
        return;
      }

      // Inject the reader
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['reader/reader.css']
      });

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['reader/reader.js']
      });

      // Start the reader with extracted text
      const currentSettings = await chrome.storage.local.get({
        wpm: 300,
        smartPauses: true
      });

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: initReader,
        args: [text, currentSettings.wpm, currentSettings.smartPauses]
      });

      // Close popup
      window.close();

    } catch (err) {
      console.error('Error:', err);
      status.textContent = 'Error: ' + err.message;
      status.className = 'status error';
    }
  }
});

// This function runs in the page context
function extractText(mode) {
  if (mode === 'selection') {
    const selection = window.getSelection();
    return selection.toString().trim();
  }

  // Try to use Readability if available
  if (typeof Readability !== 'undefined') {
    try {
      const documentClone = document.cloneNode(true);
      const reader = new Readability(documentClone);
      const article = reader.parse();
      if (article && article.textContent) {
        return article.textContent.trim();
      }
    } catch (e) {
      console.warn('Readability failed:', e);
    }
  }

  // Fallback: extract from body
  const body = document.body;
  if (body) {
    // Remove script and style content
    const clone = body.cloneNode(true);
    clone.querySelectorAll('script, style, nav, header, footer, aside').forEach(el => el.remove());
    return clone.textContent.trim().replace(/\s+/g, ' ');
  }

  return '';
}

// This function runs in the page context to initialize the reader
function initReader(text, wpm, smartPauses) {
  if (typeof window.FastReader !== 'undefined') {
    window.FastReader.start(text, wpm, smartPauses);
  }
}
