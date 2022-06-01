const createStrategyService = require('../services/db/strategy/createStrategy');
const executeStrategyService = require('../services/db/strategy/executeStrategy');

const createStrategy = (req) => {
  const params = req.body;
  const userId = req.params.userId;
  const { name, underlyingSecurity, type, expiryDate, startDate, endDate, paperTrading, intraday, interval } = params;
  return new Promise((resolve, reject) => {
    createStrategyService.createStrategy({ name,  underlyingSecurity, type, expiryDate, startDate, endDate, paperTrading, intraday, interval, userId })
      .then(strategy => resolve(strategy))
      .catch(error => reject(error));
  });
};

const executeStrategy = (req) => {
  const strategyId = req.params.id;
  executeStrategyService.executeStrategy(strategyId);
};

module.exports = { createStrategy, executeStrategy };
