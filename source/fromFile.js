import StringBean from './StringBean'
import isNode from './functions/isNode'

async function fromFile(path) {
  if (typeof path != 'string') throw new Error("Must supply a path string")
  if (!isNode()) throw new Error("This function can only be run in a Node.js environment")
  const {promisify} = require('util')
  const writeFile = promisify(require('fs').writeFile)
  await writeFile(path, this.currentString)
}

export default fromFile
