const { string } = require('i/lib/util');
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String },
  city: { type: String },
  state: { type: String },
  address: { type: String },

});

module.exports = mongoose.model('Profile', profileSchema); 
