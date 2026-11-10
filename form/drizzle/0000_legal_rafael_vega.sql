CREATE TABLE `audit` (
	`id` text PRIMARY KEY NOT NULL,
	`client` text NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`data` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`member` text,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`demo` integer DEFAULT 0 NOT NULL,
	`targets` text NOT NULL,
	`plan` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invites` (
	`hash` text PRIMARY KEY NOT NULL,
	`client` text NOT NULL,
	`expires` text NOT NULL,
	FOREIGN KEY (`client`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` text PRIMARY KEY NOT NULL,
	`client` text NOT NULL,
	`date` text NOT NULL,
	`data` text NOT NULL,
	`updated` text NOT NULL,
	FOREIGN KEY (`client`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`client` text NOT NULL,
	`author` text NOT NULL,
	`role` text NOT NULL,
	`body` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`client`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`client` text NOT NULL,
	`date` text NOT NULL,
	`view` text NOT NULL,
	`key` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`client`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`plan` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`client` text NOT NULL,
	`date` text NOT NULL,
	`data` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`client`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
