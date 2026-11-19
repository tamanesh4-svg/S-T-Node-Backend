const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // read the token from the Authorization header first, then the cookie
    const authHeader = req.headers.authorization;
    const headerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    const token = headerToken || req.cookies?.teacherToken;

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "teacher") {
      return res.status(403).json({ message: "Teacher access only" });
    }
    req.teacher = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};