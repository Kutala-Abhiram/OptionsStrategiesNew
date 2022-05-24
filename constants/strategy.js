const underlyingSecurities = {
  1 : 'NIFTY',
  2 : 'BANKNIFTY'
};

const lotSize = {
  'NIFTY' : 50,
  'BANKNIFTY' : 25
};

const strategyTypes = {
  1 : '920shortstraddle'
};

module.exports = {
  underlyingSecurities,
  strategyTypes,
  lotSize
}
