
// models/Result.js

const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    marks: {
      type: Number,
      default: null,
      min: 0,
      max: 25,
    },
    maxMarks: {
      type: Number,
      default: 25,
    },
  },
  { _id: false }
);

const studentResultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    ca1: {
      type: assessmentSchema,
      default: () => ({}),
    },
    ca2: {
      type: assessmentSchema,
      default: () => ({}),
    },
    ca3: {
      type: assessmentSchema,
      default: () => ({}),
    },
    ca4: {
      type: assessmentSchema,
      default: () => ({}),
    },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      unique: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    results: [studentResultSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
