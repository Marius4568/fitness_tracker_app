-- Initial schema creation
CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    reps INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data for initial deployment
INSERT INTO exercises (name, reps) VALUES 
    ('Push-ups', 20),
    ('Pull-ups', 10),
    ('Squats', 30);