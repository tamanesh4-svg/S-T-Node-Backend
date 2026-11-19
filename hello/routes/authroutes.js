const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const verifyToken = require("../middleware/authmiddleware");

console.log("authController:", authController);
console.log("verifyToken:", verifyToken);


// Register
router.post("/register", authController.registerStudent);

// Login
router.post("/login", authController.loginStudent);

// Get current logged-in student
router.get("/me", verifyToken, authController.getMe);

module.exports = router;