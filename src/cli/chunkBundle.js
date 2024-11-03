const { chunks } = require('./chunks')
const { commonBundleCommandOptions } = require('./commonBundleCommandOptions')
const { info } = require('./logger')
const { metroBundle } = require('./metroBundle')

async function chunkBundle(argv, cliConfig, cliOptions) {
  await chunks(argv, cliConfig, cliOptions)
  const root = cliConfig.root

  info('Bundling main bundle')

  metroBundle({ isChunkBundle: true, root, ...cliOptions })
}

const chunkBundleCommand = {
  name: 'chunk-bundle',
  description: 'Bundle your JavaScript with chunks',
  func: chunkBundle,
  options: [...commonBundleCommandOptions],
}

module.exports = {
  chunkBundle,
  chunkBundleCommand,
}
