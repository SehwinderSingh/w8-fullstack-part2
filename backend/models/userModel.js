const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Signup
userSchema.statics.signup = async function (
  username,
  password,
  phoneNumber,
  name,
  role = "user"
) {
  if (!username || !password || !phoneNumber || !name) {
    throw Error("All fields must be filled");
  }

  if (role !== "user" && role !== "admin") {
    throw Error("Invalid role");
  }

  const exists = await this.findOne({ username });

  if (exists) {
    throw Error("Username already in use");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({
    username,
    password: hash,
    phoneNumber,
    name,
    role,
  });

  return user;
};

// Login
userSchema.statics.login = async function (username, password) {
  if (!username || !password) {
    throw Error("All fields must be filled");
  }

  const user = await this.findOne({ username });

  if (!user) {
    throw Error("Invalid username or password");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw Error("Invalid username or password");
  }

  return user;
};

module.exports = mongoose.model("User", userSchema);