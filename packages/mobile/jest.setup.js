// Mock react-native-share-menu
jest.mock('react-native-share-menu', () => ({
  __esModule: true,
  default: {
    getInitialShare: jest.fn(),
    addNewShareListener: jest.fn(() => ({remove: jest.fn()})),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock fetch
global.fetch = jest.fn();
