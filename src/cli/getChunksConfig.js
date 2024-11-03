const fs = require('fs')
const path = require('path')

const requireChunksConfig = ({ root }) => {
  const files = ['chunks.config.js', 'chunks.config.json']

  for (const file of files) {
    const configPath = path.join(root, file)
    if (fs.existsSync(configPath)) {
      return require(configPath)
    }
  }

  throw new Error(`No chunks config found in ${root}. Expected one of: ${files.join(', ')}`)
}

function getChunksConfig({ root }) {
  let chunksConfig = requireChunksConfig({ root })

  if (!chunksConfig) {
    chunksConfig = {
      chunks: [],
      bundle: {
        include: [],
        exclude: [],
      },
    }
  }

  chunksConfig.chunks = chunksConfig.chunks ?? []

  chunksConfig.bundle = {
    ...chunksConfig.bundle,
    include: (chunksConfig.bundle.include ?? []).flat().map(toPattern(root)),
    exclude: (chunksConfig.bundle.exclude ?? []).flat().map(toPattern(root)),
  }

  chunksConfig.chunks = chunksConfig.chunks.map((chunk, index) => ({
    ...chunk,
    include: (chunk.include ?? []).flat().map(toPattern(root)),
    exclude: (chunk.exclude ?? []).flat().map(toPattern(root)),
    outputDir: chunk.outputDir ?? chunksConfig.outputDir,
    sourcemapOrder: index,
  }))

  return chunksConfig
}

const toPattern = (root) => (pattern) => {
  const config = typeof pattern === 'string' ? { deps: false, pattern } : { deps: false, ...pattern }
  config.pattern = config.pattern.replace('<rootDir>', root)
  return config
}

module.exports = {
  getChunksConfig,
}
