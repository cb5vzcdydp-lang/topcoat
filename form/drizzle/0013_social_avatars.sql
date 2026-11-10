CREATE TABLE social_avatars (
  id TEXT PRIMARY KEY NOT NULL,
  uid TEXT NOT NULL,
  label TEXT NOT NULL,
  key TEXT NOT NULL,
  content_type TEXT NOT NULL,
  face_anchor TEXT,
  created TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX social_avatars_uid_created ON social_avatars(uid,created);
--> statement-breakpoint
ALTER TABLE social_profiles ADD COLUMN avatar_id TEXT;
