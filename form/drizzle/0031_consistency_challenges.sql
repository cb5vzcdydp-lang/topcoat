CREATE TABLE IF NOT EXISTS consistency_challenges(id TEXT PRIMARY KEY,creator TEXT NOT NULL,title TEXT NOT NULL,starts TEXT NOT NULL,weeks INTEGER NOT NULL,mode TEXT NOT NULL,team_metric TEXT NOT NULL,team_target REAL NOT NULL,status TEXT NOT NULL DEFAULT 'active',config TEXT NOT NULL,created TEXT NOT NULL);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS consistency_members(challenge TEXT NOT NULL,uid TEXT NOT NULL,client TEXT,status TEXT NOT NULL,metric TEXT,target REAL,reviewer INTEGER NOT NULL DEFAULT 0,joined TEXT,version INTEGER NOT NULL DEFAULT 1,PRIMARY KEY(challenge,uid));
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS consistency_member_uid ON consistency_members(uid,status);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS consistency_proofs(id TEXT PRIMARY KEY,challenge TEXT NOT NULL,author TEXT NOT NULL,workout TEXT NOT NULL,reviewers TEXT NOT NULL,note TEXT NOT NULL,created TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS consistency_proof_challenge ON consistency_proofs(challenge,created);
