// inspired by https://github.com/microsoft/rnx-kit/blob/main/packages/metro-serializer/src/index.ts
function MetroSerializer({ isChunkBundle } = {}) {
  const chunkCode = `var chunkGlobal = new Function('return this;')();!chunkGlobal.isChunk && (chunkGlobal.METRO_CHUNK_BUNDLE = ${isChunkBundle});`
  const baseJSBundle = require(`metro/src/DeltaBundler/Serializers/baseJSBundle`)
  const bundleToString = require(`metro/src/lib/bundleToString`)

  function customSerializer(entryPoint, prepend, graph, options) {
    for (const module of prepend) {
      const [output] = module.output
      output.data.code = `if(!chunkGlobal.isChunk){${output.data.code}}`
    }
    prepend[0].output[0].data.code = chunkCode + '' + prepend[0].output[0].data.code
    const bundle = baseJSBundle(entryPoint, prepend, graph, options)
    const bundleCode = bundleToString(bundle).code

    return Promise.resolve(bundleCode)
  }

  customSerializer.getRunModuleStatement = (moduleId) => `!chunkGlobal.isChunk && __r(${moduleId})`

  return customSerializer
}

module.exports = {
  MetroSerializer,
}
