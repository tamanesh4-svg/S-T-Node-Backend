const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Teacher = require("../models/teacher");
const teachmiddleware = require("../middleware/teachmiddleware");
const teachcontroller = require("../controllers/teachcontroller");

const router = express.Router();

// TEACHER REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, teacherId, phone, password, subject, qualification } = req.body;
    if (!name?.trim() || !teacherId?.trim() || !phone?.trim() || !password) {
      return res.status(400).json({ message: "Name, teacher ID, phone and password are required" });
    }

    const existingTeacher = await Teacher.findOne({
      $or: [{ teacherId }, { phone }]
    });
    if (existingTeacher) return res.status(400).json({ message: "Teacher already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await Teacher.create({ name, teacherId, phone, subject, qualification, password: hashedPassword });

    res.status(201).json({ message: "Teacher registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// TEACHER LOGIN
router.post("/login", async (req, res) => {
  try {
    const { teacherId, password } = req.body;

    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) return res.status(400).json({ message: "Invalid Teacher ID" });

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: teacher._id, role: "teacher" }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("teacherToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.json({
      message: "Login successful",
      token,
      teacher: { id: teacher._id, name: teacher.name, teacherId: teacher.teacherId, phone: teacher.phone, subject: teacher.subject }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/me", teachmiddleware, teachcontroller.getMe);
router.post("/create-class", teachmiddleware, teachcontroller.createClass);
router.get("/classes", teachmiddleware, teachcontroller.getClasses);

router.get("/class/:classId/students", teachmiddleware, teachcontroller.getClassStudents);

module.exports = router; // ✅ this is what was missing