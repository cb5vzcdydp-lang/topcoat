CREATE TABLE IF NOT EXISTS site_owner(id INTEGER PRIMARY KEY CHECK(id=1),uid TEXT NOT NULL UNIQUE,claimed TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS site_feedback(id TEXT PRIMARY KEY,author TEXT NOT NULL,title TEXT NOT NULL,steps TEXT NOT NULL,expected TEXT NOT NULL,actual TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'open',version INTEGER NOT NULL DEFAULT 1,created TEXT NOT NULL,updated TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS site_reports(id TEXT PRIMARY KEY,reporter TEXT NOT NULL,post TEXT NOT NULL,reason TEXT NOT NULL,snapshot TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'open',version INTEGER NOT NULL DEFAULT 1,created TEXT NOT NULL,updated TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS site_feature_flags(name TEXT PRIMARY KEY,mode TEXT NOT NULL CHECK(mode IN ('on','off','test')),testers TEXT NOT NULL DEFAULT '[]',version INTEGER NOT NULL DEFAULT 1,updated TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS site_owner_audit(id TEXT PRIMARY KEY,actor TEXT NOT NULL,action TEXT NOT NULL,detail TEXT NOT NULL,created TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS site_release_notes(id TEXT PRIMARY KEY,body TEXT NOT NULL,created TEXT NOT NULL);
--> statement-breakpoint
ALTER TABLE social_posts ADD COLUMN moderated INTEGER NOT NULL DEFAULT 0;
