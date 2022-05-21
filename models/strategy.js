const standardFuncs = require('../lib/utilities');
const Strategy = require('./schema/strategy');
const { underlyingSecurities, strategyTypes } = require('../constants/strategy');

const createStrategy = params => {
  const convertedParams = convertParams(params);
  return new Promise((resolve, reject) => {
    const newStrategy = new Strategy(convertedParams);
    newStrategy.save()
      .then(strategy => resolve(strategy))
      .catch(error => reject(error));
  });
};

const convertParams = params => {
  const convertedParams = { ...params };
  convertedParams.type = standardFuncs.findKey(strategyTypes, params.type);
  convertedParams.underlyingSecurity = standardFuncs.findKey(underlyingSecurities, params.underlyingSecurity);
  return convertedParams;
};

module.exports = { createStrategy };
