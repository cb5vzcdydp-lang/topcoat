CREATE TABLE `workout_template_history` (
	`id` text NOT NULL,
	`client` text NOT NULL,
	`version` integer NOT NULL,
	`data` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workout_template_history_version` ON `workout_template_history` (`id`,`version`);--> statement-breakpoint
ALTER TABLE `workout_templates` ADD `metadata` text;