import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  testMatch: ['**/tests/**/*.test.(ts|tsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { isolatedModules: true }],
  },

  transformIgnorePatterns: ['/node_modules/'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  setupFiles: ['<rootDir>/jest.setup.ts'], // 👈 thêm dòng này
};

export default config;
