const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { SECRET } = require("../utils/config");

const generateToken = (_id) => {
  return jwt.sign(
    { id: _id },
    SECRET,
    { expiresIn: "3d" }
  );
};

// POST /api/users/signup
const signupUser = async (req, res) => {
  const {
    username,
    password,
    phoneNumber,
    name,
    role,
  } = req.body;

  try {
    const user = await User.signup(
      username,
      password,
      phoneNumber,
      name,
      role
    );

    const token = generateToken(user._id);

    res.status(201).json({
      username: user.username,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// POST /api/users/login
const loginUser = async (req, res) => {
  const {
    username,
    password,
  } = req.body;

  try {
    const user = await User.login(username, password);

    const token = generateToken(user._id);

    res.status(200).json({
      username: user.username,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

module.exports = {
  signupUser,
  loginUser,
};