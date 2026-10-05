import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const WorkoutPage = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [error, setError] = useState("");

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

  const deleteWorkout = async () => {
    try {
      const res = await fetch(`/api/workouts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.status === 401) {
        onLogout();
        navigate("/login");
        return;
      }
      if (!res.ok) throw new Error("Could not delete workout");
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!workout) return error ? <p className="error">{error}</p> : <p>Loading...</p>;

  return (
    <div className="workout-preview">
      <h2>{workout.title}</h2>
      <p>Difficulty: {workout.difficulty}</p>
      <p>Description: {workout.description}</p>
      <p>Price: ${workout.price}</p>
      {error && <p className="error">{error}</p>}
      {user ? (
        <div>
          <button onClick={() => navigate(`/edit-workout/${id}`)}>Edit</button>
          <button onClick={deleteWorkout}>Delete</button>
        </div>
      ) : (
        <Link to="/login">Log in to edit or delete</Link>
      )}
    </div>
  );
};

export default WorkoutPage;