const Class = require("../models/class");

const joinClass = async (req, res) => {
  try {
    const { classCode } = req.body;
    const studentId = req.student.id;

    const classData = await Class.findOne({ classCode });

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (classData.students.some((id) => id.toString() === studentId.toString())) {
      return res.status(400).json({ message: "Already joined this class" });
    }

    classData.students.push(studentId);
    await classData.save();


    res.json({
      message: "Joined class successfully",
      className: classData.className,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { joinClass };  // ✅ export as object