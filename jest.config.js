module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@rn-primitives/.*|lucide-react-native|class-variance-authority)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/index.{ts,tsx}',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    'src/presentation/shared/ui/', // shadcn components are tested separately
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/src/presentation/$1',
    '^~/core/(.*)$': '<rootDir>/src/presentation/core/$1',
    '^~/shared/(.*)$': '<rootDir>/src/presentation/shared/$1',
    '^~/features/(.*)$': '<rootDir>/src/presentation/features/$1',
    '^~/lib/(.*)$': '<rootDir>/src/presentation/lib/$1',
    '^~/routes/(.*)$': '<rootDir>/src/presentation/routes/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
