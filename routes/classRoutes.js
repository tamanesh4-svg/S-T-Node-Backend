const express = require("express");
const router = express.Router();

const { joinClass } = require("../controllers/classController");
const studentAuth = require("../middleware/studentAuth");

console.log("joinClass:", joinClass);
console.log("studentAuth:", studentAuth);

router.post("/join", studentAuth, joinClass);

module.exports = router;