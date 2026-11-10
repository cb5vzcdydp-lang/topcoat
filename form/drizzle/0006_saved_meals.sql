CREATE TABLE `saved_meals` (
  `id` text PRIMARY KEY NOT NULL,
  `owner` text NOT NULL,
  `name` text NOT NULL,
  `category` text NOT NULL DEFAULT 'Uncategorized',
  `calories` real NOT NULL,
  `protein` real NOT NULL,
  `carbs` real NOT NULL,
  `fat` real NOT NULL,
  `notes` text NOT NULL DEFAULT '',
  `created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `saved_meals_owner_created` ON `saved_meals` (`owner`, `created`);
