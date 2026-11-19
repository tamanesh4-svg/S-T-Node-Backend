// models/Routine.js
const mongoose = require("mongoose");

const routineSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true
  },
  day: {
    type: String,
    enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    required: true
  },
  slot: {
    type: Number, // 1,2,3,4,5
    required: true
  }
});

module.exports = mongoose.model("Routine", routineSchema);