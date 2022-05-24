const mongoose = require('mongoose');
const standardFuncs = require('../../lib/utilities');
const { underlyingSecurities, strategyTypes } = require('../../constants/strategy');

const strategySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  profit: {
    type: Number,
    required: true,
    default: 0
  },
  underlyingSecurity: {
    type: Number,
    required: true,
    validate: {
      validator: number => Object.keys(underlyingSecurities).map(Number).includes(number),
      message: props => `${props.value} is not a valid underlying security`
    }
  },
  type: {
    type: Number,
    required: true,
    default: standardFuncs.findKey(strategyTypes, 'SHORTSTRANGLE'),
  },
  expiryDate: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  paperTrading: {
    type: Boolean,
    required: true,
    default: true
  },
  intraday: {
    type: Boolean,
    required: true,
    default: true
  },
  interval: {
    type: Number,
    required: true,
    default: 1
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  }
});

module.exports = mongoose.model('Strategy', strategySchema);
