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

const strikeDiff = {
  'NIFTY' : 50,
  'BANKNIFTY' : 100
}

module.exports = {
  underlyingSecurities,
  strategyTypes,
  lotSize,
  strikeDiff
}
