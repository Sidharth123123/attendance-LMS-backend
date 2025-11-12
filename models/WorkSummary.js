const { string } = require('i/lib/util');
const mongoose = require('mongoose');

const WorkSummarySchema = new mongoose.Schema({
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  Month: { type: String },
  Year: { type: String },
  TotalDaysWorked: { type: String },
  TotalHoursWorked: { type: String },

});

module.exports = mongoose.model('WorkSummary', WorkSummarySchema); 
