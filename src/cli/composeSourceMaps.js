const fs = require('fs')
const { SourceMapGenerator, SourceMapConsumer } = require('source-map')
const { commonBundleCommandOptions } = require('./commonBundleCommandOptions')
const { getOutputDir, makeSourcemapOutput } = require('./utils')
const { getChunksConfig } = require('./getChunksConfig')
const SourceMetadataMapConsumer = require('metro-symbolicate/src/SourceMetadataMapConsumer')
const GoogleIgnoreListConsumer = require('metro-symbolicate/src/GoogleIgnoreListConsumer')
const { info } = require('./logger')

async function composeSourceMaps(output, ...files) {
  const options = { encoding: 'utf-8' }
  const rawMaps = files.map((file) => JSON.parse(fs.readFileSync(file, options)))
  const consumers = rawMaps.map((rawMap) => new SourceMapConsumer(rawMap))
  const generator = new SourceMapGenerator({ file: 'combined.js' })

  for (let i = 0; i < consumers.length; i++) {
    const consumer = consumers[i]
    consumer.eachMapping((mapping) => {
      const original = findOriginalPosition(consumer, mapping.generatedLine, mapping.generatedColumn)
      generator.addMapping({
        generated: {
          line: i + 1,
          column: mapping.generatedColumn,
        },
        original:
          original.line != null
            ? {
                line: original.line,
                column: original.column,
              }
            : null,
        source: original.source,
        name: original.name,
      })
    })

    consumer.sources.forEach((source) => {
      const content = consumer.sourceContentFor(source)
      if (content) {
        generator.setSourceContent(source, content)
      }
    })
  }

  const composedMap = generator.toJSON()
  composedMap.x_facebook_sources = []
  composedMap.x_hermes_function_offsets = []
  composedMap.x_google_ignoreList = []

  for (let i = 0; i < consumers.length - 1; i++) {
    const rawMap = rawMaps[i]
    const metadataConsumer = new SourceMetadataMapConsumer(rawMap)
    composedMap.x_facebook_sources = composedMap.x_facebook_sources.concat(
      metadataConsumer.toArray(composedMap.sources)
    )

    composedMap.x_hermes_function_offsets = composedMap.x_hermes_function_offsets.concat(
      rawMap.x_hermes_function_offsets || []
    )

    const ignoreListConsumer = new GoogleIgnoreListConsumer(rawMap)
    composedMap.x_google_ignoreList = composedMap.x_google_ignoreList.concat(
      ignoreListConsumer.toArray(composedMap.sources)
    )
  }
  fs.writeFileSync(output, JSON.stringify(composedMap), options)
}

function composeSourceMapsCommand(_argv, cliConfig, cliOptions) {
  const config = getChunksConfig(cliConfig)
  const files = [cliOptions.bundleSourcemap]
  const platform = cliOptions.platform
  for (const chunkConfig of config.chunks) {
    const outputDir = getOutputDir(cliConfig.root, platform, chunkConfig)
    info(`Composing source maps for chunk "${chunkConfig.name}"`)
    const sourcemapOutput = makeSourcemapOutput(outputDir, cliOptions.platform)
    files.push(sourcemapOutput)
  }
  const bundleSourcemapOutput = cliOptions.bundleSourcemapOutput ?? cliOptions.bundleSourcemap
  composeSourceMaps(bundleSourcemapOutput, ...files)
}

function findOriginalPosition(consumer, generatedLine, generatedColumn) {
  let currentLine = generatedLine
  let currentColumn = generatedColumn
  let original = {
    line: null,
    column: null,
    source: null,
    name: null,
  }

  if (currentLine == null || currentColumn == null) {
    return { line: null, column: null, source: null, name: null }
  }
  original = consumer.originalPositionFor({
    line: currentLine,
    column: currentColumn,
  })

  currentLine = original.line
  currentColumn = original.column

  if (currentLine == null) {
    return {
      line: null,
      column: null,
      source: null,
      name: null,
    }
  }
  return original
}

const chunksSoruceMapCommand = {
  name: 'chunks-compose-sourcemaps',
  description: 'Compose source maps for chunks',
  func: composeSourceMapsCommand,
  options: [
    ...commonBundleCommandOptions,
    {
      name: '--bundle-sourcemap <string>',
      description: 'Path to the input/output source map file',
    },
    {
      name: '--bundle-sourcemap-output <string>',
      description: 'Path to the output source map file',
    },
  ],
}

module.exports = {
  composeSourceMaps,
  chunksSoruceMapCommand,
}
