import {useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  WPM: '@fast-reader/wpm',
  SMART_PAUSES: '@fast-reader/smartPauses',
};

export interface Settings {
  wpm: number;
  smartPauses: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  wpm: 300,
  smartPauses: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const [wpmStr, smartPausesStr] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.WPM),
          AsyncStorage.getItem(STORAGE_KEYS.SMART_PAUSES),
        ]);

        setSettings({
          wpm: wpmStr ? parseInt(wpmStr, 10) : DEFAULT_SETTINGS.wpm,
          smartPauses:
            smartPausesStr !== null
              ? smartPausesStr === 'true'
              : DEFAULT_SETTINGS.smartPauses,
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  const updateWPM = useCallback(async (wpm: number) => {
    const clampedWPM = Math.max(100, Math.min(800, wpm));
    setSettings(prev => ({...prev, wpm: clampedWPM}));
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WPM, clampedWPM.toString());
    } catch (error) {
      console.error('Failed to save WPM:', error);
    }
  }, []);

  const updateSmartPauses = useCallback(async (enabled: boolean) => {
    setSettings(prev => ({...prev, smartPauses: enabled}));
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SMART_PAUSES, enabled.toString());
    } catch (error) {
      console.error('Failed to save smart pauses setting:', error);
    }
  }, []);

  return {
    settings,
    isLoading,
    updateWPM,
    updateSmartPauses,
  };
}
