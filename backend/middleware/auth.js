const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const config = require("../utils/config");

const requireAuth = async (req, res, next) => {
  const authorization = req.get("Authorization");
  const match = authorization && authorization.match(/^Bearer\s+(\S+)$/i);
  if (!match) {
    return res.status(401).json({ error: "Authentication required" });
  }

  let decoded;
  try {
    decoded = jwt.verify(match[1], config.SECRET); // throws if invalid or expired
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  if (!decoded || !mongoose.isValidObjectId(decoded.id)) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(401).json({ error: "User no longer exists" });
  }

  req.user = user;
  next();
};

module.exports = requireAuth;
