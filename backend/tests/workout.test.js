const mongoose = require("mongoose");
const supertest = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const connectDB = require("../config/db");
const Workout = require("../models/workoutModel");
const User = require("../models/userModel");
const config = require("../utils/config");

const api = supertest(app);

const workouts = [
  {
    title: "30-Day Fat Burn",
    difficulty: "Beginner",
    description: "A full body routine for fitness and fat loss.",
    price: 29.99,
  },
  {
    title: "Upper Body Blast",
    difficulty: "Advanced",
    description: "A strength routine for upper body muscles.",
    price: 49.99,
  },
];

const newWorkout = {
  title: "Core Strength",
  difficulty: "Intermediate",
  description: "A routine for core muscles and stability.",
  price: 39.99,
};

const userData = {
  username: "protected.workout.tester",
  password: "Workout123!",
  phoneNumber: "+358409876543",
  name: "Protected Workout Tester",
};

const workoutsInDb = async () => {
  const all = await Workout.find({});
  return all.map((w) => w.toJSON());
};

let token = null;
let userId = null;

beforeAll(async () => {
  await connectDB();
  await User.deleteMany({});
  const res = await api.post("/api/users/signup").send(userData).expect(201);
  token = res.body.token;
  const user = await User.findOne({ username: userData.username });
  userId = user.id;
});

beforeEach(async () => {
  await Workout.deleteMany({});
  for (const workout of workouts) {
    await api.post("/api/workouts")
      .set("Authorization", `Bearer ${token}`)
      .send(workout)
      .expect(201);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

// ---------- Public reads ----------

describe("GET /api/workouts", () => {
  it("should return all workouts as JSON without a token", async () => {
    const res = await api.get("/api/workouts")
      .expect(200)
      .expect("Content-Type", /application\/json/);
    expect(res.body).toHaveLength(workouts.length);
  });
});

describe("GET /api/workouts/:workoutId", () => {
  it("should return one workout without a token", async () => {
    const [workout] = await workoutsInDb();
    const res = await api.get(`/api/workouts/${workout.id}`).expect(200);
    expect(res.body.title).toBe(workout.title);
  });

  it("should return 404 for a valid id that does not exist", async () => {
    const id = new mongoose.Types.ObjectId();
    await api.get(`/api/workouts/${id}`).expect(404);
  });

  it("should return 400 for a malformed id", async () => {
    await api.get("/api/workouts/12345").expect(400);
  });
});

// ---------- Protected writes ----------

describe("POST /api/workouts", () => {
  describe("with a valid token", () => {
    it("should create the workout and return 201", async () => {
      await api.post("/api/workouts")
        .set("Authorization", `Bearer ${token}`)
        .send(newWorkout)
        .expect(201);
      const all = await workoutsInDb();
      expect(all).toHaveLength(workouts.length + 1);
      expect(all.map((w) => w.title)).toContain(newWorkout.title);
    });

    it("should return 400 and not save when title is missing", async () => {
      const { title, ...noTitle } = newWorkout;
      await api.post("/api/workouts")
        .set("Authorization", `Bearer ${token}`)
        .send(noTitle)
        .expect(400);
      expect(await workoutsInDb()).toHaveLength(workouts.length);
    });
  });

  describe("without a valid token", () => {
    it("should return 401 when the token is missing", async () => {
      await api.post("/api/workouts").send(newWorkout).expect(401);
      expect(await workoutsInDb()).toHaveLength(workouts.length);
    });

    it("should return 401 for a malformed token", async () => {
      await api.post("/api/workouts")
        .set("Authorization", "Bearer invalidtoken")
        .send(newWorkout)
        .expect(401);
      expect(await workoutsInDb()).toHaveLength(workouts.length);
    });

    it("should return 401 for an expired token", async () => {
      const expired = jwt.sign({ id: userId }, config.SECRET, { expiresIn: -1 });
      await api.post("/api/workouts")
        .set("Authorization", `Bearer ${expired}`)
        .send(newWorkout)
        .expect(401);
      expect(await workoutsInDb()).toHaveLength(workouts.length);
    });

    it("should return 401 for a user that no longer exists", async () => {
      const res = await api.post("/api/users/signup")
        .send({ ...userData, username: "deleted.tester" })
        .expect(201);
      await User.deleteOne({ username: "deleted.tester" });
      await api.post("/api/workouts")
        .set("Authorization", `Bearer ${res.body.token}`)
        .send(newWorkout)
        .expect(401);
      expect(await workoutsInDb()).toHaveLength(workouts.length);
    });
  });
});

describe("PUT /api/workouts/:workoutId", () => {
  describe("with a valid token", () => {
    it("should update the workout and return 200", async () => {
      const [workout] = await workoutsInDb();
      const res = await api.put(`/api/workouts/${workout.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Updated Title", price: 42 })
        .expect(200);
      expect(res.body.title).toBe("Updated Title");
      const updated = await Workout.findById(workout.id);
      expect(updated.price).toBe(42);
    });

    it("should return 400 for an invalid field and not change the workout", async () => {
      const [workout] = await workoutsInDb();
      await api.put(`/api/workouts/${workout.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "" })
        .expect(400);
      const after = await Workout.findById(workout.id);
      expect(after.title).toBe(workout.title);
    });

    it("should return 404 for a missing workout", async () => {
      const id = new mongoose.Types.ObjectId();
      await api.put(`/api/workouts/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ price: 42 })
        .expect(404);
    });

    it("should return 400 for a malformed id", async () => {
      await api.put("/api/workouts/12345")
        .set("Authorization", `Bearer ${token}`)
        .send({ price: 42 })
        .expect(400);
    });
  });

  describe("without a valid token", () => {
    it("should return 401 and not change the workout", async () => {
      const [workout] = await workoutsInDb();
      await api.put(`/api/workouts/${workout.id}`).send({ price: 1 }).expect(401);
      const after = await Workout.findById(workout.id);
      expect(after.price).toBe(workout.price);
    });

    it("should return 401 for an expired token", async () => {
      const [workout] = await workoutsInDb();
      const expired = jwt.sign({ id: userId }, config.SECRET, { expiresIn: -1 });
      await api.put(`/api/workouts/${workout.id}`)
        .set("Authorization", `Bearer ${expired}`)
        .send({ price: 1 })
        .expect(401);
      const after = await Workout.findById(workout.id);
      expect(after.price).toBe(workout.price);
    });
  });
});

describe("DELETE /api/workouts/:workoutId", () => {
  describe("with a valid token", () => {
    it("should delete the workout and return 204", async () => {
      const [workout] = await workoutsInDb();
      await api.delete(`/api/workouts/${workout.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204);
      expect(await Workout.findById(workout.id)).toBeNull();
    });

    it("should return 404 for a missing workout", async () => {
      const id = new mongoose.Types.ObjectId();
      await api.delete(`/api/workouts/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });

    it("should return 400 for a malformed id", async () => {
      await api.delete("/api/workouts/12345")
        .set("Authorization", `Bearer ${token}`)
        .expect(400);
    });
  });

  describe("without a valid token", () => {
    it("should return 401 and not delete the workout", async () => {
      const [workout] = await workoutsInDb();
      await api.delete(`/api/workouts/${workout.id}`).expect(401);
      expect(await Workout.findById(workout.id)).not.toBeNull();
    });

    it("should return 401 for a malformed token", async () => {
      const [workout] = await workoutsInDb();
      await api.delete(`/api/workouts/${workout.id}`)
        .set("Authorization", "Bearer invalidtoken")
        .expect(401);
      expect(await Workout.findById(workout.id)).not.toBeNull();
    });
  });
});