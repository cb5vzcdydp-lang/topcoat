CREATE TABLE `meals` (
	`id` text PRIMARY KEY NOT NULL,
	`client` text NOT NULL,
	`date` text NOT NULL,
	`data` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`client`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
