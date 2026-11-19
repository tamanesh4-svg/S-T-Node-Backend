const Notice = require("../models/Notice");

exports.createNotice = async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ message: "Title and message are required" });
    }
    const notice = await Notice.create({ title: title.trim(), message: message.trim(), teacher: req.teacher.id });
    res.status(201).json({ message: "Notice published successfully", notice });
  } catch (err) {
    console.error("createNotice:", err);
    res.status(500).json({ message: "Failed to publish notice" });
  }
};

exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().populate("teacher", "name subject").sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    console.error("getNotices:", err);
    res.status(500).json({ message: "Failed to fetch notices" });
  }
};
