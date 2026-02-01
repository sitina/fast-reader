// Minimal React Native mock for unit tests
module.exports = {
  Platform: {
    OS: 'ios',
    select: jest.fn((objs) => objs.ios),
  },
  StyleSheet: {
    create: (styles) => styles,
    flatten: jest.fn((style) => style),
  },
  NativeModules: {},
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  TextInput: 'TextInput',
  Image: 'Image',
  ScrollView: 'ScrollView',
  Dimensions: {
    get: jest.fn(() => ({width: 375, height: 812})),
    addEventListener: jest.fn(() => ({remove: jest.fn()})),
    removeEventListener: jest.fn(),
  },
  Animated: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => ({})),
    })),
    timing: jest.fn(() => ({
      start: jest.fn((cb) => cb && cb()),
    })),
    spring: jest.fn(() => ({
      start: jest.fn((cb) => cb && cb()),
    })),
    createAnimatedComponent: (component) => component,
  },
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
    addEventListener: jest.fn(() => ({remove: jest.fn()})),
    removeEventListener: jest.fn(),
  },
};
