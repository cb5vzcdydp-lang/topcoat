CREATE TABLE social_challenges_next (
  id TEXT PRIMARY KEY NOT NULL,
  creator TEXT NOT NULL,
  title TEXT NOT NULL,
  metric TEXT NOT NULL CHECK (metric IN ('bodyfat_relative_drop','weight_relative_drop','bench_relative_gain','squat_relative_gain','deadlift_relative_gain','pushup_relative_gain','pullup_relative_gain','workouts_relative_gain','steps_relative_gain')),
  starts TEXT NOT NULL,
  ends TEXT NOT NULL,
  created TEXT NOT NULL
);
--> statement-breakpoint
INSERT INTO social_challenges_next(id,creator,title,metric,starts,ends,created)
SELECT id,creator,title,metric,starts,ends,created FROM social_challenges;
--> statement-breakpoint
DROP TABLE social_challenges;
--> statement-breakpoint
ALTER TABLE social_challenges_next RENAME TO social_challenges;
