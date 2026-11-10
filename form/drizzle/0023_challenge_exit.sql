CREATE TABLE challenge_participants_next (
  challenge_id TEXT NOT NULL,
  uid TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('invited','joined','left')),
  baseline REAL,
  current REAL,
  joined TEXT,
  updated TEXT,
  PRIMARY KEY(challenge_id,uid)
);
--> statement-breakpoint
INSERT INTO challenge_participants_next(challenge_id,uid,status,baseline,current,joined,updated)
SELECT challenge_id,uid,status,baseline,current,joined,updated FROM challenge_participants;
--> statement-breakpoint
DROP TABLE challenge_participants;
--> statement-breakpoint
ALTER TABLE challenge_participants_next RENAME TO challenge_participants;
--> statement-breakpoint
CREATE INDEX challenge_participants_uid ON challenge_participants(uid,status);
