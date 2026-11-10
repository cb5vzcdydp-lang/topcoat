CREATE TABLE IF NOT EXISTS coach_workflows(id TEXT PRIMARY KEY,client TEXT NOT NULL,coach TEXT NOT NULL,author TEXT NOT NULL,kind TEXT NOT NULL CHECK(kind IN ('form','response','proposal','video-note')),data TEXT NOT NULL,status TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,created TEXT NOT NULL,updated TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS coach_workflows_client ON coach_workflows(client,updated);
