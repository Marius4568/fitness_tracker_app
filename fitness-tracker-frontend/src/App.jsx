import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import './App.css';

function AppContent() {
  const { user, token, logout, loading } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [exerciseName, setExerciseName] = useState('');
  const [reps, setReps] = useState('');

  useEffect(() => {
    if (user && token) {
      fetchExercises();
    }
  }, [user, token]);

  const fetchExercises = async () => {
    try {
      const response = await fetch('/api/exercises', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: exerciseName.trim(),
          reps: parseInt(reps),
        }),
      });

      if (response.ok) {
        setExerciseName('');
        setReps('');
        fetchExercises();
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchExercises();
      } else {
        alert('Failed to delete exercise');
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Error deleting exercise');
    }
  };

  const getTotalReps = () => {
    if (!Array.isArray(exercises)) return 0;
    return exercises.reduce((total, ex) => total + ex.reps, 0);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="app">
      <header>
        <div className="header-content">
          <div>
            <h1>💪 Exercise Tracker</h1>
            <p>Welcome, {user.username}!</p>
          </div>
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
        <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
          Build: {new Date().toISOString()}
        </p>
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;