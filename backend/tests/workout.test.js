const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const connectDB = require("../config/db");
const Workout = require("../models/workoutModel");

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

beforeAll(async () => {
  await connectDB();
});

beforeEach(async () => {
  await Workout.deleteMany({});
  await Workout.insertMany(workouts);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("GET /api/workouts", () => {
  it("should return workouts as JSON with status 200", async () => {
    await api
      .get("/api/workouts")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  it("should return all workouts", async () => {
    const response = await api.get("/api/workouts");
    expect(response.body).toHaveLength(workouts.length);
  });
});

describe("POST /api/workouts", () => {
  describe("when the payload is valid", () => {
    const newWorkout = {
      title: "Core Strength",
      difficulty: "Intermediate",
      description: "A routine for core muscles and stability.",
      price: 39.99,
    };

    it("should return status 201", async () => {
      await api.post("/api/workouts").send(newWorkout).expect(201);
    });

    it("should save the workout in the database", async () => {
      await api.post("/api/workouts").send(newWorkout);
      const workoutsAtEnd = await Workout.find({});
      expect(workoutsAtEnd).toHaveLength(workouts.length + 1);
      expect(workoutsAtEnd.map((w) => w.title)).toContain(newWorkout.title);
    });
  });

  describe("when a required field is missing", () => {
    const invalidWorkout = {
      difficulty: "Beginner",
      description: "Missing title should fail.",
      price: 19.99,
    };

    it("should return status 400", async () => {
      await api.post("/api/workouts").send(invalidWorkout).expect(400);
    });

    it("should not save the workout", async () => {
      await api.post("/api/workouts").send(invalidWorkout);
      const workoutsAtEnd = await Workout.find({});
      expect(workoutsAtEnd).toHaveLength(workouts.length);
    });
  });
});

describe("GET /api/workouts/:workoutId", () => {
  describe("when the id is valid", () => {
    it("should return the workout with status 200", async () => {
      const workout = await Workout.findOne();
      const response = await api
        .get(`/api/workouts/${workout._id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);
      expect(response.body.title).toBe(workout.title);
    });
  });

  describe("when the id does not exist", () => {
    it("should return status 404", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await api.get(`/api/workouts/${nonExistentId}`).expect(404);
    });
  });

  describe("when the id is malformed", () => {
    it("should return status 400", async () => {
      await api.get("/api/workouts/12345").expect(400);
    });
  });
});

describe("PUT /api/workouts/:workoutId", () => {
  describe("when the id is valid", () => {
    const updates = { title: "Updated Title", price: 42 };

    it("should return status 200 with the updated workout", async () => {
      const workout = await Workout.findOne();
      const response = await api
        .put(`/api/workouts/${workout._id}`)
        .send(updates)
        .expect(200);
      expect(response.body.title).toBe(updates.title);
      expect(response.body.price).toBe(updates.price);
    });

    it("should save the changes in the database", async () => {
      const workout = await Workout.findOne();
      await api.put(`/api/workouts/${workout._id}`).send(updates);
      const updated = await Workout.findById(workout._id);
      expect(updated.title).toBe(updates.title);
      expect(updated.price).toBe(updates.price);
    });
  });

  describe("when an updated field is invalid", () => {
    it("should return 400 and leave the workout unchanged", async () => {
      const workout = await Workout.findOne();
      await api.put(`/api/workouts/${workout._id}`).send({ title: "" }).expect(400);
      const workoutAtEnd = await Workout.findById(workout._id);
      expect(workoutAtEnd.title).toBe(workout.title);
    });
  });

  describe("when the id does not exist", () => {
    it("should return status 404", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await api.put(`/api/workouts/${nonExistentId}`).send({ price: 42 }).expect(404);
    });
  });

  describe("when the id is malformed", () => {
    it("should return status 400", async () => {
      await api.put("/api/workouts/12345").send({ price: 42 }).expect(400);
    });
  });
});

describe("DELETE /api/workouts/:workoutId", () => {
  describe("when the id is valid", () => {
    it("should return status 204", async () => {
      const workout = await Workout.findOne();
      await api.delete(`/api/workouts/${workout._id}`).expect(204);
    });

    it("should remove the workout from the database", async () => {
      const workout = await Workout.findOne();
      await api.delete(`/api/workouts/${workout._id}`);
      const deleted = await Workout.findById(workout._id);
      expect(deleted).toBeNull();
    });
  });

  describe("when the id does not exist", () => {
    it("should return status 404", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await api.delete(`/api/workouts/${nonExistentId}`).expect(404);
    });
  });

  describe("when the id is malformed", () => {
    it("should return status 400", async () => {
      await api.delete("/api/workouts/12345").expect(400);
    });
  });
});