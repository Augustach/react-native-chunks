const path = require('path')
const { spawnSync } = require('child_process')
const fs = require('fs')
const { getReactNativePackagePath } = require('./utils')
const { info } = require('./logger')

const hermesBundle = ({
  input,
  output,
  sourcemap,
  flags = ['-max-diagnostic-width=80', '-O', '-output-source-map', '-w', `-out=${output}`],
  command,
}) => {
  const cmd = command ?? `${getReactNativePackagePath()}/sdks/hermesc/${getHermesOSBin()}/hermesc`

  const args = ['-emit-binary', ...flags, input]

  const result = spawnSync(cmd, args, { stdio: 'inherit' })

  if (result.status !== 0) {
    throw result.error
  }

  const outputMap = output + '.map'
  if (sourcemap && args.includes('-output-source-map')) {
    const outputMap = output + '.map'
    info(`Combining source maps: ${sourcemap} + ${outputMap}`)
    const composeSourceMapsPath = getComposeSourceMapsPath()
    if (!composeSourceMapsPath) {
      throw new Error('react-native compose-source-maps.js scripts is not found')
    }
    const args = [composeSourceMapsPath, sourcemap, outputMap, '-o', sourcemap]
    spawnSync('node', args, { stdio: 'inherit' })
  }
  if (fs.existsSync(outputMap)) {
    fs.unlinkSync(outputMap)
  }
}

module.exports = {
  hermesBundle,
}

function getHermesOSBin() {
  switch (process.platform) {
    case 'win32':
      return 'win64-bin'
    case 'darwin':
      return 'osx-bin'
    case 'freebsd':
    case 'linux':
    case 'sunos':
    default:
      return 'linux64-bin'
  }
}

function getComposeSourceMapsPath() {
  // detect if compose-source-maps.js script exists
  const composeSourceMaps = path.join(getReactNativePackagePath(), 'scripts', 'compose-source-maps.js')
  if (fs.existsSync(composeSourceMaps)) {
    return composeSourceMaps
  }
  return null
}
