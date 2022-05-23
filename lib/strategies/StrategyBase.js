class StrategyBase {
  constructor(interval, paperTrading, underlyingAsset, expiryDay, strategyId) {
    this.orders = {};
    this.profit = 0;
    this.interval = interval;
    this.underlyingAsset = underlyingAsset;
    this.expiryDay = expiryDay;
    this.strategyId = strategyId;
    this.paperTrading = paperTrading;
  }

  reload() {
    
  }
}