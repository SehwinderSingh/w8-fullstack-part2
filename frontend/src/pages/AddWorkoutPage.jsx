import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddWorkoutPage = () => {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const submitForm = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const newWorkout = {
      title,
      difficulty,
      description,
      price: Number(price),
    };

    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newWorkout),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create workout");
      }
      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create">
      <h2>Add a New Workout</h2>
      <form onSubmit={submitForm}>
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <label>Difficulty:</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
        <label>Price:</label>
        <input
          type="number"
          step="0.01"
          min="0"
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Workout"}
        </button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default AddWorkoutPage;
