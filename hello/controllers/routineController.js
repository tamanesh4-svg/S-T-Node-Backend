const Routine = require("../models/Routine");
const Class = require("../models/class");

exports.addRoutine = async (req, res) => {
  const { classId, day, slot } = req.body;
  try {
    if (!classId || !["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].includes(day) || ![1, 2, 3, 4, 5].includes(Number(slot))) {
      return res.status(400).json({ message: "Valid class, day and slot are required" });
    }
    const classData = await Class.findOne({ _id: classId, teacher: req.teacher.id });
    if (!classData) return res.status(404).json({ message: "Class not found for this teacher" });

    const existing = await Routine.findOne({ teacher: req.teacher.id, day, slot: Number(slot) });
    if (existing) return res.status(400).json({ message: "Slot already occupied" });

    const routine = await Routine.create({ teacher: req.teacher.id, classId, day, slot: Number(slot) });
    res.status(201).json({ message: "Routine added", routine });
  } catch (err) {
    console.error("addRoutine:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getRoutine = async (req, res) => {
  try {
    const routine = await Routine.find({ teacher: req.teacher.id })
      .populate("classId", "className")
      .sort({ day: 1, slot: 1 });
    res.json(routine);
  } catch (err) {
    console.error("getRoutine:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteRoutine = async (req, res) => {
  try {
    const deleted = await Routine.findOneAndDelete({ _id: req.params.id, teacher: req.teacher.id });
    if (!deleted) return res.status(404).json({ message: "Routine not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteRoutine:", err);
    res.status(500).json({ message: err.message });
  }
};
