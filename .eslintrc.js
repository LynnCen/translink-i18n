module.exports = {
  extends: ['./tools/eslint-config'],
  ignorePatterns: [
    'dist',
    'node_modules',
    '.turbo',
    'coverage',
    '*.d.ts',
  ],
};
