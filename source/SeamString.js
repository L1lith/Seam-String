import autoBind from 'auto-bind'
import isNode from './functions/isNode'

const StringPrototype = Object.getPrototypeOf("")

const stringClassMethods = {}
Object.getOwnPropertyNames(StringPrototype).map(property => {
  try {
    const output = StringPrototype[property]
    if (typeof output == 'function') {
      stringClassMethods[property] = output
    }
  } catch(error) {}
});

const aliases = {
  insertBeforeBeginning: "injectBeforeBeginning",
  insertBefore: 'injectBefore',
  addAfter: "appendAfter",
  add: "append",
  writeToFile: 'writeFile'
}

class SeamString {
  constructor(string="") {
    if (typeof string != 'string') throw new Error("Must supply a string as the first argument")
    autoBind(this)
    this.originalString = string
    this.currentString = string
    // Mirror String Methods
    Object.entries(stringClassMethods).forEach(([name, func]) => {
      if (!(name in this)) {
        this[name] = (...args)=>{
          return this.currentString[name].apply(this.currentString, args)
        }
      }
    })
    Object.entries(aliases).forEach(([alias, target]) => {
      if (typeof alias != 'string' || typeof target !== 'string') return
      Object.defineProperty(this, alias, {
        enumerable: true,
        configurable: false,
        get: ()=>{
          return this[target] || SeamString[target]
        }
      })
    })
  }
  getString() {
    return this.currentString
  }
  getOriginalString() {
    return this.originalString
  }
  reset() {
    this.currentString = this.originalString
  }
  set(string) {
    if (typeof string != 'string') throw new Error("Must supply the string to set")
    return this.currentString = string
  }
  append(string) {
    if (typeof string != 'string' || string.length < 1) throw new Error("Must supply the string to append")
    return this.currentString += string
  }
  injectBeforeBeginning(string) {
    if (typeof string != 'string' || string.length < 1) throw new Error("Must supply the string to inject")
    return this.currentString = string + this.currentString
  }
  appendAfter(startingString, appendString) {
    if ((typeof startingString != 'string' || startingString.length < 1) && !(startingString instanceof RegExp)) throw new Error("Must supply the starting string or regex as the first argument")
    if (typeof appendString != 'string' || appendString.length < 1) throw new Error("Must supply the string to append as the second argument")
    let startingIndex = -1
    if (startingString instanceof RegExp) {
      const match = (this.currentString.match(startingString) || [])[0]
      if (match) startingIndex = this.currentString.indexOf(match) + match.length
    } else {
      startingIndex = this.currentString.indexOf(startingString)
      if (startingIndex >= 0) startingIndex += startingString.length
    }
    if (startingIndex < 0) return this.currentString // Don't change it if no match was found
    return this.currentString = this.currentString.substring(0, startingIndex) + injection
  }
  injectBefore(endingString, injection) {
    if ((typeof endingString != 'string' || endingString.length < 1) && !(endingString instanceof RegExp)) throw new Error("Must supply the ending string or regex as the first argument")
    if (endingString instanceof RegExp && endingString.flags.includes('g')) throw new Error("Ending string RegEx cannot include the global flag")
    if (typeof injection != 'string' || injection.length < 1) throw new Error("Must supply the injection string as the second argument")
    let endingIndex = -1
    if (endingString instanceof RegExp) {
      endingIndex = this.currentString.search(endingString)
    } else {
      endingIndex = this.currentString.indexOf(endingString)
    }
    if (endingIndex < 0) return this.currentString // Don't change it if no match was found
    return this.currentString = this.currentString.substring(0, endingIndex) + injection + this.currentString.substring(endingIndex)
  }
  injectBetween(startingString, endingString, injection) {
    if ((typeof startingString != 'string' || startingString.length < 1) && !(startingString instanceof RegExp)) throw new Error("Must supply the starting string or regex as the first argument")
    if (startingString instanceof RegExp && startingString.flags.includes('g')) throw new Error("Starting string RegEx cannot include the global flag")
    if ((typeof endingString != 'string' || endingString.length < 1) && !(endingString instanceof RegExp)) throw new Error("Must supply the ending string or regex as the second argument")
    if (endingString instanceof RegExp && endingString.flags.includes('g')) throw new Error("Ending string RegEx cannot include the global flag")
    if (typeof injection != 'string' || injection.length < 1) throw new Error("Must supply the injection string as the third argument")
    let startingIndex = -1
    if (startingString instanceof RegExp) {
      const match = (this.currentString.match(startingString) || [])[0]
      if (match) startingIndex = this.currentString.indexOf(match) + match.length
    } else {
      startingIndex = this.currentString.indexOf(startingString)
      if (startingIndex >= 0) startingIndex += startingString.length
    }
    if (startingIndex < 0) return this.currentString // Don't change it if no match was found
    let endingIndex = -1
    if (endingString instanceof RegExp) {
      endingIndex = this.currentString.search(endingString)
    } else {
      endingIndex = this.currentString.indexOf(endingString)
    }
    if (endingIndex < 0) return this.currentString // Don't change it if no match was found
    return this.currentString = this.currentString.substring(0, startingIndex) + injection + this.currentString.substring(endingIndex)
  }
  async writeFile(path) {
    if (typeof path != 'string') throw new Error("Must supply a path string")
    if (!isNode()) throw new Error("This function can only be run in a Node.js environment")
    const {promisify} = require('util')
    const writeFile = promisify(require('fs').writeFile)
    await writeFile(path, this.currentString)
  }
  static readFile(path) {
    return (async () => {
      if (typeof path != 'string') throw new Error("Must supply a path string")
      if (!isNode()) throw new Error("This function can only be run in a Node.js environment")
      const {promisify} = require('util')
      const readFile = promisify(require('fs').readFile)
      const content = await readFile(path, 'utf8')
      return new SeamString(content)
    })() // async static work around
  }
  static fromFile(path) {
    return SeamString.fromFile(path)
  }
}

export default SeamString
