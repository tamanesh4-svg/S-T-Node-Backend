const Teacher = require("../models/teacher");
const Class = require("../models/class"); // ✅ only here, never again below

// ================= GET CURRENT TEACHER =================
exports.getMe = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.teacher.id).select("-password");
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    res.json(teacher);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= CREATE CLASS =================
exports.createClass = async (req, res) => {
  try {
    const classCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newClass = new Class({
      className: req.body.className,
      teacher: req.teacher.id,
      classCode
    });
    await newClass.save();
    res.json({ message: "Class created", classCode });
  } catch (err) {
    console.error(err); // ✅ added
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET CLASSES =================  // ✅ no require here
exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.teacher.id });
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



// ================= GET CLASS STUDENTS =================
exports.getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const classData = await Class.findOne({ _id: classId, teacher: req.teacher.id })
      .populate("students", "name roll");

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json(classData.students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};