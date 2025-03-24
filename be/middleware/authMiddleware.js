console.log("verifyToken function:", typeof authenticateToken);

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {  // ✅ Rename authenticateToken to verifyToken
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Invalid token format." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key");
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired. Please log in again." });
    }
    return res.status(403).json({ message: "Invalid token." });
  }
};

// ✅ Fix the export
module.exports = { verifyToken };
