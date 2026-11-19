const express = require("express");
const router = express.Router();
const studentAuth = require("../middleware/studentAuth");
const teacherAuth = require("../middleware/teachmiddleware");
const {
  markAttendance,
  getMyAttendance,
  getAttendanceByRoll,
} = require("../controllers/attendanceController");

router.post("/mark", teacherAuth, markAttendance);
router.get("/student/:roll", studentAuth, getAttendanceByRoll);
router.get("/me", studentAuth, getMyAttendance);

module.exports = router;
