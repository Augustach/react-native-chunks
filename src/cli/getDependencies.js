const path = require('path')
const { spawnSync } = require('child_process')
const { commonBundleCommandOptions } = require('./commonBundleCommandOptions')

const getDependencies = ({ platform, entryFile, chunkId, root }) => {
  const args = ['get-dependencies', `--platform=${platform}`, `--entry-file=${entryFile}`]
  const env = {
    ...process.env,
    METRO_CHUNK_BUNDLE: String(true),
    CHUNK_ID: chunkId,
    CHUNK_ROOT: root,
    SHOULD_REPLACE_CHUNK_PATH: String(!chunkId),
  }

  const result = spawnSync(getMetroPath(), args, { encoding: 'utf-8', env })

  return result.stdout.split('\n').filter(Boolean)
}

function getMetroPath() {
  return path.join('node_modules', '.bin', 'metro')
}

function getDependenciesCommand(_argv, cliConfig, cliOptions) {
  const platform = cliOptions.platform
  const entryFile = cliOptions.entryFile
  const chunkId = cliOptions.chunk
  const root = cliConfig.root
  const dependencies = getDependencies({ platform, entryFile, chunkId, root })
  for (const dependency of dependencies) {
    console.log(dependency)
  }
}

const chunkGetDependenciesCommand = {
  name: 'chunk-dependencies',
  description: 'Get dependencies for a chunk or main bundle',
  func: getDependenciesCommand,
  options: commonBundleCommandOptions,
}

module.exports = {
  getDependencies,
  chunkGetDependenciesCommand,
}
