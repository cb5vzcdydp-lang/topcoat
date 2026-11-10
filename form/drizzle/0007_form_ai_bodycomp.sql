CREATE TABLE `exercise_videos` (
  `id` text PRIMARY KEY NOT NULL,
  `client` text NOT NULL REFERENCES `clients`(`id`),
  `exercise_id` text NOT NULL,
  `exercise_name` text NOT NULL,
  `date` text NOT NULL,
  `key` text NOT NULL,
  `content_type` text NOT NULL,
  `created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `exercise_videos_client_exercise_date` ON `exercise_videos` (`client`,`exercise_id`,`date`);
--> statement-breakpoint
CREATE TABLE `ai_chat_messages` (
  `id` text PRIMARY KEY NOT NULL,
  `client` text NOT NULL REFERENCES `clients`(`id`),
  `role` text NOT NULL,
  `content` text NOT NULL,
  `created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ai_chat_messages_client_created` ON `ai_chat_messages` (`client`,`created`);
--> statement-breakpoint
CREATE TABLE `body_composition` (
  `id` text PRIMARY KEY NOT NULL,
  `client` text NOT NULL REFERENCES `clients`(`id`),
  `date` text NOT NULL,
  `weight` real NOT NULL,
  `height` real NOT NULL,
  `body_fat` real NOT NULL,
  `estimate_low` real,
  `estimate_high` real,
  `source` text NOT NULL,
  `created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `body_composition_client_date` ON `body_composition` (`client`,`date`);
--> statement-breakpoint
CREATE TABLE `progress_plans` (
  `client` text PRIMARY KEY NOT NULL REFERENCES `clients`(`id`),
  `start_date` text NOT NULL,
  `weight` real NOT NULL,
  `height` real NOT NULL,
  `body_fat` real NOT NULL,
  `daily_deficit` real NOT NULL,
  `updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `progress_milestones` (
  `id` text PRIMARY KEY NOT NULL,
  `client` text NOT NULL REFERENCES `clients`(`id`),
  `date` text NOT NULL,
  `title` text NOT NULL,
  `target_weight` real,
  `target_body_fat` real,
  `created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `progress_milestones_client_date` ON `progress_milestones` (`client`,`date`);
