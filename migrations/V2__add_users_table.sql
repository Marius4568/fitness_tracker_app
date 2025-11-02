-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add user_id to exercises table
ALTER TABLE exercises 
ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_exercises_user_id ON exercises(user_id);
CREATE INDEX idx_users_email ON users(email);