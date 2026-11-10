CREATE TABLE `user_preferences` (
	`owner` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workspace_record_history` (
	`record` text NOT NULL,
	`owner` text NOT NULL,
	`version` integer NOT NULL,
	`data` text NOT NULL,
	`deleted` integer NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workspace_record_history_version` ON `workspace_record_history` (`record`,`version`);--> statement-breakpoint
CREATE INDEX `workspace_record_history_owner` ON `workspace_record_history` (`owner`,`record`);--> statement-breakpoint
CREATE TABLE `workspace_records` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`client` text,
	`kind` text NOT NULL,
	`data` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `workspace_records_owner_client` ON `workspace_records` (`owner`,`client`,`updated`);