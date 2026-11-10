CREATE TABLE `saved_foods` (
  `id` text PRIMARY KEY NOT NULL,
  `owner` text NOT NULL,
  `barcode` text,
  `name` text NOT NULL,
  `serving_size` text NOT NULL,
  `calories` real NOT NULL,
  `protein` real NOT NULL,
  `carbs` real NOT NULL,
  `fat` real NOT NULL,
  `notes` text NOT NULL DEFAULT '',
  `created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `saved_foods_owner_created` ON `saved_foods` (`owner`,`created`);
--> statement-breakpoint
CREATE UNIQUE INDEX `saved_foods_owner_barcode` ON `saved_foods` (`owner`,`barcode`);
