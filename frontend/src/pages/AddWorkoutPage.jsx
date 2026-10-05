import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddWorkoutPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submitForm = async (e) => {
    e.preventDefault();
    const workout = Object.fromEntries(new FormData(e.currentTarget));
    workout.price = Number(workout.price);
    setError("");
    setPending(true);
    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(workout),
      });
      if (res.status === 401) {
        onLogout(); // token expired or user deleted
        navigate("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Could not add workout");
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="create">
      <h2>Add a New Workout</h2>
      <form onSubmit={submitForm}>
        <label>Title:</label>
        <input name="title" type="text" required />
        <label>Difficulty:</label>
        <select name="difficulty">
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <label>Description:</label>
        <textarea name="description" required></textarea>
        <label>Price:</label>
        <input name="price" type="number" step="0.01" min="0" required />
        {error && <p className="error">{error}</p>}
        <button disabled={pending}>{pending ? "Adding..." : "Add Workout"}</button>
      </form>
    </div>
  );
};

export default AddWorkoutPage;