const { generateQuote } = require('../../generateQuote');
const StrategyBase = require('../StrategyBase');

module.exports = class NTShortStraddle extends StrategyBase {
  constructor(interval, paperTrading, underlyingAsset, expiryDay, strategyId) {
    super(interval, paperTrading, underlyingAsset, expiryDay, strategyId);
    this.configureStrategy(this.initStrategy, this.execute);
    this.pendingLeg = null;
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
    const orderCount = this.openOrdersCount();

    if(orderCount === 2) {
      this.executeTowLegStrategy();
    } else if(orderCount === 1) {
      this.executeOneLegStrategy();
    }

    this.calculateProfit();
    if(this.profit > this.target || this.openOrdersCount() === 0) {
      this.closeAllPositions();
    }
  }

  executeTowLegStrategy() {
    const symbols = Object.keys(this.orders);

    for(let symbol in symbols) {
      if(this.livePrice[symbol]) {
        if(this.livePrice[symbol] > this.stoploss[symbol]) {
          this.buyQuote(symbol, this.livePrice[symbol]);
          this.pendingLeg = symbols.filter(s => s !== symbol)[0];
          this.updateStopLoss();
        }
      }
    }
  }

  updateStopLoss() {
    this.stoploss[this.pendingLeg] = this.livePrice[this.pendingLeg] * (1 + 20 / 100);
  }

  executeOneLegStrategy() {
    if(!this.pendingLeg) {
      const symbols = Object.keys(this.orders);
      for(let symbol in symbols) {
        if(this.orders[symbol].BUY) {
          this.pendingLeg = symbol;
          break;
        }
      }
    }

    if(this.livePrice[this.pendingLeg] > this.stoploss[this.pendingLeg]) {
      this.closeAllPositions();
    } else if(this.livePrice[this.pendingLeg] * 1.3 < this.stoploss[this.pendingLeg]) {
      this.updateStopLoss();
    }
  }

  getInitialQuotes(price) {
    const cequote = generateQuote(this.underlyingAsset, this.expiryDay, price);
    const pequote = generateQuote(this.underlyingAsset, this.expiryDay, price, false);
    return { cequote, pequote };
  }
}
