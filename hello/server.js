const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authroutes");
const teacherAuthRoutes = require("./routes/teacherauthroutes");
const classRoutes = require("./routes/classRoutes");
const resultRoutes = require("./routes/resultRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const routineRoutes = require("./routes/routineRoutes");
const studentRoutes = require("./routes/studentRoutes");
const noticeRoutes = require("./routes/noticeRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// CHANGED: Render runs behind a proxy (needed for secure cookies)
app.set("trust proxy", 1);

// CHANGED: allow local + deployed frontend, and the Authorization header
const allowedOrigins = [
  "http://localhost:3000",
  "https://s-t-frontend.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (Postman, health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/teacher", teacherAuthRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/routine", routineRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/notices", noticeRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled API error:", err);
  res.status(500).json({ message: "Internal server error" });
});
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();