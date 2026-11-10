CREATE TABLE IF NOT EXISTS progression_targets (
 client TEXT NOT NULL,
 exercise_id TEXT NOT NULL,
 weight REAL NOT NULL,
 reps INTEGER NOT NULL,
 approved_by TEXT NOT NULL,
 updated TEXT NOT NULL,
 PRIMARY KEY(client,exercise_id)
);
CREATE TABLE IF NOT EXISTS coach_notes (
 client TEXT PRIMARY KEY,
 owner TEXT NOT NULL,
 note TEXT NOT NULL,
 updated TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS workouts_client_date ON workouts(client,date);
CREATE INDEX IF NOT EXISTS logs_client_date ON logs(client,date);
CREATE INDEX IF NOT EXISTS meals_client_date ON meals(client,date);
CREATE INDEX IF NOT EXISTS messages_client_created ON messages(client,created);
