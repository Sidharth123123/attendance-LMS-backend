const { string } = require('i/lib/util');
const mongoose = require('mongoose');

const  LeaveSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

 user: { type: String },
  StartDate: { type: String, unique: true },
  EndDate: { type: String },
  Reason:{ type: Number},
  Status:{ type: String },

});

module.exports = mongoose.model(' Leave', LeaveSchema); 
