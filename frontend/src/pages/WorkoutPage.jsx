import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const WorkoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workout, setWorkout] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const response = await fetch(`/api/workouts/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch workout");
        }

        const data = await response.json();
        setWorkout(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkout();
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete workout");
      }

      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = async () => {
    navigate(`/edit-workout/${workout._id}`)
  }

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!workout) return <p>Workout not found</p>;

  return (
    <div className="workout-preview">
      <h2>{workout.title}</h2>
      <p>Difficulty: {workout.difficulty}</p>
      <p>{workout.description}</p>
      <p>Price: ${workout.price}</p>

      <button onClick={handleDelete}>Delete</button>
      <button onClick={handleEdit}>Edit</button>
    </div>
  );
};

export default WorkoutPage;