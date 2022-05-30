const { generateQuote } = require('../../generateQuote');
const StrategyBase = require('../StrategyBase');
const HTTPClient = require('../../../lib/HTTPClient');

module.exports = class NTShortStraddle extends StrategyBase {
  constructor(interval, paperTrading, underlyingAsset, expiryDay, strategyId) {
    super(interval, paperTrading, underlyingAsset, expiryDay, strategyId, this.initStrategy, this.execute);
  }

  initStrategy() {
    return new Promise((resolve, reject) => {
      this.getUnderlyingAssetPrice().
        then(underlyingAssetPrice => {
          const strikePrice = this.getNearestStrike(underlyingAssetPrice);
          const { cequote, pequote } = this.getInitialQuotes(strikePrice);
          HTTPClient.sellOrder(cequote, this.quantity, this.livePrice[cequote]);
          HTTPClient.sellOrder(pequote, this.quantity, this.livePrice[pequote]);
        });
      });
  }

  execute() {
    
  }

  getInitialQuotes(price) {
    const cequote = generateQuote(this.underlyingAsset, this.expiryDay, price);
    const pequote = generateQuote(this.underlyingAsset, this.expiryDay, price, false);
    return { cequote, pequote };
  }
}