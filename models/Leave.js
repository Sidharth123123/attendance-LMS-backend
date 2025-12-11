// const mongoose = require('mongoose');
// const { string } = require('i/lib/util');

// const LeaveSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   startDate: { type: String, required: true },
//   endDate: { type: String, required: true },
//   reason: { type: String },
// leavetype: {
//   type: String,
//   enum: ["Casual", "Sick", "Festival", "Other"],
//   required: true
// }}, );

// module.exports = mongoose.model('Leave', LeaveSchema);

const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    leavetype: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    rejectionReason: { type: String }, // optional but saved if rejected
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Leave", leaveSchema);
