import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditWorkoutPage = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/workouts/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load workout");
        setWorkout(data);
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [id]);

  const submitForm = async (e) => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    values.price = Number(values.price);
    setPending(true);
    setError("");
    try {
      const res = await fetch(`/api/workouts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(values),
      });
      if (res.status === 401) {
        onLogout();
        navigate("/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Could not update workout");
      navigate(`/workouts/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  };

  if (!workout) return error ? <p className="error">{error}</p> : <p>Loading...</p>;

  return (
    <div className="create">
      <h2>Update Workout</h2>
      <form onSubmit={submitForm}>
        <label>Title:</label>
        <input name="title" defaultValue={workout.title} required />
        <label>Difficulty:</label>
        <select name="difficulty" defaultValue={workout.difficulty}>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <label>Description:</label>
        <textarea name="description" defaultValue={workout.description} required />
        <label>Price:</label>
        <input name="price" type="number" min="0" step="0.01" defaultValue={workout.price} required />
        {error && <p className="error">{error}</p>}
        <button disabled={pending}>{pending ? "Saving..." : "Update Workout"}</button>
      </form>
    </div>
  );
};

export default EditWorkoutPage;