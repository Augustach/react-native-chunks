const path = require('path')
const { moduleId } = require('../cli/moduleId')

const root = process.cwd()

// https://github.com/facebook/metro/blob/ed84760a8db1afc1a938c6ef005365bcf68df554/packages/metro/src/lib/createModuleIdFactory.js#L14
function createModuleIdFactory() {
  const modules = {}
  return (pathToFile) => {
    if (modules[pathToFile]) {
      return modules[pathToFile]
    }
    const id = moduleId(path.relative(root, pathToFile))
    modules[pathToFile] = id
    return id
  }
}

module.exports = createModuleIdFactory
