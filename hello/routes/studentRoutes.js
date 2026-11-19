// routes/studentRoutes.js
const express = require("express");
const router = express.Router();

const { getStudentRoutine } = require("../controllers/studentRoutineController");
const studentAuth = require("../middleware/studentAuth"); // if you have

router.get("/routine", studentAuth, getStudentRoutine);

module.exports = router; // ✅ VERY IMPORTANT