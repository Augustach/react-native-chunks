const path = require('path')

function getReactNativePackagePath() {
  return path.join('node_modules', 'react-native')
}

const getSanitizedName = (name) => name.replace(/[^a-zA-Z0-9]/g, '_')

const PLATFORMS = ['android', 'ios']

const getOutputDir = (root, platform, chunkConfig) => {
  const sanitizedName = getSanitizedName(chunkConfig.name)
  const pathToModule = path.dirname(chunkConfig.entryFile)
  let outputDir = chunkConfig.outputDir
  if (!outputDir) {
    outputDir = path.join(root, pathToModule, '.chunk', platform)
  } else {
    outputDir = path.join(outputDir, platform, sanitizedName)
  }
  if (!path.isAbsolute(outputDir)) {
    outputDir = path.join(root, outputDir)
  }

  return outputDir
}

const makeBundleName = (outputDir) => path.join(outputDir, `index.chunk`)

const makeSourcemapOutput = (outputDir) => `${makeBundleName(outputDir)}.sourcemap`

module.exports = {
  PLATFORMS,
  makeBundleName,
  makeSourcemapOutput,
  getSanitizedName,
  getOutputDir,
  getReactNativePackagePath,
}
