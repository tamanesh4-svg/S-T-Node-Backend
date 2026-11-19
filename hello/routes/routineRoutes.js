// routes/routineRoutes.js
const express = require("express");
const router = express.Router();
const routineController = require("../controllers/routineController");
const verifyTeacher = require("../middleware/teachmiddleware");

router.post("/add", verifyTeacher, routineController.addRoutine);
router.get("/", verifyTeacher, routineController.getRoutine);
router.delete("/:id", verifyTeacher, routineController.deleteRoutine);

module.exports = router;