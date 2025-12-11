const mongoose = require("mongoose");

const breakTimeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  start: Date,
  end: Date,

  durationSec: Number,
  durationFormatted: String,

  startTime: String,
  endTime: String,

  todayTotalOffSec: Number,
  todayTotalOffFormatted: String,

  allSessions: [
    {
      start: Date,
      end: Date,
      durationFormatted: String
    }
  ],

  date: { type: Date, default: Date.now }   // NOT REQUIRED
});

module.exports = mongoose.model("BreakTime", breakTimeSchema);
