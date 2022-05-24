const { executeStrategy } = require('../../../services/db/strategy/executeStrategy');
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
    this.reload()
      .then(strategy => {   
        if(this.orders.length === 0) {
          this.initStrategy();
        }
        executeStrategy();
      })
      .catch(err => {
        console.log(err);
      });
  }

  initStrategy() {
    
  }

  executeStrategy() {
    
  }
}