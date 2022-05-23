const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  strategyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Strategy',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  orderType: {
    type: String,
    required: true,
    validate: {
      validator: orderType => ['BUY', 'SELL'].includes(orderType),
      message: props => `${props.value} is not a valid order type`
    }
  },
  executedPrice: {
    type: Number
  }
});