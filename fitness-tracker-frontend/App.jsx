import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [exercises, setExercises] = useState([]);
  const [exerciseName, setExerciseName] = useState('');
  const [reps, setReps] = useState('');

  // Load exercises from API on mount
  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await fetch('/api/exercises');
      const data = await response.json();
      setExercises(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const addExercise = async (e) => {
    e.preventDefault();

    if (!exerciseName.trim() || !reps) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: exerciseName.trim(),
          reps: parseInt(reps),
        }),
      });

      if (response.ok) {
        setExerciseName('');
        setReps('');
        fetchExercises(); // Reload exercises from API
      } else {
        alert('Failed to add exercise');
      }
    } catch (error) {
      console.error('Error adding exercise:', error);
      alert('Error adding exercise');
    }
  };

  const deleteExercise = async (id) => {
    try {
      const response = await fetch(`/api/exercises/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchExercises(); // Reload exercises from API
      } else {
        alert('Failed to delete exercise');
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Error deleting exercise');
    }
  };

  const getTotalReps = () => {
    return exercises.reduce((total, ex) => total + ex.reps, 0);
  };

  return (
    <div className="app">
      <header>
        <h1>💪 Exercise Tracker</h1>
        <p>Track your daily workouts</p>
      </header>

      <div className="container">
        <form onSubmit={addExercise} className="add-form">
          <h2>Log Exercise</h2>
          <div className="form-group">
            <input
              type="text"
              placeholder="Exercise name (e.g., Push-ups)"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="input"
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              placeholder="Number of reps"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              min="1"
              className="input"
            />
          </div>
          <button type="submit" className="btn-add">Add Exercise</button>
        </form>

        <div className="stats">
          <div className="stat-card">
            <h3>Total Exercises</h3>
            <p className="stat-number">{exercises.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Reps</h3>
            <p className="stat-number">{getTotalReps()}</p>
          </div>
        </div>

        <div className="exercise-list">
          <h2>Your Exercises</h2>
          {exercises.length === 0 ? (
            <p className="empty-state">No exercises logged yet. Start tracking!</p>
          ) : (
            <div className="exercises">
              {exercises.map((exercise) => (
                <div key={exercise.id} className="exercise-card">
                  <div className="exercise-info">
                    <h3>{exercise.name}</h3>
                    <p className="reps">{exercise.reps} reps</p>
                    <p className="timestamp">
                      {new Date(exercise.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteExercise(exercise.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;