CREATE TABLE IF NOT EXISTS cardio_sessions (
  id TEXT PRIMARY KEY,
  client TEXT NOT NULL,
  date TEXT NOT NULL,
  activity TEXT NOT NULL,
  kind TEXT NOT NULL,
  distance_km REAL,
  duration_seconds INTEGER NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS cardio_client_date_idx ON cardio_sessions(client, date, created);
