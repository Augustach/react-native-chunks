const crypto = require('crypto')

/**
 * Generates a hash number from a file path string.
 *
 * @param {string} path - The file path to hash.
 * @returns {number} - The hash number not exceeding Number.MAX_SAFE_INTEGER.
 */
function moduleId(path) {
  const hash = crypto.createHash('sha256').update(path).digest('hex')

  return parseInt(hash.substring(0, 15), 16) % Number.MAX_SAFE_INTEGER
}

module.exports = {
  moduleId,
}
