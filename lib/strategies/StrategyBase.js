const Strategy = require('../../models/schema/strategy');
const Order = require('../../models/schema/order');
const { buyOrder, sellOrder } = require('../../lib/orders');
const { lotSize } = require('../../constants/strategy');
const WebSocketClient = require('../../lib/WebSocketClient');
const HTTPClient = require('../../lib/HTTPClient');
const { generateQuote } = require('../../lib/generateQuote');
const { underlyingSecurities, strikeDiff } = require('../../constants/strategy');

module.exports = class StrategyBase extends WebSocketClient {
  constructor(interval, paperTrading, underlyingAsset, expiryDay, strategyId, initStrategy, executeStrategy) {
    super(this.socketMessage, this.socketOpen, this.socketClose, this.socketError);
    this.orders = {};
    this.livePrice = {};
    this.profit = 0;
    this.interval = interval;
    this.underlyingAsset = underlyingSecurities[underlyingAsset];
    this.expiryDay = expiryDay;
    this.strategyId = strategyId;
    this.paperTrading = paperTrading;
    this.quantity = lotSize[underlyingAsset];
    this.initStrategy = initStrategy;
    this.executeStrategy = executeStrategy;
  }

  reload() {
    return new Promise((resolve, reject) => {
      Strategy.findById(this.strategyId)
        .then(strategy => {
          this.interval = strategy.interval;
          Order.find({ strategyId: this.strategyId })
            .then(all_orders => {
              this.reframeOrders(all_orders);
              resolve(strategy);
            })
            .catch(err => {
              console.log(err);
              reject(err);
            });
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  reframeOrders(all_orders) {
    this.orders = {};
    for(let order in all_orders) {
      if(!this.orders[order.symbol]) {
        this.orders[order.symbol] = {};
      }
      this.orders[order.symbol][order.orderType] = order.executedPrice;
    }
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

  getUnderlyingAssetPrice() {
    return new Promise((resolve, reject) => {
      const underlyingSymbol = `NSE:${this.underlyingAsset}`;
      HTTPClient.getLastTradedPrice(underlyingSymbol)
        .then(res => {
          if(res[underlyingSymbol]) {
            resolve(res[underlyingSymbol]);
          } else {
            console.log(res);
          }
        });
    });
  }

  getNearestStrike(price) {
    let strike = Math.round(price / strikeDiff[this.underlyingAsset]) * strikeDiff[this.underlyingAsset];
    return strike;
  }

  buyQuote(symbol, price) {
    buyOrder(symbol, this.quantity, this.strategyId, this.userId, price, this.paperTrading);
  }

  socketClose() {
    console.log(`${this.strategyId} Socket closed`);
  }

  socketError() {
    console.log(`${this.strategyId} Socket error`);
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
          this.initStrategy()
            .then(() => {
              this.executeStrategy();
            });
        } else {
          this.executeStrategy();
        }
      })
      .catch(err => {
        console.log(err);
      });
  }
}
