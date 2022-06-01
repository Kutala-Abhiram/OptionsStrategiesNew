const Strategy = require('../../models/schema/strategy');
const Order = require('../../models/schema/order');
const { buyOrder, sellOrder } = require('../../lib/orders');
const { lotSize } = require('../../constants/strategy');
const WebSocketClient = require('../../lib/WebSocketClient');
const HTTPClient = require('../../lib/HTTPClient');
const { generateQuote } = require('../../lib/generateQuote');
const { underlyingSecurities, strikeDiff } = require('../../constants/strategy');

module.exports = class StrategyBase extends WebSocketClient {
  constructor(interval, paperTrading, underlyingAsset, expiryDay, strategyId) {
    super();
    this.orders = {};
    this.livePrice = {};
    this.profit = 0;
    this.interval = interval;
    this.underlyingAsset = underlyingSecurities[underlyingAsset];
    this.expiryDay = expiryDay;
    this.strategyId = strategyId;
    this.paperTrading = paperTrading;
    this.quantity = lotSize[underlyingAsset];
    this.initStrategy = null;
    this.executeStrategy = null;
    this.target = 0;
    this.stoploss = {};
  }

  configureStrategy(initStrategy, executeStrategy) {
    this.initStrategy = initStrategy;
    this.executeStrategy = executeStrategy;
    this.configureWebSocket(this.socketMessage, this.socketOpen, this.socketClose, this.socketError);
  }

  reloadStrategy = () => {
    return new Promise((resolve, reject) => {
      Strategy.findById(this.strategyId)
        .then(strategy => {
          this.interval = strategy.interval;
          this.sendMessage(JSON.stringify({ 'operation' : 'interval', 'time_in_sec' : this.interval }));
          this.stoploss = strategy.stoploss;
          this.target = strategy.target;
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

  getQuotesPrice(symbols) {
    return new Promise((resolve, reject) => {
      HTTPClient.getLastTradedPrice(symbols)
        .then(res => {
          resolve(res);
        });
    });
  }

  getNearestStrike(price) {
    let strike = Math.round(price / strikeDiff[this.underlyingAsset]) * strikeDiff[this.underlyingAsset];
    return strike;
  }

  buyQuote(symbol, price) {
    return new Promise((resolve, reject) => {
      this.updateSocketMessage(symbol);
      this.orders[symbol].BUY = price;
      buyOrder(symbol, this.quantity, this.strategyId, this.userId, price, this.paperTrading)
        .then(res => {
          resolve(res);
        }
      );
    });
  }

  sellQuote(symbol, price) {
    return new Promise((resolve, reject) => {
      this.updateSocketMessage(symbol);
      this.orders[symbol].SELL = price;
      sellOrder(symbol, this.quantity, this.strategyId, this.userId, price, this.paperTrading)
        .then(res => {
          resolve(res);
        }
      );
    });
  }

  updateStopLoss(stoploss) {
    this.stoploss = stoploss;
    Strategy.findById(this.strategyId)
      .then(strategy => {
        strategy.stoploss = stoploss;
        strategy.save();
      })
      .catch(err => {
        console.log(err);
      });
  }

  updateTarget(target) {
    this.target = target;
    Strategy.findById(this.strategyId)
      .then(strategy => {
        strategy.target = target;
        strategy.save();
      })
      .catch(err => {
        console.log(err);
      });
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

  subscribeSocket() {
    for(let symbol in this.orders) {
      if(!(this.orders[symbol].BUY && this.orders[symbol].SELL)) {
        this.sendMessage(JSON.stringify({ 'operation' : 'add', 'symbol' : symbol }));
      }
    }
  }

  updateSocketMessage(symbol) {
    const operation = this.orders[symbol] ? 'remove' : 'add';
    this.sendMessage(JSON.stringify({ 'operation' : operation, 'strike' : symbol }));  
  }

  socketOpen() {
    this.reloadStrategy()
      .then(strategy => {   
        if(this.orders.length === 0) {
          this.initStrategy()
        } else {
          this.subscribeSocket();
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  closeAllPositions() {
    for(let symbol in this.orders) {
      if(!(this.orders[symbol].BUY && this.orders[symbol].SELL)) {
        if(this.orders[symbol].BUY) {
          this.sellQuote(symbol, this.livePrice[symbol]);
        } else {
          this.buyQuote(symbol, this.livePrice[symbol]);
        }
      }
    }

    this.calculateProfit();
    Strategy.findByIdAndUpdate(this.strategyId, { profit: this.profit });
  }

  openOrdersCount() {
    let count = 0;
    for(let symbol in this.orders) {
      if(!(this.orders[symbol].BUY && this.orders[symbol].SELL)) {
        count++;
      }
    }
    return count;
  }
}
