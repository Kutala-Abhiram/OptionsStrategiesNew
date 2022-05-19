const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  paperTrading: {
    type: Boolean,
    required: true,
    default: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('UserSettings', userSettingsSchema);
