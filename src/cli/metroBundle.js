const path = require('path')
const { spawnSync } = require('child_process')

const metroBundle = ({
  platform,
  entryFile,
  outputDir = '',
  dev = false,
  resetCache = true,
  bundleName = platform === 'android' ? 'index.android.bundle' : 'main.jsbundle',
  bundleOutput = path.join(outputDir, bundleName),
  assetsDest = outputDir,
  sourcemapOutputDir = '',
  sourcemapOutput = sourcemapOutputDir ? path.join(sourcemapOutputDir, `${bundleName}.map`) : null,
  isChunkBundle = false,
  chunkId,
  root,
  config,
  minify,
  verbose,
}) => {
  const env = {
    ...process.env,
    METRO_CHUNK_BUNDLE: isChunkBundle ? 'true' : 'false',
    CHUNK_ID: chunkId,
    CHUNK_ROOT: root,
  }
  const args = [
    'bundle',
    `--platform=${platform}`,
    `--entry-file=${entryFile}`,
    `--dev=${dev}`,
    `--bundle-output=${bundleOutput}`,
    sourcemapOutput && `--sourcemap-output=${sourcemapOutput}`,
    assetsDest && `--assets-dest=${assetsDest}`,
    resetCache && '--reset-cache',
    config && `--config=${config}`,
    `--minify=${minify}`,
    verbose && '--verbose',
  ].filter(Boolean)

  spawnSync(getCliPath(), args, { stdio: 'inherit', env })
}

function getCliPath() {
  return path.join('node_modules', '.bin', 'react-native')
}

module.exports = {
  metroBundle,
}
