const { string } = require('i/lib/util');
const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String },
  date: { type: String, required: true },
  CheckInTime: { type: String },
  CheckOutTime: { type: String },
  TotalHours: { type: String },
  Status: { type: String },
  isVerified: { type: Boolean, default: false },
});


module.exports = mongoose.model('Attendance', AttendanceSchema);

