const { generateQuote } = require('../../generateQuote');
const StrategyBase = require('../StrategyBase');

module.exports = class NTShortStraddle extends StrategyBase {
  constructor(interval, paperTrading, underlyingAsset, expiryDay, strategyId) {
    super(interval, paperTrading, underlyingAsset, expiryDay, strategyId);
    this.configureStrategy();
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
            const st_percent = this.stopLossPercentage;
            let st_loss = {}
            st_loss[cequote] = this.livePrice[cequote] * (1 + st_percent / 100);
            st_loss[pequote] = this.livePrice[pequote] * (1 + st_percent / 100);
            this.updateStopLoss(st_loss); 
            this.updateTarget((this.livePrice[cequote] + this.livePrice[pequote]) * (50 / 100) * this.quantity);
            this.sellQuote(cequote, this.livePrice[cequote])
              .then(res => {
                this.sellQuote(pequote, this.livePrice[pequote]);
              });
          });
      });
  }

  executeStrategy() {
    const orderCount = this.openOrdersCount();
    this.calculateProfit();
    console.log(`Live Price: ${JSON.stringify(this.livePrice)}    Stop Loss: ${JSON.stringify(this.stoploss)}   Profit: ${this.profit}`);

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
          this.updatePendingLegStopLoss();
        }
      }
    }
  }

  updatePendingLegStopLoss() {
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
      this.updatePendingLegStopLoss();
    }
  }

  getInitialQuotes(price) {
    const cequote = generateQuote(this.underlyingAsset, this.expiryDay, price);
    const pequote = generateQuote(this.underlyingAsset, this.expiryDay, price, false);
    return { cequote, pequote };
  }
}
