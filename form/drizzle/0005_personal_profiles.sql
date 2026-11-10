ALTER TABLE `clients` ADD `personal` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX `clients_one_personal_profile_per_owner` ON `clients` (`owner`) WHERE `personal` = 1;
