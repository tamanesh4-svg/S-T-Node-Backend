const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Student = require("../models/student");


// ================= REGISTER =================
exports.registerStudent = async (req, res) => {
  try {
    const { name, roll, classId, phone, password } = req.body;
    if (![name, roll, classId, phone, password].every((value) => String(value || "").trim())) {
      return res.status(400).json({ message: "All registration fields are required" });
    }

    const existing = await Student.findOne({ phone });
    if (existing) {
      return res.status(400).json({ message: "Phone already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const student = new Student({
      name,
      roll,
      classId,
      phone,
      password: hashedPassword
    });

    await student.save();

    res.status(201).json({ message: "Student registered successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  
};


// ================= LOGIN =================
exports.loginStudent = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ message: "Phone and password are required" });

    const student = await Student.findOne({ phone });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: student._id,
        phone: student.phone,
        roll: student.roll,
        classId: student.classId,
        role: "student"
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login successful",
      token,
      student: {
        name: student.name,
        roll: student.roll,
        classId: student.classId,
        phone: student.phone
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ================= GET CURRENT STUDENT =================
exports.getMe = async (req, res) => {
  try {
    const student = await Student.findById(req.student.id).select("-password");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};