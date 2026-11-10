ALTER TABLE cardio_sessions ADD COLUMN equipment TEXT NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE cardio_sessions ADD COLUMN splits TEXT NOT NULL DEFAULT '[]';
