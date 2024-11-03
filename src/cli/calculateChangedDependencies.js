const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const { spawnSync, execSync } = require('child_process')
const { commonBundleCommandOptions } = require('./commonBundleCommandOptions')

function getMetroPath() {
  return path.join('node_modules', '.bin', 'metro')
}

const getDependencies = ({ platform, entryFile }) => {
  const args = ['get-dependencies', `--platform=${platform}`, `--entry-file=${entryFile}`]
  const result = spawnSync(getMetroPath(), args, { encoding: 'utf-8' })

  return result.stdout.split('\n').filter(Boolean)
}

function makeHash(file) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')

    fs.createReadStream(file)
      .on('data', (data) => {
        hash.update(data)
      })
      .on('end', () => {
        resolve(hash.digest('hex'))
      })
      .on('error', reject)
  })
}

async function makeHashes(files) {
  const hashes = {}

  for (const file of files) {
    hashes[file] = await makeHash(file)
  }

  return hashes
}

async function calculateChangedDependencies({ commit, platform, entryFile, npm }) {
  const headHashes = await makeHashes(getDependencies({ platform, entryFile }))
  execSync(`git checkout ${commit}`)
  npm && execSync(npm)
  const commitHashes = await makeHashes(getDependencies({ platform, entryFile }))
  execSync('git switch -')

  for (const file in headHashes) {
    if (headHashes[file] !== commitHashes[file]) {
      console.log(file)
    }
  }
}

async function calculateChangedDependenciesFunc(_argv, _cliConfig, cliOptions) {
  await calculateChangedDependencies(cliOptions)
}

const calculateChangedDependenciesCommand = {
  name: 'chunk-changed-deps',
  description: 'Print changed dependencies between two commits',
  func: calculateChangedDependenciesFunc,
  options: [
    ...commonBundleCommandOptions,
    {
      name: '--commit <string>',
      description: 'Baseline commit to compare against',
    },
    {
      name: '--npm <string>',
      description: 'Command to reinstall node_modules during switching commits',
    },
  ],
}

module.exports = {
  calculateChangedDependencies,
  calculateChangedDependenciesCommand,
}
