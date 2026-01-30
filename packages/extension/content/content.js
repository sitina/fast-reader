// Content script for Fast Reader
// This file is injected into pages to help with text extraction

(function() {
  // Prevent multiple injections
  if (window.__fastReaderContentLoaded) return;
  window.__fastReaderContentLoaded = true;

  // Helper function to clean extracted text
  function cleanText(text) {
    return text
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/\n{3,}/g, '\n\n')  // Limit consecutive newlines
      .trim();
  }

  // Extract main content from the page
  function extractMainContent() {
    // Try Readability first (if available)
    if (typeof Readability !== 'undefined') {
      try {
        const documentClone = document.cloneNode(true);
        const reader = new Readability(documentClone);
        const article = reader.parse();
        if (article && article.textContent) {
          return cleanText(article.textContent);
        }
      } catch (e) {
        console.warn('Fast Reader: Readability extraction failed', e);
      }
    }

    // Fallback: Try to find main content area
    const mainSelectors = [
      'article',
      '[role="main"]',
      'main',
      '.post-content',
      '.article-content',
      '.entry-content',
      '.content',
      '#content'
    ];

    for (const selector of mainSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim().length > 200) {
        return cleanText(element.textContent);
      }
    }

    // Last resort: use body with cleanup
    const body = document.body;
    if (body) {
      const clone = body.cloneNode(true);
      // Remove non-content elements
      const removeSelectors = [
        'script', 'style', 'nav', 'header', 'footer', 'aside',
        '.sidebar', '.navigation', '.menu', '.comments', '.ads',
        '[role="navigation"]', '[role="banner"]', '[role="complementary"]'
      ];
      removeSelectors.forEach(selector => {
        clone.querySelectorAll(selector).forEach(el => el.remove());
      });
      return cleanText(clone.textContent);
    }

    return '';
  }

  // Extract selected text
  function extractSelection() {
    const selection = window.getSelection();
    return selection ? cleanText(selection.toString()) : '';
  }

  // Expose extraction functions globally
  window.__fastReaderExtract = {
    mainContent: extractMainContent,
    selection: extractSelection
  };
})();
