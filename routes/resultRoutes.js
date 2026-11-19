// routes/resultRoutes.js
console.log("Result routes loaded");
const express = require("express");
const router = express.Router();


router.use((req, res, next) => {
  console.log("📌 Result route hit:", req.method, req.url);
  next();
});


const {
  getTeacherClasses,
  getStudentsByClass,
  saveResults,
} = require("../controllers/resultController");

const protectTeacher = require("../middleware/teachmiddleware");
const verifyStudent = require("../middleware/studentAuth"); // 👈 your student middleware
const {getMyResult} = require("../controllers/resultController");


router.get("/student/my", verifyStudent, getMyResult);

router.get("/classes", protectTeacher, getTeacherClasses);
router.get("/classes/:id/students", protectTeacher, getStudentsByClass);
router.post("/", protectTeacher, saveResults);

module.exports = router;