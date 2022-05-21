const underlyingSecurities = {
  1 : 'NIFTY',
  2 : 'BANKNIFTY'
};

const lotSize = {
  'NIFTY' : 50,
  'BANKNIFTY' : 25
};

const strategyTypes = {
  1 : 'SHORTSTRANGLE',
  2 : 'EXPIRYDAYNEUTRAL',
  3 : 'SHORTSTRADDLE-LOWCAPITAL',
  5 : 'SHORTSTRADDLE-NEW'
};

module.exports = {
  underlyingSecurities,
  strategyTypes,
  lotSize
}
