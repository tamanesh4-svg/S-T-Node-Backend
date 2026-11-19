const Routine = require("../models/Routine");
const Class = require("../models/class");

exports.getStudentRoutine = async (req, res) => {
  try {
    const studentId = req.student.id;
    const classes = await Class.find({ students: studentId }).select("_id");
    const classIds = classes.map((item) => item._id);

    const routine = await Routine.find({ classId: { $in: classIds } })
      .populate("classId", "className")
      .sort({ day: 1, slot: 1 });

    res.json(routine);
  } catch (err) {
    console.error("getStudentRoutine:", err);
    res.status(500).json({ message: "Failed to fetch student routine" });
  }
};
