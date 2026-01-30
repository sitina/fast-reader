/**
 * RSVP Engine Types
 */

export interface RSVPEngineOptions {
  wpm?: number;
  smartPauses?: boolean;
}

export interface RSVPEngineState {
  words: string[];
  currentIndex: number;
  wpm: number;
  smartPauses: boolean;
  isPlaying: boolean;
  isFinished: boolean;
}

export interface WordDisplay {
  word: string;
  leftPart: string;
  orpChar: string;
  rightPart: string;
  orpIndex: number;
}

export interface ProgressInfo {
  currentIndex: number;
  totalWords: number;
  percentage: number;
}

export type RSVPEventType =
  | 'word'
  | 'play'
  | 'pause'
  | 'finish'
  | 'navigate'
  | 'speedChange'
  | 'reset';

export interface RSVPEvent {
  type: RSVPEventType;
  state: RSVPEngineState;
  wordDisplay?: WordDisplay;
  progress?: ProgressInfo;
}

export type RSVPEventListener = (event: RSVPEvent) => void;
