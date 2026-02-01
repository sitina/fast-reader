import {renderHook, act, waitFor} from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSettings} from '../hooks/useSettings';

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;

describe('useSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
  });

  describe('initialization', () => {
    it('returns default settings initially', () => {
      const {result} = renderHook(() => useSettings());

      expect(result.current.settings).toEqual({
        wpm: 300,
        smartPauses: true,
      });
      expect(result.current.isLoading).toBe(true);
    });

    it('loads settings from AsyncStorage', async () => {
      mockGetItem.mockImplementation((key: string) => {
        if (key === '@fast-reader/wpm') return Promise.resolve('400');
        if (key === '@fast-reader/smartPauses') return Promise.resolve('false');
        return Promise.resolve(null);
      });

      const {result} = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings).toEqual({
        wpm: 400,
        smartPauses: false,
      });
    });

    it('uses defaults when AsyncStorage returns null', async () => {
      mockGetItem.mockResolvedValue(null);

      const {result} = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings).toEqual({
        wpm: 300,
        smartPauses: true,
      });
    });

    it('handles AsyncStorage errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockGetItem.mockRejectedValue(new Error('Storage error'));

      const {result} = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should use defaults on error
      expect(result.current.settings.wpm).toBe(300);
      consoleSpy.mockRestore();
    });
  });

  describe('updateWPM', () => {
    it('updates WPM in state', async () => {
      const {result} = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateWPM(450);
      });

      expect(result.current.settings.wpm).toBe(450);
    });

    it('persists WPM to AsyncStorage', async () => {
      const {result} = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateWPM(450);
      });

      expect(mockSetItem).toHaveBeenCalledWith('@fast-reader/wpm', '450');
    });

    it('clamps WPM to minimum 100', async () => {
      const {result} = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateWPM(50);
      });

      expect(result.current.settings.wpm).toBe(100);
      expect(mockSetItem).toHaveBeenCalledWith('@fast-reader/wpm', '100');
    });

    it('clamps WPM to maximum 800', async () => {
      const {result} = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateWPM(1000);
      });

      expect(result.current.settings.wpm).toBe(800);
      expect(mockSetItem).toHaveBeenCalledWith('@fast-reader/wpm', '800');
    });

    it('handles AsyncStorage errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockSetItem.mockRejectedValueOnce(new Error('Storage error'));

      const {result} = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should still update state even if save fails
      await act(async () => {
        await result.current.updateWPM(450);
      });

      expect(result.current.settings.wpm).toBe(450);
      consoleSpy.mockRestore();
    });
  });

  describe('updateSmartPauses', () => {
    it('updates smartPauses in state', async () => {
      const {result} = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateSmartPauses(false);
      });

      expect(result.current.settings.smartPauses).toBe(false);
    });

    it('persists smartPauses to AsyncStorage', async () => {
      const {result} = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateSmartPauses(false);
      });

      expect(mockSetItem).toHaveBeenCalledWith('@fast-reader/smartPauses', 'false');
    });

    it('can enable smartPauses', async () => {
      mockGetItem.mockImplementation((key: string) => {
        if (key === '@fast-reader/smartPauses') return Promise.resolve('false');
        return Promise.resolve(null);
      });

      const {result} = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.settings.smartPauses).toBe(false);
      });

      await act(async () => {
        await result.current.updateSmartPauses(true);
      });

      expect(result.current.settings.smartPauses).toBe(true);
      expect(mockSetItem).toHaveBeenCalledWith('@fast-reader/smartPauses', 'true');
    });
  });
});
