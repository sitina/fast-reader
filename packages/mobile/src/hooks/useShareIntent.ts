import {useState, useEffect, useCallback} from 'react';
import {Platform, Linking} from 'react-native';

export interface SharedContent {
  text: string;
  title?: string;
  type: 'text' | 'url';
}

interface UseShareIntentReturn {
  sharedContent: SharedContent | null;
  isLoading: boolean;
  clearSharedContent: () => void;
}

// Simple HTML stripper for extracting text from URLs
function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract article text (simplified)
async function fetchArticleText(url: string): Promise<{text: string; title: string}> {
  try {
    const response = await fetch(url);
    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? stripHtml(titleMatch[1]) : 'Shared Article';

    // Try to find article content
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    const contentMatch = html.match(/class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);

    let content = articleMatch?.[1] || mainMatch?.[1] || contentMatch?.[1] || '';

    if (!content) {
      // Fallback: get body content
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      content = bodyMatch?.[1] || html;
    }

    const text = stripHtml(content);

    if (text.length < 100) {
      throw new Error('Could not extract article content');
    }

    return {text, title};
  } catch (error) {
    throw new Error('Failed to fetch article content');
  }
}

export function useShareIntent(): UseShareIntentReturn {
  const [sharedContent, setSharedContent] = useState<SharedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Handle initial URL (app opened via share)
    const handleInitialUrl = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          await handleSharedData(initialUrl);
        }
      } catch (error) {
        console.error('Error handling initial URL:', error);
      }
    };

    // Handle URL while app is running
    const handleUrlEvent = ({url}: {url: string}) => {
      handleSharedData(url);
    };

    handleInitialUrl();
    const subscription = Linking.addEventListener('url', handleUrlEvent);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleSharedData = async (data: string) => {
    setIsLoading(true);
    try {
      // Check if it's a URL
      const isUrl = data.startsWith('http://') || data.startsWith('https://');

      if (isUrl) {
        const {text, title} = await fetchArticleText(data);
        setSharedContent({text, title, type: 'url'});
      } else {
        // Plain text
        setSharedContent({
          text: data,
          title: 'Shared Text',
          type: 'text',
        });
      }
    } catch (error) {
      console.error('Error processing shared content:', error);
      // If URL fetch fails, still show the URL as text
      setSharedContent({
        text: data,
        title: 'Shared Content',
        type: 'text',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearSharedContent = useCallback(() => {
    setSharedContent(null);
  }, []);

  // Note: Full share intent integration requires native setup
  // For iOS: react-native-share-menu with Share Extension
  // For Android: Intent filters in AndroidManifest.xml
  // This hook provides the basic structure and URL handling

  return {
    sharedContent,
    isLoading,
    clearSharedContent,
  };
}
