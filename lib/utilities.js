const standardFuncs = {
  findKey(hash, value) {
    for (let key in hash) {
      if (hash[key] === value) {
        return key;
      }
    }
    return null;
  }
}


module.exports = standardFuncs;
