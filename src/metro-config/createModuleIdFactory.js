const path = require('path')
const { moduleId } = require('../cli/moduleId')

const root = process.cwd()

// https://github.com/facebook/metro/blob/ed84760a8db1afc1a938c6ef005365bcf68df554/packages/metro/src/lib/createModuleIdFactory.js#L14
const createCreateModuleIdFactory =
  ({ moduleIdMaxNumber } = {}) =>
  () => {
    const modules = {}
    const hashes = {}
    return (pathToFile) => {
      if (modules[pathToFile]) {
        return modules[pathToFile]
      }
      const id = moduleId(path.relative(root, pathToFile), moduleIdMaxNumber)
      if (hashes[id] && hashes[id] !== pathToFile) {
        throw new Error(`${pathToFile} collides with ${hashes[id]}`)
      }
      modules[pathToFile] = id
      hashes[id] = pathToFile
      return id
    }
  }

module.exports = createCreateModuleIdFactory
