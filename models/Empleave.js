




const mongoose = require("mongoose");

const EmpleaveSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  PaidLeave: { type: Number, default: 0 },
  SickLeave: { type: Number, default: 0 },
  UnpaidLeave: { type: Number, default: 0 },
  FestivalLeave: { type: Number, default: 0 },
  leavetype: { type: String},
  

  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Empleave", EmpleaveSchema);




    




