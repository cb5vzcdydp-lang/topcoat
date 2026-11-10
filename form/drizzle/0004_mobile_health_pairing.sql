CREATE TABLE `mobile_devices` (
	`id` text PRIMARY KEY NOT NULL,
	`client` text NOT NULL,
	`uid` text NOT NULL,
	`token_hash` text NOT NULL,
	`platform` text NOT NULL,
	`device_name` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`last_synced` text,
	`revoked_at` text,
	FOREIGN KEY (`client`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mobile_devices_token_hash_unique` ON `mobile_devices` (`token_hash`);--> statement-breakpoint
CREATE INDEX `mobile_devices_client` ON `mobile_devices` (`client`);--> statement-breakpoint
CREATE TABLE `mobile_pair_codes` (
	`code_hash` text PRIMARY KEY NOT NULL,
	`client` text NOT NULL,
	`uid` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`client`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
