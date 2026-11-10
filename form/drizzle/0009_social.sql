CREATE TABLE social_profiles (
  uid TEXT PRIMARY KEY NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE friendships (
  id TEXT PRIMARY KEY NOT NULL,
  requester TEXT NOT NULL,
  addressee TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','accepted')),
  created TEXT NOT NULL,
  UNIQUE(requester,addressee)
);
--> statement-breakpoint
CREATE INDEX friendships_addressee_status ON friendships(addressee,status);
--> statement-breakpoint
CREATE TABLE social_posts (
  id TEXT PRIMARY KEY NOT NULL,
  author TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('text','workout','photo')),
  body TEXT NOT NULL,
  workout TEXT,
  media_key TEXT,
  media_type TEXT,
  created TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX social_posts_author_created ON social_posts(author,created);
--> statement-breakpoint
CREATE TABLE social_likes (
  post_id TEXT NOT NULL,
  uid TEXT NOT NULL,
  created TEXT NOT NULL,
  PRIMARY KEY(post_id,uid)
);
--> statement-breakpoint
CREATE TABLE social_comments (
  id TEXT PRIMARY KEY NOT NULL,
  post_id TEXT NOT NULL,
  uid TEXT NOT NULL,
  body TEXT NOT NULL,
  created TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX social_comments_post_created ON social_comments(post_id,created);
--> statement-breakpoint
CREATE TABLE social_challenges (
  id TEXT PRIMARY KEY NOT NULL,
  creator TEXT NOT NULL,
  title TEXT NOT NULL,
  metric TEXT NOT NULL CHECK (metric IN ('bodyfat_relative_drop','bench_relative_gain')),
  starts TEXT NOT NULL,
  ends TEXT NOT NULL,
  created TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE challenge_participants (
  challenge_id TEXT NOT NULL,
  uid TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('invited','joined')),
  baseline REAL,
  current REAL,
  joined TEXT,
  updated TEXT,
  PRIMARY KEY(challenge_id,uid)
);
--> statement-breakpoint
CREATE INDEX challenge_participants_uid ON challenge_participants(uid,status);
--> statement-breakpoint
ALTER TABLE social_profiles ADD COLUMN auto_share_workouts INTEGER NOT NULL DEFAULT 0;
