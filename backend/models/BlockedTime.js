const mongoose = require('mongoose');

const blockedTimeSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('BlockedTime', blockedTimeSchema); 