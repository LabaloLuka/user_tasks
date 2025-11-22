module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/e2e/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/**',
    '!src/app.js'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 30000 // 30 seconds for database operations
};

