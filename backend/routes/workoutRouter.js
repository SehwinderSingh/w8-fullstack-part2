const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const {
  getAllWorkouts,
  createWorkout,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
} = require("../controllers/workoutControllers");

// Public
router.get("/", getAllWorkouts);
router.get("/:workoutId", getWorkoutById);

// Everything below needs a valid token
router.use(requireAuth);

router.post("/", createWorkout);
router.put("/:workoutId", updateWorkout);
router.delete("/:workoutId", deleteWorkout);

module.exports = router;
