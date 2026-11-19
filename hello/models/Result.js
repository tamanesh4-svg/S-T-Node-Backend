// models/Result.js

const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  results: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      marks: Number,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Result", resultSchema);