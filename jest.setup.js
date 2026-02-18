// Jest setup file
// jest-expo preset handles most mocking automatically

// Suppress act() warnings in tests
// These are common in async hook tests and not critical
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: An update to') ||
        args[0].includes('inside a test was not wrapped in act') ||
        args[0].includes('wrap-tests-with-act'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock localStorage for web platform tests
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
}));

jest.mock('firebase/auth', () => ({
  initializeAuth: jest.fn(() => ({})),
  getAuth: jest.fn(() => ({})),
  getReactNativePersistence: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(() => jest.fn()),
}));

// Mock Sentry (only if installed)
try {
  require.resolve('@sentry/react-native');
  jest.mock('@sentry/react-native', () => ({
    init: jest.fn(),
    wrap: jest.fn((component) => component),
    captureException: jest.fn(),
    captureMessage: jest.fn(),
    addBreadcrumb: jest.fn(),
    setUser: jest.fn(),
    setContext: jest.fn(),
    setExtra: jest.fn(),
    setTag: jest.fn(),
  }));
} catch {
  // @sentry/react-native not installed, skip mock
}
