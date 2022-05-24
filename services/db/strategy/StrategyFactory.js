const { strategyTypes } = require('../../../constants/strategy');
const NTShortStraddle = require('../../../lib/strategies/neutral_strategies/NTShortStraddle');

const StrategyFactory = strategy => {
  switch (strategyTypes[strategy.type]) {
    case '920shortstraddle':
      return new NTShortStraddle(strategy.interval, strategy.paperTrading, strategy.underlyingSecurity, strategy.expiryDate, strategy._id);
    default:
      console.log('Unkown Strategy');
  }
}

module.exports = {
  StrategyFactory
}