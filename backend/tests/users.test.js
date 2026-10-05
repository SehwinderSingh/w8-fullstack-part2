const mongoose = require("mongoose");
const supertest = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../app");
const connectDB = require("../config/db");
const User = require("../models/userModel");
const config = require("../utils/config");

const api = supertest(app);

const validUser = {
  username: "jane.workout",
  password: "Workout123!",
  phoneNumber: "+358401234567",
  name: "Jane Workout",
  role: "user",
};

beforeAll(async () => {
  await connectDB();
  await User.init(); // make sure the unique username index exists
});

beforeEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("POST /api/users/signup", () => {
  describe("when the payload is valid", () => {
    it("should return status 201 with JSON", async () => {
      await api.post("/api/users/signup").send(validUser)
        .expect(201)
        .expect("Content-Type", /application\/json/);
    });

    it("should return username and a valid token, but no password", async () => {
      const res = await api.post("/api/users/signup").send(validUser).expect(201);
      expect(res.body.username).toBe(validUser.username);
      expect(res.body).toHaveProperty("token");
      expect(res.body).not.toHaveProperty("password");

      const decoded = jwt.verify(res.body.token, config.SECRET);
      const saved = await User.findOne({ username: validUser.username });
      expect(decoded.id).toBe(saved._id.toString());
    });

    it("should save the user with a hashed password", async () => {
      await api.post("/api/users/signup").send(validUser).expect(201);
      const saved = await User.findOne({ username: validUser.username });
      expect(saved).not.toBeNull();
      expect(saved.name).toBe(validUser.name);
      expect(saved.phoneNumber).toBe(validUser.phoneNumber);
      expect(saved.password).not.toBe(validUser.password);
      expect(await bcrypt.compare(validUser.password, saved.password)).toBe(true);
    });

    it("should default the role to user when no role is sent", async () => {
      const { role, ...withoutRole } = validUser;
      await api.post("/api/users/signup").send(withoutRole).expect(201);
      const saved = await User.findOne({ username: validUser.username });
      expect(saved.role).toBe("user");
    });

    it("should save the selected admin role", async () => {
      await api.post("/api/users/signup").send({ ...validUser, role: "admin" }).expect(201);
      const saved = await User.findOne({ username: validUser.username });
      expect(saved.role).toBe("admin");
    });
  });

  describe("when required fields are missing", () => {
    it("should return status 400", async () => {
      await api.post("/api/users/signup").send({ username: "missing" }).expect(400);
    });

    it("should not save a user", async () => {
      await api.post("/api/users/signup").send({ username: "missing" }).expect(400);
      expect(await User.find({})).toHaveLength(0);
    });
  });

  describe("when the username already exists", () => {
    it("should return 400 and not create a second user", async () => {
      await api.post("/api/users/signup").send(validUser).expect(201);
      await api.post("/api/users/signup")
        .send({ ...validUser, name: "Another User" })
        .expect(400);
      expect(await User.find({})).toHaveLength(1);
    });
  });
});

describe("POST /api/users/login", () => {
  beforeEach(async () => {
    await api.post("/api/users/signup").send(validUser).expect(201);
  });

  describe("when the credentials are valid", () => {
    it("should return status 200 with JSON", async () => {
      await api.post("/api/users/login")
        .send({ username: validUser.username, password: validUser.password })
        .expect(200)
        .expect("Content-Type", /application\/json/);
    });

    it("should return username and token, but no password", async () => {
      const res = await api.post("/api/users/login")
        .send({ username: validUser.username, password: validUser.password })
        .expect(200);
      expect(res.body.username).toBe(validUser.username);
      expect(res.body).toHaveProperty("token");
      expect(res.body).not.toHaveProperty("password");
    });
  });

  describe("when the credentials are invalid", () => {
    it("should return 400 with a wrong password", async () => {
      const res = await api.post("/api/users/login")
        .send({ username: validUser.username, password: "WrongPassword1!" })
        .expect(400);
      expect(res.body).not.toHaveProperty("token");
    });

    it("should return 400 for a username that does not exist", async () => {
      await api.post("/api/users/login")
        .send({ username: "nobody", password: validUser.password })
        .expect(400);
    });

    it("should return 400 when the password is missing", async () => {
      await api.post("/api/users/login")
        .send({ username: validUser.username })
        .expect(400);
    });
  });
});