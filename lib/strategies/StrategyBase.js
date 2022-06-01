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
    this.quantity = lotSize[this.underlyingAsset];
    this.target = 0;
    this.stoploss = {};
  }

  configureStrategy() {
    this.configureWebSocket(this.socketMessage, this.socketOpen, this.socketClose, this.socketError, this);
  }

  reloadStrategy() {
    return new Promise((resolve, reject) => {
      Strategy.findById(this.strategyId)
        .then(strategy => {
          this.interval = strategy.interval;
          this.sendMessage(JSON.stringify({ 'operation' : 'interval', 'time_in_sec' : this.interval }));
          this.stoploss = strategy.stoploss;
          this.stopLossPercentage = strategy.stopLossPercentage;
          this.target = strategy.target;
          this.userId = strategy.userId;
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
      const underlyingSymbol = `NSE:NIFTY${this.underlyingAsset == 'NIFTY' ? '50' : 'BANK' }-INDEX`;
      HTTPClient.getLastTradedPrice(underlyingSymbol)
        .then(res => res.data)
        .then(data => {
          if(data[underlyingSymbol]) {
            resolve(data[underlyingSymbol]);
          } else {
            console.log(data);
          }
        })
        .catch(err => {
          console.log(err);
        });
    });
  }

  getQuotesPrice(symbols) {
    return new Promise((resolve, reject) => {
      HTTPClient.getLastTradedPrice(symbols)
        .then(res => {
          resolve(res.data);
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
    this.strategyObj.livePrice[data.strike] = parseFloat(data.lp);
    this.strategyObj.executeStrategy();
  }

  subscribeSocket() {
    for(let symbol in this.orders) {
      if(!(this.orders[symbol].BUY && this.orders[symbol].SELL)) {
        this.sendMessage(JSON.stringify({ 'operation' : 'add', 'symbol' : symbol }));
      }
    }
  }

  updateSocketMessage(symbol) {
    let operation = null;
    if(this.orders[symbol]) {
      operation = 'remove';
    } else {
      operation = 'add';
      this.orders[symbol] = {};
    }
    this.sendMessage(JSON.stringify({ 'operation' : operation, 'strike' : symbol }));  
  }

  socketOpen() {
    this.strategyObj.reloadStrategy()
      .then(strategy => {   
        if(Object.keys(this.strategyObj.orders).length === 0) {
          this.strategyObj.initStrategy()
        } else {
          this.strategyObj.subscribeSocket();
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
