CREATE TABLE IF NOT EXISTS community_groups(id TEXT PRIMARY KEY,owner TEXT NOT NULL,name TEXT NOT NULL,members TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,updated TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS community_groups_owner ON community_groups(owner,updated);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS community_preferences(owner TEXT PRIMARY KEY,reactions_disabled INTEGER NOT NULL DEFAULT 0);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS community_reactions(post TEXT NOT NULL,owner TEXT NOT NULL,kind TEXT NOT NULL CHECK(kind IN ('cheer','strong','thanks')),updated TEXT NOT NULL,PRIMARY KEY(post,owner));
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS community_notifications(id TEXT PRIMARY KEY,recipient TEXT NOT NULL,actor TEXT NOT NULL,post TEXT NOT NULL,created TEXT NOT NULL,read_at TEXT,UNIQUE(recipient,actor,post));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS community_notifications_recipient ON community_notifications(recipient,created);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS partner_checkins(id TEXT PRIMARY KEY,sender TEXT NOT NULL,recipient TEXT NOT NULL,note TEXT NOT NULL,meet_at TEXT,status TEXT NOT NULL CHECK(status IN ('proposed','acknowledged','declined','cancelled')),created TEXT NOT NULL,updated TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS partner_checkins_recipient ON partner_checkins(recipient,created);
