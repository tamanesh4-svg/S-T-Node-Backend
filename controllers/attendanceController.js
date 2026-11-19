const Attendance = require("../models/Attendance");
const Student = require("../models/student");
const Class = require("../models/class");

// MARK ATTENDANCE (teacher cookie JWT protected)
exports.markAttendance = async (req, res) => {
  try {
    const { classId, records, date } = req.body;
    if (!classId || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "Class and attendance records are required" });
    }

    const classData = await Class.findOne({ _id: classId, teacher: req.teacher.id });
    if (!classData) return res.status(404).json({ message: "Class not found for this teacher" });

    const validStudentIds = new Set(classData.students.map((id) => id.toString()));
    const normalizedRecords = records.map((record) => ({
      student: record.student,
      status: record.status,
    }));

    const invalidRecord = normalizedRecords.find((record) =>
      !validStudentIds.has(String(record.student)) || !["present", "absent"].includes(record.status)
    );
    if (invalidRecord) {
      return res.status(400).json({ message: "Attendance contains an invalid student or status" });
    }

    const attendance = new Attendance({
      classId,
      date: date ? new Date(date) : new Date(),
      records: normalizedRecords,
    });
    await attendance.save();
    res.status(201).json({ message: "Attendance marked successfully", attendance });
  } catch (err) {
    console.error("markAttendance:", err);
    res.status(500).json({ message: "Failed to save attendance" });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const studentId = req.student.id;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const attendanceRecords = await Attendance.find({ "records.student": student._id })
      .populate("classId", "className")
      .sort({ date: -1 });

    let attendedClasses = 0;
    attendanceRecords.forEach((record) => {
      const studentRecord = record.records.find((item) => item.student.toString() === student._id.toString());
      if (studentRecord?.status === "present") attendedClasses += 1;
    });

    res.json({
      name: student.name,
      roll: student.roll,
      className: attendanceRecords[0]?.classId?.className || "N/A",
      totalClasses: attendanceRecords.length,
      attendedClasses,
    });
  } catch (err) {
    console.error("getMyAttendance:", err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};

// Retain the existing /student/:roll endpoint and resolve its roll parameter.
exports.getAttendanceByRoll = async (req, res) => {
  try {
    const student = await Student.findById(req.student.id);
    if (!student || student.roll !== req.params.roll) {
      return res.status(404).json({ message: "Student not found" });
    }
    return exports.getMyAttendance(req, res);
  } catch (err) {
    console.error("getAttendanceByRoll:", err);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};
