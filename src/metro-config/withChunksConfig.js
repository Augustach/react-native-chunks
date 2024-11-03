const path = require('path')
const { minimatch } = require('minimatch')
const createModuleIdFactory = require('./createModuleIdFactory')
const { getChunksConfig } = require('../cli/getChunksConfig')
const { getOutputDir } = require('../cli/utils')
const { MetroSerializer } = require('./MetroSerializer')

const chunkId = process.env.CHUNK_ID
const isChunkBundle = process.env.METRO_CHUNK_BUNDLE === 'true'
const root = process.env.CHUNK_ROOT ?? process.cwd()
const shouldReplaceChunkPath = isChunkBundle && process.env.SHOULD_REPLACE_CHUNK_PATH !== 'false'

const bootstraps = [
  { deps: false, pattern: '**/metro-runtime/src/polyfills/require.js' },
  { deps: false, pattern: '**/js/script/virtual' },
  { deps: false, pattern: '**/__prelude__' },
  { deps: false, pattern: '**/@babel/runtime/**' },
  { deps: false, pattern: 'require-/**' }, // https://github.com/facebook/metro/blob/4e5bd945f647b41a5e3151c3d9f5c3c597cba8ba/packages/metro/src/lib/getAppendScripts.js#L55
  { deps: true, pattern: '**/@react-native/js-polyfills/**' },
]

/**
 *
 * @param {import('metro-config').MetroConfig} config
 */
const serializeChunks = (config, chunksConfig, chunkId) => {
  const customSerializer = MetroSerializer({ isChunkBundle })
  let result = {
    ...config.serializer,
    getRunModuleStatement: customSerializer.getRunModuleStatement,
    customSerializer: customSerializer,
    createModuleIdFactory: createModuleIdFactory,
  }
  if (!isChunkBundle) {
    return result
  }
  const assetExts = config.resolver.assetExts ?? []
  const currentChunk = chunksConfig?.chunks?.find(({ name }) => name === chunkId)
  const excludedPathes = new Set()
  const includedPathes = new Set()

  let excluded = []
  let included = []
  if (currentChunk) {
    included = currentChunk.include
    excluded = [].concat(bootstraps, currentChunk.exclude)
  } else {
    // main bundle
    included = [].concat(bootstraps, chunksConfig.bundle.include)
    excluded = chunksConfig.bundle.exclude
  }

  const processModuleFilter = (module) => {
    if (includedPathes.has(module.path)) {
      for (const [_, dep] of module.dependencies) {
        includedPathes.add(dep.absolutePath)
      }
      return true
    }
    for (const { pattern, deps } of included) {
      if (minimatch(module.path, pattern)) {
        if (deps) {
          for (const [_, dep] of module.dependencies) {
            includedPathes.add(dep.absolutePath)
          }
        }
        return true
      }
    }
    if (excludedPathes.has(module.path)) {
      for (const [_, dep] of module.dependencies) {
        excludedPathes.add(dep.absolutePath)
      }
      return false
    }
    for (const { pattern, deps } of excluded) {
      if (minimatch(module.path, pattern)) {
        if (deps) {
          for (const [_, dep] of module.dependencies) {
            excludedPathes.add(dep.absolutePath)
          }
        }
        return false
      }
    }
    return true
  }

  // main bundle already includes all the polyfills
  if (currentChunk) {
    result = {
      ...result,
      getModulesRunBeforeMainModule: () => [],
      getPolyfills: () => [],
      polyfillModuleNames: [],
      processModuleFilter,
    }
  } else {
    result = {
      ...result,
      processModuleFilter: (module) => {
        if (assetExts.some((ext) => module.path.endsWith(ext))) {
          return true
        }
        return processModuleFilter(module)
      },
    }
  }

  return result
}

/**
 *
 * @param {import('metro-config').MetroConfig} config
 */
function withChunksConfig(config) {
  const chunksConfig = isChunkBundle ? getChunksConfig({ root }) : null

  return {
    ...config,
    resolver: {
      ...config.resolver,
      assetExts: [...config.resolver.assetExts, 'chunk'],
      resolveRequest: resolveRequest(config, chunksConfig, chunkId),
    },
    serializer: serializeChunks(config, chunksConfig, chunkId),
  }
}

const resolveRequest = (config, chunksConfig, currentChunk) => {
  if (!shouldReplaceChunkPath) {
    return config.resolver.resolveRequest
  }
  const replaceChunkPath = createReplaceChunkPath(chunksConfig, currentChunk)

  return (context, moduleName, platform) => {
    const resolveRequest = config.resolver?.resolveRequest ?? context.resolveRequest
    const module = resolveRequest(context, moduleName, platform)
    if (module.type === 'sourceFile') {
      return replaceChunkPath(module, platform)
    }
    return module
  }
}

function createReplaceChunkPath(chunksConfig, currentChunk) {
  const chunks = chunksConfig.chunks.filter(({ entryFile }) => entryFile !== currentChunk?.entryFile)
  const chunkRoots = Object.fromEntries(chunks.map((chunk) => [path.join(root, chunk.entryFile), chunk]))

  return (module, platform) => {
    const chunk = chunkRoots[module.filePath]

    if (chunk) {
      const outputDir = getOutputDir(root, platform, chunk)
      return {
        ...module,
        filePath: path.join(outputDir, `index.js`),
      }
    }

    return module
  }
}

module.exports = {
  withChunksConfig,
}
