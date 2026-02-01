import {RSVPEngine} from '../rsvp-engine';

describe('RSVPEngine', () => {
  let engine: RSVPEngine;

  beforeEach(() => {
    engine = new RSVPEngine();
    jest.useFakeTimers();
  });

  afterEach(() => {
    engine.destroy();
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('uses default values when no options provided', () => {
      const state = engine.getState();
      expect(state.wpm).toBe(300);
      expect(state.smartPauses).toBe(true);
    });

    it('accepts custom WPM', () => {
      const customEngine = new RSVPEngine({wpm: 400});
      expect(customEngine.getState().wpm).toBe(400);
      customEngine.destroy();
    });

    it('clamps WPM to valid range (100-800)', () => {
      const lowEngine = new RSVPEngine({wpm: 50});
      expect(lowEngine.getState().wpm).toBe(100);
      lowEngine.destroy();

      const highEngine = new RSVPEngine({wpm: 1000});
      expect(highEngine.getState().wpm).toBe(800);
      highEngine.destroy();
    });

    it('accepts smartPauses option', () => {
      const noSmartPauses = new RSVPEngine({smartPauses: false});
      expect(noSmartPauses.getState().smartPauses).toBe(false);
      noSmartPauses.destroy();
    });
  });

  describe('calculateORP', () => {
    it('returns 0 for single character words', () => {
      expect(engine.calculateORP('I')).toBe(0);
      expect(engine.calculateORP('a')).toBe(0);
    });

    it('returns approximately 1/3 position for short words', () => {
      expect(engine.calculateORP('the')).toBe(1); // 3/3 = 1
      expect(engine.calculateORP('word')).toBe(1); // 4/3 = 1
      expect(engine.calculateORP('hello')).toBe(1); // 5/3 = 1
    });

    it('returns approximately 1/3 position for medium words', () => {
      expect(engine.calculateORP('reading')).toBe(2); // 7/3 = 2
      expect(engine.calculateORP('something')).toBe(3); // 9/3 = 3
    });

    it('adds 1 for long words (>9 chars)', () => {
      expect(engine.calculateORP('programming')).toBe(4); // 11/3 + 1 = 4
      expect(engine.calculateORP('understanding')).toBe(5); // 13/3 + 1 = 5
    });
  });

  describe('tokenize', () => {
    it('splits text on whitespace', () => {
      expect(engine.tokenize('hello world')).toEqual(['hello', 'world']);
      expect(engine.tokenize('one  two   three')).toEqual(['one', 'two', 'three']);
    });

    it('handles tabs and newlines', () => {
      expect(engine.tokenize('hello\tworld\ntest')).toEqual(['hello', 'world', 'test']);
    });

    it('filters empty strings', () => {
      expect(engine.tokenize('  hello   ')).toEqual(['hello']);
    });

    it('inserts space after sentence-ending punctuation followed by uppercase', () => {
      expect(engine.tokenize('ended.That')).toEqual(['ended.', 'That']);
      expect(engine.tokenize('done!What')).toEqual(['done!', 'What']);
      expect(engine.tokenize('really?Yes')).toEqual(['really?', 'Yes']);
    });

    it('inserts space after closing parenthesis/bracket followed by letter', () => {
      expect(engine.tokenize('(note)The')).toEqual(['(note)', 'The']);
      expect(engine.tokenize('[ref]see')).toEqual(['[ref]', 'see']);
    });

    it('splits on em-dashes', () => {
      expect(engine.tokenize('word—another')).toEqual(['word', 'another']);
    });

    it('splits on double hyphens', () => {
      expect(engine.tokenize('word--another')).toEqual(['word', 'another']);
    });

    it('preserves punctuation attached to words', () => {
      expect(engine.tokenize('Hello, world!')).toEqual(['Hello,', 'world!']);
    });
  });

  describe('getWordDelay', () => {
    it('returns base delay at 300 WPM', () => {
      const delay = engine.getWordDelay('test');
      expect(delay).toBe(200); // 60000 / 300 = 200ms
    });

    it('increases delay for sentence-ending punctuation', () => {
      const baseDelay = engine.getWordDelay('test');
      const periodDelay = engine.getWordDelay('test.');
      expect(periodDelay).toBeGreaterThan(baseDelay);
      expect(periodDelay).toBe(baseDelay * 1.5);
    });

    it('increases delay for clause-breaking punctuation', () => {
      const baseDelay = engine.getWordDelay('test');
      const commaDelay = engine.getWordDelay('test,');
      expect(commaDelay).toBeGreaterThan(baseDelay);
      expect(commaDelay).toBe(baseDelay * 1.25);
    });

    it('increases delay for long words (>8 chars)', () => {
      const shortDelay = engine.getWordDelay('test');
      const longDelay = engine.getWordDelay('programming');
      expect(longDelay).toBeGreaterThan(shortDelay);
    });

    it('returns base delay when smartPauses disabled', () => {
      const noSmartEngine = new RSVPEngine({smartPauses: false});
      const baseDelay = 60000 / 300;
      expect(noSmartEngine.getWordDelay('test.')).toBe(baseDelay);
      expect(noSmartEngine.getWordDelay('verylongword')).toBe(baseDelay);
      noSmartEngine.destroy();
    });
  });

  describe('getWordDisplay', () => {
    it('returns correct parts for short words', () => {
      const display = engine.getWordDisplay('the');
      expect(display.word).toBe('the');
      expect(display.leftPart).toBe('t');
      expect(display.orpChar).toBe('h');
      expect(display.rightPart).toBe('e');
      expect(display.orpIndex).toBe(1);
    });

    it('returns correct parts for longer words', () => {
      const display = engine.getWordDisplay('reading');
      expect(display.word).toBe('reading');
      expect(display.leftPart).toBe('re');
      expect(display.orpChar).toBe('a');
      expect(display.rightPart).toBe('ding');
      expect(display.orpIndex).toBe(2);
    });
  });

  describe('loadText', () => {
    it('tokenizes and stores words', () => {
      engine.loadText('Hello world test');
      const state = engine.getState();
      expect(state.words).toEqual(['Hello', 'world', 'test']);
      expect(state.currentIndex).toBe(0);
    });

    it('resets to beginning', () => {
      engine.loadText('first text');
      engine.jumpTo(1);
      engine.loadText('new text');
      expect(engine.getState().currentIndex).toBe(0);
    });

    it('stops playback when loading new text', () => {
      engine.loadText('first text');
      engine.play();
      expect(engine.getState().isPlaying).toBe(true);
      engine.loadText('new text');
      expect(engine.getState().isPlaying).toBe(false);
    });
  });

  describe('setWPM', () => {
    it('updates WPM', () => {
      engine.setWPM(400);
      expect(engine.getWPM()).toBe(400);
    });

    it('clamps to minimum 100', () => {
      engine.setWPM(50);
      expect(engine.getWPM()).toBe(100);
    });

    it('clamps to maximum 800', () => {
      engine.setWPM(1000);
      expect(engine.getWPM()).toBe(800);
    });
  });

  describe('play/pause/togglePlay', () => {
    beforeEach(() => {
      engine.loadText('one two three');
    });

    it('starts playing', () => {
      engine.play();
      expect(engine.getState().isPlaying).toBe(true);
    });

    it('pauses playback', () => {
      engine.play();
      engine.pause();
      expect(engine.getState().isPlaying).toBe(false);
    });

    it('toggles between play and pause', () => {
      engine.togglePlay();
      expect(engine.getState().isPlaying).toBe(true);
      engine.togglePlay();
      expect(engine.getState().isPlaying).toBe(false);
    });

    it('does not play if no words loaded', () => {
      const emptyEngine = new RSVPEngine();
      emptyEngine.play();
      expect(emptyEngine.getState().isPlaying).toBe(false);
      emptyEngine.destroy();
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      engine.loadText('one two three four five');
    });

    it('navigates forward', () => {
      engine.navigate(2);
      expect(engine.getState().currentIndex).toBe(2);
    });

    it('navigates backward', () => {
      engine.jumpTo(3);
      engine.navigate(-2);
      expect(engine.getState().currentIndex).toBe(1);
    });

    it('clamps to valid range', () => {
      engine.navigate(-10);
      expect(engine.getState().currentIndex).toBe(0);

      engine.navigate(100);
      expect(engine.getState().currentIndex).toBe(4); // last index
    });

    it('jumpTo sets exact index', () => {
      engine.jumpTo(3);
      expect(engine.getState().currentIndex).toBe(3);
    });

    it('jumpToPercentage calculates correct index', () => {
      engine.jumpToPercentage(50);
      expect(engine.getState().currentIndex).toBe(2); // 50% of 5 = index 2
    });
  });

  describe('getProgress', () => {
    it('returns correct progress info', () => {
      engine.loadText('one two three four');
      engine.jumpTo(2);

      const progress = engine.getProgress();
      expect(progress.currentIndex).toBe(2);
      expect(progress.totalWords).toBe(4);
      expect(progress.percentage).toBe(50);
    });

    it('returns 0 percentage for empty text', () => {
      const progress = engine.getProgress();
      expect(progress.percentage).toBe(0);
    });
  });

  describe('events', () => {
    it('emits events to subscribers', () => {
      const listener = jest.fn();
      engine.subscribe(listener);

      engine.loadText('hello world');
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({type: 'reset'}),
      );
    });

    it('unsubscribe removes listener', () => {
      const listener = jest.fn();
      const unsubscribe = engine.subscribe(listener);

      unsubscribe();
      engine.loadText('hello world');
      expect(listener).not.toHaveBeenCalled();
    });

    it('emits word events during playback', () => {
      const listener = jest.fn();
      engine.subscribe(listener);
      engine.loadText('one two');

      listener.mockClear();
      engine.play();

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({type: 'play'}),
      );
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({type: 'word'}),
      );
    });

    it('emits finish event when playback ends', () => {
      const listener = jest.fn();
      engine.subscribe(listener);
      engine.loadText('one');

      engine.play();
      jest.advanceTimersByTime(300); // Advance past word delay

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({type: 'finish'}),
      );
    });
  });

  describe('getCurrentWordDisplay', () => {
    it('returns null when no words loaded', () => {
      expect(engine.getCurrentWordDisplay()).toBeNull();
    });

    it('returns word display for current word', () => {
      engine.loadText('hello world');
      const display = engine.getCurrentWordDisplay();
      expect(display?.word).toBe('hello');
    });

    it('returns null when finished (via playback)', () => {
      engine.loadText('one');
      engine.play();
      jest.advanceTimersByTime(500); // Advance past the word to finish
      expect(engine.getState().isFinished).toBe(true);
      expect(engine.getCurrentWordDisplay()).toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops playback and clears listeners', () => {
      const listener = jest.fn();
      engine.subscribe(listener);
      engine.loadText('hello world');
      engine.play();

      engine.destroy();

      expect(engine.getState().isPlaying).toBe(false);
      expect(engine.getState().words).toEqual([]);
    });
  });
});
