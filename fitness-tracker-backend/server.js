const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');


require('dotenv').config({ path: envPath });


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Log incoming requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

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
    logger.error('❌ Database connection error:', err);
  } else {
    logger.info('✅ Database connected successfully at:', res.rows[0].now);
  }
});

// Health check endpoint - Tests database connectivity
app.get('/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW()');

    // Check Flyway migration status
    const migrationResult = await pool.query(
      'SELECT version, description, installed_on FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 1'
    );

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      dbTime: dbResult.rows[0].now,
      latestMigration: migrationResult.rows[0] || null
    });
  } catch (err) {
    logger.error('Health check failed:', err);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: err.message
    });
  }
});

// Get all exercises
app.get('/api/exercises', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM exercises ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    logger.error('Error fetching exercises:', err);
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
    logger.error('Error adding exercise:', err);
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
    logger.error('Error deleting exercise:', err);
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
    logger.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});