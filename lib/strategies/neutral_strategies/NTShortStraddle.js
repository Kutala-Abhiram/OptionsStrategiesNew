const StrategyBase = require('../StrategyBase');

module.exports = class NTShortStraddle extends StrategyBase {
  constructor(interval, paperTrading, underlyingAsset, expiryDay, strategyId) {
    super(interval, paperTrading, underlyingAsset, expiryDay, strategyId, this.socketMessage, this.socketOpen);
  }

  socketMessage(message) {
    let data = JSON.parse(message.data);
    this.livePrice[data.strike] = data.lp;
    this.executeStrategy();
  }

  socketOpen() {
    this.initStrategy();
  }

  initStrategy() {
    
  }

  executeStrategy() {
    
  }
}