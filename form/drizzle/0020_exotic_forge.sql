CREATE TABLE `import_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`client` text NOT NULL,
	`kind` text NOT NULL,
	`source` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `import_batches_owner_client` ON `import_batches` (`owner`,`client`,`created`);--> statement-breakpoint
CREATE TABLE `import_items` (
	`batch` text NOT NULL,
	`entry_key` text NOT NULL,
	`table_name` text NOT NULL,
	`before_data` text,
	`after_data` text NOT NULL,
	`status` text DEFAULT 'imported' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `import_items_batch_key` ON `import_items` (`batch`,`entry_key`);