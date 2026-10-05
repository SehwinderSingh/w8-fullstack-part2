const Workout = require('../models/workoutModel');
const mongoose = require('mongoose');

// GET /api/workouts
const getAllWorkouts = async (req, res) => {
  const workouts = await Workout.find({});
  res.status(200).json(workouts);
};

// POST /api/workouts
const createWorkout = async (req, res) => {
  const workout = await Workout.create(req.body);
  res.status(201).json(workout);
};

// GET /api/workouts/:workoutId
const getWorkoutById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.workoutId)) {
    return res.status(400).json({ error: "Invalid workout ID" });
  }
  const workout = await Workout.findById(req.params.workoutId);
  if (!workout) return res.status(404).json({ error: "Workout not found" });
  res.status(200).json(workout);
};

// PUT /api/workouts/:workoutId
const updateWorkout = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.workoutId)) {
    return res.status(400).json({ error: "Invalid workout ID" });
  }
  const workout = await Workout.findOneAndUpdate(
    { _id: req.params.workoutId },
    { ...req.body },
    { returnDocument: "after", runValidators: true }
  );
  if (!workout) return res.status(404).json({ error: "Workout not found" });
  res.status(200).json(workout);
};

// DELETE /api/workouts/:workoutId
const deleteWorkout = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.workoutId)) {
    return res.status(400).json({ error: "Invalid workout ID" });
  }
  const workout = await Workout.findOneAndDelete({ _id: req.params.workoutId });
  if (!workout) return res.status(404).json({ error: "Workout not found" });
  res.status(204).end();
};

module.exports = {
  getAllWorkouts,
  createWorkout,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
};