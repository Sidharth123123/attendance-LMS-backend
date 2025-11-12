const { string } = require('i/lib/util');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  number: { type: Number },
  image: { type: String },
  otp: { type: String },
  role: {
    type: String,
    enum: ['admin', 'emp',],
    default: 'emp'
  }, isVerified: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', userSchema);


