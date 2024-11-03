module.exports = {
  bundle: {
    include: [
      { deps: true, pattern: '**/node_modules/react-native/**' },
      '**/react-native-chunks/src/**',
      '<rootDir>/bootstrap.ts',
      '<rootDir>/index.js',
    ],
    exclude: ['**/*'],
  },
}
