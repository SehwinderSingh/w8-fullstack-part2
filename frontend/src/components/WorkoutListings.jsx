import {useState, useEffect} from "react";
import WorkoutListing from "./WorkoutListing";

const WorkoutListings = () => {
  const [workouts, setWorkouts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await fetch("/api/workouts");
        if (!response.ok) throw new Error("Failed to fetch workouts");  
          const data = await response.json();
          setWorkouts(data);
        } catch (error) {
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchWorkouts();
    }, []);

  if (isLoading) return <p> Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (workouts.length === 0) return <p>No workouts found</p>;



  return (
    <div className="workout-list">
      {workouts.map((workout) => (
        <WorkoutListing key={workout._id} workout={workout} />
      ))}
    </div>
  );
};

export default WorkoutListings;
