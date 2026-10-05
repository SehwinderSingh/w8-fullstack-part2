const Workout = require('../models/workoutModel');
const mongoose = require('mongoose');

// GET /api/workouts
const getAllWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({});
    res.status(200).json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/workouts
const createWorkout = async (req, res) => {
  try {
    const workout = await Workout.create({ ...req.body });
    res.status(201).json(workout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/workouts/:workoutId
const getWorkoutById = async (req, res) => {
  try {
    const { workoutId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(workoutId)) {
      return res.status(400).json({ message: 'Invalid workout ID' });
    }
    
    const workout = await Workout.findById(workoutId);

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.status(200).json(workout)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  res.send("getWorkoutById");
};

// PUT /api/workouts/:workoutId
const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.workoutId },
      { ...req.body },
      { returnDocument: "after", runValidators: true }
    );
    if (!workout) {
      res.status(404).json({ message: "Workout not found" })
    }
    res.status(200).json(workout)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
};

// DELETE /api/workouts/:workoutId
const deleteWorkout = async (req, res) => {
  try {
    const { workoutId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(workoutId)) {
      return res.status(400).json({ message: 'Invalid workout ID' });
    }

    const workout = await Workout.findByIdAndDelete(workoutId);

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }   
  res.send("deleteWorkout");
};

module.exports = {
  getAllWorkouts,
  createWorkout,
  getWorkoutById,
  updateWorkout,
  deleteWorkout,
};

