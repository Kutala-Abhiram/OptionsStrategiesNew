const Strategy = require('../../../models/strategy');

const createStrategy = params => {
  return new Promise((resolve, reject) => {
    Strategy.createStrategy(params)
      .then(strategy => resolve(strategy))
      .catch(error => reject(error));
  });
}

module.exports = { createStrategy };
