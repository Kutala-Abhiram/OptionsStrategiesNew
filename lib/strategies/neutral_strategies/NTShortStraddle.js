const { generateQuote } = require('../../generateQuote');
const StrategyBase = require('../StrategyBase');
const HTTPClient = require('../../../lib/HTTPClient');

module.exports = class NTShortStraddle extends StrategyBase {
  constructor(interval, paperTrading, underlyingAsset, expiryDay, strategyId) {
    super(interval, paperTrading, underlyingAsset, expiryDay, strategyId, this.initStrategy, this.execute);
  }

  initStrategy() {
    this.getUnderlyingAssetPrice().
      then(underlyingAssetPrice => {
        const strikePrice = this.getNearestStrike(underlyingAssetPrice);
        const { cequote, pequote } = this.getInitialQuotes(strikePrice);
        this.getQuotesPrice([cequote, pequote])
          .then(quotesPrice => {
            this.livePrice[cequote] = quotesPrice[cequote];
            this.livePrice[pequote] = quotesPrice[pequote];
            const st_percent = strategy.stopLossPercentage;
            let st_loss = {}
            st_loss[cequote] = this.livePrice[cequote] * (1 + st_percent / 100);
            st_loss[pequote] = this.livePrice[pequote] * (1 + st_percent / 100);
            this.updateStopLoss(st_loss); 
            this.updateTarget((this.livePrice[cequote] + this.livePrice[pequote]) * (strategy.targetPercentage / 100) * this.quantity);
            this.sellOrder(cequote, this.livePrice[cequote])
              .then(res => {
                this.sellOrder(pequote, this.livePrice[pequote]);
              });
          });
      });
  }

  execute() {
    const symbols = Object.keys(this.orders);
    const ordersOpen = symbols.filter(symbol => !this.orders[symbol].BUY );


  }

  getInitialQuotes(price) {
    const cequote = generateQuote(this.underlyingAsset, this.expiryDay, price);
    const pequote = generateQuote(this.underlyingAsset, this.expiryDay, price, false);
    return { cequote, pequote };
  }
}