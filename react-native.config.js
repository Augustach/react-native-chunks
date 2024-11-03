const { chunkBundleCommand } = require('./src/cli/chunkBundle')
const { chunkCommand } = require('./src/cli/chunks')
const { chunksSoruceMapCommand } = require('./src/cli/composeSourceMaps')
const { chunkGetDependenciesCommand } = require('./src/cli/getDependencies')
const { calculateChangedDependenciesCommand } = require('./src/cli/calculateChangedDependencies')

module.exports = {
  commands: [
    chunkBundleCommand,
    chunkCommand,
    chunksSoruceMapCommand,
    chunkGetDependenciesCommand,
    calculateChangedDependenciesCommand,
  ],
}
