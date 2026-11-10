CREATE TABLE workout_templates (
  id TEXT PRIMARY KEY NOT NULL,
  client TEXT NOT NULL REFERENCES clients(id),
  name TEXT NOT NULL,
  exercises TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created TEXT NOT NULL,
  updated TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX workout_templates_client ON workout_templates(client, updated);
