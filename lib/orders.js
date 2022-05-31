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

  return new Promise((resolve, reject) => {
    order.save()
      .then(res => {
        resolve(res);
      });
  });
}

const buyOrder = (symbol, quantity, strategyId, userId, price, paperTrading) => {
  const params = {
    symbol,
    quantity,
    orderType: 'BUY',
    strategyId,
    userId
  };
  const order = new Order(params);
  
  if(paperTrading) {
    order.executedPrice = price;
  } else {
    HTTPClient.buyOrder(symbol, quantity);
  }

  return new Promise((resolve, reject) => {
    order.save()
      .then(res => {
        resolve(res);
      }
    );
  });
}

module.exports = { sellOrder, buyOrder };
