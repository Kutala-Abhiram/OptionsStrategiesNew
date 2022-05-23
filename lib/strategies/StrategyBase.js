const Strategy = require('../../models/schema/strategy');
const Order = require('../../models/schema/order');
const { lotSize } = require('../../constants/strategy');

module.exports = class StrategyBase {
  constructor(interval, paperTrading, underlyingAsset, expiryDay, strategyId) {
    this.orders = {};
    this.livePrice = {};
    this.profit = 0;
    this.interval = interval;
    this.underlyingAsset = underlyingAsset;
    this.expiryDay = expiryDay;
    this.strategyId = strategyId;
    this.paperTrading = paperTrading;
    this.quantity = lotSize[underlyingAsset];
  }

  reload() {
    Strategy.findById(this.strategyId, (err, strategy) => {
      if(err) {
        console.log(err);
        return;
      }
      this.interval = strategy.interval;
    });

    Order.find({ strategyId: this.strategyId }, (err, all_orders) => {
      if(err) {
        console.log(err);
        return;
      }
      
      this.reframeOrders(all_orders);
    });
  }

  reframeOrders(all_orders) {
    this.orders = {};
    all_orders.forEach(order => {
      if(!this.orders[order.symbol]) {
        this.orders[order.symbol] = {};
      }
      this.orders[order.symbol][order.orderType] = order.executedPrice;
    });
  }

  calculateProfit() {
    let live_profit = 0;

    for(let symbol in this.orders) {
      let buy_price = this.orders[symbol].BUY || this.livePrice[symbol];
      let sell_price = this.orders[symbol].SELL || this.livePrice[symbol];
      live_profit += sell_price - buy_price; 
    }

    this.profit = live_profit.toFixed(2) * this.quantity;
  }
}
