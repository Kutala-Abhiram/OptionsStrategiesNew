const Strategy = require('../services/db/strategy/createStrategy');

const createStrategy = (req) => {
  const params = req.body;
  const userId = req.params.userId;
  const { name, underlyingSecurity, type, expiryDate, startDate, endDate, paperTrading, intraday } = params;
  return new Promise((resolve, reject) => {
    Strategy.createStrategy({ name,  underlyingSecurity, type, expiryDate, startDate, endDate, paperTrading, intraday, userId })
      .then(strategy => resolve(strategy))
      .catch(error => reject(error));
  });
};

module.exports = { createStrategy };
