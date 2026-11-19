const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roll: { type: String, required: true },
  classId: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model("Student", studentSchema);