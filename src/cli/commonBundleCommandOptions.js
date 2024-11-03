function asBoolean(value) {
  switch (value) {
    case 'false':
      return false
    case 'true':
      return true
    default:
      throw new Error(`Invalid boolean value: ${value}`)
  }
}

const commonBundleCommandOptions = [
  {
    name: '--chunk <chunk>',
    description: 'Target bundle definition; only needed when need to bundle a specific chunk',
  },
  {
    name: '--entry-file <path>',
    description: 'Path to the root JavaScript or TypeScript file, either absolute or relative to the package',
  },
  {
    name: '--platform <ios|android>',
    description: 'Target platform',
  },
  {
    name: '--dev [boolean]',
    description: 'If false, warnings are disabled and the bundle is minified',
    default: false,
    parse: asBoolean,
  },
  {
    name: '--minify [boolean]',
    description: 'Controls whether or not the bundle is minified (useful for test builds)',
    parse: asBoolean,
  },
  {
    name: '--bundle-output <string>',
    description: 'Path to the output bundle file, either absolute or relative to the package',
  },
  {
    name: '--sourcemap-output <string>',
    description: 'Path where the bundle source map is written, either absolute or relative to the package',
  },
  {
    name: '--sourcemap-sources-dir <string>',
    description: 'Path to use when relativizing file entries in the bundle source map',
  },
  {
    name: '--assets-dest <path>',
    description:
      'Path where bundle assets like images are written, either absolute or relative to the package; if unspecified, assets are ignored',
  },
  {
    name: '--reset-cache',
    description: 'Reset the Metro cache',
  },
  {
    name: '--config <string>',
    description: 'Path to the Metro configuration file',
  },
  {
    name: '--force [boolean]',
    description: 'Force bundling of chunks',
    default: false,
    parse: asBoolean,
  },
  {
    name: '--config-cmd <string>',
    description: 'Metro configuration command to run',
  },
  {
    name: '--skip-chunks [boolean]',
    description: 'Skip bundling chunks',
    default: false,
    parse: asBoolean,
  },
  {
    name: '--skip-assets [boolean]',
    description: 'Skip bundling assets',
    default: false,
    parse: asBoolean,
  },
]

module.exports = {
  commonBundleCommandOptions,
  asBoolean,
}
