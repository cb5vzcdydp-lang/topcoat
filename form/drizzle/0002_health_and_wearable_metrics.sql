CREATE TABLE `health_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`client` text NOT NULL,
	`date` text NOT NULL,
	`metric` text NOT NULL,
	`value` real NOT NULL,
	`unit` text NOT NULL,
	`source` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`client`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `wearable_connections` (
	`id` text PRIMARY KEY NOT NULL,
	`client` text NOT NULL,
	`provider` text NOT NULL,
	`token_blob` text NOT NULL,
	`expires_at` text NOT NULL,
	`scopes` text NOT NULL,
	`connected_at` text NOT NULL,
	`last_synced` text,
	FOREIGN KEY (`client`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `wearable_oauth_states` (
	`state_hash` text PRIMARY KEY NOT NULL,
	`client` text NOT NULL,
	`uid` text NOT NULL,
	`verifier` text NOT NULL,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`client`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
