const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fitness_tracker',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected successfully at:', res.rows[0].now);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all exercises
app.get('/api/exercises', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM exercises ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching exercises:', err);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// Add new exercise
app.post('/api/exercises', async (req, res) => {
  const { name, reps } = req.body;

  if (!name || !reps) {
    return res.status(400).json({ error: 'Name and reps are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO exercises (name, reps) VALUES ($1, $2) RETURNING *',
      [name, reps]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding exercise:', err);
    res.status(500).json({ error: 'Failed to add exercise' });
  }
});

// Delete exercise
app.delete('/api/exercises/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM exercises WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    res.json({ message: 'Exercise deleted', exercise: result.rows[0] });
  } catch (err) {
    console.error('Error deleting exercise:', err);
    res.status(500).json({ error: 'Failed to delete exercise' });
  }
});

// Get exercise statistics
app.get('/api/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_exercises,
        SUM(reps) as total_reps,
        AVG(reps) as avg_reps
      FROM exercises
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});