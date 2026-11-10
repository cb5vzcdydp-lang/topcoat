CREATE TABLE `entry_history` (
	`id` text PRIMARY KEY NOT NULL,
	`client` text NOT NULL,
	`kind` text NOT NULL,
	`entry_key` text NOT NULL,
	`before_data` text,
	`after_data` text NOT NULL,
	`actor` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `entry_history_client_key` ON `entry_history` (`client`,`entry_key`,`created`);