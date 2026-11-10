CREATE TABLE `social_controls` (
	`owner` text NOT NULL,
	`target` text NOT NULL,
	`kind` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `social_control_unique` ON `social_controls` (`owner`,`target`,`kind`);--> statement-breakpoint
CREATE TABLE `social_post_history` (
	`post` text NOT NULL,
	`author` text NOT NULL,
	`version` integer NOT NULL,
	`body` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `social_post_history_version` ON `social_post_history` (`post`,`version`);--> statement-breakpoint
CREATE TABLE `social_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter` text NOT NULL,
	`post` text NOT NULL,
	`reason` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `social_posts` ADD `audience` text DEFAULT 'friends' NOT NULL;--> statement-breakpoint
ALTER TABLE `social_posts` ADD `allowed_uids` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `social_posts` ADD `comments_open` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `social_posts` ADD `version` integer DEFAULT 1 NOT NULL;