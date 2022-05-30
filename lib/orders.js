const HTTPClient = require('./HTTPClient');
const Order = require('../models/schema/order');

const sellOrder = (symbol, quantity, strategyId, userId, price, paperTrading) => {
  const params = {
    symbol,
    quantity,
    orderType: 'SELL',
    strategyId,
    userId
  };
  const order = new Order(params);

  if(paperTrading) {
    order.executedPrice = price;
  } else {
    HTTPClient.sellOrder(symbol, quantity);
  }

  order.save();
}

const buyOrder = (symbol, quantity, strategyId, userId) => {
  const params = {
    symbol,
    quantity,
    orderType: 'BUY',
    strategyId,
    userId
  };
  const order = new Order(params);
  HTTPClient.buyOrder(order);
  return new Promise((resolve, reject) => {
    order.save().then(order => resolve(order)).catch(err => reject(err));
  });
}

module.exports = { sellOrder, buyOrder };
