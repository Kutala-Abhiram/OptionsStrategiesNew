const axios = require('axios');
const clientApi = "http://localhost:3001";

const getLastTradedPrice = (symbol) => {
  return new Promise((resolve, reject) => {
    axios.post(`${clientApi}/getQuotes`, { symbols: [symbol] })
      .then(res => resolve(res))
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
};

const getLastTradedPrices = (symbols) => {
  return new Promise((resolve, reject) => {
    axios.post(`${clientApi}/getQuotes`, { symbols })
      .then(res => resolve(res))
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
};

const sellOrder = (symbol, quantity) => {
  return new Promise((resolve, reject) => {
    axios.post(`${clientApi}/sellOrder`, { symbol, quantity })
      .then(res => resolve(res))
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
};

const buyOrder = (symbol, quantity) => {
  return new Promise((resolve, reject) => {
    axios.post(`${clientApi}/buyOrder`, { symbol, quantity })
      .then(res => resolve(res))
      .catch(err => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports = { getLastTradedPrice, getLastTradedPrices, sellOrder, buyOrder };
