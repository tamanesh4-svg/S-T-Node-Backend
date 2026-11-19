const express = require("express");
const router = express.Router();
const teacherAuth = require("../middleware/teachmiddleware");
const { createNotice, getNotices } = require("../controllers/noticeController");

router.get("/", getNotices);
router.post("/", teacherAuth, createNotice);

module.exports = router;
