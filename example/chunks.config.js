module.exports = {
  outputDir: './.chunks',
  chunks: [
    {
      name: 'core',
      entryFile: 'src/core/index.ts',
      exclude: [
        { deps: true, pattern: '**/node_modules/react-native/**' },
        { deps: true, pattern: '**/node_modules/react/**' },
      ],
    },
    {
      name: 'node_modules_chunk',
      entryFile: 'node_modules_chunk.ts',
      include: ['**/node_modules_chunk.ts'],
      exclude: [
        '!**/node_modules/**',
        { deps: true, pattern: '**/node_modules/react-native/**' },
        { deps: true, pattern: '**/node_modules/react/**' },
      ],
    },
  ],
  bundle: {
    include: [
      { deps: true, pattern: '**/node_modules/react-native/**' },
      { deps: true, pattern: '**/node_modules/react/**' },
    ],
    exclude: [
      '**/node_modules/**', // node_modules_chunk loads all node_modules
    ],
  },
}
