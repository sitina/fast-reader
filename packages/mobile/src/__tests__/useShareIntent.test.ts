import {renderHook, act, waitFor} from '@testing-library/react-native';
import ShareMenu from 'react-native-share-menu';
import {useShareIntent} from '../hooks/useShareIntent';

// Get mocked functions
const mockGetInitialShare = ShareMenu.getInitialShare as jest.Mock;
const mockAddNewShareListener = ShareMenu.addNewShareListener as jest.Mock;
const mockFetch = global.fetch as jest.Mock;

describe('useShareIntent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetInitialShare.mockImplementation(() => {});
    mockAddNewShareListener.mockReturnValue({remove: jest.fn()});
  });

  describe('initialization', () => {
    it('returns initial state', () => {
      const {result} = renderHook(() => useShareIntent());

      expect(result.current.sharedContent).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.clearSharedContent).toBe('function');
    });

    it('calls getInitialShare on mount', () => {
      renderHook(() => useShareIntent());

      expect(mockGetInitialShare).toHaveBeenCalledTimes(1);
      expect(mockGetInitialShare).toHaveBeenCalledWith(expect.any(Function));
    });

    it('adds new share listener on mount', () => {
      renderHook(() => useShareIntent());

      expect(mockAddNewShareListener).toHaveBeenCalledTimes(1);
    });

    it('removes listener on unmount', () => {
      const mockRemove = jest.fn();
      mockAddNewShareListener.mockReturnValue({remove: mockRemove});

      const {unmount} = renderHook(() => useShareIntent());
      unmount();

      expect(mockRemove).toHaveBeenCalledTimes(1);
    });
  });

  describe('handling plain text', () => {
    it('handles shared plain text', async () => {
      let shareHandler: ((item: any) => void) | null = null;
      mockGetInitialShare.mockImplementation((handler) => {
        shareHandler = handler;
      });

      const {result} = renderHook(() => useShareIntent());

      await act(async () => {
        shareHandler?.({mimeType: 'text/plain', data: 'Hello world'});
      });

      await waitFor(() => {
        expect(result.current.sharedContent).toEqual({
          text: 'Hello world',
          title: 'Shared Text',
          type: 'text',
        });
      });
    });

    it('ignores null share data', async () => {
      let shareHandler: ((item: any) => void) | null = null;
      mockGetInitialShare.mockImplementation((handler) => {
        shareHandler = handler;
      });

      const {result} = renderHook(() => useShareIntent());

      await act(async () => {
        shareHandler?.(null);
      });

      expect(result.current.sharedContent).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('ignores share data without data field', async () => {
      let shareHandler: ((item: any) => void) | null = null;
      mockGetInitialShare.mockImplementation((handler) => {
        shareHandler = handler;
      });

      const {result} = renderHook(() => useShareIntent());

      await act(async () => {
        shareHandler?.({mimeType: 'text/plain'});
      });

      expect(result.current.sharedContent).toBeNull();
    });
  });

  describe('handling URLs', () => {
    const mockHtmlResponse = `
      <!DOCTYPE html>
      <html>
      <head><title>Test Article</title></head>
      <body>
        <article>
          <p>This is the article content that is long enough to be extracted properly.
          It needs to be at least 100 characters to pass the validation check in the hook.</p>
        </article>
      </body>
      </html>
    `;

    it('fetches and extracts article content from URL', async () => {
      mockFetch.mockResolvedValueOnce({
        text: () => Promise.resolve(mockHtmlResponse),
      });

      let shareHandler: ((item: any) => void) | null = null;
      mockGetInitialShare.mockImplementation((handler) => {
        shareHandler = handler;
      });

      const {result} = renderHook(() => useShareIntent());

      await act(async () => {
        shareHandler?.({mimeType: 'text/plain', data: 'https://example.com/article'});
      });

      await waitFor(() => {
        expect(result.current.sharedContent?.type).toBe('url');
        expect(result.current.sharedContent?.title).toBe('Test Article');
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('https://example.com/article');
    });

    it('sets isLoading during URL fetch', async () => {
      let resolvePromise: (value: any) => void;
      mockFetch.mockReturnValueOnce(
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
      );

      let shareHandler: ((item: any) => void) | null = null;
      mockGetInitialShare.mockImplementation((handler) => {
        shareHandler = handler;
      });

      const {result} = renderHook(() => useShareIntent());

      act(() => {
        shareHandler?.({mimeType: 'text/plain', data: 'https://example.com'});
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!({text: () => Promise.resolve(mockHtmlResponse)});
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('falls back to URL as text when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      let shareHandler: ((item: any) => void) | null = null;
      mockGetInitialShare.mockImplementation((handler) => {
        shareHandler = handler;
      });

      const {result} = renderHook(() => useShareIntent());

      await act(async () => {
        shareHandler?.({mimeType: 'text/plain', data: 'https://example.com/article'});
      });

      await waitFor(() => {
        expect(result.current.sharedContent).toEqual({
          text: 'https://example.com/article',
          title: 'Shared Content',
          type: 'text',
        });
      });
    });

    it('falls back when article content is too short', async () => {
      mockFetch.mockResolvedValueOnce({
        text: () => Promise.resolve('<html><body><article>Short</article></body></html>'),
      });

      let shareHandler: ((item: any) => void) | null = null;
      mockGetInitialShare.mockImplementation((handler) => {
        shareHandler = handler;
      });

      const {result} = renderHook(() => useShareIntent());

      await act(async () => {
        shareHandler?.({mimeType: 'text/plain', data: 'https://example.com'});
      });

      await waitFor(() => {
        expect(result.current.sharedContent?.type).toBe('text');
        expect(result.current.sharedContent?.text).toBe('https://example.com');
      });
    });

    it('detects http:// URLs', async () => {
      mockFetch.mockResolvedValueOnce({
        text: () => Promise.resolve(mockHtmlResponse),
      });

      let shareHandler: ((item: any) => void) | null = null;
      mockGetInitialShare.mockImplementation((handler) => {
        shareHandler = handler;
      });

      const {result} = renderHook(() => useShareIntent());

      await act(async () => {
        shareHandler?.({mimeType: 'text/plain', data: 'http://example.com'});
      });

      await waitFor(() => {
        expect(result.current.sharedContent?.type).toBe('url');
      });

      expect(mockFetch).toHaveBeenCalledWith('http://example.com');
    });
  });

  describe('clearSharedContent', () => {
    it('clears shared content', async () => {
      let shareHandler: ((item: any) => void) | null = null;
      mockGetInitialShare.mockImplementation((handler) => {
        shareHandler = handler;
      });

      const {result} = renderHook(() => useShareIntent());

      await act(async () => {
        shareHandler?.({mimeType: 'text/plain', data: 'Test content'});
      });

      await waitFor(() => {
        expect(result.current.sharedContent).not.toBeNull();
      });

      act(() => {
        result.current.clearSharedContent();
      });

      expect(result.current.sharedContent).toBeNull();
    });
  });

  describe('new share listener', () => {
    it('handles shares while app is running', async () => {
      let newShareHandler: ((item: any) => void) | null = null;
      mockAddNewShareListener.mockImplementation((handler) => {
        newShareHandler = handler;
        return {remove: jest.fn()};
      });

      const {result} = renderHook(() => useShareIntent());

      await act(async () => {
        newShareHandler?.({mimeType: 'text/plain', data: 'New shared content'});
      });

      await waitFor(() => {
        expect(result.current.sharedContent).toEqual({
          text: 'New shared content',
          title: 'Shared Text',
          type: 'text',
        });
      });
    });
  });
});
