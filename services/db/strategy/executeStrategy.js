const Strategy = require('../../../models/schema/strategy');
const { StrategyFactory } = require('./StrategyFactory');

const executeStrategy = (strategyId) => {
  return new Promise((resolve, reject) => {
    Strategy.findById(strategyId)
      .then(strategy => {
        if(!strategy) {
          return reject('Strategy not found');
        }
        processStrategy(strategy);
        resolve(strategy);
      });
  });
}

const processStrategy = (strategy) => {
  const StrategyObj = StrategyFactory(strategy);
}

module.exports = { executeStrategy };
