function isNode() {
  if (typeof module !== 'undefined' && module.exports) {
    return true
  } else {
    return false
  }
}

export default isNode
