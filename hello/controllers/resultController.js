// controllers/resultController.js

const Class = require("../models/class");
const Result = require("../models/Result");
const Student =require("../models/student")

// ================= GET TEACHER CLASSES =================
exports.getTeacherClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.teacher.id });

    const formatted = classes.map(c => ({
      id: c._id,
      name: c.className,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ================= GET STUDENTS + OLD RESULTS =================
exports.getStudentsByClass = async (req, res) => {
  try {
    const classId = req.params.id;

    const classData = await Class.findOne({ _id: classId, teacher: req.teacher.id })
      .populate("students", "name roll");
    if (!classData) return res.status(404).json({ message: "Class not found" });

    // find previous results (IMPORTANT)
    const existingResult = await Result.findOne({ class: classId });

    const students = classData.students.map((s, index) => {
      const prev = existingResult?.results.find(
        r => r.student.toString() === s._id.toString()
      );

      return {
        id: s._id,
        name: s.name,
        roll: s.roll || index + 1,
        marks: prev ? prev.marks : "",
      };
    });

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ================= SAVE RESULTS =================
exports.getMyResult = async (req, res) => {
  try {
    console.log("✅ getMyResult called");
    console.log("Student from token:", req.student);

    const studentId = req.student.id;

    const resultDoc = await Result.findOne({
      "results.student": studentId,
    }).populate("class");

    console.log("Result doc:", resultDoc);

    if (!resultDoc) {
      console.log("❌ No result doc found");
      return res.json({ subjects: [] });
    }

    const studentResult = resultDoc.results.find(
      r => r.student.toString() === studentId
    );

    console.log("Student result:", studentResult);

    if (!studentResult) {
      console.log("❌ Student not in results array");
      return res.json({ subjects: [] });
    }

    const student = await Student.findById(studentId);
    console.log("Student:", student);

    res.json({
      name: student.name,
      roll: student.roll,
      className: resultDoc.class.className,
      subjects: [{ subject: "Overall", marks: studentResult.marks }],
    });

  } catch (err) {
    console.error("❌ getMyResult error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.saveResults = async (req, res) => {
  try {
    const { classId, students } = req.body;
    if (!classId || !Array.isArray(students)) {
      return res.status(400).json({ message: "classId and students are required" });
    }
    const classData = await Class.findOne({ _id: classId, teacher: req.teacher.id });
    if (!classData) return res.status(404).json({ message: "Class not found for this teacher" });

    const classStudentIds = new Set(classData.students.map((id) => id.toString()));
    const formatted = students.map((s) => ({
      student: s.id,
      marks: Number(s.marks),
    }));
    if (formatted.some((s) =>
      !s.student ||
      !classStudentIds.has(String(s.student)) ||
      !Number.isFinite(s.marks) ||
      s.marks < 0 ||
      s.marks > 100
    )) {
      return res.status(400).json({ message: "Each result must belong to this class and have marks between 0 and 100" });
    }

    const result = await Result.findOneAndUpdate(
      { class: classId },
      {
        class: classId,
        teacher: req.teacher.id,
        results: formatted,
      },
      { new: true, upsert: true }
    );

    res.json({ message: "Results saved", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};