import {useState, useEffect, useRef, useCallback} from 'react';
import {RSVPEngine, WordDisplay, ProgressInfo} from '@fast-reader/core';

interface UseRSVPEngineOptions {
  initialWPM?: number;
  smartPauses?: boolean;
  onFinish?: () => void;
}

interface UseRSVPEngineReturn {
  // State
  isPlaying: boolean;
  isFinished: boolean;
  currentWord: WordDisplay | null;
  progress: ProgressInfo;
  wpm: number;

  // Actions
  loadText: (text: string) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  navigate: (delta: number) => void;
  jumpTo: (index: number) => void;
  jumpToPercentage: (percentage: number) => void;
  setWPM: (wpm: number) => void;
  setSmartPauses: (enabled: boolean) => void;
  reset: () => void;
}

export function useRSVPEngine(
  options: UseRSVPEngineOptions = {},
): UseRSVPEngineReturn {
  const {initialWPM = 300, smartPauses = true, onFinish} = options;

  const engineRef = useRef<RSVPEngine | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentWord, setCurrentWord] = useState<WordDisplay | null>(null);
  const [progress, setProgress] = useState<ProgressInfo>({
    currentIndex: 0,
    totalWords: 0,
    percentage: 0,
  });
  const [wpm, setWPMState] = useState(initialWPM);

  // Initialize engine
  useEffect(() => {
    const engine = new RSVPEngine({wpm: initialWPM, smartPauses});
    engineRef.current = engine;

    const unsubscribe = engine.subscribe(event => {
      const state = event.state;
      setIsPlaying(state.isPlaying);
      setIsFinished(state.isFinished);
      setWPMState(state.wpm);

      if (event.wordDisplay) {
        setCurrentWord(event.wordDisplay);
      }

      if (event.progress) {
        setProgress(event.progress);
      }

      if (event.type === 'finish' && onFinish) {
        onFinish();
      }
    });

    return () => {
      unsubscribe();
      engine.destroy();
    };
  }, [initialWPM, smartPauses, onFinish]);

  const loadText = useCallback((text: string) => {
    engineRef.current?.loadText(text);
    setIsFinished(false);
    const wordDisplay = engineRef.current?.getCurrentWordDisplay();
    if (wordDisplay) {
      setCurrentWord(wordDisplay);
    }
    const progressInfo = engineRef.current?.getProgress();
    if (progressInfo) {
      setProgress(progressInfo);
    }
  }, []);

  const play = useCallback(() => {
    engineRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    engineRef.current?.togglePlay();
  }, []);

  const navigate = useCallback((delta: number) => {
    engineRef.current?.navigate(delta);
    setIsFinished(false);
  }, []);

  const jumpTo = useCallback((index: number) => {
    engineRef.current?.jumpTo(index);
    setIsFinished(false);
  }, []);

  const jumpToPercentage = useCallback((percentage: number) => {
    engineRef.current?.jumpToPercentage(percentage);
    setIsFinished(false);
  }, []);

  const setWPM = useCallback((newWPM: number) => {
    engineRef.current?.setWPM(newWPM);
    setWPMState(newWPM);
  }, []);

  const setSmartPauses = useCallback((enabled: boolean) => {
    engineRef.current?.setSmartPauses(enabled);
  }, []);

  const reset = useCallback(() => {
    engineRef.current?.jumpTo(0);
    setIsFinished(false);
  }, []);

  return {
    isPlaying,
    isFinished,
    currentWord,
    progress,
    wpm,
    loadText,
    play,
    pause,
    togglePlay,
    navigate,
    jumpTo,
    jumpToPercentage,
    setWPM,
    setSmartPauses,
    reset,
  };
}
