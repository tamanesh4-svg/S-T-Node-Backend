const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  teacherId: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  subject: String,
  qualification: String,
  password: {
    type: String,
    required: true,
  },

  // Automatically identifies this account as a teacher
  role: {
    type: String,
    enum: ["teacher"],
    default: "teacher",
  }

}, { timestamps: true });

module.exports = mongoose.model("Teacher", teacherSchema);